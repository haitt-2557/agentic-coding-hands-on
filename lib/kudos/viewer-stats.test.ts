import { test, expect } from '@playwright/test';
import { buildStatRows, VIEWER_STATS } from './viewer-stats';

// FR-008 — buildStatRows(heartsReceived) keeps the five frame-order labels fixed and static
// (design defect #3, clarifications decision 6), swapping only the third row's value for the
// real per-viewer ledger total. Labels are copied verbatim from the frame; do not retype them.

test.describe('buildStatRows', () => {
  test('returns the five labels in frame order with the placeholder values unchanged', () => {
    const rows = buildStatRows(42);

    expect(rows.map((row) => row.label)).toEqual([
      'Số Kudos bạn nhận được:',
      'Số Kudos bạn đã gửi:',
      'Số tim bạn nhận được:',
      'Số Secret Box bạn đã mở:',
      'Số Secret Box chưa mở:',
    ]);
    expect(rows[0].value).toBe(VIEWER_STATS.kudosReceived);
    expect(rows[1].value).toBe(VIEWER_STATS.kudosSent);
    expect(rows[3].value).toBe(VIEWER_STATS.secretBoxesOpened);
    expect(rows[4].value).toBe(VIEWER_STATS.secretBoxesUnopened);
  });

  test('the third row (hearts received) carries the real per-viewer ledger total', () => {
    const rows = buildStatRows(7);
    expect(rows[2].value).toBe(7);
  });

  test('an unbridged or signed-out viewer (heartsReceived = 0) shows 0, not the placeholder', () => {
    const rows = buildStatRows(0);
    expect(rows[2].value).toBe(0);
  });
});
