---
status: promoted
authored_by: takumi
fcode: F012_AwardSystemPage
created: 2026-08-20
promoted_from: plans/260820-1020-award-system-page/spec/award-system-page/edge-cases.md
lang: vi
---

# Edge Cases — Hệ thống giải thưởng SAA 2025 (Award System Page)

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| URL mang một hash không khớp 6 slug thật (ví dụ `#khong-ton-tai`) | Trang tải bình thường ở đầu trang, không có mục nav nào được coi là active, không cuộn giật, không lỗi console | "None — trang hiển thị bình thường, không có cảnh báo nào." |
| Người dùng click liên tiếp nhiều mục nav thật nhanh trước khi cuộn tới nơi | Chỉ mục được click sau cùng là đích cuối và là mục được tô sáng; không có tình trạng hai mục cùng sáng hay cuộn giữa chừng bị kẹt | "None — trang cuộn thẳng tới mục vừa chọn sau cùng." |
| Điều hướng client-side sang `/kudos` khi click "Chi tiết" bị gián đoạn (mất mạng/lỗi tải chunk) | Trình duyệt tự chuyển sang tải lại toàn trang để tới `/kudos` thay vì hiển thị trang trắng hoặc treo | "None — không có thông báo lỗi riêng, trang đích vẫn tải được qua tải lại toàn trang." |
| Xem trang trên viewport hẹp hơn 375px | Nav danh mục chuyển thành thanh cuộn ngang bên dưới khối tiêu đề, khối ảnh/nội dung mỗi hạng mục xếp chồng một cột — không có phần nào tràn ngang trang | "None — bố cục tự điều chỉnh, không có cảnh báo." |
| Best Manager và MVP không có dòng ghi chú giá trị giải (chỉ Top Talent/Top Project/Top Project Leader/Signature có) | Khối chỉ hiện đúng dòng số tiền, không hiện dòng ghi chú — tái tạo nguyên trạng khiếm khuyết trong chính frame thiết kế, không phải lỗi code | "None — chỉ hiện số tiền giải thưởng, không có dòng phụ." |
| Khách chưa đăng nhập mở `/awards` | Trang tải công khai giống hệt người đã đăng nhập — không có redirect sang đăng nhập, vì bảo vệ route vẫn hoãn ở lượt này (ID-1 không được assert) | "None — trang tải bình thường, không yêu cầu đăng nhập." |
