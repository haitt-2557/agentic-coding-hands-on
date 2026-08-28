// FR-008/FR-009 + BR-003 + DEC-001 — pure query functions over `KUDOS_RECORDS`. No memoisation,
// no caching (dom-contract.md §12): callers own re-render timing.

import type { KudosRecord } from './kudos-records';

/** `null` means "no constraint" on that field — this is what makes S5's zero-match combination
 * reachable and keeps both empty states (HIGHLIGHT and ALL KUDOS) consistent (F42). */
export interface KudosFilter {
  hashtag: string | null;
  department: string | null;
}

/** AND across both fields. Department matches either the sender's or receiver's dept code —
 * the seed data always sets them equal per card (see kudos-records.ts), but this stays
 * defensive rather than assuming that invariant holds forever. */
export function matchesFilter(record: KudosRecord, filter: KudosFilter): boolean {
  const hashtagMatches = filter.hashtag === null || record.hashtags.includes(filter.hashtag);
  const departmentMatches =
    filter.department === null ||
    record.senderDept === filter.department ||
    record.receiverDept === filter.department;
  return hashtagMatches && departmentMatches;
}

export function filterRecords(records: KudosRecord[], filter: KudosFilter): KudosRecord[] {
  return records.filter((record) => matchesFilter(record, filter));
}

/** Filter, then sort by heart count descending, then take the top 5 — the HIGHLIGHT KUDOS
 * carousel's unfiltered set (F14: denominator is always 5 on first load). */
export function highlightTop5(records: KudosRecord[], filter: KudosFilter): KudosRecord[] {
  return filterRecords(records, filter)
    .slice()
    .sort((a, b) => b.heartCount - a.heartCount)
    .slice(0, 5);
}

/** Newest-first order for the ALL KUDOS feed. `KUDOS_RECORDS` is authored in the order each
 * kudos was sent (kudos-1 first, kudos-9 most recent) and every record shares the same display
 * `timestamp` string (kudos-records.ts), so recency is the record's position in that array, not
 * its `timestamp` field. Reversing preserves whatever relative order the caller already
 * filtered down to. */
export function sortLatestFirst(records: KudosRecord[]): KudosRecord[] {
  return records.slice().reverse();
}
