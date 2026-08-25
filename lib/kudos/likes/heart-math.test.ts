import { test, expect } from '@playwright/test';
import { heartsGranted, tallyLikeCounts, likeCountFor, ledgerTotal } from './heart-math';

// ALG-001 / FR-003 / FR-006 / FR-007 — pure arithmetic, no Supabase involved. See heart-math.ts
// for why the ledger cannot be a single SQL aggregate; this file only proves the math once it
// already has rows in hand.

test.describe('heartsGranted', () => {
  test('a special-day like grants 2 hearts', () => {
    expect(heartsGranted(true)).toBe(2);
  });

  test('a normal-day like grants 1 heart', () => {
    expect(heartsGranted(false)).toBe(1);
  });
});

test.describe('tallyLikeCounts', () => {
  test('counts rows per kudos_id, including duplicates across different likers', () => {
    const rows = [
      { kudos_id: 'kudos-1' },
      { kudos_id: 'kudos-1' },
      { kudos_id: 'kudos-2' },
    ];
    expect(tallyLikeCounts(rows)).toEqual({ 'kudos-1': 2, 'kudos-2': 1 });
  });

  test('an empty row set yields an empty map', () => {
    expect(tallyLikeCounts([])).toEqual({});
  });
});

test.describe('likeCountFor', () => {
  test('returns the tallied count for a known id', () => {
    expect(likeCountFor({ 'kudos-1': 3 }, 'kudos-1')).toBe(3);
  });

  // edge-cases.md row 9 — a kudos with zero like rows must render 0, never NaN/undefined.
  test('returns 0 for an id absent from the map', () => {
    expect(likeCountFor({}, 'kudos-9')).toBe(0);
    expect(likeCountFor({ 'kudos-1': 3 }, 'kudos-2')).toBe(0);
  });
});

test.describe('ledgerTotal', () => {
  test('weights a mixed special/normal set correctly (2 special + 3 normal = 7)', () => {
    const rows = [
      { is_special: true },
      { is_special: true },
      { is_special: false },
      { is_special: false },
      { is_special: false },
    ];
    expect(ledgerTotal(rows)).toBe(7);
  });

  test('an empty row set totals to 0', () => {
    expect(ledgerTotal([])).toBe(0);
  });

  // edge-cases.md row 10 — an orphaned like row (kudos_id matches no static record) never
  // reaches this function in practice because ledger.ts pre-filters by authored id, but the
  // arithmetic itself must not special-case orphan rows: it just sums whatever it is given.
  test('sums exactly the rows it is handed, with no implicit filtering', () => {
    const rows = [{ is_special: false }];
    expect(ledgerTotal(rows)).toBe(1);
  });
});
