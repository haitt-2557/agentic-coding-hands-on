---
status: promoted
authored_by: doc-writer
created: 2026-08-18
promoted_from: plans/260818-0936-homepage-saa/spec/homepage-saa/business-context.md
lang: vi
---

## Why It Matters

Trang chủ SAA 2025 (`SCR001_Home`, route `/`) là điểm chạm đầu tiên và duy nhất để giới thiệu chủ đề "Root Further" của giải thưởng thường niên Sun*, tạo háo hức qua đếm ngược sự kiện, và dẫn khách truy cập sang 2 điểm đến chính: tìm hiểu hệ thống giải thưởng hoặc tìm hiểu phong trào ghi nhận Sun* Kudos.

## Who Uses It

- **Khách vãng lai (chưa đăng nhập, `role: guest`)** — xem toàn bộ nội dung công khai: chủ đề, đếm ngược, thông tin sự kiện, danh sách giải thưởng, Sun* Kudos; điều hướng sang trang giải thưởng hoặc Kudos.
- **Nhân viên Sun* đã đăng nhập (`role: user`)** — giống khách, cộng thêm xem thông báo và menu tài khoản cá nhân của mình (Profile, Đăng xuất).
- **Quản trị viên (`role: admin`)** — giống nhân viên, cộng thêm lối vào khu vực quản trị từ menu tài khoản. Lưu ý: đây chỉ là ẩn/hiện MỤC MENU — route `/admin` không có kiểm soát truy cập thật ở phía server (xem `technical-spec.md` § DISC-001).

## What They Do

1. Người xem mở trang chủ và đọc chủ đề "Root Further" cùng thời gian đếm ngược tới sự kiện — cảm nhận được sự kiện sắp diễn ra.
2. Người xem đọc thông tin thời gian, địa điểm và cách theo dõi trực tiếp sự kiện.
3. Người xem lướt qua 6 hạng mục giải thưởng, đọc mô tả ngắn từng hạng mục.
4. Người xem chọn xem chi tiết một hạng mục giải thưởng — hệ thống đưa họ sang trang thông tin giải thưởng đúng mục đã chọn.
5. Người xem tìm hiểu phong trào ghi nhận Sun* Kudos và chọn xem chi tiết — hệ thống đưa họ sang trang Kudos.
6. Nhân viên đã đăng nhập kiểm tra thông báo và, nếu cần, đổi ngôn ngữ hiển thị giữa tiếng Việt và tiếng Anh.

## Unresolved Questions

None. Hai điểm ngoài phạm vi ghi nhận trong `clarifications.md`: nội dung thật của `/awards` và `/kudos` (placeholder ở lần build này), và việc thay session mock bằng auth thật.

**Ghi chú bản sửa lỗi (bug fix nội dung theo ngôn ngữ trên trang chủ):**

- Bản sửa này mở rộng phạm vi i18n của trang chủ (`/`) từ chỉ chrome (nav, heading, nút, nhãn) sang cả nội dung dài (Root Further, Sun* Kudos, mô tả thẻ giải thưởng) — xem `rootFurther.*`, `kudos.badge`/`kudos.body`, `awards.*.description` trong `lib/i18n/dictionaries/vi.ts`/`en.ts`.
- **Copy tiếng Anh (`en.ts`) cho các khóa mới ở trên là bản dịch nháp do AI soạn trong phiên sửa lỗi này** — chưa phải văn bản chính thức của Comms/BTC, người dùng đã chấp nhận dùng tạm với điều kiện sẽ được rà soát lại sau.
- Trang `/awards` (`lib/awards.ts`: `longDescription`, `quantity.unit`, `prizeLines[].note`) **vẫn chỉ có tiếng Việt** — bản sửa này cố ý chỉ giới hạn ở trang chủ, không mở rộng sang `/awards`. Đừng suy diễn rằng toàn site đã song ngữ.
