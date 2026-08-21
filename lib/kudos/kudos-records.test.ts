import { test, expect } from '@playwright/test';
import { KUDOS_RECORDS, MOCK_VIEWER_ID, formatHeartCount } from './kudos-records';
import { matchesFilter, filterRecords, highlightTop5 } from './kudos-queries';
import { HASHTAG_OPTIONS, DEPARTMENT_OPTIONS } from './filters';

// dom-contract.md §10 S1-S8 — the seed data breaks its own test here, not the E2E suite.
// MOCK_VIEWER_ID must equal DEFAULT_SESSION.userId in lib/session/session-provider.tsx —
// that file duplicates the same literal with a cross-reference comment (no cross-import, see
// implementer report for the reasoning).

test.describe('KUDOS_RECORDS — seed-data contract (dom-contract.md §10)', () => {
  test('S1 — exactly 9 records total, exactly 5 in the unfiltered highlight set', () => {
    expect(KUDOS_RECORDS).toHaveLength(9);
    const top5 = highlightTop5(KUDOS_RECORDS, { hashtag: null, department: null });
    expect(top5).toHaveLength(5);
  });

  test('S2 — heart counts are distinct integers and at least one exceeds 1000', () => {
    const counts = KUDOS_RECORDS.map((record) => record.heartCount);
    expect(new Set(counts).size).toBe(counts.length);
    for (const count of counts) {
      expect(Number.isInteger(count)).toBe(true);
      expect(count).toBeGreaterThan(0);
    }
    expect(counts.some((count) => count > 1000)).toBe(true);
  });

  test('S3 — filter vocabularies are in the frozen menu order', () => {
    expect(HASHTAG_OPTIONS).toEqual(['#Dedicated', '#Inspring', 'Tất cả']);
    expect(DEPARTMENT_OPTIONS).toEqual(['CEVC10', 'CECV10', 'Tất cả']);
  });

  test('S4 — #Dedicated and CEVC10 each carry at least 4 records', () => {
    const dedicatedCount = filterRecords(KUDOS_RECORDS, {
      hashtag: '#Dedicated',
      department: null,
    }).length;
    const cevc10Count = filterRecords(KUDOS_RECORDS, {
      hashtag: null,
      department: 'CEVC10',
    }).length;
    expect(dedicatedCount).toBeGreaterThanOrEqual(4);
    expect(cevc10Count).toBeGreaterThanOrEqual(4);
  });

  test('S5 — #Dedicated + CECV10 matches zero records (the reachable empty state)', () => {
    const matches = filterRecords(KUDOS_RECORDS, {
      hashtag: '#Dedicated',
      department: 'CECV10',
    });
    expect(matches).toHaveLength(0);
  });

  test('S6 — exactly one record is sent by the mock viewer, at index 1 (not 0)', () => {
    const viewerSentIndexes = KUDOS_RECORDS.reduce<number[]>((acc, record, index) => {
      if (record.senderId === MOCK_VIEWER_ID) acc.push(index);
      return acc;
    }, []);
    expect(viewerSentIndexes).toEqual([1]);
  });

  test('S7 — every record carries at least one hashtag; the first record starts with #Dedicated', () => {
    for (const record of KUDOS_RECORDS) {
      expect(record.hashtags.length).toBeGreaterThanOrEqual(1);
      for (const hashtag of record.hashtags) {
        expect(hashtag.startsWith('#')).toBe(true);
      }
    }
    expect(KUDOS_RECORDS[0].hashtags[0]).toBe('#Dedicated');
  });

  test('S8 — verbatim trailing-space names are preserved byte-for-byte', () => {
    const names = KUDOS_RECORDS.flatMap((record) => [record.senderName, record.receiverName]);
    expect(names).toContain('Mai phương Thúy ');
    expect(names.some((name) => name === 'Mai phương Thúy')).toBe(false);
  });

  test('every string field traces to real frame vocabulary (no invented names/hashtags)', () => {
    const knownNames = new Set([
      'Nguyễn Bá Chức',
      'Đỗ hoàng Hiệp',
      'Dương thúy An',
      'Mai phương Thúy ',
      'Lê Kiều Trang',
      'Nguyễn Văn Quy',
      'Nguyễn Hoàng Linh',
    ]);
    const knownBadges = new Set(['New Hero', 'Rising Hero', 'Super Hero', 'Legend Hero']);
    const knownDepts = new Set(['CEVC10', 'CECV10']);
    const knownHashtags = new Set(['#Dedicated', '#Inspring']);

    for (const record of KUDOS_RECORDS) {
      expect(knownNames.has(record.senderName)).toBe(true);
      expect(knownNames.has(record.receiverName)).toBe(true);
      expect(knownBadges.has(record.senderBadge)).toBe(true);
      expect(knownBadges.has(record.receiverBadge)).toBe(true);
      expect(knownDepts.has(record.senderDept)).toBe(true);
      expect(knownDepts.has(record.receiverDept)).toBe(true);
      for (const hashtag of record.hashtags) {
        expect(knownHashtags.has(hashtag)).toBe(true);
      }
    }
  });
});

test.describe('matchesFilter / filterRecords', () => {
  test('null filter fields are unconstrained (matches everything)', () => {
    expect(filterRecords(KUDOS_RECORDS, { hashtag: null, department: null })).toHaveLength(9);
  });

  test('AND semantics across hashtag and department', () => {
    const result = filterRecords(KUDOS_RECORDS, { hashtag: '#Inspring', department: 'CECV10' });
    for (const record of result) {
      expect(record.hashtags).toContain('#Inspring');
      expect([record.senderDept, record.receiverDept]).toContain('CECV10');
    }
  });

  test('matchesFilter agrees with filterRecords for a single record', () => {
    const [first] = KUDOS_RECORDS;
    expect(matchesFilter(first, { hashtag: null, department: null })).toBe(true);
  });
});

test.describe('highlightTop5', () => {
  test('sorts by heartCount descending and caps at 5', () => {
    const top5 = highlightTop5(KUDOS_RECORDS, { hashtag: null, department: null });
    const counts = top5.map((record) => record.heartCount);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    expect(top5.length).toBeLessThanOrEqual(5);
  });

  test('respects the active filter before ranking (S5 empty combination)', () => {
    const top5 = highlightTop5(KUDOS_RECORDS, { hashtag: '#Dedicated', department: 'CECV10' });
    expect(top5).toHaveLength(0);
  });
});

test.describe('formatHeartCount', () => {
  test('renders the frame Vietnamese thousands separator', () => {
    expect(formatHeartCount(1000)).toBe('1.000');
    expect(formatHeartCount(1500)).toBe('1.500');
  });

  test('leaves counts under 1000 as plain digits', () => {
    expect(formatHeartCount(45)).toBe('45');
    expect(formatHeartCount(999)).toBe('999');
  });
});
