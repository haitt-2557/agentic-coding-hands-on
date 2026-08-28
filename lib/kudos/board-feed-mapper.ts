// Board rewire (read side) — pure mapping from a `list_board_kudos` RPC row (migration
// 20260828154500) to the `KudosRecord` shape both card variants already render. Pure and
// IO-free so kudos-records.test.ts-style unit tests can pin it without Supabase.
//
// Deliberate defaults, each the DB row's honest value rather than an invention:
// - heartCount 0: a DB row has no static heart baseline; its displayed count is
//   `0 + likeCount(id)` via the existing formula in kudos-card-actions.tsx.
// - badge 'New Hero' / kudosReceived 0: the DB has no badge/star ledger for real senders yet.
// - attachments []: the kudos-images bucket is private with owner-only select (F014 decision 4)
//   — nothing may render another user's attachment until that policy decision is reopened.
// - category '': the frame's category tag exists only on the 9 static records; the send form
//   captures no category.

import type { KudosRecord } from './kudos-records';

export interface BoardKudosRow {
  id: string;
  title: string;
  message: string;
  is_anonymous: boolean;
  nickname: string | null;
  created_at: string;
  sender_slug: string | null;
  sender_name: string | null;
  sender_dept: string | null;
  recipient_id: string;
  recipient_name: string;
  recipient_dept: string | null;
  hashtags: string[];
  is_own: boolean;
}

const DEFAULT_BADGE = 'New Hero';
// The board's timestamps are Vietnam-event-local (frame format 'HH:mm - MM/DD/YYYY', spec
// C.3.4); pin the zone so the rendered string does not depend on the server's own timezone.
const EVENT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/** Formats an ISO instant as the frame's 'HH:mm - MM/DD/YYYY' (spec C.3.4), event-local. */
export function formatKudosTimestamp(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EVENT_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  // `hour12: false` can yield '24' at midnight in some ICU versions; normalise to '00'.
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${hour}:${get('minute')} - ${get('month')}/${get('day')}/${get('year')}`;
}

/**
 * Maps one RPC row to a renderable KudosRecord. The sender identity resolves in this order:
 * anonymous → nickname only (the RPC already withheld the profile — see the migration header);
 * bridged → the real profile slug/name/department, which also lets the existing
 * `senderId === viewerSlug` rule disable the sender's own heart button; unbridged → a 'db:'-
 * prefixed synthetic id that can never equal a viewer slug. Because that synthetic id (and an
 * anonymous row's withheld profile) blinds the slug rule, ownership rides separately as
 * `viewerIsSender` — the RPC's per-caller `auth.uid()` verdict (TC 63645b03) — so the heart
 * still disables on the sender's own kudos; the RLS policy remains the hard backstop.
 */
export function mapBoardKudosRow(row: BoardKudosRow): KudosRecord {
  const senderName = row.is_anonymous
    ? row.nickname?.trim() || 'Ẩn danh'
    : (row.sender_name ?? 'Sunner');
  const senderId = !row.is_anonymous && row.sender_slug ? row.sender_slug : `db:${row.id}`;
  // The card has no title slot (the 9 static records carry none), so the title joins the
  // message body rather than being dropped — it is content the sender wrote.
  const message = row.title.trim() ? `${row.title.trim()} — ${row.message}` : row.message;

  return {
    id: row.id,
    senderId,
    senderName,
    senderDept: (row.is_anonymous ? '' : (row.sender_dept ?? '')) || '',
    senderBadge: DEFAULT_BADGE,
    senderKudosReceived: 0,
    receiverId: row.recipient_id,
    receiverName: row.recipient_name,
    receiverDept: row.recipient_dept ?? '',
    receiverBadge: DEFAULT_BADGE,
    receiverKudosReceived: 0,
    category: '',
    message,
    highlightMessage: message,
    hashtags: row.hashtags,
    attachments: [],
    heartCount: 0,
    timestamp: formatKudosTimestamp(row.created_at),
    variant: 'post',
    viewerIsSender: row.is_own,
  };
}
