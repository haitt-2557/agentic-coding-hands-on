# System Overview

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Architecture Type**: Static site Next.js App Router, không có backend

## Executive Summary

Đây là trang chủ marketing/sự kiện cho Sun* Annual Awards 2025, build bằng Next.js 16 (App Router) + React 19 + Tailwind v4. Hệ thống có đúng 6 route, tất cả đều là `page.tsx` prerender tĩnh: `/` (`app/page.tsx`), `/awards`, `/kudos`, `/profile`, `/admin`, và route `_not-found` mặc định do Next.js tự sinh (không có file `app/not-found.tsx` tùy chỉnh trong repo).

Không có backend dưới bất kỳ hình thức nào: không `app/api/**/route.ts`, không `middleware.ts`, không database/ORM, không biến môi trường bí mật phía server — `.env.example` chỉ khai báo các key `NEXT_PUBLIC_*` hiển thị công khai phía client. Nội dung giải thưởng là một hằng số hard-code trong `lib/awards.ts` (`AWARDS: Award[]`, 6 hạng mục tĩnh), và bộ đếm ngược trên hero section là một hàm thuần (`lib/countdown.ts`) tính từ `NEXT_PUBLIC_EVENT_START_AT`.

Trạng thái đăng nhập (`role`: `guest|user|admin`) và locale (`vi|en`) đến từ một mock phía client đọc `localStorage` với fallback là biến `NEXT_PUBLIC_*` — xem `lib/session/session-provider.tsx` và `lib/i18n/locale-provider.tsx`. Cơ chế này chỉ dùng để **ẩn/hiện UI**, không phải một ranh giới phân quyền thật (không có kiểm tra phía server nào tồn tại trong repo).

`/awards`, `/kudos`, `/profile`, `/admin` là các route placeholder có chủ đích theo brief của dự án, không phải tính năng dang dở.

For architecture diagrams and tech stack details, see [architecture.md](architecture.md).

## Key Design Decisions

### Decision 1: Kiến trúc static, không backend

**Context**: Đây là trang sự kiện ngắn hạn (SAA 2025), không cần lưu trữ dữ liệu động hay xử lý phía server.

**Decision**: Toàn bộ hệ thống được implement như một Next.js App Router site tĩnh — 6 route, tất cả prerender, không có route handler API, không middleware, không database client hay ORM nào trong cây nguồn.

**Rationale**: Scout report xác nhận 0 kết quả khớp trên cả 10 loại Background Logic chuẩn (custom-command, event-listener, integration, mail, middleware, notification, observer, queue-worker, scheduled-job, webhook); duy nhất một manifest ở root (`package.json`, dependencies chỉ gồm `next`, `react`, `react-dom`). Một trang sự kiện ngắn hạn không cần hạ tầng backend để build và vận hành — đúng tinh thần YAGNI.

### Decision 2: Session/role và locale là mock phía client, chỉ để ẩn/hiện UI

**Context**: Route `/admin` và một số UI (account menu, notification bell) cần điều kiện hiển thị theo vai trò, nhưng dự án không xây auth thật.

**Decision**: `lib/session/session-provider.tsx` lấy `role` (`guest|user|admin`) và `unreadCount` từ `localStorage` (`saa.mock-role` / `saa.mock-unread`), fallback về env `NEXT_PUBLIC_MOCK_ROLE` / `NEXT_PUBLIC_MOCK_UNREAD_COUNT`; `lib/i18n/locale-provider.tsx` xử lý `vi`/`en` theo cơ chế tương tự.

**Rationale**: File nguồn có cảnh báo tường minh rằng giá trị này sửa được từ DevTools, không có backend, không có kiểm tra phía server ở bất kỳ đâu trong repo. Đây là công tắc hiển thị UI cho mục đích demo/dev, không phải ranh giới bảo mật — các artifact về permission ở downstream (permissions-template, permissions-matrix) phải ghi nhận đây là UI-only gating, không phải authorization thật.

## Security Overview

- **Authentication**: Không có — không tồn tại luồng đăng nhập/đăng xuất nào trong codebase.
- **Authorization**: Không có ở phía server; chỉ có UI-only role gating từ mock phía client (xem Decision 2), không phải một ranh giới bảo mật.
- **Data Encryption**: Không áp dụng — hệ thống không lưu trữ dữ liệu, không có backend, không có secret; `.env.example` chỉ khai báo các key `NEXT_PUBLIC_*` vốn đã hiển thị công khai phía client.
- **API Security**: Không áp dụng — không có `app/api/**/route.ts` hay bất kỳ route handler nào trong repo.

## Scalability

- **Current Capacity**: 6 route, toàn bộ prerender tĩnh — năng lực phục vụ phụ thuộc vào hạ tầng CDN/static hosting, không có compute phía server cho từng request.
- **Scaling Strategy**: Không cần chiến lược scale riêng — output tĩnh scale theo cơ chế CDN/edge cache chuẩn của Next.js; không có backend stateful nào cần scale.
- **Performance Targets**: Không có target hiệu năng nào được định nghĩa trong codebase. Điểm cần lưu ý duy nhất: `components/home/countdown-timer.tsx` dùng `setInterval(tick, 60_000)` để refresh UI đếm ngược mỗi phút — đây là tick UI phía client, chi phí không đáng kể, và biến mất khi tab đóng (không phải background job).
