---
status: draft
authored_by: takumi
created: 2026-08-26
lang: vi
fcode: F005
---

## Screen List

| Screen | Route | Component | Vai trò của LanguageSwitcher |
|---|---|---|---|
| SCR001_Home | `/` | `components/layout/site-header.tsx:16,70` | Chính — MoMorph frame `hUyaaugye2` map trực tiếp vào đây, header hiển thị trên mọi trang công khai (`/`, `/awards`, `/kudos`, `/profile`, `/admin` đều dùng chung `site-header.tsx`) |
| Login | `/login` (`app/login/page.tsx`) | `components/login/login-header.tsx:1-24` | Phụ — header riêng của trang login (không có nav/account-menu, chỉ logo + `LanguageSwitcher`), dùng CHUNG component `LanguageSwitcher` nên thừa hưởng mọi thay đổi design ở revision này |

Không có screen thứ 3 nào render `LanguageSwitcher` — xác nhận qua grep 2 điểm import (`site-header.tsx`, `login-header.tsx`) trong toàn bộ `app/` và `components/`.

## User Journey

1. Người dùng vào `/` (hoặc `/login`) → thấy nút cờ + mã ngôn ngữ (VN mặc định) ở góc phải header.
2. Bấm nút (hoặc focus + Enter/Space) → panel xổ xuống, 2 dòng VN/EN, dòng đang chọn có nền sáng nhẹ phân biệt.
3. Bấm dòng còn lại (hoặc click ra ngoài/Esc để huỷ, không đổi gì) → nếu chọn: toàn bộ copy trang đổi ngôn ngữ, nút trigger đổi cờ/nhãn theo lựa chọn mới, panel đóng lại, lựa chọn ghi vào `localStorage.saa.locale`.
4. Reload trang hoặc chuyển sang `/login` → lựa chọn vẫn giữ nguyên (đọc lại từ `localStorage` sau khi client mount).
