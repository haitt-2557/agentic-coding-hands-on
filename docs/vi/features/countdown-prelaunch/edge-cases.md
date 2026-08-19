---
status: promoted
authored_by: doc-writer
created: 2026-08-19
promoted_from: plans/260819-0913-countdown-prelaunch/spec/countdown-prelaunch/edge-cases.md
lang: vi
---

| Scenario | What Happens | User-Facing Message | Source |
|----------|--------------|----------------------|--------|
| Đếm ngược về đúng 0 trong lúc actor đang đứng ở `/prelaunch` | Trang tự động chuyển sang Trang chủ trong vòng 1 giây kể từ mốc 0, không cần tải lại | "Không có thông báo — chỉ chuyển trang mượt sang Trang chủ" | `lib/prelaunch/use-prelaunch-countdown.ts:70-98` |
| Actor gõ thẳng URL trang khác (vd `/awards`) trong lúc còn khóa | Bị điều hướng ngay về `/prelaunch` trước khi trang kia kịp hiển thị bất kỳ nội dung nào | "Không có thông báo lỗi — chỉ là một lần chuyển hướng" | `proxy.ts`, `lib/prelaunch/gate.ts:39-40` |
| Biến môi trường `NEXT_PUBLIC_EVENT_START_AT` bị thiếu hoặc sai định dạng | Toàn site coi như đã mở khóa (fail-open) — không khóa vĩnh viễn vì lỗi cấu hình | "Không có — actor vào thẳng Trang chủ như bình thường, không thấy khác biệt gì" | `lib/prelaunch/gate.ts:33-35`, `lib/countdown.ts:36-43` — rationale đầy đủ ở [ADR-002](../../../decisions/ADR-002-prelaunch-launch-timing-gate.md) |
| Actor cố vào lại `/prelaunch` sau khi sự kiện đã bắt đầu | Bị điều hướng ngay về Trang chủ, không hiển thị lại đếm ngược | "Không có — chuyển hướng êm, không thông báo" | `lib/prelaunch/gate.ts:43` |
| Giá trị giờ/phút chạm biên (00, 09, 23, 59) | Luôn hiển thị đủ 2 chữ số; giá trị ngoài khoảng (âm, ≥24 giờ, ≥60 phút) không bao giờ xảy ra vì được tính bằng phép chia lấy dư | "Không có — chỉ là cách hiển thị số, không phải lỗi" | `lib/countdown.ts:50-52` |
| Số ngày còn lại vượt quá 99 (site deploy hơn 99 ngày trước sự kiện — trường hợp thật của `.env.example`, mục tiêu ~122 ngày) | Ô DAYS hiển thị cố định `"99"` thay vì số ngày thật — hành vi THIẾT KẾ (frame chỉ vẽ 2 ô số), không phải bug | "Không có — vẫn hiển thị đủ 2 chữ số, chỉ là con số đã bị giới hạn trần ở 99" | `lib/prelaunch/display.ts` (`capDisplayDays`, `MAX_DISPLAY_DAYS = 99`) — xem `clarifications.md` mục "Design defects", câu hỏi cuối |
| Đồng hồ máy actor chạy nhanh hơn đồng hồ server một khoảng đáng kể (vài phút/giờ trở lên) | Client tự redirect `/` trước khi server đồng ý, `proxy.ts` bounce request đó về lại `/prelaunch`, actor thấy nhấp nháy `/` ↔ `/prelaunch` cho tới khi độ lệch tự hết — throttle qua `sessionStorage` giới hạn còn tối đa 1 lần thử mỗi 30 giây thay vì mỗi giây, không loại bỏ hoàn toàn hiện tượng | "Không có thông báo — chỉ là nhấp nháy điều hướng tạm thời khi đồng hồ lệch, tự hết trong vài chục giây" | `lib/prelaunch/use-prelaunch-countdown.ts:27-63` — trade-off có chủ đích, xem [ADR-002](../../../decisions/ADR-002-prelaunch-launch-timing-gate.md) và `plans/reports/reviewer-260819-1040-prelaunch.md` mục High #1 |
| Font "Digital Numbers" chưa có file thật trong repo | Chữ số hiển thị bằng font monospace dự phòng (`ui-monospace, 'SF Mono', 'Courier New', monospace`) thay vì kiểu LED bảy đoạn như thiết kế | "Không có — vẫn đọc được số bình thường, chỉ khác kiểu chữ hiển thị" | `app/globals.css` (`@font-face` trỏ `public/fonts/digital-numbers.woff2`, file chưa tồn tại — swap tự động, không cần đổi code khi file được bổ sung) |
