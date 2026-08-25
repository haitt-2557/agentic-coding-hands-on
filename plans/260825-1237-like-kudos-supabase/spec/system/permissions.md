---
status: implemented
authored_by: takumi
created: 2026-08-25
lang: vi
promote_target: docs/vi/system/permissions.md
promote_mode: append-delta
---

# Permissions — Delta: Thả tim Kudos (like) trên Live board

> **Forward-draft.** Viết ở giai đoạn spec, trước khi code. Promote vào
> `docs/vi/system/permissions.md` theo kiểu append-delta ở implement-start.
> Không tự đặt mã `PERM###` mới — bảng kỹ thuật `permissions-matrix.md` do pipeline sinh,
> không viết tay ở đây.

## 1. Lần đầu một quy tắc nghiệp vụ được enforce ở tầng database

Cho tới nay, mọi quy tắc "ai được làm gì" trên live board đều nằm ở client và chỉ có tác dụng
trang trí. Nút tim bị vô hiệu hoá dựa trên mock session trong `localStorage` — ai mở DevTools cũng
đổi được, và file `lib/session/session-provider.tsx` đã tự cảnh báo đúng điều đó.

Delta này chuyển **BR-002 (người gửi không được tự thả tim cho kudos của mình)** từ một quy ước
UI thành một ràng buộc thật, được giữ ở cả hai tầng:

| Tầng | Cách chặn | Chống được gì |
|------|-----------|---------------|
| UI | nút render `disabled` | người dùng bình thường bấm nhầm |
| Database | policy RLS + ràng buộc | người gọi thẳng server action, bỏ qua UI |

Tầng UI là tiện lợi. Tầng database là ranh giới thật. Không được coi tầng UI là đủ.

## 2. `user_id` bị ép từ `auth.uid()`, không nhận từ client

Giống hệt cách `kudos.sender_id` được xử lý ở F014: mệnh đề `with check` của policy insert ép
`user_id = auth.uid()`. Payload từ client không bao giờ được tin.

Hệ quả: một client cố ghi lượt thả tim mang danh người khác thì bị từ chối ở database, không cần
tầng ứng dụng kiểm tra thêm. Đây là kiểm soát chính của BR-006.

## 3. "Một người một lượt tim" là ràng buộc, không phải kiểm tra

Quy tắc "mỗi người chỉ thả một tim cho một kudos" (BR-001) được giữ bằng `unique (kudos_id,
user_id)` chứ không bằng một lệnh kiểm tra "đã tồn tại chưa" ở tầng ứng dụng.

Lý do là race condition: hai request đến cùng lúc thì cả hai đều thấy "chưa tồn tại" và cùng ghi.
Chỉ ràng buộc ở database mới thực sự chặn được double-click. Tầng ứng dụng bắt lỗi vi phạm ràng
buộc và xử lý êm, chứ không cố phòng ngừa trước.

## 4. Bảng vẫn công khai — có chủ ý

`/kudos` **không** được thêm route guard. Khách chưa đăng nhập vẫn đọc được bảng và thấy số tim
thật; chỉ hành động thả tim là bị chặn.

Đây là khác biệt có chủ ý so với `/kudos/send` — trang đó đẩy khách chưa đăng nhập sang `/login`.
Live board là mặt tiền công khai của sự kiện; gate nó lại là một sự thụt lùi về sản phẩm mà không
ai yêu cầu (clarifications quyết định 5).

## 5. Cảnh báo cũ vẫn đứng vững

Delta này **không** hợp nhất hai hệ thống danh tính. `role` trong mock session vẫn là mock, vẫn
không phải ranh giới phân quyền, và vẫn không có gì phía sau nó.

Cột `profiles.auth_user_id` chỉ trả lời đúng một câu hỏi — "người đang đăng nhập có phải người gửi
kudos này không?" — và không được dùng cho bất kỳ quyết định phân quyền nào khác. Cụ thể: nó không
cấp quyền admin, không gate route, không mở dữ liệu của người khác.

## 6. GRANT là bắt buộc, không phải tuỳ chọn

`config.toml` không bật `auto_expose_new_tables`, nên bảng mới **không** tự động tiếp cận được qua
Data API. Thiếu `grant` thì mọi thao tác fail với "permission denied for table kudos_likes" —
trông y hệt như RLS đang chặn đúng.

Đây là bẫy chẩn đoán đã được ghi nhận từ F014. Kiểm thử phải phân biệt được hai ca: "RLS chặn đúng
người sai" và "thiếu grant nên chặn tất cả".

## 7. Unresolved — ghi trung thực, không tự ý gate

- Chưa có màn admin cho `special_days`; ai chèn được dòng vào bảng đó thì nhân đôi được tim. Hiện
  chỉ truy cập DB trực tiếp mới làm được, nhưng khi có màn admin thì nó **phải** được gate thật.
- Người dùng đăng nhập mà chưa gắn `auth_user_id` với slug nào thì không trùng người gửi nào, nên
  thả tim được cho mọi thẻ. Đúng theo thiết kế ở quy mô hiện tại, cần xem lại khi seam đóng.
