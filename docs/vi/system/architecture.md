# Architecture

## System Architecture

Ứng dụng là một trang tĩnh Next.js App Router, không có tầng backend: không có
`app/api/**/route.ts`, không có database/ORM/queue nào trong cây nguồn (xác nhận tại
`scout-report.md` § Background Logic Source Inventory — mọi hạng mục đều `_(none found)_`,
ngoại trừ một request-interception layer thêm sau đó — xem § Request-Interception Layer
bên dưới). Toàn bộ 7 route (`/`, `/prelaunch`, `/awards`, `/kudos`, `/profile`, `/admin`,
và `_not-found` do Next tự sinh) được prerender ở build time.

**Đính chính so với bản trước của tài liệu này**: dòng trên từng ghi "không có
`middleware.ts`" — điều đó không còn đúng. `proxy.ts` (tên mới của quy ước `middleware.ts`
kể từ Next 16 — quy ước cũ đã deprecated, xem
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`) nay
chặn MỌI request tới bất kỳ route nào trước khi route đó render, để thực hiện gate đếm-ngược
trước-khi-mở-site cho trang `/prelaunch`. Đây là **gate theo THỜI GIAN (launch-timing),
không phải một ranh giới ủy quyền (authorization boundary)** — nó không đọc
`role`/`SessionState` của `lib/session/session-provider.tsx` (đã tự ghi rõ là mock, không
phải access control — xem § Cross-cutting concerns bên dưới) hay bất kỳ state phía client
nào khác; mọi actor (guest/user/admin) đều nhận cùng một quyết định khóa/mở, không phân
biệt vai trò. Đừng nhầm layer này với PERM001–PERM003
(`docs/vi/generated/permissions-matrix.md`) — 3 mã đó vẫn là toàn bộ role-gating tồn tại
trong hệ thống; gate này nằm trên một trục hoàn toàn khác. Chi tiết cơ chế, quyết định
kiến trúc, và rationale đầy đủ nằm ở § Request-Interception Layer (Prelaunch Gate) bên
dưới và [ADR-002](../../decisions/ADR-002-prelaunch-launch-timing-gate.md).

**Cập nhật (lượt Login, 2026-08-19)**: dòng mở đầu ở trên ("không có tầng backend... không
có `app/api/**/route.ts`") không còn đúng theo nghĩa tuyệt đối. `app/auth/callback/route.ts`
là route handler thật ĐẦU TIÊN của codebase này (xử lý redirect OAuth từ Google/Supabase),
và `proxy.ts` (cùng file gate ở trên — Next 16 chỉ nạp đúng MỘT proxy) nay đảm nhiệm THÊM một
việc: refresh session cookie Supabase trên mọi request. Hệ thống vẫn không có database/ORM
riêng của app (Supabase tự quản lý schema `auth.users` của nó, app không viết migration nào).
Chi tiết đầy đủ ở § Authentication Layer (Supabase + Google OAuth) bên dưới.

```mermaid
graph TB
    subgraph Browser["Browser (client)"]
        Pages["app/*/page.tsx<br/>(6 static routes)"]
        Layout["app/layout.tsx<br/>(Server Component)"]
        Providers["SessionProvider + LocaleProvider<br/>(Client Components)"]
        Home["components/home/*"]
        UILayout["components/layout/*"]
        UI["components/ui/*"]
        Lib["lib/*<br/>(pure logic + i18n dicts + mock session)"]
    end
    subgraph Storage["Browser-local storage (no server)"]
        LS["localStorage<br/>saa.mock-role / saa.mock-unread / saa.locale"]
        Env["NEXT_PUBLIC_* build-time env<br/>(.env.example)"]
    end

    Layout --> Providers
    Providers --> Pages
    Pages --> Home
    Pages --> UILayout
    UILayout --> UI
    Home --> UI
    Home --> Lib
    UILayout --> Lib
    UI --> Lib
    Providers -.->|"reconcile after mount"| LS
    Providers -.->|fallback| Env
```

Không có "API Gateway", "Services", hay "Data Layer" phía sau — bỏ hẳn 3 subgraph đó khỏi
sơ đồ gốc của template vì hệ thống này không có backend tier nào tồn tại.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.3.1 |
| UI library | React / react-dom | 19.2.8 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS (CSS-first, `@import "tailwindcss"` + `@theme inline` trong `app/globals.css`; không có `tailwind.config.ts`) | ^4 (`@tailwindcss/postcss` ^4) |
| Lint | ESLint (flat config, `eslint-config-next`) | ^9 / 16.3.1 |
| E2E test runner | Playwright (`@playwright/test`, `playwright.config.ts`) | ^1.62.1 |
| Unit test runner | Playwright (`playwright.unit.config.ts`, chạy `lib/*.test.ts`) | ^1.62.1 (dùng chung install) |
| Package manager | npm (`package-lock.json`) | — |
| Backend | none cho phần còn lại của app; **thêm 2026-08-19** — 1 route handler thật (`app/auth/callback/route.ts`) cho OAuth callback | not-applicable (ngoại trừ route handler trên) |
| Database | none do app tự định nghĩa; **thêm 2026-08-19** — Postgres nội bộ của Supabase local (`auth.users`, app không viết migration) | Supabase CLI local (Docker) |
| Auth | **thêm 2026-08-19** — Supabase Auth (GoTrue) + Google OAuth provider, qua `@supabase/supabase-js` + `@supabase/ssr` (`lib/supabase/{client,server,proxy-session,env}.ts`) | `@supabase/ssr` (xem `package.json`) |
| Cache | none | not-applicable |
| Queue | none | not-applicable |

## Data Flow

Không có request/response qua network layer nào ngoài lần Next.js phục vụ HTML/JS tĩnh đã
prerender. "Data flow" thực chất là luồng state phía client: mount → đọc localStorage/env →
reconcile → render lại UI. Sequence dưới đây thay cho client→API→service→store gốc của
template (không áp dụng được vì thiếu 3 tầng đó):

```mermaid
sequenceDiagram
    participant B as Browser
    participant L as "app/layout.tsx (Server Component, SSR)"
    participant SP as SessionProvider
    participant LP as LocaleProvider
    participant LS as localStorage

    B->>L: "Request / (or any of the 6 routes)"
    L->>SP: Render with SSR-default state "role=guest, unreadCount=0"
    SP->>LP: Render with SSR-default state "locale=vi"
    LP-->>B: HTML "matches server output" ("no hydration mismatch")
    B->>SP: "useEffect" fires after mount
    SP->>LS: Read "saa.mock-role" / "saa.mock-unread"
    LS-->>SP: Stored value or "null"
    SP->>SP: "Fallback: NEXT_PUBLIC_MOCK_ROLE/COUNT env -> hard default"
    B->>LP: "useEffect" fires after mount
    LP->>LS: Read "saa.locale"
    LS-->>LP: Stored value or "null" (default "vi")
    SP-->>B: Re-render with reconciled session (role-gated UI, e.g. admin menu link)
    LP-->>B: Re-render with reconciled locale (vi/en strings)
```

## Layering

```mermaid
graph LR
    App["app/ (routes)"] --> Comp["components/{layout,home,ui}/ (presentation)"]
    Comp --> Lib["lib/ (state + pure logic)"]
```

Chiều phụ thuộc là một chiều: `lib/` không import bất cứ gì từ `components/` (xác nhận qua
grep toàn bộ import trong `lib/*.ts(x)` — chỉ import `react` và các dictionary nội bộ của
chính `lib/i18n/`). Ranh giới component/route ngược lại đọc `lib/` thoải mái
(`useI18n`, `useSession`, `computeCountdown`, `AWARDS`/`awardHref`).

## Component composition (module graph, xác nhận qua Grep import)

```mermaid
graph TD
    Layout["app/layout.tsx (Server)"] --> SessionProvider["lib/session/session-provider.tsx"]
    Layout --> LocaleProvider["lib/i18n/locale-provider.tsx"]
    LocaleProvider --> HomePage["app/page.tsx (Server)"]

    HomePage --> SiteHeader["components/layout/site-header.tsx (Client)"]
    HomePage --> HeroKeyvisual["components/home/hero-keyvisual.tsx (Server)"]
    HomePage --> RootFurther["components/home/root-further-content.tsx (Server)"]
    HomePage --> AwardsSection["components/home/awards-section.tsx (Client)"]
    HomePage --> KudosSection["components/home/kudos-section.tsx (Client)"]
    HomePage --> QuickActionWidget["components/layout/quick-action-widget.tsx (Client)"]
    HomePage --> SiteFooter["components/layout/site-footer.tsx (Client)"]

    HeroKeyvisual --> CountdownTimer["components/home/countdown-timer.tsx (Client)"]
    HeroKeyvisual --> EventInfo["components/home/event-info.tsx (Client)"]
    HeroKeyvisual --> HeroCta["components/home/hero-cta.tsx (Client)"]
    AwardsSection --> AwardCard["components/home/award-card.tsx (Client)"]

    SiteHeader --> AccountMenu["components/ui/account-menu.tsx (Client)"]
    SiteHeader --> LanguageSwitcher["components/ui/language-switcher.tsx (Client)"]
    SiteHeader --> NotificationBell["components/ui/notification-bell.tsx (Client)"]
    QuickActionWidget --> DropdownMenu["components/ui/dropdown-menu.tsx (Client)"]
    AccountMenu --> DropdownMenu
    LanguageSwitcher --> DropdownMenu
    NotificationBell --> DropdownMenu

    CountdownTimer -.->|calls| LibCountdown["lib/countdown.ts (computeCountdown)"]
    AwardsSection -.->|reads| LibAwards["lib/awards.ts (AWARDS)"]
    AwardCard -.->|reads| LibAwards
    AccountMenu -.->|reads| SessionProvider
    NotificationBell -.->|reads| SessionProvider
```

**Đính chính so với giả định trong task brief**: không phải toàn bộ `components/` đều là
Client Component. Grep trực tiếp `'use client'` trên từng file trong `components/` (15 file
`.tsx` tổng cộng) cho thấy đúng 2 ngoại lệ giữ nguyên Server Component:
`components/home/hero-keyvisual.tsx` và `components/home/root-further-content.tsx` — cả hai
chỉ compose các component con và không gọi hook/state, nên không cần opt-in client. 13 file
`.tsx` còn lại trong `components/` đều khai `'use client'` ở dòng đầu.

Lý do chia 3 lớp `app/` → `components/` → `lib/` không chỉ để tách trình bày khỏi logic: nó
còn cho phép `lib/countdown.ts` test độc lập bằng input `now` do caller truyền vào (không gọi
`Date.now()` bên trong — xác nhận `lib/countdown.ts:35`), và trong giai đoạn build ban đầu nó
tách quyền sở hữu file — `components/**` do Track A (UI trình bày) giữ, `lib/**` do Track B
(hành vi + logic) giữ — để hai track chạy song song không đụng file nhau (xem
`clarifications.md`, mục "Ownership of components/ui/dropdown-menu.tsx").

## Cross-cutting concerns

- **Hai React Context Provider**, cả hai cùng một pattern SSR-default → `useEffect`
  reconcile (đã đọc trực tiếp source, không suy đoán):
  - `lib/session/session-provider.tsx` — mock role (`guest|user|admin`) + unread count,
    thứ tự ưu tiên `localStorage` → `NEXT_PUBLIC_MOCK_ROLE`/`NEXT_PUBLIC_MOCK_UNREAD_COUNT`
    → default cứng (`resolveSession()`, dòng 43-58). File có cảnh báo bảo mật ngay trong
    comment (dòng 3-10): đây **không** phải ranh giới auth, chỉ gate UI, không có kiểm tra
    phía server.
  - `lib/i18n/locale-provider.tsx` — locale `vi|en`, thứ tự ưu tiên `localStorage` →
    default `vi` (`resolvePersistedLocale()`, dòng 29-32). Comment (dòng 3-5) ghi rõ chọn
    hand-rolled thay vì thêm dependency `next-intl` (YAGNI, deferred tới khi có locale thứ 3).
  - **Ranh giới trách nhiệm**: `SessionProvider` không biết gì về ngôn ngữ; `LocaleProvider`
    không biết gì về role — component tiêu thụ qua hai hook riêng (`useSession()` tại
    `lib/session/session-provider.tsx:79-81`, `useI18n()` tại
    `lib/i18n/locale-provider.tsx:77-79`), không đọc context trực tiếp.
  - Lý do đầy đủ hai quyết định này (vì sao mock session, vì sao hand-rolled i18n, điều kiện
    nâng cấp) → [ADR-001](../../decisions/ADR-001-mock-session-and-hand-rolled-i18n.md).
  - **Cập nhật (lượt Login, 2026-08-19) — hai ranh giới "trạng thái người dùng" tồn tại song
    song, KHÔNG hợp nhất ở lượt này**: `SessionProvider` ở trên vẫn y nguyên — mock, đọc
    `localStorage`, vẫn KHÔNG phải security boundary. Đứng cạnh nó, giờ có một phiên
    Supabase THẬT (cookie do `@supabase/ssr` quản lý, xác thực qua Google) — không ai giả
    mạo được từ DevTools như mock role. Hai cái **không đọc lẫn nhau**: `role` hiển thị UI
    (account menu, notification bell, mục Admin Dashboard) vẫn hoàn toàn do mock session
    quyết định; phiên Supabase chỉ quyết định đúng một việc — có được xem `/login` hay bị
    đưa về `/` (xem § Authentication Layer bên dưới, và
    [permissions.md](permissions.md) đã cập nhật). Đừng đọc nhầm: sự tồn tại của phiên
    Supabase KHÔNG có nghĩa là các route khác (`/`, `/awards`, `/kudos`, `/profile`,
    `/admin`) đã được bảo vệ — chúng vẫn y nguyên như mô tả ở trên, không kiểm tra session
    nào. Việc hợp nhất hai ranh giới này (dùng phiên Supabase để xác định `role` thật, bảo
    vệ route khác) nằm ngoài phạm vi lượt này.
- **Testing kép trên cùng một Playwright install**:
  - `playwright.config.ts` (E2E) — 2 project, 2 `webServer` tách biệt cổng 3000/3100, mỗi
    server set một giá trị `NEXT_PUBLIC_EVENT_START_AT` khác nhau (một hợp lệ, một
    `'not-a-date'`) để bài test `homepage-invalid-env.spec.ts` có môi trường build riêng —
    không tái dùng dev server đang chạy sẵn (`reuseExistingServer: false` cả hai, dòng
    31/38-39 — comment trong file giải thích lý do: tránh race điều kiện làm bài test
    countdown "xanh giả"). Hai server chạy hai lệnh khác nhau, không đối xứng: cổng 3000
    dùng `next dev` (vòng lặp RED→GREEN nhanh), cổng 3100 dùng `next build && next start`
    (bản production thật cho case invalid-env, tránh HMR can thiệp vào giá trị env đã đóng
    băng).
  - `playwright.unit.config.ts` — chạy như một unit runner thuần (`testDir: './lib'`,
    match `*.test.ts`), không mở `webServer`, dùng cho `lib/awards.test.ts` và
    `lib/countdown.test.ts`.

## Request-Interception Layer (Prelaunch Gate)

`proxy.ts` ở project root chạy trước mọi route, kể cả `/`. Nó không thêm state mới, không
thêm bảng CSDL mới — chỉ đọc lại `NEXT_PUBLIC_EVENT_START_AT` (biến đã có sẵn cho đếm
ngược trang chủ) qua cùng hàm thuần `computeCountdown` (`lib/countdown.ts`), gói trong
`resolveGateRedirect()` (`lib/prelaunch/gate.ts`) để quyết định redirect. Vì `proxy.ts`
chạy trên runtime server của Next.js (không có `localStorage`, không có DOM), quyết định
này KHÔNG đọc `saa.mock-role`/`saa.locale` hay bất kỳ state phía client nào.

```mermaid
graph TB
    Browser["Browser — request tới bất kỳ route nào"] --> Proxy["proxy.ts<br/>(chạy trước mọi route)"]
    Proxy -->|"gate khóa AND route != /prelaunch"| ToPrelaunch["redirect -> /prelaunch"]
    Proxy -->|"gate mở AND route == /prelaunch"| ToHome["redirect -> /"]
    Proxy -->|"khác"| PassThrough["pass-through, không đổi"]
```

**Quy tắc rẽ nhánh** (`resolveGateRedirect`, `lib/prelaunch/gate.ts:26-44`):
- Khóa (`!isExpired`) và route khác `/prelaunch` → redirect `/prelaunch`.
- Khóa và đã ở `/prelaunch` → `null` (không tự redirect vào chính nó, tránh vòng lặp).
- Mở (`isExpired`) và đang ở `/prelaunch` → redirect `/`.
- `isInvalid` (biến env thiếu/sai định dạng) → luôn `null`, bất kể pathname — **fail-open**:
  một lỗi cấu hình không bao giờ khóa cứng toàn site. Lý do chọn hướng này thay vì
  fail-closed nằm ở [ADR-002](../../decisions/ADR-002-prelaunch-launch-timing-gate.md).

**Matcher loại trừ** (`export const config.matcher` trong `proxy.ts`):
`'/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'` — loại mọi path chứa dấu chấm
sau dấu `/` đầu tiên (không chỉ 3 alternative liệt kê tên trong biểu thức), nên bảo vệ
được `/saa/Prelaunch_BG.png`, `/fonts/digital-numbers.woff2`, và bất kỳ static asset có
phần mở rộng nào khác — thiếu bước loại trừ này, `/prelaunch` sẽ tự redirect ảnh
nền/font/CSS của chính nó vào chính nó và render trần trụi.

**Nửa còn lại — client-side unlock**: `proxy.ts` chỉ chặn ở request MỚI. Một actor đang
mở sẵn `/prelaunch` đúng lúc đếm ngược chạm 0 sẽ không tự nhận request mới nào để proxy
can thiệp — nếu chỉ có nửa server, actor đó bị "kẹt" ở `00 00 00` cho tới khi tự tải lại.
`lib/prelaunch/use-prelaunch-countdown.ts` bù lại bằng cách tick mỗi 1 giây và gọi
`router.replace('/')` ngay khi client thấy `isExpired`/`isInvalid`, có throttle qua
`sessionStorage` (tối đa 1 lần mỗi 30 giây) để tránh vòng lặp nhấp nháy khi đồng hồ
client/server lệch nhau. Rationale đầy đủ và giới hạn đã biết của cơ chế throttle này nằm
ở [ADR-002](../../decisions/ADR-002-prelaunch-launch-timing-gate.md).

## Authentication Layer (Supabase + Google OAuth) — thêm 2026-08-19

Lần đầu tiên hệ thống có một ranh giới xác thực THẬT, cho đúng một mục đích: màn `/login`.
4 module `lib/supabase/{client,server,proxy-session,env}.ts` đều dùng factory của
`@supabase/ssr` (không phải `@supabase/auth-helpers-nextjs` đã deprecated) với adapter cookie
`getAll`/`setAll` — `cookies()` từ `next/headers` là async trong Next 16 nên phải `await`
trước khi đưa vào adapter.

```mermaid
sequenceDiagram
    participant B as Browser
    participant LC as "login-client.tsx (Client)"
    participant SC as "lib/supabase/client.ts"
    participant G as Google OAuth consent
    participant CB as "app/auth/callback/route.ts"
    participant SS as "lib/supabase/server.ts"
    participant P as "proxy.ts (mọi request khác)"

    B->>LC: Click nút đăng nhập
    LC->>SC: signInWithOAuth({provider:'google'})
    SC-->>B: Redirect cùng-tab tới Google
    B->>G: Consent screen
    G-->>CB: Redirect kèm ?code= (hoặc ?error_description= nếu huỷ)
    CB->>CB: Kiểm tra error_description TRƯỚC code (R4)
    CB->>SS: exchangeCodeForSession(code) — try/catch (auth-js#782)
    SS-->>CB: session + Set-Cookie
    CB-->>B: Redirect getSiteUrl()+"/" (thành công) hoặc .../login?error=... (thất bại)
    B->>P: Request tiếp theo tới route bất kỳ
    P->>P: updateSupabaseSession() refresh cookie TRƯỚC KHI resolveGateRedirect()
```

**3 quyết định đáng ghi lại nhất của lớp này:**

1. **`getUser()`, không bao giờ `getSession()`, ở phía server** (`app/login/page.tsx`,
   `lib/supabase/proxy-session.ts`) — cookie là input không đáng tin trên server; `getUser()`
   round-trip thật tới Supabase Auth, `getSession()` chỉ đọc cookie tại chỗ mà không xác
   minh lại.
2. **Redirect của `app/auth/callback/route.ts` luôn dựng từ `getSiteUrl()`
   (`lib/supabase/env.ts`), KHÔNG BAO GIỜ từ `request.nextUrl.origin`** — phát hiện từ
   security review (mức High): route này không xác thực và internet-reachable; `nextUrl.origin`
   suy ra từ header `Host`/`X-Forwarded-Host` do client gửi, nên phía sau hạ tầng không pin
   `Host`, một header giả mạo có thể biến route thành open-redirect tới origin của kẻ tấn
   công. `getSiteUrl()` là config tĩnh (`NEXT_PUBLIC_SITE_URL`, mặc định
   `http://localhost:3000`), không bao giờ suy ra từ request.
3. **`proxy.ts` — rủi ro cao nhất của lượt này**: `@supabase/ssr` ghi cookie refresh lên
   object response nó được giao qua `setAll`. Next 16 chỉ nạp đúng MỘT `proxy.ts`, nên gate
   đếm-ngược (BL001, xem § Request-Interception Layer ở trên) và việc refresh session
   Supabase bắt buộc sống chung một file. Nếu gate sau đó trả về một `NextResponse.redirect`
   KHÁC với response đã có cookie refresh, cookie đó biến mất — actor bị đăng xuất âm thầm
   trên mọi request có gate can thiệp. Cách xử lý: `updateSupabaseSession()`
   (`lib/supabase/proxy-session.ts`) trả về cả `response` LẪN danh sách `supabaseCookies` nó
   đã ghi; `proxy.ts` copy thủ công từng cookie đó lên bất kỳ response nào cuối cùng thật sự
   được gửi đi (pass-through hoặc redirect của gate) — xem `proxy.ts` dòng 38-41.

**Exemption của gate đếm-ngược**: `/login` và `/auth/callback` được thêm vào
`ALWAYS_ALLOWED` của `lib/prelaunch/gate.ts`, miễn trừ theo CẢ HAI chiều (khóa và mở) — khác
với `/prelaunch` chỉ miễn trừ một chiều. Đây vẫn là quyết định launch-timing (cùng trục với
`/prelaunch`), KHÔNG phải nới lỏng authorization.

**Chưa xác minh bằng round-trip thật**: chưa có Google OAuth client ID/secret thật được cấp
(`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID/SECRET` trong `.env.example` là placeholder) — stack
local (`supabase start`) khởi động và redirect `authorize` bắn ra bình thường, nhưng vòng
quay lại từ Google chưa được exercise với tài khoản thật. Xem § Local Supabase Development
Setup ngay dưới đây để cấu hình khi có credentials.

### Local Supabase Development Setup

Yêu cầu Docker chạy được (`colima start` trên máy không có Docker Desktop), sau đó:

```bash
supabase start   # đọc supabase/config.toml, in ra API URL + anon/publishable key thật
```

| Việc | Chi tiết |
|---|---|
| **Port đã dịch +100** | API `54421` (không phải mặc định `54321`), DB `54422`, Studio `54423`, Inbucket `54424` — một project Supabase local khác (`meeting-translation`) đã chiếm dải `54321-54324` trên máy dev này (`supabase/config.toml` dòng 10-12, R6). Copy đúng port `supabase start` in ra, đừng dùng mặc định CLI. |
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — lấy từ output `supabase start`, KHÔNG phải giá trị placeholder trong `.env.example`. |
| Root `.env` (không phải `.env.local`) | `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` + `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` — Supabase CLI đọc file `.env` ở root qua cú pháp `env(...)` trong `supabase/config.toml`, không đọc `.env.local` của Next.js. Cả hai file đã trong `.gitignore`. |
| Google Cloud Console — Authorized redirect URI | `http://127.0.0.1:54421/auth/v1/callback` — trỏ vào **Supabase local** (GoTrue), KHÔNG PHẢI `app/auth/callback` của Next.js. Next.js chỉ nhận redirect từ Supabase sau khi Supabase đã tự xử lý xong với Google. |
| E2E fixture user | `supabase/seed.sql` seed sẵn `e2e-login@example.com` (idempotent, an toàn khi `supabase db reset`) — chỉ hợp lệ với Postgres local này. |

## Configuration

| Biến | Nguồn | Vì sao `NEXT_PUBLIC_` |
|---|---|---|
| `NEXT_PUBLIC_EVENT_START_AT` | `.env.example` — ISO-8601, mặc định `2026-12-19T18:30:00+07:00` (~90 ngày, để dev thấy "Coming soon" với DAYS/HOURS/MINUTES khác 0) | Countdown chạy trên client (`setInterval`/`useEffect` trong `components/home/countdown-timer.tsx`), cần đọc giá trị này trong browser mỗi giây — bắt buộc prefix `NEXT_PUBLIC_` để Next inline lúc build |
| `NEXT_PUBLIC_MOCK_ROLE` | `.env.example`, mặc định `guest` — chỉ dùng khi `localStorage` (`saa.mock-role`) chưa có giá trị | Fallback seed cho `SessionProvider`, không phải security boundary |
| `NEXT_PUBLIC_MOCK_UNREAD_COUNT` | `.env.example`, mặc định `0` — cùng cơ chế fallback | Fallback seed số thông báo chưa đọc |
| `NEXT_PUBLIC_SUPABASE_URL` | **Thêm 2026-08-19** — output thật của `supabase start`, mặc định placeholder `http://127.0.0.1:54321` (chưa dịch port, xem cảnh báo port +100 ở trên) | Supabase browser/server client cần biết endpoint để gọi `/auth/v1/*` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Thêm 2026-08-19** — output thật của `supabase start` | Key công khai cho browser client (`lib/supabase/client.ts`) |
| `NEXT_PUBLIC_SITE_URL` | **Thêm 2026-08-19** — mặc định `http://localhost:3000` nếu unset | Origin tin cậy mà `getSiteUrl()` dùng để dựng MỌI redirect trong `app/auth/callback/route.ts` — phải khớp `site_url`/`additional_redirect_urls` trong `supabase/config.toml` (Supabase so khớp exact string) |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `_CLIENT_SECRET` | **Thêm 2026-08-19** — người dùng cung cấp, đặt trong `.env` ở root (không phải `.env.local`) | `supabase/config.toml` đọc qua cú pháp `env(...)` để bật provider Google; secret không có prefix `NEXT_PUBLIC_`, không commit |

Giá trị `NEXT_PUBLIC_*` đóng băng lúc `next build`/lúc server process khởi động, không đổi
được giữa chừng — lý do bộ E2E cần 2 `webServer` trên 2 port thay vì 1 server đổi env giữa
các test (xem mục Testing ở trên).

`targetIso` không parse được (rỗng hoặc sai định dạng) không được crash: `computeCountdown`
(`lib/countdown.ts:35-43`) bắt lỗi bằng `Date.parse` + `Number.isNaN` và trả về trạng thái
zero (`isInvalid: true`, `00d 00h 00m`) — cùng hình dạng dữ liệu với trạng thái "sự kiện đã
bắt đầu" (`isExpired: true`), UI không phân biệt hai case này (giữ component đơn giản).

## Routing

| Route | File | Nội dung |
|---|---|---|
| `/` | `app/page.tsx` | Trang chủ Homepage SAA đầy đủ (Header, Hero+Countdown, Awards, Kudos, Widget, Footer) |
| `/awards` | `app/awards/page.tsx` (19 dòng) | Placeholder có chủ đích — render 6 `<section id={slug}>` theo `AWARDS` (`lib/awards.ts`) làm đích hash-anchor thật; không có nội dung Awards Information đầy đủ |
| `/kudos` | `app/kudos/page.tsx` (10 dòng) | Placeholder có chủ đích — chỉ tiêu đề, chưa có nội dung Sun* Kudos |
| `/profile` | `app/profile/page.tsx` (16 dòng) | Placeholder — đích của mục "Profile" trong account menu, tồn tại để không 404 (TC ID-59) |
| `/admin` | `app/admin/page.tsx` (16 dòng) | Placeholder — đích của mục "Admin Dashboard"; comment dòng 1-4 nói rõ trang KHÔNG có access control (xem `permissions.md`) |
| `/prelaunch` | `app/prelaunch/page.tsx` | Màn đếm ngược full-viewport (DAYS/HOURS/MINUTES, tick 1s) — chặn mọi route khác cho tới khi `NEXT_PUBLIC_EVENT_START_AT` tới/qua hạn (xem § Request-Interception Layer ở trên) |
| `/login` | `app/login/page.tsx` | **Thêm 2026-08-19** — Server Component; `getUser()` guard redirect `/` nếu đã có phiên hợp lệ; render `LoginClient` (click → loading → `signInWithOAuth`) nếu chưa. Miễn trừ gate đếm-ngược cả 2 chiều (xem § Authentication Layer). |
| `/auth/callback` | `app/auth/callback/route.ts` | **Thêm 2026-08-19** — Route handler THẬT đầu tiên của app (`GET`). Đổi `code` OAuth lấy session, redirect `/` hoặc `/login?error=...`. Xem § Authentication Layer. |

5 route cũ (`/`, `/awards`, `/kudos`, `/profile`, `/admin`) không đổi file nguồn — chỉ đổi
điều kiện khi nào chúng được phép render, qua `proxy.ts` ở trên.

Hash-anchor scroll (`/awards#top-talent` từ card/CTA/nav) hoạt động nhờ
`data-scroll-behavior="smooth"` trên thẻ `<html>` (`app/layout.tsx:33`) — Next 16 bỏ việc tự
động ép `scroll-behavior: smooth` khi chuyển trang SPA so với 15; thiếu attribute này thì
`Link` vẫn nhảy đúng section nhưng không smooth.

## Asset Strategy

Ảnh MoMorph (hero keyvisual, ROOT/FURTHER logo, 6 thumbnail award, icon) phục vụ qua
`next/image` từ `public/`, tham chiếu bằng root-relative path (vd `/saa/Keyvisual_BG.png`,
`/images/awards/*.png` — `lib/awards.ts:30` v.v.). Prop `priority` (Next 15) đã deprecated
trong Next 16 — 2 ảnh LCP của hero dùng `preload` thay thế, xác nhận
`components/home/hero-keyvisual.tsx:23,35`. `next.config.ts` không khai báo
`images.qualities` hay `images.localPatterns` — không ảnh nào trong build này cần quality
khác mặc định (`75`) hay query-string cache-busting, nên không cần cấu hình thêm.

## Unresolved / out of scope for this artifact

- `app/_not-found` không có file tùy biến trong cây nguồn — đây là route auto-generate của
  Next.js App Router, không phải file thiếu; không vẽ riêng trong sơ đồ vì không có source
  file tương ứng. Cờ này đã có trong `scout-report.md` § Unresolved Questions, để nguyên
  cho pha tổng hợp feature/screen quyết định có cần một dòng ghi chú riêng hay không.
- Không xác minh runtime thực tế (không chạy `next dev`/Playwright trong tác vụ này) — toàn
  bộ sơ đồ dựa trên đọc source tĩnh (`grep`/`Read`), phù hợp phạm vi Wave 1 (architecture
  synthesis), không phải một lần kiểm thử hành vi.
- **Thêm 2026-08-19**: vòng quay Google OAuth thật (Google Console → Supabase → Next.js)
  chưa được exercise với credentials thật — xem § Authentication Layer, "Chưa xác minh bằng
  round-trip thật". Bảo vệ các route còn lại (`/`, `/awards`, `/kudos`, `/profile`, `/admin`)
  bằng phiên Supabase, và thay `lib/session/session-provider.tsx` bằng session thật, đều nằm
  ngoài phạm vi lượt này.
