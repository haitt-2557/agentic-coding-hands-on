---
status: draft
authored_by: takumi
created: 2026-08-21
lang: vi
---

# Permissions

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-21
**Analysis Scope**: Bản nháp bổ sung cho `docs/vi/system/permissions.md` hiện có, phát sinh từ
`plans/260821-1029-kudos-live-board/` — mở rộng mock session với một danh tính người xem.

> **Bản nháp forward-authored.** Tài liệu này KHÔNG thay thế `docs/vi/system/permissions.md` — nó mô
> tả phần thay đổi mà feature Sun* Kudos - Live board mang tới, để lúc triển khai/reconcile hợp nhất
> vào bản chính thức. Mọi nội dung không được nhắc lại ở đây (cảnh báo tổng quát, 3 PERM### hiện có,
> gate đếm-ngược, `/login`) vẫn giữ nguyên như bản hiện tại.

## Cảnh báo quan trọng nhất: hệ thống này vẫn chưa có phân quyền thật

Không đổi so với bản hiện tại: mọi mô tả dưới đây chỉ là việc ẩn/hiện giao diện, không phải một hàng
rào bảo mật. Phần mở rộng trong lượt này (danh tính mock-user) **làm rõ thêm cùng một sự thật đó** —
nó không thêm bất kỳ điều gì được xác thực ở phía máy chủ.

## Thay đổi lượt này: mock session có thêm một danh tính người xem

`lib/session/session-provider.tsx` (đã tồn tại — chỉ mang `role` và `unreadCount`) được mở rộng thêm
hai field mới: một mã định danh và một tên hiển thị cho "người xem hiện tại". Đây KHÔNG phải là một
hệ thống định danh mới — nó vẫn đọc/ghi qua đúng cơ chế `localStorage` → `NEXT_PUBLIC_*` → mặc định
cứng đã có, và vẫn mang nguyên SECURITY NOTE ở đầu file: **bất kỳ ai cũng tự đổi được danh tính này từ
DevTools của chính họ, không có bước xác thực nào đứng giữa.**

Lý do cần danh tính này: trang Sun* Kudos - Live board cần biết "bạn" là ai để (1) vô hiệu nút tim
trên chính lời cảm ơn bạn đã gửi, và (2) hiển thị đúng số liệu ở khu vực thống kê cá nhân ("Số Kudos
bạn nhận được", "Số Kudos bạn đã gửi", …). Không có danh tính nào để so sánh, hai tính năng đó không
có gì để "loại trừ chính mình" hay "thuộc về ai".

**Đây là một affordance UI trên dữ liệu tĩnh, không phải một điểm gate mới theo nghĩa PERM###.** Nó
không quyết định người dùng có xem được trang hay không (trang vẫn công khai), không đọc `role`, và
không thêm ranh giới truy cập nào — nó chỉ quyết định MỘT nút cụ thể trên MỖI thẻ có bấm được hay
không, dựa trên so sánh dữ liệu tĩnh (`kudos.senderId === viewer.id`), tương tự cách 3 PERM### hiện có
chỉ ẩn/hiện icon trên header.

| Mã `PERM###` | Điểm enforce dự kiến | Loại | Ghi chú |
|---|---|---|---|
| TBD (draft) — chưa được cấp | `components/kudos/kudos-card-actions.tsx` (dự kiến, chưa viết) — so sánh `kudos.senderId` với danh tính mock-user | screen-permission | Vô hiệu nút tim trên chính lời cảm ơn người xem đã gửi; không phải role-based, không đọc `role` |

Không có PERM### thứ hai phát sinh từ feature này — mọi tương tác khác trên trang (lọc, cuộn, tìm
kiếm, sao chép link, bốn trigger đích-hoãn) không phụ thuộc vào danh tính hay vai trò của người xem.

## Authorization System Type

Không đổi: `other` — vẫn không có hệ thống authorization thật nào tồn tại; phần mở rộng ở đây chỉ
thêm dữ liệu (id, tên hiển thị) vào đúng khái niệm "vai trò/mock" đã ghi trong bản hiện tại, không
thêm role mới, không thêm loại authorization mới.

## Access Boundaries

Không đổi: route `/kudos` vẫn mở công khai, không có ranh giới truy cập nào giữa `guest`/`user`/
`admin` khi xem trang này. Danh tính mock-user mới không tạo ra khái niệm "chủ sở hữu tài nguyên"
(ownership) nào — nó chỉ là một chuỗi/số so sánh trên client, tự người dùng đặt được từ DevTools.

## Special Conditions

**Cập nhật (lượt Kudos Live board, 2026-08-21)**: mock session (`lib/session/session-provider.tsx`)
được mở rộng thêm danh tính người xem (id + tên hiển thị) để phục vụ đúng hai chỗ trên trang
`/kudos` nêu ở trên. Cơ chế seed (`localStorage` → `NEXT_PUBLIC_*` → mặc định cứng) và SECURITY NOTE
giữ nguyên không đổi bản chất — vẫn không có bước xác thực nào, vẫn không phải một access boundary.
Route `/kudos` không được gate mới ở lượt này; gate đếm-ngược trước sự kiện (nếu còn hiệu lực) và mọi
special condition khác trong bản hiện tại vẫn áp dụng như cũ, không bị thay đổi bởi cập nhật này.

Rationale (lý do kiến trúc vì sao chọn mở rộng mock session thay vì gắn với Supabase user thật) không
thuộc phạm vi tài liệu này — xem ADR-001 hiện có (mock session và i18n tự viết); phần mở rộng này là
một ứng dụng thêm của cùng quyết định đó, không phải một quyết định kiến trúc mới cần ADR riêng.
