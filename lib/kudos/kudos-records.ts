// FR-006/FR-008/FR-009/FR-010 + BR-001/BR-002/BR-003 — the single source of kudos content for
// both the HIGHLIGHT KUDOS carousel and the ALL KUDOS feed (dom-contract.md §12).
//
// The frame draws one kudos repeated seven times (design defect #11): identical sender,
// receiver, department, category, hashtag line and heart count on every card. Seeding that
// verbatim cannot demonstrate filtering, most-hearted ranking, heart ownership or the empty
// state, so these 9 records are *recombined* from real frame vocabulary only — clarifications.md
// "Session 2026-08-21 (second pass)": the 7 word-cloud names, the 4 real badge tiers, both real
// department spellings (`CEVC10` on post-card-derived records, `CECV10` on highlight-derived
// records — defect #15, both kept), the 2 real hashtags, the 1 real category. No name, hashtag,
// department or category below is invented. One line per record (dom-contract.md's own
// precedent for the 106-row spotlight table) keeps this file under the 200-line ceiling.
//
// `message`/`highlightMessage` reuse the frame's one real message body verbatim in both its
// forms (design/kudos-content.md §3.3 vs §5.4, design defect #13) — the frame gives no second
// message, so every record shares the same pair rather than inventing per-record copy.
//
// `variant` documents which literal card type this record's department spelling was
// transcribed from (`'post'` = `CEVC10`, `'highlight'` = `CECV10`); it is metadata, not a
// filter — `highlightTop5` in kudos-queries.ts ranks purely by heart count, so a `'post'`
// record can still land in the highlight carousel and vice versa.
//
// MOCK_VIEWER_ID/MOCK_VIEWER_DISPLAY_NAME must equal DEFAULT_SESSION.userId/.displayName in
// lib/session/session-provider.tsx. The two files intentionally do not import each other —
// session-provider is generic app infrastructure and should not depend on one feature's data
// module — so the literal is duplicated there with a cross-reference comment back to this file.
// kudos-records.test.ts is the drift detector: it asserts against this file's own constant.

export interface KudosRecord {
  id: string;
  senderId: string;
  senderName: string;
  senderDept: string;
  senderBadge: string;
  senderKudosReceived: number;
  receiverId: string;
  receiverName: string;
  receiverDept: string;
  receiverBadge: string;
  receiverKudosReceived: number;
  category: string;
  message: string;
  highlightMessage: string;
  hashtags: string[];
  attachments: string[];
  heartCount: number;
  timestamp: string;
  variant: 'highlight' | 'post';
}

/** The mock viewer's identity — see the file header for why this is duplicated, not imported,
 * into lib/session/session-provider.tsx. Must be one of the 7 real word-cloud names (S6). */
export const MOCK_VIEWER_ID = 'nguyen-hoang-linh';
export const MOCK_VIEWER_DISPLAY_NAME = 'Nguyễn Hoàng Linh';

const CATEGORY = 'IDOL GIỚI TRẺ';
const TIMESTAMP = '10:00 - 10/30/2025';
// design/kudos-content.md §5.4 — the full post-card message body, verbatim.
const MESSAGE =
  'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...';
// design/kudos-content.md §3.3 — the shorter highlight-card truncation (design defect #13).
// A separate verbatim string, not derived from MESSAGE.
const HIGHLIGHT_MESSAGE =
  'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất...';
// design/kudos-content.md §5.3 — all four post cards render 5 identical `MM_MEDIA_Sample Image`
// thumbnails; highlight cards render no attachment row at all (§3.3).
// Path is `/saa/Sample_Image.png` — every SAA asset in this project lives under `public/saa/`,
// which is where Phase 2 placed the frame's 88x88 attachment export (node `…;256:5177;513:8436`).
// An earlier `/images/kudos/attachment-sample.png` pointed at a directory that does not exist.
const POST_ATTACHMENTS: string[] = Array.from({ length: 5 }, () => '/saa/Sample_Image.png');
const NO_ATTACHMENTS: string[] = [];

/** kudosReceived per badge tier (BR-005 star input). Loosely correlated with tier for narrative
 * coherence; no test pins these exact numbers — star-tiers.test.ts exercises the pure threshold
 * function directly with boundary values instead. */
const KR: Record<string, number> = { 'New Hero': 5, 'Rising Hero': 15, 'Super Hero': 35, 'Legend Hero': 60 };

// prettier-ignore
export const KUDOS_RECORDS: KudosRecord[] = [
  // id, sender, dept, senderBadge -> receiver, dept, receiverBadge, hashtags, hearts, variant
  { id: 'kudos-1', senderId: 'nguyen-ba-chuc', senderName: 'Nguyễn Bá Chức', senderDept: 'CEVC10', senderBadge: 'New Hero', senderKudosReceived: KR['New Hero'], receiverId: 'do-hoang-hiep', receiverName: 'Đỗ hoàng Hiệp', receiverDept: 'CEVC10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Dedicated', '#Inspring'], attachments: POST_ATTACHMENTS, heartCount: 1500, timestamp: TIMESTAMP, variant: 'post' },
  { id: 'kudos-2', senderId: MOCK_VIEWER_ID, senderName: MOCK_VIEWER_DISPLAY_NAME, senderDept: 'CEVC10', senderBadge: 'Rising Hero', senderKudosReceived: KR['Rising Hero'], receiverId: 'mai-phuong-thuy', receiverName: 'Mai phương Thúy ', receiverDept: 'CEVC10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Dedicated'], attachments: POST_ATTACHMENTS, heartCount: 45, timestamp: TIMESTAMP, variant: 'post' },
  { id: 'kudos-3', senderId: 'duong-thuy-an', senderName: 'Dương thúy An', senderDept: 'CEVC10', senderBadge: 'Super Hero', senderKudosReceived: KR['Super Hero'], receiverId: 'le-kieu-trang', receiverName: 'Lê Kiều Trang', receiverDept: 'CEVC10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Dedicated', '#Inspring'], attachments: POST_ATTACHMENTS, heartCount: 999, timestamp: TIMESTAMP, variant: 'post' },
  { id: 'kudos-4', senderId: 'nguyen-van-quy', senderName: 'Nguyễn Văn Quy', senderDept: 'CEVC10', senderBadge: 'New Hero', senderKudosReceived: KR['New Hero'], receiverId: 'nguyen-ba-chuc', receiverName: 'Nguyễn Bá Chức', receiverDept: 'CEVC10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Dedicated'], attachments: POST_ATTACHMENTS, heartCount: 890, timestamp: TIMESTAMP, variant: 'post' },
  { id: 'kudos-5', senderId: 'le-kieu-trang', senderName: 'Lê Kiều Trang', senderDept: 'CEVC10', senderBadge: 'Rising Hero', senderKudosReceived: KR['Rising Hero'], receiverId: MOCK_VIEWER_ID, receiverName: MOCK_VIEWER_DISPLAY_NAME, receiverDept: 'CEVC10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Inspring'], attachments: POST_ATTACHMENTS, heartCount: 678, timestamp: TIMESTAMP, variant: 'post' },
  { id: 'kudos-6', senderId: 'mai-phuong-thuy', senderName: 'Mai phương Thúy ', senderDept: 'CEVC10', senderBadge: 'Super Hero', senderKudosReceived: KR['Super Hero'], receiverId: 'duong-thuy-an', receiverName: 'Dương thúy An', receiverDept: 'CEVC10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Inspring'], attachments: POST_ATTACHMENTS, heartCount: 512, timestamp: TIMESTAMP, variant: 'post' },
  { id: 'kudos-7', senderId: 'do-hoang-hiep', senderName: 'Đỗ hoàng Hiệp', senderDept: 'CEVC10', senderBadge: 'New Hero', senderKudosReceived: KR['New Hero'], receiverId: 'nguyen-van-quy', receiverName: 'Nguyễn Văn Quy', receiverDept: 'CEVC10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Inspring'], attachments: POST_ATTACHMENTS, heartCount: 340, timestamp: TIMESTAMP, variant: 'post' },
  // CECV10 (highlight spelling) + #Inspring-only — kudos-8/9 are the S5 zero-match combination.
  { id: 'kudos-8', senderId: 'nguyen-ba-chuc', senderName: 'Nguyễn Bá Chức', senderDept: 'CECV10', senderBadge: 'Rising Hero', senderKudosReceived: KR['Rising Hero'], receiverId: 'le-kieu-trang', receiverName: 'Lê Kiều Trang', receiverDept: 'CECV10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Inspring'], attachments: NO_ATTACHMENTS, heartCount: 120, timestamp: TIMESTAMP, variant: 'highlight' },
  { id: 'kudos-9', senderId: 'duong-thuy-an', senderName: 'Dương thúy An', senderDept: 'CECV10', senderBadge: 'Super Hero', senderKudosReceived: KR['Super Hero'], receiverId: 'mai-phuong-thuy', receiverName: 'Mai phương Thúy ', receiverDept: 'CECV10', receiverBadge: 'Legend Hero', receiverKudosReceived: KR['Legend Hero'], category: CATEGORY, message: MESSAGE, highlightMessage: HIGHLIGHT_MESSAGE, hashtags: ['#Inspring'], attachments: NO_ATTACHMENTS, heartCount: 95, timestamp: TIMESTAMP, variant: 'highlight' },
];

/**
 * Renders a heart count with the frame's own Vietnamese thousands separator (`1.000`, design
 * defect #19). Overrides the phase file's original "no formatter, keep counts under 1000"
 * guidance — the sealed dom-contract.md F28/S2 rule was written before the tester's heart-toggle
 * assertion was updated to strip non-digit characters before parsing, so `parseInt` no longer
 * truncates at the separator. Recorded as a deviation in the implementer report.
 */
export function formatHeartCount(count: number): string {
  return count.toLocaleString('vi-VN');
}
