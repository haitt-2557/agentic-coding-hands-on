import { test, expect } from '@playwright/test';
import { LEADERBOARD, LEADERBOARD_TITLE, leaderboardOrEmpty } from './leaderboard';

// F40/F41/F43, TC d662780b — the empty leaderboard state has no UI route on static data, so it
// is closed here as a pure helper per dom-contract.md §9.

test.describe('LEADERBOARD', () => {
  test('has exactly 5 entries, ranked 1..5, names carrying the verbatim trailing space', () => {
    expect(LEADERBOARD).toHaveLength(5);
    expect(LEADERBOARD.map((entry) => entry.rank)).toEqual([1, 2, 3, 4, 5]);
    for (const entry of LEADERBOARD) {
      expect(entry.name).toBe('Huỳnh Dương Xuân ');
      expect(entry.prizeDescription).toBe('Nhận được 1 áo phông SAA');
    }
  });

  test('title carries the real newline (F40 — not a <br/>)', () => {
    expect(LEADERBOARD_TITLE).toBe('10 SUNNER NHẬN QUÀ\nMỚI NHẤT');
    expect(LEADERBOARD_TITLE.includes('\n')).toBe(true);
  });
});

test.describe('leaderboardOrEmpty (TC d662780b)', () => {
  test('returns the sentinel message for an empty list', () => {
    expect(leaderboardOrEmpty([])).toBe('Chưa có dữ liệu');
  });

  test('returns the entries unchanged when non-empty', () => {
    expect(leaderboardOrEmpty(LEADERBOARD)).toEqual(LEADERBOARD);
  });
});
