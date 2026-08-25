// FR-013 — sidebar "D.1 stats" block (design/kudos-content.md §6.1). Design defect #3: all five
// metrics are the placeholder `25` in both the frame and the spec CSV; reproduced as drawn.
// FR-008 makes row 3 ("Số tim bạn nhận được:") real — the weighted like ledger for the signed-in
// viewer, passed in from `useLikes().heartsReceived` (components/kudos/likes-provider.tsx). The
// remaining four rows stay the design-defect-#3 placeholder per clarifications decision 6 —
// Known Consequence 4 already records that the four will visibly disagree with row 3.

export interface ViewerStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  secretBoxesOpened: number;
  secretBoxesUnopened: number;
}

export const VIEWER_STATS: ViewerStats = {
  kudosReceived: 25,
  kudosSent: 25,
  heartsReceived: 25,
  secretBoxesOpened: 25,
  secretBoxesUnopened: 25,
};

export interface StatRow {
  label: string;
  value: number;
}

/**
 * F39 — five labels, each unique, in the frame's D.1 row order. Verbatim text.
 * `heartsReceived` is the only real number (FR-008); the rest stay the static `VIEWER_STATS`
 * placeholder. A viewer with no resolved slug (signed out or authenticated-but-unbridged) is
 * expected to pass `0` here — never `VIEWER_STATS.heartsReceived` — per edge-case row 13.
 */
export function buildStatRows(heartsReceived: number): StatRow[] {
  return [
    { label: 'Số Kudos bạn nhận được:', value: VIEWER_STATS.kudosReceived },
    { label: 'Số Kudos bạn đã gửi:', value: VIEWER_STATS.kudosSent },
    { label: 'Số tim bạn nhận được:', value: heartsReceived },
    { label: 'Số Secret Box bạn đã mở:', value: VIEWER_STATS.secretBoxesOpened },
    { label: 'Số Secret Box chưa mở:', value: VIEWER_STATS.secretBoxesUnopened },
  ];
}
