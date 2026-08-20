---
status: draft
authored_by: takumi
created: 2026-08-20
lang: vi
---

# Business Context — Hệ thống giải thưởng SAA 2025 (Award System Page)

## Why It Matters

Lưới 6 thẻ giải thưởng ở trang chủ chỉ đủ chỗ cho một mô tả ngắn — người xem chưa biết rõ một
giải thưởng vinh danh ai, có bao nhiêu suất, và giá trị bao nhiêu. Trang `/awards` là nơi duy nhất
trình bày đầy đủ cả 6 hạng mục giải thưởng SAA 2025 cùng lúc, để bất kỳ ai — từ người đang cân
nhắc có xứng đáng được đề cử hay không, tới người tò mò về quy mô giải thưởng — có thể đọc hết
thông tin và nhảy thẳng tới đúng hạng mục mình quan tâm mà không phải đọc lướt cả trang.

## Who Uses It

- **Người xem từ trang chủ hoặc từ menu chính** — click một thẻ giải thưởng hoặc mục "Award
  Information" trên header, được đưa thẳng tới trang này (hoặc đúng hạng mục đã chọn), đọc chi
  tiết một hoặc nhiều giải thưởng.
- **Người xem cuộn tự do trên trang này** — dùng nav danh mục bên trái để nhảy nhanh giữa 6 hạng
  mục thay vì cuộn tay qua một trang rất dài, và luôn biết mình đang xem hạng mục nào nhờ mục nav
  tương ứng luôn sáng.
- **Người xem muốn tìm hiểu thêm về Sun* Kudos** — sau khi đọc xong 6 giải thưởng, gặp lời mời tìm
  hiểu phong trào ghi nhận Sun* Kudos ngay cuối trang.

## What They Do

1. Người xem mở trang hệ thống giải thưởng và đọc phần giới thiệu, thấy danh sách 6 hạng mục ở
   một nav bên trái.
2. Người xem chọn một hạng mục trong nav — trang cuộn thẳng tới đúng phần nội dung của hạng mục
   đó, và mục vừa chọn được đánh dấu là đang xem.
3. Người xem đọc mô tả đầy đủ, số lượng giải và giá trị giải của hạng mục đó, rồi tiếp tục cuộn
   sang các hạng mục khác — mục đang được đánh dấu tự cập nhật theo đúng phần đang xem, không cần
   chọn lại trong nav.
4. Người xem đọc hết 6 hạng mục, gặp lời mời tìm hiểu phong trào ghi nhận Sun* Kudos, và chọn xem
   chi tiết — hệ thống đưa họ sang trang Sun* Kudos.

## Unresolved Questions

- **Tên đường dẫn chính thức của trang này** — bộ test case gốc gọi trang này bằng một tên khác
  (`/he-thong-giai`) không tồn tại trong ứng dụng; đã tạm giữ nguyên đường dẫn hiện có (`/awards`)
  vì mọi liên kết nội bộ đang trỏ tới đó, nhưng tên chính thức cần chủ sở hữu thiết kế xác nhận lại
  cho hồ sơ.
- **Việc yêu cầu đăng nhập mới được xem trang này có nằm trong phạm vi lượt sau không?** Lượt này
  giữ trang mở công khai như hiện tại (giống mọi trang khác) — việc gộp chung với quyết định bảo vệ
  route đã hoãn từ trước.
