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
// phase-03 exists). Concretely, before any Storage or Postgres call: required fields and their
// length caps (`validateDraft`), the 1-5 hashtag bound (also `validateDraft`, run against the
// DEDUPED id list so a padded payload cannot hide behind an inflated count), the image-count
// cap (`isValidImageCount` — the client only hides the add button at 5, which is a UI
// affordance a direct caller never sees), and each file's MIME/size allow-list
// (`isAcceptedImage`). Review finding, 2026-08-24: the image-count check and the dedupe were
// both missing; this comment previously overstated the coverage.
//
// Ordering is deliberate: identity, then ALL validation (including the dedupe), then upload,
// then inserts — every input-shape failure is caught before any Storage or Postgres write, so
// none of it can happen mid-sequence. Two residual risks remain and are accepted, not silently
// fixed, because closing either fully needs a transaction or an RPC (out of scope for this
// pass without a separate sign-off):
//   1. If the insert fails after images have already uploaded, those Storage objects are
//      orphaned — accepted and logged (YAGNI; recorded in phase-05's completion report).
//   2. If the `kudos_hashtags` or `kudos_images` insert fails for a reason validation cannot
//      see ahead of time (e.g. a transient network error, or a hashtag id that passed shape
//      validation but does not exist in `hashtags`), the already-written `kudos` row is left
//      behind with fewer hashtags than BR-004 requires. Deduping ids removes the one failure
//      mode that was reachable through normal use (a duplicate id violating the join table's
//      primary key); it does not make the parent row's persistence atomic with its children.

import { requireSupabaseUser } from './auth-gate';
import { createClient } from '@/lib/supabase/server';
import { uploadKudosImages } from './storage';
import { validateDraft, isAcceptedImage, isValidImageCount, dedupeHashtagIds, IMAGE_MAX } from './validation';
import type { KudosDraft, SubmitKudosInput, SubmitKudosResult } from './types';

function draftFrom(input: SubmitKudosInput, hashtagIds: string[]): KudosDraft {
  return {
    recipientId: input.recipientId,
    title: input.title,
    message: input.message,
    hashtagIds,
    isAnonymous: input.isAnonymous,
    nickname: input.nickname ?? '',
  };
}

export async function submitKudos(input: SubmitKudosInput): Promise<SubmitKudosResult> {
  const user = await requireSupabaseUser();

  // Dedupe FIRST — every check after this point (the min/max bound below, and the eventual
  // insert) must see the real distinct count, not a duplicate-inflated array length.
  const hashtagIds = dedupeHashtagIds(input.hashtagIds);

  const fieldErrors = validateDraft(draftFrom(input, hashtagIds));
  const firstInvalidField = (
    Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>
  )[0];
  if (firstInvalidField) {
    return { ok: false, error: fieldErrors[firstInvalidField]!, field: firstInvalidField };
  }

  if (!isValidImageCount(input.images.length)) {
    return { ok: false, error: `Tối đa ${IMAGE_MAX} ảnh` };
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
      .insert(hashtagIds.map((hashtagId) => ({ kudos_id: kudosId, hashtag_id: hashtagId })));

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
