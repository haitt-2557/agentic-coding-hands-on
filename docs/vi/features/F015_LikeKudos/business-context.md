---
status: implemented
authored_by: takumi
created: 2026-08-25
lang: vi
---

## Why It Matters

Live board là nơi mọi người đọc lời cảm ơn của nhau trong suốt sự kiện. Nhưng đọc xong thì không
làm được gì — không có cách nào nói "cái này hay đấy" ngoài việc tự đi viết một lời cảm ơn khác.

Nút trái tim đang có trên giao diện thực ra là đồ trang trí: bấm vào thì số nhảy, tải lại trang
thì số về như cũ. Không ai lưu lại, nên không ai biết lời cảm ơn nào chạm được tới người khác.

Thả tim thật giải quyết ba việc cùng lúc. Người đọc có một cách phản hồi rẻ tiền, một cú bấm là
xong. Người viết nhận lại tín hiệu là bài của mình có người đọc và thấy hay. Và mục HIGHLIGHT
KUDOS — vốn được định nghĩa là "top những kudos có nhiều lượt thả tim nhất xuyên suốt sự kiện" —
cuối cùng cũng có một con số thật để xếp hạng, thay vì con số cứng gõ tay trong file dữ liệu.

Phần nhân đôi tim vào ngày đặc biệt là công cụ của ban tổ chức: đẩy tương tác dồn vào đúng khung
giờ họ muốn, ví dụ ngày trao giải, mà không phải sửa gì trong code.

## Who Uses It

**Sunner đọc bảng và đã đăng nhập** — người dùng chính. Họ thả tim, rút tim, và thấy tim của mình
còn nguyên khi quay lại.

**Sunner viết kudos** — người hưởng lợi. Tim tích vào sổ của họ. Họ không được tự thả tim cho bài
của chính mình; hệ thống chặn hẳn chứ không trông vào ý thức.

**Khách chưa đăng nhập** — vẫn đọc được bảng và thấy số tim thật. Nút tim mờ đi, có chú thích vì
sao. Không đá họ ra trang đăng nhập, vì live board vốn để mọi người xem.

**Ban tổ chức** — cấu hình ngày đặc biệt. Ở phiên bản này họ làm bằng SQL, vì chưa có màn admin
nào được thiết kế.

## What They Do

Bấm vào trái tim dưới một thẻ kudos. Tim chuyển từ xám sang đỏ, số tăng một. Đóng trình duyệt,
mở lại ngày hôm sau — vẫn đỏ, số vẫn thế.

Bấm lần nữa nếu đổi ý. Tim về xám, số giảm đúng bằng lúc tăng. Nếu lúc thả là ngày đặc biệt và
được tính hai tim, thì lúc rút cũng trừ hai — kể cả khi ngày đặc biệt đã qua. Cái đã cho là bao
nhiêu thì lấy lại bấy nhiêu.

Người viết kudos nhìn sang sidebar bên phải, dòng "Số tim bạn nhận được" giờ là số thật, không
còn là placeholder 25 nữa.
