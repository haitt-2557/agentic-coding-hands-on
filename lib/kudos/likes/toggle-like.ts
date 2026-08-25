'use server';

// SM-001, FR-001/FR-002, BR-001/BR-002/BR-006 — the one write in this feature. `is_special` is
// never sent from the client: the phase 01 BEFORE INSERT trigger stamps it from `special_days`
// at insert time, and BR-005 requires that value stay frozen forever after, so an unlike revokes
// exactly what the like granted regardless of what `special_days` looks like now.
//
// edge-cases.md row 1 (double-click): a pre-check-then-write ("does a row exist?" then insert/
// delete) races two concurrent requests — both can pass the check before either writes. Instead
// this reads current state once for the UI-facing branch, but treats the database's own unique
// constraint (`kudos_likes(kudos_id, user_id)`, BR-001) as the real arbiter: a `23505` on insert
// means a concurrent request already won, and the user's intent ("I want this liked") is already
// satisfied, so that is reported as success, not failure.
//
// BR-002 is checked here in application code as defence in depth (mirroring submit-kudos.ts) —
// RLS's `is_static_kudos_author` check on the insert policy is the real boundary and would reject
// the same request independently.

import { getSupabaseUserOrNull } from '@/lib/supabase/current-user';
import { resolveViewerSlug } from '@/lib/kudos/viewer-identity';
import { createClient } from '@/lib/supabase/server';
import { KUDOS_RECORDS } from '@/lib/kudos/kudos-records';
import type { ToggleLikeResult } from './types';

const UNIQUE_VIOLATION = '23505';

const AUTH_REQUIRED_ERROR = 'Bạn cần đăng nhập để thả tim.';
const SELF_LIKE_ERROR = 'Bạn không thể thả tim cho Kudos của chính mình.';
const UNKNOWN_KUDOS_ERROR = 'Không tìm thấy Kudos này.';
const GENERIC_ERROR = 'Không thể cập nhật lượt tim.';

/**
 * Toggles the caller's like on `kudosId`: inserts a row when absent, deletes it when present.
 * `'use server'` — never trusts `kudosId` beyond checking it against the known static records,
 * and never derives `user_id` from anything but the caller's own session.
 */
export async function toggleKudosLike(kudosId: string): Promise<ToggleLikeResult> {
  const user = await getSupabaseUserOrNull();
  if (user === null) {
    return { ok: false, error: AUTH_REQUIRED_ERROR };
  }

  const record = KUDOS_RECORDS.find((r) => r.id === kudosId);
  if (!record) {
    return { ok: false, error: UNKNOWN_KUDOS_ERROR };
  }

  const viewerSlug = await resolveViewerSlug(user.id);
  if (viewerSlug !== null && viewerSlug === record.senderId) {
    return { ok: false, error: SELF_LIKE_ERROR };
  }

  try {
    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
      .from('kudos_likes')
      .select('id')
      .eq('kudos_id', kudosId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from('kudos_likes')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return { ok: true, liked: false };
    }

    const { error: insertError } = await supabase
      .from('kudos_likes')
      .insert({ kudos_id: kudosId, user_id: user.id });

    if (insertError) {
      if (insertError.code === UNIQUE_VIOLATION) {
        // A concurrent request already inserted this exact (kudos_id, user_id) row — the
        // user's intent ("liked") is already satisfied (edge-cases.md row 1).
        return { ok: true, liked: true };
      }
      throw new Error(insertError.message);
    }

    return { ok: true, liked: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('toggleKudosLike failed:', message);
    return { ok: false, error: GENERIC_ERROR };
  }
}
