# Route List

**Project**: my-app
**Generated**: 2026-08-18

## Backend Routes

Không có backend route nào trong project này. Đây là ứng dụng Next.js App Router thuần
client/static — không có `app/api/**/route.ts`, không `middleware.ts`, không server
action, không database client/ORM. Xác nhận bằng scout-report.md § Background Logic
Source Inventory (zero hit ở mọi category) và bằng chính cấu trúc thư mục `app/`
(chỉ gồm `page.tsx`, `layout.tsx`, `globals.css`, `favicon.ico` — không có file
`route.ts` nào). **None found.**

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

**Xác thực nguồn route:** không có CLI probe manifest cho Next.js (Wave 0.4 chỉ nhận
diện Rails/Laravel/Phoenix/Symfony/Django) nên bảng trên suy ra Tier-2 từ static parse
cấu trúc `app/` — mỗi `page.tsx` là một route theo file-based routing convention của
App Router. Đã đối chiếu với build output thật (`npm run build`, Next.js 16.3.1,
Turbopack) — bảng Route in ra đúng 6 route, **tất cả đều `○ (Static)`** (prerendered
tại build time, không có route nào `ƒ (Dynamic)`). Đây là dữ kiện quan trọng nhất của
route surface này: toàn bộ site là static.

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | 0 |
| Frontend Pages | 6 |
| Total | 6 |
