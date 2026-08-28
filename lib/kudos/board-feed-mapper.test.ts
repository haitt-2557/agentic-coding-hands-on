import { test, expect } from '@playwright/test';
import { mapBoardKudosRow, formatKudosTimestamp, type BoardKudosRow } from './board-feed-mapper';

// Board rewire (TC ca8f60b3) — pins the pure RPC-row → KudosRecord mapping so the DB feed's
// display rules (anonymity, identity bridging, zero heart baseline) break here, not in e2e.

const BASE_ROW: BoardKudosRow = {
  id: '3c1f2a00-0000-4000-8000-000000000001',
  title: 'Board rewire',
  message: 'thanks for the read side',
  is_anonymous: false,
  nickname: null,
  created_at: '2026-08-28T08:30:00.000Z',
  sender_slug: 'nguyen-hoang-linh',
  sender_name: 'Nguyễn Hoàng Linh',
  sender_dept: 'CECV10',
  recipient_id: 'duong-thuy-an',
  recipient_name: 'Dương thúy An',
  recipient_dept: 'CEVC10',
  hashtags: ['#WASSHOI'],
  is_own: false,
};

test.describe('mapBoardKudosRow', () => {
  test('bridged sender maps to the real profile slug so the own-heart disable rule works', () => {
    const record = mapBoardKudosRow(BASE_ROW);
    expect(record.senderId).toBe('nguyen-hoang-linh');
    expect(record.senderName).toBe('Nguyễn Hoàng Linh');
    expect(record.receiverName).toBe('Dương thúy An');
    expect(record.heartCount).toBe(0);
    expect(record.attachments).toEqual([]);
    expect(record.variant).toBe('post');
    expect(record.hashtags).toEqual(['#WASSHOI']);
    // Title is sender-written content and the card has no title slot — it joins the message.
    expect(record.message).toBe('Board rewire — thanks for the read side');
  });

  test('anonymous row renders the nickname and never a profile identity', () => {
    const record = mapBoardKudosRow({
      ...BASE_ROW,
      is_anonymous: true,
      nickname: 'Sunner bí ẩn',
      // The RPC withholds these when is_anonymous, but the mapper must not rely on that alone.
      sender_slug: 'nguyen-hoang-linh',
      sender_name: 'Nguyễn Hoàng Linh',
      sender_dept: 'CECV10',
    });
    expect(record.senderName).toBe('Sunner bí ẩn');
    expect(record.senderDept).toBe('');
    expect(record.senderId).toBe(`db:${BASE_ROW.id}`);
  });

  test('unbridged sender falls back to a db-prefixed id that can never equal a viewer slug', () => {
    const record = mapBoardKudosRow({ ...BASE_ROW, sender_slug: null, sender_name: null, sender_dept: null });
    expect(record.senderId).toBe(`db:${BASE_ROW.id}`);
    expect(record.senderName).toBe('Sunner');
    expect(record.senderDept).toBe('');
  });

  // TC 63645b03 regression — the slug rule alone cannot see ownership of an anonymous or
  // unbridged row (senderId becomes 'db:…'), so the RPC's per-caller `is_own` must survive the
  // mapping as `viewerIsSender` for the heart button to disable on the sender's own kudos.
  test('is_own survives mapping as viewerIsSender even when the sender identity is withheld', () => {
    const anonymousOwn = mapBoardKudosRow({
      ...BASE_ROW,
      is_anonymous: true,
      nickname: 'Sunner bí ẩn',
      is_own: true,
    });
    expect(anonymousOwn.viewerIsSender).toBe(true);

    const unbridgedOwn = mapBoardKudosRow({
      ...BASE_ROW,
      sender_slug: null,
      sender_name: null,
      sender_dept: null,
      is_own: true,
    });
    expect(unbridgedOwn.viewerIsSender).toBe(true);

    expect(mapBoardKudosRow(BASE_ROW).viewerIsSender).toBe(false);
  });

  test('empty title leaves the message untouched', () => {
    const record = mapBoardKudosRow({ ...BASE_ROW, title: '  ' });
    expect(record.message).toBe('thanks for the read side');
  });
});

test.describe('formatKudosTimestamp', () => {
  test('renders the frame format HH:mm - MM/DD/YYYY in event-local time (UTC+7)', () => {
    // 08:30 UTC = 15:30 Asia/Ho_Chi_Minh
    expect(formatKudosTimestamp('2026-08-28T08:30:00.000Z')).toBe('15:30 - 08/28/2026');
    // Midnight boundary: 17:00 UTC = 00:00 next day UTC+7 — must be '00', never '24'.
    expect(formatKudosTimestamp('2026-08-27T17:00:00.000Z')).toBe('00:00 - 08/28/2026');
  });
});
