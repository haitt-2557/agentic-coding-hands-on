---
status: draft
authored_by: takumi
created: 2026-08-19
lang: vi
---

# Permissions (bản nháp — thêm ranh giới auth Supabase)

> **Bản nháp forward-drafted.** Cập nhật DỰ KIẾN của `docs/vi/system/permissions.md` sau khi
> feature Login qua Google OAuth (Supabase) được triển khai. Không ghi đè file hiện có — việc đó
> xảy ra lúc promote/reconcile.

## Điều quan trọng nhất cần hiểu ở bản cập nhật này

Bản hiện có mở đầu bằng: *"hệ thống này chưa có phân quyền thật"*. Câu đó **không còn đúng theo
nghĩa tuyệt đối** sau lượt này — lần đầu tiên có một ranh giới xác thực THẬT: chỉ ai hoàn tất
đăng nhập Google qua Supabase mới có một phiên đăng nhập hợp lệ, không ai tự đặt được nó từ
DevTools. **Nhưng phạm vi của ranh giới đó, ở lượt này, chỉ có đúng một tác dụng**: quyết định
`/login` có redirect người dùng đi hay không. Mọi mô tả "vai trò `guest`/`user`/`admin` chỉ là
lựa chọn hiển thị, không phải hàng rào bảo mật" ở phần dưới đây **vẫn đúng nguyên văn** — vai trò
đó và phiên Supabase là hai trục hoàn toàn tách biệt, chưa được nối với nhau.

## Authorization System Type (bổ sung)

**System Type**: vẫn `other` cho phần role-gating hiện có (không đổi). **Điểm mới**: hệ thống
giờ có thêm một khái niệm authentication (khác authorization) THẬT — "đã đăng nhập Google hay
chưa" — do Supabase Auth (GoTrue) quản lý, không phải một giá trị tự đặt trên trình duyệt.
Authentication này chưa được nối với bất kỳ quyết định authorization nào (không quyết định ai
thấy gì, ai làm được gì) — nó chỉ quyết định một câu hỏi duy nhất: có được xem `/login` hay
không.

| Khái niệm | Cơ chế | Ai xác định | Tính chất |
|---|---|---|---|
| `role` (guest/user/admin) — KHÔNG đổi | `localStorage`/`NEXT_PUBLIC_MOCK_ROLE` | Chính người dùng (DevTools) | Chỉ ẩn/hiện UI, không phải bảo mật thật |
| **MỚI** — phiên Supabase (đã đăng nhập Google hay chưa) | Session cookie do `@supabase/ssr` quản lý, xác thực thật qua Google | Google + Supabase Auth server | Là một ranh giới xác thực THẬT — không ai giả mạo được từ DevTools |

## Curated View (bổ sung một dòng)

Giữ nguyên toàn bộ mô tả `guest`/`user`/`admin` hiện có (không đổi — xem bản gốc). Thêm:

- **Bất kỳ ai đã có phiên Supabase hợp lệ** đều bị chặn không cho xem lại `/login` — tự động
  đưa về trang chính. Đây là điều kiện MỚI, tách biệt hoàn toàn khỏi bảng `guest`/`user`/`admin`
  ở trên (một người `guest` theo role vẫn có thể đã đăng nhập Google, và ngược lại — vì hai khái
  niệm không liên quan nhau ở lượt này).

## Điểm enforce (client-only, KHÔNG đổi) + điểm enforce MỚI

Bảng `PERM001`–`PERM003` hiện có giữ nguyên (không đổi — xem `permissions-matrix.md`). Điểm
enforce MỚI:

| Mã | Điểm enforce | Loại |
|---|---|---|
| TBD (draft) — mã PERM### thật cấp lúc reconcile, nếu quyết định cấp mã (xem ghi chú dưới) | Route `/login`, kiểm tra phiên Supabase trước khi render (dự kiến `app/login/page.tsx`, chưa viết) | route-gate (KHÔNG phải screen-permission như 3 mã hiện có — đây là gate xác thực, không phải ẩn/hiện theo role) |

**Ghi chú:** đây là quyết định KHÁC LOẠI với 3 `PERM###` hiện có (những mã đó là "ẩn icon theo
role", còn cái này là "chặn route theo đã-đăng-nhập-hay-chưa") — cần người review quyết định lúc
reconcile xem có nên cấp một mã `PERM###` mới cho nó, hay ghi nhận như một dòng riêng ngoài bảng
(tương tự cách `permissions-matrix.md` đã xử lý gate đếm-ngược trong `## Special Conditions`).
Không tự cấp mã ở bản nháp này.

## Access Boundaries (không đổi)

Giữ nguyên toàn bộ mô tả hiện có — vẫn không có ranh giới truy cập thật nào giữa `guest`/`user`/
`admin` cho các route khác ngoài `/login`. Việc dùng phiên Supabase để bảo vệ `/`, `/awards`,
`/kudos`, `/profile`, `/admin` nằm ngoài phạm vi lượt này (xem `clarifications.md` § Next Steps
của feature Login).

## Special Conditions (thêm một mục)

Giữ nguyên mục "Cập nhật 2026-08-19" về cổng đếm-ngược hiện có. Thêm mục mới:

**Cập nhật (lượt Login)**: `/login` và `/auth/callback` được miễn trừ khỏi cổng đếm-ngược, cùng
cách `/prelaunch` đã được miễn trừ — đây là gate theo THỜI GIAN (launch-timing), không phải một
permission theo vai trò, và không có mã `PERM###` nào cho nó (đúng nguyên tắc đã áp dụng cho
`/prelaunch`).

## Unresolved / out of scope for this artifact

- Có nên cấp `PERM###` cho gate "đã đăng nhập → chặn `/login`" hay ghi nhận như một dòng đặc
  biệt ngoài bảng — quyết định để lúc reconcile, sau khi có source thật để đối chiếu.
- Việc hợp nhất phiên Supabase với `role` (để phiên đăng nhập thật quyết định vai trò hiển thị,
  thay vì mock) là việc của lượt sau, không thuộc bản nháp này.
