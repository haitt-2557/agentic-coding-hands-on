# API Map

**Project**: my-app (Sun* Annual Awards 2025 — Homepage sự kiện)
**Generated**: 2026-08-18

## Kết luận (2026-08-18): không có API surface để map

Đối chiếu hai artifact nguồn cho lượt sinh gốc:

- `route-list.md` § Backend Routes: **0 backend route** — repo là Next.js App Router thuần
  client/static, không có `app/api/**/route.ts`, không server action. 7 route trong repo
  đều là **frontend page** (`ROUTE001`–`ROUTE007`, tất cả `○ Static`, xác nhận bằng
  `npm run build`). **Cập nhật 2026-08-19**: `proxy.ts` (request-interception layer, tên
  mới của `middleware.ts` từ Next 16) nay tồn tại — nhưng nó không expose endpoint/response
  body riêng, chỉ quyết định route nào được phép render, nên không đổi kết luận "0 backend
  route" ở đây.
- `behavior-logic.md` § Behavior Logic Index: **1 BL item** (`BL001_PrelaunchLaunchGate`,
  type `middleware`, thêm 2026-08-19) trên 10 category chuẩn — nhưng BL001 không gắn với
  bất kỳ API handler nào (nó redirect giữa các page, không trả response body của một API),
  nên vẫn không có hàng nào để thêm vào API Map.

## Cập nhật (lượt Login, 2026-08-19): 1 backend route thật

`app/auth/callback/route.ts` (ROUTE008, xem `route-list.md` § Backend Routes) là route
handler thật đầu tiên của codebase — expose `GET /auth/callback`, trả về redirect (không
JSON, nhưng vẫn là một endpoint thật với logic phân nhánh riêng), nên nay có đúng 1 hàng
trong API Map dưới đây.

### API Routes (grouped by domain/resource)

**Auth**

| Method | Path | Handler BL### | Auth |
|--------|------|---------------|------|
| GET | /auth/callback | BL002_OAuthCallbackExchange (`behavior-logic.md`) | Không xác thực (route tự nó KHÔNG yêu cầu phiên có sẵn — nó là nơi phiên được TẠO RA); bảo vệ open-redirect bằng `getSiteUrl()`, không dùng `request.nextUrl.origin` (xem `docs/vi/system/architecture.md` § Authentication Layer) |

## Cập nhật (lượt Send Kudos Wishes, 2026-08-24) — đã xét và loại

`submitKudos` (`lib/kudos/send/submit-kudos.ts`) là **Server Action** đầu tiên của repo, gọi
trực tiếp từ `KudosSendPageClient` — không có Method+Path độc lập kiểu REST để liệt kê ở đây
(bảng "API Routes" trong tài liệu này chỉ dành cho route handler `app/api/**/route.ts` hoặc
tương đương có endpoint công khai). Không thêm hàng nào cho nó; xem `route-list.md` § Backend
Routes để biết ghi chú đầy đủ về việc không cấp `ROUTE###`.

## Ghi chú

- 8 route frontend (`/`, `/prelaunch`, `/awards`, `/kudos`, `/profile`, `/admin`, `/login`,
  `/_not-found`) **không** được liệt kê ở đây — đây là page route, không phải API
  endpoint; chúng đã có đầy đủ ở `route-list.md` § Frontend Routes/Pages.
- `/admin` có gating hiển thị phía client theo `role === 'admin'` (xem
  `lib/session/session-provider.tsx`, ghi chú tại `route-list.md` dòng ROUTE005) nhưng đây
  không phải auth/permission trên một API — không có `permissions.md` PERM### nào áp dụng
  vì không có endpoint để bảo vệ.
- `/login` (ROUTE009) có `PERM004_LoginRouteAuthGate` (`permissions-matrix.md`) nhưng đó là
  gate trên một PAGE (Server Component), không phải trên `/auth/callback` — không lặp lại ở
  đây.
- Không có hàng nào bị đánh dấu `[UNMAPPED]` — `/auth/callback` map đúng 1-1 tới BL002.

## Summary

| Category | Count |
|----------|-------|
| Backend API Routes | 1 (`/auth/callback`, thêm 2026-08-19) |
| Routes mapped to BL### | 1 |
| Routes `[UNMAPPED]` | 0 |
