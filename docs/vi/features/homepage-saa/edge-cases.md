---
status: promoted
authored_by: doc-writer
created: 2026-08-18
promoted_from: plans/260818-0936-homepage-saa/spec/homepage-saa/edge-cases.md
lang: vi
---

| Scenario | What Happens | User-Facing Message | Source |
|----------|--------------|---------------------|--------|
| `NEXT_PUBLIC_EVENT_START_AT` rỗng hoặc không parse được thành ngày hợp lệ | Countdown chuyển sang zero-state (00/00/00), không throw lỗi, không crash trang | "None — không có thông báo lỗi hiển thị, chỉ hiện 00 ở cả 3 ô" | `lib/countdown.ts:36-43` |
| Thời điểm hiện tại đã qua `NEXT_PUBLIC_EVENT_START_AT` | Countdown về 00/00/00, nhãn "Coming soon" tự ẩn | "None — không có thông báo, chỉ ẩn nhãn Coming soon" | `lib/countdown.ts:46-48`, `components/home/countdown-timer.tsx:39` |
| Thẻ giải thưởng không có slug hợp lệ | Điều hướng tới `/awards` không kèm hash, không tự cuộn | "None — người dùng thấy trang Award Information từ đầu trang" | `lib/awards.ts:69-74`. **Không khả đạt từ UI thật** trong bản build hiện tại — cả 6 award trong `lib/awards.ts:25-62` đều có slug hợp lệ; coverage thật chỉ ở unit test `lib/awards.test.ts:51-52` |
| Khách chưa đăng nhập mở trang chủ | Chuông thông báo và menu tài khoản không hiển thị; toàn bộ nội dung công khai vẫn xem được | "None — không có thông báo, các phần tử liên quan tài khoản chỉ đơn giản không xuất hiện" | `components/ui/account-menu.tsx:16`, `components/ui/notification-bell.tsx:16` |
| Người dùng đã đăng nhập nhưng không có thông báo chưa đọc | Không hiển thị badge đỏ trên chuông | "None — chuông thông báo hiển thị bình thường không có huy hiệu" | `components/ui/notification-bell.tsx:30-37` |
| Mở panel thông báo khi chưa có dữ liệu thông báo thật | Panel hiện trạng thái rỗng cố định | "Không có thông báo mới" | `components/ui/notification-bell.tsx:41-46`, `lib/i18n/dictionaries/vi.ts:32` |
| Click ra ngoài vùng dropdown đang mở (ngôn ngữ/tài khoản/thông báo/widget) | Dropdown tự đóng, không cần click lại nút trigger | "None — dropdown đóng lại êm, không có thông báo" | `components/ui/dropdown-menu.tsx:58-62` |
| Nhấn phím Esc khi một dropdown đang mở | Dropdown đóng ngay lập tức, focus trả về nút trigger (không mất khỏi trang) | "None — không có thông báo, chỉ đóng menu" | `components/ui/dropdown-menu.tsx:64-71` |
| Xem trang trên viewport tablet hoặc mobile | Lưới giải thưởng chuyển còn 2 cột thay vì 3 | "None — bố cục tự điều chỉnh, không có cảnh báo" | `components/home/awards-section.tsx:21` |
| Điều hướng sang `/awards`, `/kudos`, `/profile`, `/admin` rồi muốn quay lại | Không có link trong-app quay về `/` — 4 route này không render `SiteHeader`/`SiteFooter` | "None — chỉ dùng nút Back của trình duyệt" | `app/page.tsx:12,20` (header/footer chỉ ở đây) so với `app/layout.tsx:37-39` (không có chrome dùng chung); design defect mục E, chưa sửa — xem `plans/260818-0936-homepage-saa/reports/design-defects-260818-homepage-saa.md` |
