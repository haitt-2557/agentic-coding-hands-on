// FR-013 — sidebar "D.1 stats" block (design/kudos-content.md §6.1). Design defect #3: all five
// metrics are the placeholder `25` in both the frame and the spec CSV; reproduced as drawn.

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

/** F39 — five labels, each unique, in the frame's D.1 row order. Verbatim text. */
export const STAT_ROWS: StatRow[] = [
  { label: 'Số Kudos bạn nhận được:', value: VIEWER_STATS.kudosReceived },
  { label: 'Số Kudos bạn đã gửi:', value: VIEWER_STATS.kudosSent },
  { label: 'Số tim bạn nhận được:', value: VIEWER_STATS.heartsReceived },
  { label: 'Số Secret Box bạn đã mở:', value: VIEWER_STATS.secretBoxesOpened },
  { label: 'Số Secret Box chưa mở:', value: VIEWER_STATS.secretBoxesUnopened },
];
