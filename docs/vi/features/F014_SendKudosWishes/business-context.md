---
status: implemented
authored_by: takumi
created: 2026-08-24
lang: vi
---

## Why It Matters

Trang Sun* Kudos hiện tại (`/kudos`) chỉ đọc dữ liệu mẫu tĩnh — mọi lời cảm ơn hiển thị ở đó đều
là dữ liệu demo, không ai thực sự gửi được một lời chúc mới. Trang này lấp đúng khoảng trống đó:
lần đầu tiên một Sunner viết một lời chúc thật và nó được lưu lại thật, không phải chỉ là một nút
bấm dẫn tới hư không như trước đây.

## Who Uses It

- **Người muốn gửi lời cảm ơn cho một đồng nghiệp** — mở trang, chọn người nhận, viết lời chúc,
  chọn chủ đề (hashtag) phù hợp, và có thể đính kèm ảnh minh hoạ.
- **Người muốn giữ kín danh tính khi gửi** — vẫn ghi nhận được lời cảm ơn của mình nhưng ký tên
  bằng một biệt danh thay vì tên thật.
- **Người chưa đăng nhập** — không vào được trang này; hệ thống đưa họ tới màn đăng nhập trước.

## What They Do

1. Người dùng đã đăng nhập mở trang gửi lời chúc Kudos; nếu chưa đăng nhập, họ được đưa tới màn
   đăng nhập trước, chưa thấy form.
2. Người dùng gõ tên để tìm và chọn một đồng nghiệp làm người nhận, từ danh sách Sunner có thật
   trong hệ thống — không tự gõ một cái tên tuỳ ý được.
3. Người dùng đặt một danh hiệu ngắn cho lời chúc (ví dụ "Người truyền động lực cho tôi") và viết
   nội dung lời cảm ơn; có thể dùng các nút định dạng để in đậm, in nghiêng, gạch ngang, đánh số,
   chèn liên kết, hoặc trích dẫn một đoạn.
4. Người dùng chọn từ 1 đến 5 chủ đề (hashtag) có sẵn phù hợp với nội dung lời chúc — không gõ
   hashtag tự do, chỉ chọn từ danh sách cố định.
5. Người dùng có thể đính kèm tối đa 5 hình ảnh minh hoạ (chỉ nhận ảnh, không nhận video hay tài
   liệu khác).
6. Người dùng có thể chọn gửi ẩn danh — khi đó phải đặt thêm một biệt danh để hiển thị thay tên
   thật.
7. Người dùng bấm "Gửi" khi đã điền đủ thông tin bắt buộc; nếu còn thiếu, hệ thống báo rõ đúng
   phần còn thiếu. Người dùng cũng có thể bấm "Hủy" bất cứ lúc nào để bỏ toàn bộ nội dung đang
   soạn.
8. Sau khi gửi thành công, người dùng được đưa trở lại trang Sun* Kudos - Live board kèm một
   thông báo xác nhận đã gửi thành công.

## Unresolved Questions

- **Lời chúc vừa gửi sẽ không xuất hiện ở bất kỳ đâu trên trang Sun* Kudos - Live board** — trang
  đó vẫn đang hiển thị dữ liệu mẫu cũ. Việc đưa những lời chúc thật lên trang đó (bảng xếp hạng,
  khối nổi bật, bảng tên) là công việc của một lượt sau.
  - Cross-reference: tính năng này thuộc cùng dòng phát triển với trang Sun* Kudos - Live board —
    xem `docs/vi/features/kudos-live-board/`.
- **Gợi ý tên đồng nghiệp khi gõ `@` trong nội dung lời chúc chưa được xây** — người dùng vẫn gõ
  `@` được như một ký tự bình thường, nhưng sẽ không có danh sách gợi ý nào bật lên.
- **Chưa rõ ai được phép nhận lời chúc từ chính mình gửi** — hệ thống hiện chưa ngăn việc một
  người chọn chính mình làm người nhận.
- **Nút "Tiêu chuẩn cộng đồng" cạnh khu vực soạn thảo chưa dẫn tới đâu** — bấm/chọn vào đó chưa
  mở ra nội dung gì, vì màn hình đó chưa được thiết kế cho phiên bản web.
