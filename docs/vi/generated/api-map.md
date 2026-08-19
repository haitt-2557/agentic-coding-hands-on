# API Map

**Project**: my-app (Sun* Annual Awards 2025 — Homepage sự kiện)
**Generated**: 2026-08-18

## Kết luận: không có API surface để map

Đối chiếu hai artifact nguồn cho lượt sinh này:

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

Vì không có backend route nào và không có `BL###` nào gắn với một API handler thật, bảng
API Map dưới đây **không có hàng nào** — đây là kết quả đúng của dữ liệu nguồn, không phải
thiếu sót của lượt tổng hợp này.

### API Routes (grouped by domain/resource)

_(none — no backend route in this codebase)_

| Method | Path | Handler BL### | Auth |
|--------|------|---------------|------|
| _(none)_ | | | |

## Ghi chú

- 7 route frontend (`/`, `/prelaunch`, `/awards`, `/kudos`, `/profile`, `/admin`,
  `/_not-found`) **không** được liệt kê ở đây — đây là page route, không phải API
  endpoint; chúng đã có đầy đủ ở `route-list.md` § Frontend Routes/Pages.
- `/admin` có gating hiển thị phía client theo `role === 'admin'` (xem
  `lib/session/session-provider.tsx`, ghi chú tại `route-list.md` dòng ROUTE005) nhưng đây
  không phải auth/permission trên một API — không có `permissions.md` PERM### nào áp dụng
  vì không có endpoint để bảo vệ.
- Không có hàng nào bị đánh dấu `[UNMAPPED]` vì không có route nào tồn tại để thiếu mapping.

## Summary

| Category | Count |
|----------|-------|
| Backend API Routes | 0 |
| Routes mapped to BL### | 0 |
| Routes `[UNMAPPED]` | 0 |
