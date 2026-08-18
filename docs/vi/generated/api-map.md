# API Map

**Project**: my-app (Sun* Annual Awards 2025 — Homepage sự kiện)
**Generated**: 2026-08-18

## Kết luận: không có API surface để map

Đối chiếu hai artifact nguồn cho lượt sinh này:

- `route-list.md` § Backend Routes: **0 backend route** — repo là Next.js App Router thuần
  client/static, không có `app/api/**/route.ts`, không `middleware.ts`, không server
  action. 6 route duy nhất trong repo đều là **frontend page** (`ROUTE001`–`ROUTE006`,
  tất cả `○ Static`, xác nhận bằng `npm run build`).
- `behavior-logic.md` § Behavior Logic Index: **0 BL item** trên cả 10/10 category
  (`scheduled-job`, `queue-worker`, `event-listener`, `observer`, `mail`, `notification`,
  `middleware`, `custom-command`, `integration`, `webhook`) — scout inventory zero-hit,
  đối chiếu độc lập cũng xác nhận không sót.

Vì không có backend route nào và không có `BL###` nào để gắn handler, bảng API Map
dưới đây **không có hàng nào** — đây là kết quả đúng của dữ liệu nguồn, không phải
thiếu sót của lượt tổng hợp này.

### API Routes (grouped by domain/resource)

_(none — no backend route in this codebase)_

| Method | Path | Handler BL### | Auth |
|--------|------|---------------|------|
| _(none)_ | | | |

## Ghi chú

- 6 route frontend (`/`, `/awards`, `/kudos`, `/profile`, `/admin`, `/_not-found`) **không**
  được liệt kê ở đây — đây là page route, không phải API endpoint; chúng đã có đầy đủ ở
  `route-list.md` § Frontend Routes/Pages.
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
