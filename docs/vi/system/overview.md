# System Overview

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Architecture Type**: Static site Next.js App Router, gần như không có backend (ngoại lệ duy nhất, thêm 2026-08-19: 1 route handler OAuth callback — xem § Executive Summary)

## Executive Summary

Đây là trang chủ marketing/sự kiện cho Sun* Annual Awards 2025, build bằng Next.js 16 (App Router) + React 19 + Tailwind v4. Hệ thống có 9 route: `/` (`app/page.tsx`), `/prelaunch` (thêm 2026-08-19), `/awards`, `/kudos`, `/profile`, `/admin`, route `_not-found` mặc định do Next.js tự sinh (không có file `app/not-found.tsx` tùy chỉnh trong repo), cộng **`/login` và `/auth/callback` (thêm 2026-08-19, lượt Login)** — 2 route ĐẦU TIÊN render `ƒ Dynamic` thay vì `○ Static` (xác nhận `npm run build`), vì cả hai đọc cookie phiên Supabase.

Không có backend dưới bất kỳ hình thức nào cho phần còn lại của app: không database/ORM tự viết, không biến môi trường bí mật phía server cho các route cũ — `.env.example` chỉ khai báo các key `NEXT_PUBLIC_*` hiển thị công khai phía client. (Cập nhật 2026-08-19: có một request-interception layer — `proxy.ts`, tên mới của quy ước `middleware.ts` từ Next 16 — nhưng nó chỉ quyết định route nào được phép render theo thời gian, không phải một backend service; xem [architecture.md](architecture.md) § Request-Interception Layer.) **Cập nhật (lượt Login, 2026-08-19)**: dòng "không `app/api/**/route.ts`" không còn đúng tuyệt đối — `app/auth/callback/route.ts` là route handler thật đầu tiên (đổi mã OAuth lấy session Supabase); và `.env.example`/root `.env` nay có thêm biến server-only thật (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`/`_SECRET`, không có prefix `NEXT_PUBLIC_`). Xem [architecture.md](architecture.md) § Authentication Layer. Nội dung giải thưởng là một hằng số hard-code trong `lib/awards.ts` (`AWARDS: Award[]`, 6 hạng mục tĩnh), và bộ đếm ngược trên hero section là một hàm thuần (`lib/countdown.ts`) tính từ `NEXT_PUBLIC_EVENT_START_AT` — cùng biến này cũng lái gate đếm-ngược ở `/prelaunch`.

Trạng thái đăng nhập (`role`: `guest|user|admin`) và locale (`vi|en`) đến từ một mock phía client đọc `localStorage` với fallback là biến `NEXT_PUBLIC_*` — xem `lib/session/session-provider.tsx` và `lib/i18n/locale-provider.tsx`. Cơ chế này chỉ dùng để **ẩn/hiện UI**, không phải một ranh giới phân quyền thật (không có kiểm tra phía server nào tồn tại trong repo). **Cập nhật (lượt Login, 2026-08-19)**: đây vẫn đúng nguyên văn — mock `role` không đổi. Nhưng hệ thống giờ có THÊM một ranh giới xác thực thật hoàn toàn tách biệt (đăng nhập Google qua Supabase), phạm vi chỉ giới hạn ở một route (`/login`); xem [permissions.md](permissions.md).

`/awards`, `/kudos`, `/profile`, `/admin` là các route placeholder có chủ đích theo brief của dự án, không phải tính năng dang dở.

For architecture diagrams and tech stack details, see [architecture.md](architecture.md).

## Key Design Decisions

### Decision 1: Kiến trúc static, không backend

**Context**: Đây là trang sự kiện ngắn hạn (SAA 2025), không cần lưu trữ dữ liệu động hay xử lý phía server.

**Decision**: Toàn bộ hệ thống được implement như một Next.js App Router site tĩnh — không có route handler API, không database client hay ORM nào trong cây nguồn. (Cập nhật 2026-08-19: một request-interception layer — `proxy.ts` — được thêm sau đó cho gate đếm-ngược-trước-khi-mở-site; đây KHÔNG phải một backend service/API, chỉ quyết định route nào được phép render, và không thay đổi kết luận "static, không backend" ở trên. Xem [architecture.md](architecture.md) § Request-Interception Layer.)

**Rationale**: Scout report xác nhận 0 kết quả khớp trên cả 10 loại Background Logic chuẩn (custom-command, event-listener, integration, mail, middleware, notification, observer, queue-worker, scheduled-job, webhook); duy nhất một manifest ở root (`package.json`, dependencies chỉ gồm `next`, `react`, `react-dom`). Một trang sự kiện ngắn hạn không cần hạ tầng backend để build và vận hành — đúng tinh thần YAGNI.

### Decision 2: Session/role và locale là mock phía client, chỉ để ẩn/hiện UI

**Context**: Route `/admin` và một số UI (account menu, notification bell) cần điều kiện hiển thị theo vai trò, nhưng dự án không xây auth thật.

**Decision**: `lib/session/session-provider.tsx` lấy `role` (`guest|user|admin`) và `unreadCount` từ `localStorage` (`saa.mock-role` / `saa.mock-unread`), fallback về env `NEXT_PUBLIC_MOCK_ROLE` / `NEXT_PUBLIC_MOCK_UNREAD_COUNT`; `lib/i18n/locale-provider.tsx` xử lý `vi`/`en` theo cơ chế tương tự.

**Rationale**: File nguồn có cảnh báo tường minh rằng giá trị này sửa được từ DevTools, không có backend, không có kiểm tra phía server ở bất kỳ đâu trong repo. Đây là công tắc hiển thị UI cho mục đích demo/dev, không phải ranh giới bảo mật — các artifact về permission ở downstream (permissions-template, permissions-matrix) phải ghi nhận đây là UI-only gating, không phải authorization thật.

### Decision 3: Đăng nhập Google qua Supabase — ranh giới auth thật, song song KHÔNG hợp nhất với mock session (thêm 2026-08-19)

**Context**: Cần một màn `/login` thật cho SAA 2025, nhưng không được đổi hành vi hiện có
của `role` mock (F007/F008) hay mở rộng phạm vi thành bảo vệ toàn site — đó là việc của một
lượt sau.

**Decision**: Dựng một ranh giới xác thực THẬT bằng Supabase Auth local + Google OAuth
(`@supabase/ssr`), nhưng cố tình KHÔNG nối nó với `lib/session/session-provider.tsx`. Phiên
Supabase chỉ có đúng một tác dụng: `PERM004_LoginRouteAuthGate` — quyết định `/login` có
redirect actor đi hay không. Do Next 16 chỉ nạp một `proxy.ts`, việc refresh cookie session
Supabase được gộp vào cùng file đang chạy gate đếm-ngược `/prelaunch` (BL001), thay vì tạo
`proxy.ts` thứ hai (Next không hỗ trợ).

**Rationale**: Hợp nhất `role` với phiên Supabase (để phiên đăng nhập thật quyết định vai
trò hiển thị) là một quyết định sản phẩm lớn hơn nhiều — cần biết Google account nào map
tới `role` nào, việc đó chưa được đặc tả. Giữ hai ranh giới tách biệt (YAGNI) tránh việc dựng
sai một mapping role chưa ai duyệt. Rủi ro kỹ thuật lớn nhất của việc gộp proxy — cookie
refresh Supabase bị rơi mất nếu gate trả về response khác — được xử lý bằng cách
`updateSupabaseSession()` trả về cookie đã ghi để `proxy.ts` tự copy lên response cuối cùng;
xem [architecture.md](architecture.md) § Authentication Layer để biết chi tiết đầy đủ.

## Security Overview

- **Authentication**: **Cập nhật (lượt Login, 2026-08-19)** — nay CÓ một luồng đăng nhập thật: Google OAuth qua Supabase Auth (GoTrue) local, tại `/login`. Trước lượt này: không có.
- **Authorization**: Không có ở phía server cho `role`; chỉ có UI-only role gating từ mock phía client (xem Decision 2), không phải một ranh giới bảo mật. **Cập nhật (lượt Login, 2026-08-19)**: có đúng MỘT route-guard thật (`PERM004_LoginRouteAuthGate`, `getUser()` phía server) — nhưng nó chỉ chi phối `/login`, không mở rộng thành authorization cho route nào khác; kết luận "không có authorization theo vai trò" không đổi.
- **Data Encryption**: Không áp dụng cho phần còn lại của app — không lưu trữ dữ liệu riêng, không có secret cho các route cũ; `.env.example` chỉ khai báo các key `NEXT_PUBLIC_*` vốn đã hiển thị công khai phía client. **Cập nhật (lượt Login, 2026-08-19)**: nay có secret thật server-only (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`/`_SECRET`, không prefix `NEXT_PUBLIC_`, đặt ở root `.env`, không commit) — do Supabase CLI đọc, không phải Next.js runtime.
- **API Security**: **Cập nhật (lượt Login, 2026-08-19)** — `app/auth/callback/route.ts` là route handler thật đầu tiên trong repo (trước đó: không áp dụng, đúng như dòng gốc). Route này không xác thực (nó là nơi phiên được TẠO ra) nhưng có một biện pháp bảo vệ cụ thể: mọi redirect dựng từ `getSiteUrl()` (config tĩnh), không bao giờ từ `request.nextUrl.origin` (tránh open-redirect qua header `Host` giả mạo — phát hiện security review mức High). Xem [architecture.md](architecture.md) § Authentication Layer.

## Scalability

- **Current Capacity**: 6 route, toàn bộ prerender tĩnh — năng lực phục vụ phụ thuộc vào hạ tầng CDN/static hosting, không có compute phía server cho từng request.
- **Scaling Strategy**: Không cần chiến lược scale riêng — output tĩnh scale theo cơ chế CDN/edge cache chuẩn của Next.js; không có backend stateful nào cần scale.
- **Performance Targets**: Không có target hiệu năng nào được định nghĩa trong codebase. Điểm cần lưu ý duy nhất: `components/home/countdown-timer.tsx` dùng `setInterval(tick, 60_000)` để refresh UI đếm ngược mỗi phút — đây là tick UI phía client, chi phí không đáng kể, và biến mất khi tab đóng (không phải background job).
