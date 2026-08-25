// ALG-001 / FR-003 / FR-006 / FR-007 — pure arithmetic over `kudos_likes` rows. No Supabase
// import here on purpose: this module is the unit-testable half of the ledger, kept separate
// from the I/O half (queries.ts, ledger.ts) so the weighting logic can be pinned down without a
// database. See ledger.ts for why the sender-credit join still has to live in application code.

/** ALG-001 — a like row's `is_special` flag decides its weight, always as stored, never
 * recomputed from `current_date` (BR-005: a revoke must undo exactly what the accrual granted). */
export function heartsGranted(isSpecial: boolean): number {
  return isSpecial ? 2 : 1;
}

/** FR-003 — per-card display count is a row count, not weighted: `is_special` only ever affects
 * the sender's ledger (FR-006/007), never the number shown on the card itself. */
export function tallyLikeCounts(rows: { kudos_id: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.kudos_id] = (counts[row.kudos_id] ?? 0) + 1;
  }
  return counts;
}

/** edge-cases.md row 9 — a kudos with zero like rows never gets a key in the tally map. Reading
 * that as `undefined` would render `NaN` once added to the static `heartCount`; this returns 0. */
export function likeCountFor(counts: Record<string, number>, kudosId: string): number {
  return counts[kudosId] ?? 0;
}

/** FR-006/FR-007/ALG-001 — the weighted sum a ledger consumer applies to whatever rows it is
 * handed. It does not know or care whose rows these are; ledger.ts owns filtering to "rows for
 * kudos this slug authored" before calling this. */
export function ledgerTotal(rows: { is_special: boolean }[]): number {
  return rows.reduce((total, row) => total + heartsGranted(row.is_special), 0);
}
