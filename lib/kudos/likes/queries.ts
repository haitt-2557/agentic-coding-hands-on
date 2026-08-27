// FR-003 / FR-005 — the board's read side of the like ledger. Two independent queries, not one
// join: the count query has to work for `anon` (phase 01 grants `select` + `using (true)` to both
// roles, so a signed-out visitor still sees real counts), while the viewer's own liked set only
// makes sense when someone is signed in. Selecting only `kudos_id` for the count query (never
// `is_special`) keeps the per-card number a row count, not a weighted sum — mixing the two would
// double-count on special days (FR-003 vs FR-006/007).
//
// A query failure here must not take the board down (FR-005: the board is still public even when
// something upstream misbehaves) — it logs and returns an empty state instead of throwing.

import { createClient } from '@/lib/supabase/server';
import { tallyLikeCounts } from './heart-math';
import { formatQueryFailure } from './query-failure-log';
import type { BoardLikeState } from './types';

const EMPTY_STATE: BoardLikeState = { counts: {}, likedIds: [] };

/**
 * Loads the per-card like counts (all viewers) and, when `userId` is present, the viewer's own
 * liked-kudos ids. Returns an empty-but-valid state on any query error rather than throwing.
 */
export async function loadBoardLikeState(userId: string | null): Promise<BoardLikeState> {
  try {
    const supabase = await createClient();

    // Rework (Stage 5 inspection, finding 5): deliberately unfiltered — there are only 9 static
    // kudos ids (lib/kudos/kudos-records.ts) and the board never asks for anything narrower than
    // "every count for every card on this render", so a `WHERE kudos_id IN (...)` would not
    // reduce the row count in practice today, only add a query-building step. This stops being
    // acceptable the moment `kudos_id` stops being a small, fixed, static set (i.e. the deferred
    // board-rewire seam this migration's header comment already calls out) — at that point this
    // needs a `WHERE kudos_id = ANY($1)` scoped to the ids actually rendered, plus a supporting
    // index on `kudos_likes(kudos_id)`.
    const { data: allRows, error: allRowsError } = await supabase
      .from('kudos_likes')
      .select('kudos_id');

    if (allRowsError || !allRows) {
      console.error(formatQueryFailure('count', allRowsError));
      return EMPTY_STATE;
    }

    const counts = tallyLikeCounts(allRows as { kudos_id: string }[]);

    if (userId === null) {
      return { counts, likedIds: [] };
    }

    const { data: ownRows, error: ownRowsError } = await supabase
      .from('kudos_likes')
      .select('kudos_id')
      .eq('user_id', userId);

    if (ownRowsError || !ownRows) {
      console.error(formatQueryFailure('viewer', ownRowsError));
      return { counts, likedIds: [] };
    }

    const likedIds = (ownRows as { kudos_id: string }[]).map((row) => row.kudos_id);

    return { counts, likedIds };
  } catch (error) {
    console.error('loadBoardLikeState failed:', error instanceof Error ? error.message : error);
    return EMPTY_STATE;
  }
}
