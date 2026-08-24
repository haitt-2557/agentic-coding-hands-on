# Route List

**Project**: my-app
**Generated**: 2026-08-18

## Backend Routes

Trước 2026-08-19: không có backend route nào trong project này — không có
`app/api/**/route.ts`, không server action, không database client/ORM. Xác nhận bằng
scout-report.md § Background Logic Source Inventory và bằng chính cấu trúc thư mục `app/`
(chỉ gồm `page.tsx`, `layout.tsx`, `globals.css`, `favicon.ico` — không có file `route.ts`
nào) tại thời điểm đó.

**Cập nhật 2026-08-19**: dòng trên từng ghi thêm "không `middleware.ts`" — điều đó không
còn đúng. `proxy.ts` ở project root (tên mới của `middleware.ts` từ Next 16) nay chặn mọi
request trước khi route render, thực hiện gate đếm-ngược-trước-khi-mở-site cho
`/prelaunch` (xem `docs/vi/system/architecture.md` § Request-Interception Layer,
`docs/vi/generated/behavior-logic.md` BL001). Đây KHÔNG phải một backend route (không
expose endpoint, không trả JSON/response body riêng) nên không được cấp mã `ROUTE###` —
chỉ can thiệp vào việc route nào được phép render.

**Cập nhật (lượt Login, 2026-08-19)**: `app/auth/callback/route.ts` là route handler THẬT
đầu tiên của codebase này — có expose một endpoint (`GET`), nên được cấp mã `ROUTE###`,
khác với `proxy.ts` ở trên.

| Method | Path | File | Code | Owner F### | Ghi chú |
|---|---|---|---|---|---|
| GET | /auth/callback | `app/auth/callback/route.ts` | ROUTE008 | F011 | Đổi `code` OAuth (Google, qua Supabase) lấy session; redirect `/` (thành công) hoặc `/login?error=...` (thất bại/huỷ). Không trả JSON — luôn 307/308 redirect. Chi tiết: `docs/vi/system/architecture.md` § Authentication Layer. |

**Cập nhật (lượt Send Kudos Wishes, 2026-08-24)**: `submitKudos` (`lib/kudos/send/submit-kudos.ts`)
là **Server Action** đầu tiên của repo — được `KudosSendPageClient` gọi trực tiếp (không qua
`fetch`/HTTP method+path công khai). Nó **không được cấp `ROUTE###`**: bảng này định nghĩa
"route" là một endpoint có Method+Path độc lập, còn Server Action là một RPC gắn liền build ID
của trang gọi nó, không có Path riêng để liệt kê. Đây là một phán đoán phạm vi, không phải bỏ
sót — ghi lại tường minh để không bị hiểu nhầm là thiếu hàng.

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
| /awards | AwardsPage (`app/awards/page.tsx`) | awards | ROUTE002 | F003, F012 | ○ Static | **Cập nhật 2026-08-20** — không còn placeholder. Trang Hệ thống giải thưởng đầy đủ: `SiteHeader`/`SiteFooter` dùng chung (mới — route này trước đây không render chrome), hero thu nhỏ, khối tiêu đề, nav danh mục dính bên trái (scrollspy qua `IntersectionObserver`, không ghi lại hash), và 6 khối chi tiết giải thưởng tại đúng 6 anchor section `#<slug>` cũ: `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp` (nguồn: `lib/awards.ts` `EXPECTED_AWARD_SLUGS`, render tại `components/awards/award-detail-card.tsx` với `id={award.slug}` — giữ nguyên hợp đồng deep-link với trang chủ). Chi tiết: `docs/vi/features/award-system-page/technical-spec.md`. |
| /kudos | KudosPage (`app/kudos/page.tsx`) | kudos | ROUTE003 | F004, F013 | ○ Static | **Cập nhật 2026-08-21** — không còn placeholder. Trang Sun* Kudos - Live board đầy đủ: `SiteHeader`/`SiteFooter` dùng chung (mục "Sun* Kudos" derive `aria-current` từ `usePathname()`), banner + pill mời gửi kudos, khối HIGHLIGHT KUDOS (carousel 5 thẻ, 3 hiển thị cùng lúc, 2 dropdown lọc dùng chung), SPOTLIGHT BOARD (word cloud ~100 tên + tìm kiếm), ALL KUDOS (feed hiện dần theo cuộn), và sidebar thống kê cá nhân + bảng xếp hạng. Dữ liệu tĩnh trong `lib/kudos/`; không có API route, không có persistence. Mã route giữ nguyên ROUTE003 (không cấp mã mới). Chi tiết: `docs/vi/features/kudos-live-board/technical-spec.md`. |
| /profile | ProfilePage (`app/profile/page.tsx`) | profile | ROUTE004 | F007 | ○ Static | Route placeholder có chủ đích — cho account-menu resolve. |
| /admin | AdminDashboardPage (`app/admin/page.tsx`) | admin | ROUTE005 | F007 | ○ Static | Route placeholder có chủ đích — account-menu chỉ hiện link này khi `role === 'admin'` (gating phía client, xem `lib/session/session-provider.tsx`; không có server-side enforcement). |
| /_not-found | (Next.js auto-generated) | not-found | ROUTE006 | — (không feature nào sở hữu: route mặc định do Next.js sinh) | ○ Static | Không có file `app/not-found.tsx` tùy biến trong tree — đây là route `_not-found` mặc định do Next.js App Router tự sinh từ `app/layout.tsx`. Xác nhận bằng `npm run build` (in ra `○ /_not-found` trong bảng Route). |
| /prelaunch | PrelaunchPage (`app/prelaunch/page.tsx`) | prelaunch | ROUTE007 | F010 | ○ Static | Màn đếm ngược full-viewport — bị `proxy.ts` chặn mọi request khác vào cho tới khi `NEXT_PUBLIC_EVENT_START_AT` tới/qua hạn, sau đó tự redirect về `/` (xem § Backend Routes ở trên, `docs/vi/system/architecture.md` § Request-Interception Layer). |
| /login | LoginPage (`app/login/page.tsx`) | login | ROUTE009 | F011 | ƒ Dynamic (Server Component đọc `searchParams` + gọi `getUser()`) | **Thêm 2026-08-19** — Google OAuth qua Supabase. `getUser()` guard redirect `/` nếu đã có phiên; miễn trừ gate đếm-ngược cả 2 chiều (PERM004, xem `permissions-matrix.md`). |

**Xác thực nguồn route:** không có CLI probe manifest cho Next.js (Wave 0.4 chỉ nhận
diện Rails/Laravel/Phoenix/Symfony/Django) nên bảng trên suy ra Tier-2 từ static parse
cấu trúc `app/` — mỗi `page.tsx` là một route theo file-based routing convention của
App Router. Đã đối chiếu với build output thật (`npm run build`, Next.js 16.3.1,
Turbopack) — bảng Route in ra đúng 6 route ở lần build gốc, **tất cả đều `○ (Static)`**
(prerendered tại build time, không có route nào `ƒ (Dynamic)`); `/prelaunch` (thêm
2026-08-19) giữ cùng đặc tính static — vẫn prerender bình thường, chỉ khác ở việc
`proxy.ts` quyết định request nào được phép chạm tới nó.

**Cập nhật (lượt Login, 2026-08-19)** — build lại (`npm run build`, cùng Next.js
16.3.1/Turbopack) sau khi thêm `/login` + `/auth/callback` in ra:

```
┌ ○ /            ├ ƒ /auth/callback   ├ ○ /kudos     ├ ○ /prelaunch
├ ○ /_not-found  ├ ○ /awards          ├ ƒ /login     ├ ○ /profile
├ ○ /admin
ƒ Proxy (Middleware)
```

`/login` và `/auth/callback` là 2 route ĐẦU TIÊN trong toàn hệ thống render `ƒ (Dynamic)`
— cả hai đọc cookie (`getUser()`/`exchangeCodeForSession` qua `lib/supabase/server.ts`),
nên Next.js không thể prerender tĩnh. 7 route còn lại (kể cả `/prelaunch`) vẫn `○ Static`
— site vẫn chủ yếu tĩnh, không phải một chuyển dịch kiến trúc toàn phần.

### Pending: `/kudos/send` — F014_SendKudosWishes (2026-08-24, chưa cấp mã ROUTE###)

`/kudos/send` (`app/kudos/send/page.tsx`) là route MỚI thật — Server Component gọi
`requireSupabaseUser()` (`lib/kudos/send/auth-gate.ts`) trước khi render, `redirect('/login')`
nếu chưa có phiên Supabase hợp lệ (TC ID-1), rồi đọc song song `listProfiles()`/`listHashtags()`
(`lib/kudos/send/queries.ts`, bọc `withRetry()`) trước khi render form. Mã `ROUTE###` giữ
`TBD (draft)` — không tự đánh số ở lượt promote này.

| Path | Component | Owner F### | Rendering | Ghi chú |
|------|-----------|------------|-----------|---------|
| /kudos/send | KudosSendPage (`app/kudos/send/page.tsx`) | F014 | ƒ Dynamic (đọc `getUser()` + 2 query Supabase trước khi render) | Route ĐẦU TIÊN gate theo chiều "chưa đăng nhập → đá đi" (ngược PERM004); xem `permissions-matrix.md` § Pending. `GET /kudos/send` intermittently 500 (`JWT issued at future`, vài % mỗi lần chạy) — verdict inspection REWORK, chưa sealed, xem `clarifications.md` § "Decision on the residual 500". |

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | 1 (ROUTE008 `/auth/callback` — thêm 2026-08-19; `proxy.ts` không tính, vẫn là request-interception layer, không phải route) |
| Frontend Pages | 9 (7 route cũ + ROUTE009 `/login`) — **+1 pending** (`/kudos/send`, F014, chưa cấp mã nên không cộng vào 9) |
| Total | 10 (+1 pending) |
| Server Actions | 1 (`submitKudos`, F014, thêm 2026-08-24 — không cấp `ROUTE###`, xem § Backend Routes) |
