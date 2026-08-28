// Board rewire (read side) — the IO half: calls the `list_board_kudos` security-definer RPC
// (migration 20260828154500) and maps rows through board-feed-mapper.ts. Split from the mapper
// so the mapping stays unit-testable without Supabase.
//
// Same degrade contract as every other read on /kudos (loadBoardLikeState, resolveViewerSlug):
// a failure logs and returns [] — the board must still render its 9 static records when
// Supabase local is down (FR-005: the board stays public and alive).

import { createClient } from '@/lib/supabase/server';
import { mapBoardKudosRow, type BoardKudosRow } from './board-feed-mapper';
import type { KudosRecord } from './kudos-records';

/**
 * Loads every DB-persisted kudos as renderable records, oldest first — the RPC orders by
 * `created_at asc` so that appending these AFTER the 9 static records keeps one global
 * "authored order" array, which `sortLatestFirst` (kudos-queries.ts) then flips into the
 * feed's newest-first display. Returns [] on any failure; never throws.
 */
export async function loadBoardKudos(): Promise<KudosRecord[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('list_board_kudos');

    if (error || !data) {
      console.error('loadBoardKudos failed:', error?.message ?? 'no data');
      return [];
    }

    return (data as BoardKudosRow[]).map(mapBoardKudosRow);
  } catch (error) {
    console.error('loadBoardKudos failed:', error instanceof Error ? error.message : error);
    return [];
  }
}
