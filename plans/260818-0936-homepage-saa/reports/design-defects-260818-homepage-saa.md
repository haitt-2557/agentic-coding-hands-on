# Design defects — Homepage SAA 2025

**Gửi:** design owner · **Từ:** implementation run 2026-08-18 · **Branch:** `feat/homepage-saa`
**Screen:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `i87tDx10uM` · **figma node:** `2167:9026`
**Nguồn:** 46 spec item (`spec_status: done`), 62 test case, 35 media node, frame render `design/homepage-saa-full.png` (1512×4480)

Trang đã build xong và chạy đúng. Những mục dưới đây là lỗi **trong chính dữ liệu thiết kế**, không phải lỗi code — chúng tôi đã xử lý tạm để không chặn tiến độ, nhưng mỗi mục cần một quyết định từ phía thiết kế trước khi trang lên public. Mỗi mục ghi rõ: hiện trạng, chúng tôi đã làm gì, và cần gì từ anh/chị.

Quy tắc precedence đã áp dụng cho toàn bộ run này: **frame thắng về copy và layout; CSV + 62 test case thắng về hành vi, trạng thái và logic.**

---

## A. Sai chính tả trong file thiết kế

### A1 — Hero subtitle: "Comming soon" (thừa một chữ `m`)

- **Hiện trạng:** frame render `Comming soon`. Spec row B1.2 lại viết đúng là `Coming soon`.
- **Đã làm:** dùng `Coming soon`. Frame thắng về copy, nhưng ở đây frame tự mâu thuẫn với spec của chính nó, và một lỗi chính tả thì không phải là chủ ý thiết kế.
- **Cần:** sửa trong file Figma để lần đồng bộ sau không kéo lỗi này quay lại.

### A2 — Footer copyright: "Bản quyền thuộc **vè** Sun*" (thiếu dấu, phải là "về")

- **Hiện trạng:** spec CSV row 7 và TC ID-17 viết `thuộc vè`. Frame viết đúng `thuộc về`.
- **Đã làm:** dùng `Bản quyền thuộc về Sun* © 2025` theo frame. Không tái tạo lỗi từ CSV.
- **Cần:** sửa trong nguồn spec CSV — hiện tại TC ID-17 nếu chạy nguyên văn sẽ fail trên code đúng.

---

## B. Dữ liệu thiết kế lỗi thời hoặc tự mâu thuẫn

### B1 — Thông tin sự kiện: spec đang là bản nháp cũ

| Nguồn | Nội dung |
|-------|----------|
| Frame (đã dùng) | `Thời gian: 26/12/2025 · Địa điểm: Âu Cơ Art Center · Tường thuật trực tiếp qua sóng Livestream` |
| Spec item B2 / TC ID-14 | `18h30 · Nhà hát nghệ thuật quân đội · Tường thuật trực tiếp tại Group Facebook Sun* Family` |

- **Khác nhau cả ba trường** — giờ, địa điểm, kênh phát. Đây không phải khác biệt diễn đạt mà là hai phiên bản sự kiện khác nhau.
- **Đã làm:** lấy theo frame. **TC ID-14 bị đánh dấu STALE** và loại khỏi phạm vi E2E — đây là test case duy nhất trong 62 case bị loại.
- **Cần:** xác nhận frame mới là đúng, rồi cập nhật spec item B2 + TC ID-14. Nếu ngược lại — spec mới đúng và frame cũ — thì báo ngay, vì phần event-info trên trang đang hiển thị sai và E2E đang khoá giá trị theo frame.

### B2 — Spec item C2 mâu thuẫn giữa hàng tiếng Việt và tiếng Anh

| Nguồn | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| C2 hàng vi | 3 | 2 | 2 |
| TC ID-16 | 3 | 2 | 2 |
| C2 hàng en | 3 | 2 | **1** |

- **Đã làm:** chọn **3 / 2 / 2** — hai nguồn đồng thuận, và test case là thứ E2E khẳng định. Hàng tiếng Anh được coi là bản dịch lỗi thời.
- **Cần:** sửa hàng tiếng Anh cho khớp, hoặc nếu 1 cột trên mobile mới là ý đồ thật thì báo lại — cả C2 (vi) lẫn TC ID-16 đều phải sửa theo, kèm một vòng cập nhật E2E.

---

## C. Nội dung thiếu, phải xử lý tạm

### C1 — Ba award card dùng chung một đoạn mô tả placeholder

Ba giải **Best Manager**, **Signature 2025 - Creator**, **MVP (Most Valuable Person)** đều mang y hệt một dòng mô tả trong frame:

> "Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm"

- Dòng này chỉ đúng nghĩa cho **Best Manager**. Hai giải còn lại rõ ràng đang xài tạm.
- **Đã làm:** tái tạo nguyên văn theo quy tắc frame-thắng-về-copy. Nghĩa là trang hiện tại đang hiển thị mô tả sai cho hai giải.
- **Cần:** copy thật cho `signature-2025-creator` và `mvp`. Đây là mục **chặn public** — không phải chuyện chỉnh chu, mà là thông tin sai về giải thưởng.

### C2 — Link footer "Tiêu chuẩn chung" không có đích đến

- Không có destination ở bất kỳ đâu: spec row, test case, hay frame.
- **Đã làm:** render thành phần tử **không phải link** (text tạo dáng giống các link anh em, không có `href`). TC ID-59 (không có link gãy) vẫn đúng, không có gì 404, và khoảng trống này vẫn nhìn thấy được thay vì bị lấp bằng một URL bịa.
- **Cần:** URL thật, hoặc xác nhận bỏ hẳn link này.

---

## D. Ngữ nghĩa accessibility cần thiết kế quyết định

Ba mục này do `reviewer` phát hiện ở vòng review cuối. Chúng tôi **không tự sửa** vì mỗi mục đổi ý nghĩa của thành phần chứ không chỉ đổi code, và cái giá phải trả rơi vào trải nghiệm người dùng bàn phím / trình đọc màn hình.

### D1 — Hai nút CTA ở hero mang `role="button"` nhưng thực chất là link

`components/home/hero-cta.tsx` — frame tạo dáng "ABOUT AWARDS" / "ABOUT KUDOS" như nút bấm, nhưng chúng điều hướng sang `/awards` và `/kudos`. Hiện code đặt `role="button"` lên thẻ `<Link>`.

Hệ quả: theo chuẩn WAI-ARIA, `role="button"` hứa rằng phím **Space** kích hoạt được — nhưng `<a>` chỉ phản hồi **Enter**. Người dùng bàn phím nhấn Space sẽ thấy trang cuộn xuống thay vì chuyển trang. Đồng thời mất luôn các khả năng của link (mở tab mới, copy địa chỉ, trình đọc màn hình đọc là "liên kết").

**Hai hướng:** (a) bỏ `role="button"`, để chúng là link đúng nghĩa — giữ nguyên hình thức, sửa ngữ nghĩa; (b) giữ `role="button"` và bổ sung xử lý phím Space. Chúng tôi nghiêng về (a): điều hướng thì nên là link.

### D2 — Bốn dropdown dùng `role="menu"` / `role="menuitem"` nhưng không có điều hướng phím mũi tên

`components/ui/dropdown-menu.tsx` và cả bốn nơi dùng nó (language switcher, notification bell, account menu, quick-action widget).

`role="menu"` trong chuẩn APG là **command menu** kiểu menu ứng dụng desktop: mở ra là focus nhảy vào trong, phím mũi tên di chuyển giữa các mục, Home/End nhảy đầu/cuối. Hiện chỉ có toggle, click-outside, Enter, Space, Escape — mũi tên chưa có. Người dùng trình đọc màn hình được thông báo "menu, 2 mục" rồi bấm mũi tên thì không có gì xảy ra.

Thực chất bốn dropdown này là **nhóm liên kết điều hướng**, không phải command menu. Nên hướng gọn nhất có thể là đổi sang `role` phù hợp hơn (ví dụ nhóm link trong `<nav>`) thay vì đi hiện thực đủ hành vi APG.

### D3 — Mỗi award card có 3 link về cùng một đích, 2 trong đó trùng tên

`components/home/award-card.tsx` — ảnh, tiêu đề, và link "Chi tiết" đều trỏ về cùng `/awards#<slug>`. Link bọc ảnh và link ở tiêu đề còn có **accessible name giống hệt nhau** (đều là tên giải).

Hệ quả: người dùng bàn phím phải Tab qua 3 điểm dừng cho mỗi card — 18 lần Tab cho 6 card — để tới đúng một trang đích. Trình đọc màn hình đọc trùng tên hai lần liên tiếp. (Đây cũng là lý do một locator trong E2E phải dùng `.first()` để phân biệt hai link không thể phân biệt được.)

**Hướng:** gom còn ít điểm dừng hơn — ví dụ một link cấp card cộng một link "Chi tiết" phụ — hoặc đặt accessible name khác nhau cho hai link trùng.

---

---

## E. Bốn trang placeholder không có đường quay lại

Phát hiện lúc dựng tài liệu, đã kiểm chứng trực tiếp trong source: `app/layout.tsx` chỉ bọc `SessionProvider` và `LocaleProvider` quanh `children` — header và footer nằm trong JSX của riêng `app/page.tsx` (dòng 12 và 20).

Hệ quả: bấm "Award Information" trên header của trang chủ → sang `/awards` → trang đó **không có header, không có footer**, không có cách nào trong ứng dụng để quay lại. Chỉ còn nút Back của trình duyệt. Tương tự với `/kudos`, `/profile`, `/admin`.

- **Chưa sửa.** Cách sửa là chuyển `<SiteHeader />` / `<SiteFooter />` từ `app/page.tsx` lên `app/layout.tsx`, nhưng đó là thay đổi cấu trúc chạm vào phạm vi Track A và có thể làm lệch một số locator E2E (khi đó `/awards` sẽ có thêm toàn bộ link của header) — không phải việc nên làm ở bước bàn giao.
- **Về mặt phạm vi thì chấp nhận được:** cả bốn trang đều là stub có chủ đích, và khi màn hình thật được thiết kế thì chúng sẽ có chrome riêng.
- **Cần:** khi thiết kế màn `/awards` và `/kudos` thật, xác nhận chúng dùng chung header/footer với trang chủ. Nếu đúng thì lúc dựng màn thật nên nâng hai component đó lên layout luôn, thay vì lặp lại ở từng trang.

---

## Tóm tắt cần quyết định

| # | Mục | Mức | Chặn public? |
|---|-----|-----|--------------|
| A1 | Sửa "Comming soon" trong Figma | Thấp | Không |
| A2 | Sửa "thuộc vè" trong spec CSV | Thấp | Không |
| B1 | Xác nhận thông tin sự kiện đúng (frame hay spec) | **Cao** | **Có** — sai thì trang đang hiện sai giờ/địa điểm |
| B2 | Thống nhất số cột responsive ở C2 | Trung bình | Không |
| C1 | Copy thật cho Signature 2025 - Creator và MVP | **Cao** | **Có** — hai giải đang hiển thị mô tả của giải khác |
| C2 | Đích đến cho "Tiêu chuẩn chung" | Trung bình | Không |
| D1 | Ngữ nghĩa hero CTA: link hay button | Trung bình | Không |
| D2 | Ngữ nghĩa dropdown: menu hay nhóm link | Trung bình | Không |
| D3 | Số link trên mỗi award card | Trung bình | Không |

Hai mục **B1** và **C1** cần trả lời trước khi trang lên public — cả hai đều là thông tin sai hiển thị cho người dùng, không phải chuyện hoàn thiện.
