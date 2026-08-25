// Frozen exports for phase 04/05 consumers (phase-03-server-data-layer-likes-and-ledger.md
// "Frozen exports"). Keep this file to types only — no logic, so downstream phases can import it
// without pulling in Supabase or the pure math module as a side effect.

/** The two pieces of like state a board render needs: per-card counts and the viewer's own set
 * of liked kudos ids. `likedIds` is a plain array (not a Set) so it serialises cleanly across the
 * server/client boundary without extra marshalling. */
export interface BoardLikeState {
  counts: Record<string, number>;
  likedIds: string[];
}

/** SM-001 — two states only, the row is the truth. `liked` reports the state AFTER the toggle
 * ran, so the caller does not have to re-derive it from its own optimistic guess. */
export type ToggleLikeResult = { ok: true; liked: boolean } | { ok: false; error: string };
