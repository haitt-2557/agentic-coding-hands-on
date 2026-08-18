---
status: Accepted
date: 2026-08-18
deciders: takumi (orchestrator), user
---

# ADR-001: Mock client-side session thay vì auth thật, i18n hand-rolled thay vì `next-intl`

## Status

Accepted (2026-08-18).

## Context

Homepage SAA 2025 là một trang tĩnh Next.js App Router greenfield, không có tầng backend
(không `app/api/**/route.ts`, không `middleware.ts`, không database/ORM). Thiết kế MoMorph
lại đòi hai hành vi cần "trạng thái người dùng":

1. Header hiển thị chuông thông báo + account menu (mục "Admin Dashboard" chỉ cho admin) —
   đòi một khái niệm role, nhưng repo không có auth backend nào để lấy role đó.
2. Bộ chuyển ngôn ngữ VN/EN phải thật sự đổi toàn bộ copy giao diện (TC ID-24/25/26/58).

Cả hai quyết định được chốt cùng lúc trong phiên clarification 2026-08-18
(`plans/260818-0936-homepage-saa/clarifications.md`) và cùng một tính chất: giải quyết đúng
scope hiện tại (một trang, không backend) mà không khóa cứng kiến trúc tương lai.

## Decision

### 1. Session client-side mock, không phải auth thật

Dựng `SessionProvider` (`lib/session/session-provider.tsx`) — một React context thuần
client, seed role theo thứ tự ưu tiên: `localStorage` (`saa.mock-role`) → env
`NEXT_PUBLIC_MOCK_ROLE` → default cứng `guest` (`resolveSession()`, dòng 43-58). SSR/lần
render đầu luôn là `guest`/`unreadCount: 0` để khớp HTML server, giá trị thật được reconcile
sau `useEffect` (dòng 62-77) — tránh hydration mismatch vì `localStorage` không tồn tại phía
server.

File tự mang cảnh báo bảo mật ngay trong comment đầu (dòng 3-10): đây **không phải một
ranh giới auth**. Bất kỳ ai mở DevTools cũng gõ được
`localStorage.setItem('saa.mock-role', 'admin')` để tự cấp quyền — không có bước xác thực
hay kiểm tra phía server nào can thiệp.

Hệ quả trực tiếp trên 2 route:

- `/admin` (`app/admin/page.tsx`) — comment dòng 1-4 nói tường minh: "this page is NOT
  access-controlled and must not be treated as protected: real authorization has to be
  enforced server-side when real auth arrives". Route render được cho bất kỳ ai gõ đúng
  URL, kể cả `guest` chưa từng thấy mục menu dẫn tới đó.
- `/profile` (`app/profile/page.tsx`) — cùng tình trạng, không guard.

3 điểm ẩn/hiện UI theo role (`components/ui/account-menu.tsx:16,51`,
`components/ui/notification-bell.tsx:16`) là toàn bộ những gì "role" chi phối trong build
này — xem `docs/vi/system/permissions.md` và
`docs/vi/generated/permissions-matrix.md` (PERM001–PERM003, cả 3 đều type
`screen-permission`, không có `route-guard` nào tồn tại).

**Khi có auth thật, những gì phải thay**:

- Thêm session server-side thật (cookie/JWT xác thực qua một identity provider) — không
  đọc `role` từ `localStorage`/env nữa.
- Thêm route guard hoặc middleware (`middleware.ts`) chặn `/admin` ở tầng server trước khi
  render, không chỉ ẩn mục menu.
- Kiểm tra lại toàn bộ 3 điểm PERM### hiện tại — chúng đang enforce trong thân component
  (client render), phải chuyển thành kiểm tra phía server (hoặc ít nhất double-check phía
  server) trước khi coi là an toàn.
- `SessionProvider` có thể giữ lại như một lớp UI-state mỏng (đọc session server trả về),
  nhưng không được là nguồn sự thật (source of truth) cho quyền truy cập nữa.

### 2. Dictionary VN/EN hand-rolled, không phải `next-intl`

`LocaleProvider` (`lib/i18n/locale-provider.tsx`) là một context thuần với 2 dictionary
đã gõ kiểu, `vi` (`lib/i18n/dictionaries/vi.ts`, 40 dòng) và `en`
(`lib/i18n/dictionaries/en.ts`, 34 dòng), một hàm `translate()` tra key trực tiếp, và lựa
chọn được lưu `localStorage` (`saa.locale`, dòng 19). Comment nguồn (dòng 3-5) nói rõ:
"No new runtime dependency (`next-intl` was considered and deferred per
clarifications.md — YAGNI until a third locale is needed)." `next-intl` không xuất hiện
trong `package.json`.

Cùng pattern SSR-default → `useEffect` reconcile với `SessionProvider`: render đầu luôn
`vi` (dòng 47-51), giá trị `localStorage` được đọc sau mount (`resolvePersistedLocale()`,
dòng 29-32) để tránh hydration mismatch.

Lý do chọn hand-rolled thay vì `next-intl`:

- Chỉ 2 locale, không cần i18n routing (`/en/...` vs `/...`) — `next-intl` giải quyết một
  lớp vấn đề (routing, pluralization, number/date formatting) mà scope hiện tại không cần.
- Copy trang chủ là tập hợp string ngắn, liệt kê được hết (header/hero/section
  labels/CTA/footer/notification/account menu/widget) — tra bằng object key đơn giản hơn
  cấu hình một thư viện đầy đủ.
- Giữ đúng nguyên tắc KISS/YAGNI của dự án: không thêm dependency cho một nhu cầu chưa
  xuất hiện.

**Điều kiện nên nâng cấp lên `next-intl` (hoặc tương đương)**:

- Thêm locale thứ 3 trở lên — tra dictionary phẳng không scale tốt khi số locale tăng, và
  lúc đó lợi ích routing/pluralization của `next-intl` bắt đầu vượt chi phí tích hợp.
- Cần pluralization thật (số nhiều/số ít theo ngôn ngữ) hoặc format ngày/số/tiền tệ theo
  locale — 2 nhu cầu `translate()` hiện tại (tra string phẳng) không đáp ứng được.
- Cần URL theo locale (`/en/...`) cho SEO hoặc chia sẻ link — đòi hỏi tầng routing mà
  `next-intl` cung cấp sẵn.

## Consequences

**Được**:

- Không thêm dependency mới cho một trang tĩnh không backend — bundle nhỏ, không có lớp
  cấu hình i18n routing không dùng tới.
- Cả hai provider theo cùng một pattern (SSR-default → client-reconcile), dễ đọc, dễ maintain
  song song.
- Interface `useSession()`/`useI18n()` tách biệt hoàn toàn khỏi nơi tiêu thụ — khi thay
  session thật hoặc thư viện i18n khác, component gọi hook không cần đổi.

**Trả giá / rủi ro**:

- **Không được coi bảng phân quyền hiện tại là bảo mật** — đây là rủi ro lớn nhất của
  quyết định 1. Bất kỳ ai code sau này thêm dữ liệu thật đằng sau `/admin` hoặc `/profile`
  mà quên đọc cảnh báo này sẽ tạo lỗ hổng thật.
  → **Mitigation**: comment cảnh báo đặt trực tiếp trong `session-provider.tsx` (dòng 3-10)
  và `app/admin/page.tsx` (dòng 1-4), cộng tài liệu này và `permissions.md`.
- Dictionary hand-rolled không có pluralization/formatting — nếu copy tương lai cần "1 giải
  thưởng" / "2 giải thưởng" khác nhau, phải tự viết logic đó hoặc migrate sớm hơn dự kiến.
- Thêm locale thứ 3 sẽ đòi refactor cả `LocaleProvider` lẫn nơi gọi `translate()` — chi phí
  migrate dồn lại thay vì trả dần.

## Alternatives Considered

| Lựa chọn | Vì sao không chọn (cho scope hiện tại) |
|---|---|
| Auth thật (NextAuth/Auth.js, session server) | Không có backend, không có yêu cầu đăng nhập thật trong scope Homepage SAA — over-engineering cho 1 trang tĩnh |
| `next-intl` | Cần routing/pluralization/formatting mà 2-locale, không-routing, plain-string copy không cần tới; thêm dependency + cấu hình không tương xứng lợi ích |
| Không có role nào (ẩn hẳn bell/account menu) | Không thỏa được TC ID-1/5/6/27-29/36-38 — thiết kế MoMorph yêu cầu rõ hành vi theo role |
| Server Component đọc `cookies()` để seed role | Không có gì để đọc — không có login flow ghi cookie; vẫn cần một nơi seed giá trị ban đầu, bản chất là cùng vấn đề chuyển sang chỗ khác |

## Cross-references

- `docs/vi/system/architecture.md` § Cross-cutting concerns
- `docs/vi/system/permissions.md`, `docs/vi/generated/permissions-matrix.md` (PERM001–PERM003)
- `plans/260818-0936-homepage-saa/clarifications.md` — phiên 2026-08-18, các mục "Header
  shows a notification bell..." và "The language switcher must actually switch..."
- `lib/session/session-provider.tsx`, `lib/i18n/locale-provider.tsx`,
  `lib/i18n/dictionaries/{vi,en}.ts`, `app/admin/page.tsx`, `app/profile/page.tsx`
