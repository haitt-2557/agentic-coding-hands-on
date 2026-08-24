'use server';

// FR-013, FR-014, INT-001, INT-002 — the repo's first Server Action. Writes one `kudos` row
// plus its hashtag/image join rows, deriving the sender from the caller's own Supabase
// session, never from the client payload (FR-014). Phase-01's RLS `with check
// (sender_id = auth.uid())` is a second, independent control behind this one — not a
// replacement for it.
//
// dom-contract.md E5 — this function performs NO server-side navigation and appends NO
// success marker to the URL: the submission spec asserts an anchored `/kudos` destination
// that a trailing marker would fail. It returns a typed result instead; the client
// (phase-08) stores a flag in browser storage and navigates with the router.
//
// Client-side validation (phase-06, reusing lib/kudos/send/validation.ts) is UX only and is
// always defeatable via DevTools (architecture.md §4) — every check below re-runs server-side
// against the same pure functions, never a re-implementation of them (DRY, and the reason
// phase-03 exists).
//
// Ordering is deliberate: identity, then validation, then upload, then inserts. If the insert
// fails after images have already uploaded, those Storage objects are orphaned — accepted and
// logged, not compensated with a saga, for this first write path (YAGNI; recorded in this
// phase's completion report).

import { requireSupabaseUser } from './auth-gate';
import { createClient } from '@/lib/supabase/server';
import { uploadKudosImages } from './storage';
import { validateDraft, isAcceptedImage } from './validation';
import type { KudosDraft, SubmitKudosInput, SubmitKudosResult } from './types';

function draftFrom(input: SubmitKudosInput): KudosDraft {
  return {
    recipientId: input.recipientId,
    title: input.title,
    message: input.message,
    hashtagIds: input.hashtagIds,
    isAnonymous: input.isAnonymous,
    nickname: input.nickname ?? '',
  };
}

export async function submitKudos(input: SubmitKudosInput): Promise<SubmitKudosResult> {
  const user = await requireSupabaseUser();

  const fieldErrors = validateDraft(draftFrom(input));
  const firstInvalidField = (
    Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>
  )[0];
  if (firstInvalidField) {
    return { ok: false, error: fieldErrors[firstInvalidField]!, field: firstInvalidField };
  }

  const rejectedImage = input.images.find((file) => !isAcceptedImage(file));
  if (rejectedImage) {
    return { ok: false, error: `Định dạng ảnh không hợp lệ: ${rejectedImage.name}` };
  }

  const supabase = await createClient();

  try {
    const uploadedImages = await uploadKudosImages(supabase, user.id, input.images);

    const { data: kudosRow, error: kudosError } = await supabase
      .from('kudos')
      .insert({
        sender_id: user.id,
        recipient_id: input.recipientId,
        title: input.title,
        message: input.message,
        is_anonymous: input.isAnonymous,
        nickname: input.isAnonymous ? input.nickname : null,
      })
      .select('id')
      .single();

    if (kudosError || !kudosRow) {
      throw new Error(kudosError?.message ?? 'Insert returned no row');
    }

    const kudosId = kudosRow.id as string;

    const { error: hashtagsError } = await supabase
      .from('kudos_hashtags')
      .insert(input.hashtagIds.map((hashtagId) => ({ kudos_id: kudosId, hashtag_id: hashtagId })));

    if (hashtagsError) {
      throw new Error(hashtagsError.message);
    }

    if (uploadedImages.length > 0) {
      const { error: imagesError } = await supabase.from('kudos_images').insert(
        uploadedImages.map((image) => ({
          kudos_id: kudosId,
          storage_path: image.path,
          original_filename: image.originalFilename,
        }))
      );

      if (imagesError) {
        throw new Error(imagesError.message);
      }
    }

    return { ok: true, kudosId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('submitKudos failed:', message);
    return { ok: false, error: 'Không thể gửi Kudos. Vui lòng thử lại.' };
  }
}
