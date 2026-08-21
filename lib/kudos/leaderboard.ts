// FR-014 — sidebar "10 SUNNER NHẬN QUÀ MỚI NHẤT" leaderboard (design/kudos-content.md §6.3).
// Frame is truth over the spec CSV's second "thăng hạng" list, which does not exist as a node
// anywhere on the frame (design defect #1) — one leaderboard only.

export interface LeaderboardEntry {
  rank: number;
  name: string;
  prizeDescription: string;
}

/** F40 — a single text node containing a real newline, rendered with `whitespace-pre-line`.
 * Not `<br/>`: a `<br/>` would lose this whitespace from `textContent`. */
export const LEADERBOARD_TITLE = '10 SUNNER NHẬN QUÀ\nMỚI NHẤT';

// design/kudos-content.md §6.3 — all five names carry a verbatim trailing space (S8).
export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Huỳnh Dương Xuân ', prizeDescription: 'Nhận được 1 áo phông SAA' },
  { rank: 2, name: 'Huỳnh Dương Xuân ', prizeDescription: 'Nhận được 1 áo phông SAA' },
  { rank: 3, name: 'Huỳnh Dương Xuân ', prizeDescription: 'Nhận được 1 áo phông SAA' },
  { rank: 4, name: 'Huỳnh Dương Xuân ', prizeDescription: 'Nhận được 1 áo phông SAA' },
  { rank: 5, name: 'Huỳnh Dương Xuân ', prizeDescription: 'Nhận được 1 áo phông SAA' },
];

const EMPTY_LEADERBOARD_MESSAGE = 'Chưa có dữ liệu';

/**
 * F43 / TC d662780b — not reachable through the UI on static data (the seed leaderboard is
 * never empty), so the empty-state choice is proven here as a pure helper instead. The
 * component (Phase 7) renders whatever this returns: the entry list, or the sentinel message.
 */
export function leaderboardOrEmpty(entries: LeaderboardEntry[]): LeaderboardEntry[] | string {
  return entries.length > 0 ? entries : EMPTY_LEADERBOARD_MESSAGE;
}
