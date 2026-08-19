# Route List

**Project**: my-app
**Generated**: 2026-08-18

## Backend Routes

Không có backend route nào trong project này — không có `app/api/**/route.ts`, không
server action, không database client/ORM. Xác nhận bằng scout-report.md § Background
Logic Source Inventory và bằng chính cấu trúc thư mục `app/` (chỉ gồm `page.tsx`,
`layout.tsx`, `globals.css`, `favicon.ico` — không có file `route.ts` nào). **None found.**

**Cập nhật 2026-08-19**: dòng trên từng ghi thêm "không `middleware.ts`" — điều đó không
còn đúng. `proxy.ts` ở project root (tên mới của `middleware.ts` từ Next 16) nay chặn mọi
request trước khi route render, thực hiện gate đếm-ngược-trước-khi-mở-site cho
`/prelaunch` (xem `docs/vi/system/architecture.md` § Request-Interception Layer,
`docs/vi/generated/behavior-logic.md` BL001). Đây KHÔNG phải một backend route (không
expose endpoint, không trả JSON/response body riêng) nên không được cấp mã `ROUTE###` —
chỉ can thiệp vào việc route nào được phép render.

## Frontend Routes/Pages

> **Code Column Contract:** `Code` là bắt buộc, dạng `ROUTE###`, liên tục và global
> trong file này. `Owner F###` mang F-code của feature sở hữu route; ở lượt Wave 1
> này `feature-list.md` chưa được sinh (feature synthesis là Wave 5, xem
> `_session-context.md` § Counts: `feature_count: <pending-W5>`) — mọi ô Owner F###
> ghi `—` và sẽ được đối chiếu ngược ở review pass sau khi feature-list.md tồn tại.

### File: app/**/page.tsx

| Path | Component | Route Name | Code | Owner F### | Rendering | Ghi chú |
|------|-----------|------------|------|------------|-----------|---------|
| / | Home (`app/page.tsx`) | home | ROUTE001 | F001–F009 (all homepage features) | ○ Static | Trang chủ — hero, countdown, awards, kudos. |
| /awards | AwardsPage (`app/awards/page.tsx`) | awards | ROUTE002 | F003 | ○ Static | Route placeholder có chủ đích — tồn tại để CTA/award-card từ trang chủ resolve, không 404. Mang 6 anchor section `#<slug>`: `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp` (nguồn: `lib/awards.ts` `AWARD_SLUGS`, render tại `app/awards/page.tsx:12` với `id={award.slug}`). |
| /kudos | KudosPage (`app/kudos/page.tsx`) | kudos | ROUTE003 | F004 | ○ Static | Route placeholder có chủ đích — cho link kudos-section/footer resolve. |
| /profile | ProfilePage (`app/profile/page.tsx`) | profile | ROUTE004 | F007 | ○ Static | Route placeholder có chủ đích — cho account-menu resolve. |
| /admin | AdminDashboardPage (`app/admin/page.tsx`) | admin | ROUTE005 | F007 | ○ Static | Route placeholder có chủ đích — account-menu chỉ hiện link này khi `role === 'admin'` (gating phía client, xem `lib/session/session-provider.tsx`; không có server-side enforcement). |
| /_not-found | (Next.js auto-generated) | not-found | ROUTE006 | — (không feature nào sở hữu: route mặc định do Next.js sinh) | ○ Static | Không có file `app/not-found.tsx` tùy biến trong tree — đây là route `_not-found` mặc định do Next.js App Router tự sinh từ `app/layout.tsx`. Xác nhận bằng `npm run build` (in ra `○ /_not-found` trong bảng Route). |
| /prelaunch | PrelaunchPage (`app/prelaunch/page.tsx`) | prelaunch | ROUTE007 | F010 | ○ Static | Màn đếm ngược full-viewport — bị `proxy.ts` chặn mọi request khác vào cho tới khi `NEXT_PUBLIC_EVENT_START_AT` tới/qua hạn, sau đó tự redirect về `/` (xem § Backend Routes ở trên, `docs/vi/system/architecture.md` § Request-Interception Layer). |

**Xác thực nguồn route:** không có CLI probe manifest cho Next.js (Wave 0.4 chỉ nhận
diện Rails/Laravel/Phoenix/Symfony/Django) nên bảng trên suy ra Tier-2 từ static parse
cấu trúc `app/` — mỗi `page.tsx` là một route theo file-based routing convention của
App Router. Đã đối chiếu với build output thật (`npm run build`, Next.js 16.3.1,
Turbopack) — bảng Route in ra đúng 6 route ở lần build gốc, **tất cả đều `○ (Static)`**
(prerendered tại build time, không có route nào `ƒ (Dynamic)`); `/prelaunch` (thêm
2026-08-19) giữ cùng đặc tính static — vẫn prerender bình thường, chỉ khác ở việc
`proxy.ts` quyết định request nào được phép chạm tới nó. Toàn bộ site vẫn là static.

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | 0 (không tính `proxy.ts` — request-interception layer, không phải route) |
| Frontend Pages | 7 |
| Total | 7 |
