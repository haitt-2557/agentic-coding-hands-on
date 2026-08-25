---
status: draft
authored_by: takumi
created: 2026-08-25
lang: vi
---

| Scenario | Input | Expected | Severity |
|----------|-------|----------|----------|
| Bấm tim hai lần thật nhanh (double-click) | hai request insert cho cùng `(kudos_id, user_id)` | Unique constraint chặn cái thứ hai; UI kết thúc ở đúng một trạng thái, số không nhảy 2 | high |
| Client tự gọi server action với `user_id` của người khác | payload giả mạo | RLS `with check (user_id = auth.uid())` từ chối; không có dòng nào được ghi (BR-006) | high |
| Người gửi kudos gọi thẳng action để tự thả tim, bỏ qua UI disabled | request hợp lệ về mặt session | Database từ chối theo BR-002; UI disabled chỉ là lớp phòng thủ thứ nhất | high |
| Bảng mới thiếu `grant` cho role `authenticated` | mọi thao tác like | "permission denied for table kudos_likes" — nhìn giống hệt RLS chặn đúng, rất dễ chẩn đoán nhầm. Phải có test phân biệt được hai ca này (INT-002) | high |
| Ngày đặc biệt kết thúc giữa lúc thả và lúc rút | thả `is_special=true`, hôm sau rút | Trừ đúng 2, đọc từ cờ trên dòng — không tính lại theo ngày hiện tại (BR-005) | high |
| Hai dòng `special_days` chồng nhau cùng phủ hôm nay | ngày nằm trong cả hai khoảng | Vẫn chỉ `is_special = true`, cộng 2 — không cộng dồn thành 4 | medium |
| Người xem đăng nhập nhưng `auth_user_id` chưa gắn slug nào | `resolveViewerSlug()` trả `null` | Nút tim vẫn **bật** (họ là người thật, chỉ chưa gắn profile tĩnh); không trùng người gửi nào nên không bị chặn (DEC-002) | medium |
| Session hết hạn giữa lúc trang mở và lúc bấm tim | action chạy với session chết | Thao tác thất bại êm, UI trở về trạng thái trước đó — không để số đếm lệch với database | medium |
| Kudos không có dòng like nào | `likeCountsByKudosId()` không trả key cho id đó | Hiển thị đúng `heartCount` tĩnh, không phải `NaN` hay 0 (FR-003) | medium |
| `kudos_id` trỏ tới record tĩnh đã bị xoá khỏi `lib/kudos/kudos-records.ts` | dòng like mồ côi | Không crash — cột là `text` nên không có FK bảo vệ (Assumption 2). Dòng mồ côi bị bỏ qua khi render | medium |
| Số tim vượt 999 | `formatHeartCount(1500)` | Hiển thị `1.500` theo định dạng vi-VN đang có; test phải strip ký tự không phải số trước khi `parseInt` | medium |
| Người dùng chưa đăng nhập bấm vào nút tim disabled | click | Không có gì xảy ra, không redirect, không toast (FR-005) | low |
| Sidebar của người xem chưa gắn slug | `resolveViewerSlug()` trả `null` | Dòng "Số tim bạn nhận được:" hiển thị `0`, không phải placeholder 25 và không phải lỗi | low |
| `special_days` rỗng (trạng thái mặc định khi seed) | mọi lượt thả tim | `is_special = false`, cộng 1 — đường đi mặc định (BR-003) | low |
