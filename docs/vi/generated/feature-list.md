# Feature List

**Project**: Sun* Annual Awards 2025 (SAA 2025) — Homepage sự kiện
**Generated**: 2026-08-18
**Analysis Scope**: 19 user stories (`user-stories.md` US001–US019), 6 màn hình (`screen-list.md` SCR001–SCR006), 7 route frontend (`route-list.md` ROUTE001–ROUTE007, ROUTE006 `/_not-found` loại khỏi mapping vì không có source file), 3 permission (`permissions-matrix.md` PERM001–PERM003), 1 data model (`data-model.md` MODEL001), 1 background logic (`behavior-logic.md` BL001).

**Cập nhật 2026-08-19**: thêm `F010_PrelaunchCountdownGate` — gate đếm-ngược-trước-khi-mở-site
(`/prelaunch`, `proxy.ts`). Xem chi tiết đầy đủ ở
`docs/vi/features/countdown-prelaunch/technical-spec.md`.

**Cập nhật (lượt Login, 2026-08-19)**: thêm `F011_GoogleOAuthLogin` — đăng nhập Google qua
Supabase Auth local (`/login`, `app/auth/callback/route.ts`). Feature-spec đầy đủ
(`docs/vi/features/login-supabase-auth/`) CHƯA được sinh trong lượt này — chỉ inventory
(route/screen/US/BL/PERM) được đối chiếu ngược ở đây; xem ghi chú cuối tài liệu.

**Code Format**: All codes MUST follow `F###_NameSlug` format (e.g., F001_Auth, F002_UserProfile)
**Screen Code Format**: All screen codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm)
**User Story Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login)
**Background Logic Code Format**: All BL codes MUST follow `BL###_NameSlug` format (e.g., BL001_ScheduledReport)
**Permission Code Format**: All PERM codes MUST follow `PERM###_NameSlug` format (e.g., PERM001_ViewReports)

**Feature Types**:
- `ui` - Feature has UI screens (SCR###)
- `background` - Feature only has background logic (BL###, no SCR###)
- `mixed` - Feature has both UI screens and background logic

**Related Screens column format**: Accepts `SCR###`, `SCR###/REG###`, or mixed comma-separated. Không có REG### nào trong hệ thống này — cả 5 SCR đều atomic (`screen-list.md`).

**Ghi chú phạm vi (đọc trước bảng)**: Đây là trang sự kiện tĩnh, không có backend, không persistence phía server, không có authorization thật (`role` chỉ là mock phía client gating hiển thị UI — xem `permissions-matrix.md`). Cả 9 feature dưới đây đều type `ui`; không feature nào type `background`/`mixed` vì `behavior-logic.md` có 0 BL item. Không feature nào được dựng lên để lấp đầy con số ước tính — 9 feature phản ánh đúng 16 US thật đã liệt kê, không hơn không kém.

## Feature Hierarchy

**Note**: Features are sorted by priority from highest to lowest (P0 → P1 → P2 → P3). Priority levels:
- **P0**: Core functionality, blocking issues, or essential features
- **P1**: High priority, significant features
- **P2**: Medium priority, standard features
- **P3**: Low priority, nice-to-have features

| Code | Name | Type | Language | Workspace | Priority |
|------|------|------|----------|-----------|----------|
| F001_EventOverview | Event Overview | ui | TypeScript/TSX | my-app | P0 |
| F002_EventCountdown | Event Countdown | ui | TypeScript/TSX | my-app | P0 |
| F003_AwardDiscovery | Award Discovery | ui | TypeScript/TSX | my-app | P0 |
| F004_KudosPromotion | Kudos Promotion | ui | TypeScript/TSX | my-app | P1 |
| F005_LanguageSwitching | Language Switching | ui | TypeScript/TSX | my-app | P1 |
| F006_QuickActionWidget | Quick Action Widget | ui | TypeScript/TSX | my-app | P1 |
| F007_AccountMenuAccess | Account Menu Access | ui | TypeScript/TSX | my-app | P2 |
| F008_NotificationPanelAccess | Notification Panel Access | ui | TypeScript/TSX | my-app | P2 |
| F009_ReturnToHomeTop | Return To Home Top | ui | TypeScript/TSX | my-app | P3 |
| F010_PrelaunchCountdownGate | Prelaunch Countdown Gate | ui | TypeScript/TSX | my-app | P0 |
| F011_GoogleOAuthLogin | Google OAuth Login | ui | TypeScript/TSX | my-app | P0 |
| F012_AwardSystemPage | Award System Page | ui | TypeScript/TSX | my-app | P1 |
| F013_KudosLiveBoard | Kudos Live Board | ui | TypeScript/TSX | my-app | P1 |
| F014_SendKudosWishes | Send Kudos Wishes | ui | TypeScript/TSX | my-app | P1 |
| F015_LikeKudos | Like Kudos (thả tim) | mixed | TypeScript/TSX + SQL | my-app | P1 |

## Feature Details

### F001_EventOverview: Event Overview

**Type**: ui
**Description**: Giới thiệu sự kiện SAA 2025 ngay khi vào trang chủ — khối hero (keyvisual full-bleed + tiêu đề "ROOT FURTHER" + thông tin sự kiện tĩnh) và khối copy dài "Root Further" (2 đoạn văn + trích dẫn). Cả hai đều là nội dung tĩnh, không có state/logic tương tác, hiển thị cho mọi actor không phân biệt role. Gộp chung vì cùng một intent: cho khách truy cập hiểu "sự kiện này là gì" trước khi họ đi sâu vào Awards/Kudos.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 3

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US001_ViewHeroSection: View Hero Section
- US003_ReadRootFurtherContent: Read Root Further Content

**Related APIs/Routes**:
- (page) / — ROUTE001

**Related Data Models**:
- Không có — nội dung tĩnh (dictionary i18n + copy hard-code), không phải entity nghiệp vụ

**Related Background Logic**:
- Không có — hệ thống không có background logic (`behavior-logic.md`: 0 item)

**Related Permissions**:
- Không có — hiển thị cho mọi actor, không gating theo role

---

### F002_EventCountdown: Event Countdown

**Type**: ui
**Description**: Đếm ngược tới thời điểm bắt đầu sự kiện (`NEXT_PUBLIC_EVENT_START_AT`), cập nhật mỗi 60 giây, với 3 trạng thái hiển thị rõ ràng: coming-soon/normal, expired, và invalid-config (khi biến env thiếu/không parse được). Toàn bộ là hàm thuần phía client (`computeCountdown`), không network. Tách riêng khỏi F001 vì đây là khối duy nhất trên trang có logic/trạng thái thật (không phải nội dung tĩnh).

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 1

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US002_ViewEventCountdown: View Event Countdown

**Related APIs/Routes**:
- (page) / — ROUTE001

**Related Data Models**:
- Không có — `CountdownResult` là computed value object (pure-function output), không phải MODEL### entity (xem `data-model.md` § Non-Entity Data Shapes)

**Related Background Logic**:
- Không có — `setInterval` tick UI phía client, không phải scheduled-job thật (đã xét và loại trong `behavior-logic.md` § Near-miss)

**Related Permissions**:
- Không có — hiển thị cho mọi actor

---

### F003_AwardDiscovery: Award Discovery

**Type**: ui
**Description**: Duyệt danh sách 6 hạng mục giải thưởng ngay trên trang chủ (badge + wordmark + title/description, grid responsive 3/2 cột) và điều hướng sang trang Awards (`/awards`) để xem chi tiết từng hạng mục qua anchor `#<slug>`. Gộp US004 (browse list), US006 (view detail — navigate to anchor), US007 (navigate to Awards overview) thành một feature vì cùng một luồng liền mạch: xem danh sách → click vào một mục → tới đúng khối chi tiết, hoặc đi thẳng tới trang tổng quan qua 4 điểm vào (header/footer nav, hero CTA, quick-action widget mục "Về SAA"). Đây là nội dung cốt lõi của site (chính "Awards" trong tên sự kiện).

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 3

**Related Screens**:
- SCR001_Home: Home
- SCR002_Awards: Awards

**Related User Stories**:
- US004_BrowseAwardCategories: Browse Award Categories
- US006_ViewAwardCategoryDetail: View Award Category Detail
- US007_NavigateToAwardsPage: Navigate To Awards Page

**Related APIs/Routes**:
- (page) / — ROUTE001
- (page) /awards — ROUTE002

**Related Data Models**:
- MODEL001_Award

**Related Background Logic**:
- Không có

**Related Permissions**:
- Không có — hiển thị và điều hướng cho mọi actor, không gating theo role

---

### F004_KudosPromotion: Kudos Promotion

**Type**: ui
**Description**: Giới thiệu hoạt động mới "Sun* Kudos" bằng copy quảng bá trên trang chủ, và điều hướng sang trang Kudos (`/kudos`, bare stub `<h1>Sun* Kudos</h1>`) qua 5 điểm vào (header/footer nav, hero CTA, KudosSection "Chi tiết", quick-action widget mục "Viết Kudos"). Gộp US005 (đọc promo) + US008 (điều hướng) vì cùng một intent: làm khách truy cập biết và tò mò về Kudos. Ưu tiên thấp hơn F003 vì đích đến (`/kudos`) hiện là placeholder chưa có nội dung thật.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 1

**Related Screens**:
- SCR001_Home: Home
- SCR003_Kudos: Kudos

**Related User Stories**:
- US005_ReadKudosPromotion: Read Kudos Promotion
- US008_NavigateToKudosPage: Navigate To Kudos Page

**Related APIs/Routes**:
- (page) / — ROUTE001
- (page) /kudos — ROUTE003

**Related Data Models**:
- Không có — copy tĩnh hard-code, không qua model nào

**Related Background Logic**:
- Không có

**Related Permissions**:
- Không có — hiển thị và điều hướng cho mọi actor

---

### F005_LanguageSwitching: Language Switching

**Type**: ui
**Description**: Đổi ngôn ngữ hiển thị toàn trang giữa Tiếng Việt và English qua dropdown `LanguageSwitcher`, lựa chọn ghi vào `localStorage` (`saa.locale`) và tồn tại qua lần tải trang sau. Đây là năng lực i18n duy nhất của site, độc lập với mọi feature nội dung khác (mỗi feature khác chỉ *tiêu thụ* locale hiện tại, không sở hữu cơ chế đổi locale).

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 2

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US010_SwitchInterfaceLanguage: Switch Interface Language

**Related APIs/Routes**:
- (page) / — ROUTE001

**Related Data Models**:
- Không có — `I18nState`/`Locale` là client-side state (DISC-002), không phải MODEL### entity (xem `data-model.md` § Non-Entity Data Shapes)

**Related Background Logic**:
- Không có

**Related Permissions**:
- Không có — khả dụng cho mọi actor, không gating theo role

---

### F006_QuickActionWidget: Quick Action Widget

**Type**: ui
**Description**: Nút nổi cố định (fixed, luôn hiển thị khi cuộn, ngoài luồng `<main>`) mở dropdown 2 mục "Viết Kudos"/"Về SAA" để nhảy nhanh tới Kudos/Awards từ bất kỳ đâu trên trang. Feature này chỉ sở hữu hành vi mở/đóng widget của chính nó — đích đến điều hướng thực tế thuộc F003/F004 (cùng đích với nav header/footer/hero CTA), tránh trùng lặp phạm vi (DRY) giữa các feature điều hướng.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 2

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US011_OpenQuickActionWidget: Open Quick Action Widget

**Related APIs/Routes**:
- (page) / — ROUTE001

**Related Data Models**:
- Không có

**Related Background Logic**:
- Không có

**Related Permissions**:
- Không có — widget hiển thị cho mọi actor, không phụ thuộc role

---

### F007_AccountMenuAccess: Account Menu Access

**Type**: ui
**Description**: Menu tài khoản trên header — ẩn hoàn toàn khi `role === 'guest'` (PERM001); `user` thấy "Profile" + "Sign out"; `admin` thấy thêm "Admin Dashboard" (PERM002). Gộp US013 (mở menu), US014 (điều hướng Profile), US015 (click Sign out — không có logic đăng xuất thật), US016 (điều hướng Admin Dashboard) thành một feature vì cùng một component (`AccountMenu`) và cùng một intent: truy cập các hành động liên quan tài khoản, được gating theo role mock phía client. **Cảnh báo ghi nhận từ nguồn**: `/admin` không có route guard thật — ẩn/hiện chỉ là ẩn MỤC MENU, ai gõ thẳng URL cũng vào được (PERM002).

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 2

**Related Screens**:
- SCR001_Home: Home
- SCR004_Profile: Profile
- SCR005_AdminDashboard: AdminDashboard

**Related User Stories**:
- US013_OpenAccountMenu: Open Account Menu
- US014_NavigateToProfilePage: Navigate To Profile Page
- US015_ClickSignOutButton: Click Sign Out Button
- US016_NavigateToAdminDashboard: Navigate To Admin Dashboard

**Related APIs/Routes**:
- (page) / — ROUTE001
- (page) /profile — ROUTE004
- (page) /admin — ROUTE005

**Related Data Models**:
- Không có — `role` thuộc `SessionState` (DISC-001), client-side mock, không phải MODEL### entity

**Related Background Logic**:
- Không có

**Related Permissions**:
- PERM001_AccountMenuVisibility: Account Menu Visibility
- PERM002_AdminDashboardLinkVisibility: Admin Dashboard Link Visibility

---

### F008_NotificationPanelAccess: Notification Panel Access

**Type**: ui
**Description**: Chuông thông báo trên header — ẩn hoàn toàn khi `role === 'guest'` (PERM003); `user`/`admin` mở được panel, nhưng panel luôn hiện cùng một empty-state cố định (chưa có nguồn dữ liệu thông báo thật). Badge số chỉ hiện khi `unreadCount > 0` (điều kiện hiển thị dữ liệu, không phải permission riêng). Tách riêng khỏi F007 dù cùng là "role-gated header control" vì đây là mối quan tâm khác — thông báo, không phải hành động tài khoản — gộp chung sẽ vi phạm single-intent.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 2

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US012_OpenNotificationPanel: Open Notification Panel

**Related APIs/Routes**:
- (page) / — ROUTE001

**Related Data Models**:
- Không có — `unreadCount` thuộc `SessionState`, client-side mock, không phải MODEL### entity

**Related Background Logic**:
- Không có — panel là empty-state tĩnh, không có nguồn phát notification thật (`behavior-logic.md`: 0 item type `notification`)

**Related Permissions**:
- PERM003_NotificationBellVisibility: Notification Bell Visibility

---

### F009_ReturnToHomeTop: Return To Home Top

**Type**: ui
**Description**: Click logo (header/footer) hoặc nav "About"/"About SAA 2025" (header/footer) cuộn về đầu trang (`window.scrollTo({top:0})`) và link `href="/"` — 4 điểm vào cùng một hành vi, cùng một đích (đang đứng tại `/`). Ưu tiên thấp nhất vì đây là tiện ích điều hướng phụ trợ (nice-to-have), không phải nội dung hay luồng chính của trang.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 2

**Related Screens**:
- SCR001_Home: Home

**Related User Stories**:
- US009_ReturnToHomeTop: Return To Home Top

**Related APIs/Routes**:
- (page) / — ROUTE001

**Related Data Models**:
- Không có

**Related Background Logic**:
- Không có

**Related Permissions**:
- Không có — hiển thị và khả dụng cho mọi actor

### F010_PrelaunchCountdownGate: Prelaunch Countdown Gate

**Type**: ui
**Description**: Gate đếm-ngược-trước-khi-mở-site cho SAA 2025 — route mới `/prelaunch`
(full-viewport, nền ảnh sự kiện + đếm ngược DAYS/HOURS/MINUTES tick 1 giây) cộng một
request-interception layer mới (`proxy.ts`) chặn 5 route hiện có (`/`, `/awards`,
`/kudos`, `/profile`, `/admin`) và đưa về `/prelaunch` cho tới khi
`NEXT_PUBLIC_EVENT_START_AT` tới/qua hạn; khi đó chiều ngược lại mở khóa và `/prelaunch`
tự đưa actor về `/`. Áp dụng cho mọi actor không phân biệt — đây là gate theo THỜI GIAN,
không phải theo quyền, và không đọc `role`/`SessionState` của F007/F008. Chi tiết đầy đủ:
`docs/vi/features/countdown-prelaunch/technical-spec.md`.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 4

**Related Screens**:
- SCR006_Prelaunch: Prelaunch

**Related User Stories**:
- US017_XemManHinhDemNguoc: Xem màn hình đếm ngược khi trang bị khóa
- US018_ChanDieuHuongKhiConDemNguoc: Bị chặn điều hướng trong lúc đếm ngược còn > 0
- US019_TuDongMoKhoaKhiVeMoc: Tự động mở khóa và điều hướng khi đếm ngược về 0

**Related APIs/Routes**:
- (page) /prelaunch — ROUTE007
- 5 route hiện có (ROUTE001–ROUTE005) — hành vi truy cập bị gate này chi phối, file không đổi

**Related Data Models**:
- Không có — `CountdownResult`/`NavigationGateState` là computed/derived value, không phải
  MODEL### entity (tái dùng `lib/countdown.ts`, xem `technical-spec.md` § Key Entities)

**Related Background Logic**:
- BL001_PrelaunchLaunchGate (`behavior-logic.md`) — request-interception layer, type
  `middleware`

**Related Permissions**:
- Không có — công khai cho mọi actor, gate theo thời gian không phải theo quyền (xem
  `permissions-matrix.md`)

---

### F011_GoogleOAuthLogin: Google OAuth Login — thêm 2026-08-19

**Type**: ui
**Description**: Đăng nhập bằng tài khoản Google qua Supabase Auth (GoTrue) local — màn
`/login` (`app/login/page.tsx`) + route handler `/auth/callback`
(`app/auth/callback/route.ts`). Actor bấm nút → chuyển cùng-tab tới Google consent →
Google redirect về Supabase → Supabase redirect về `/auth/callback` kèm `code` → đổi lấy
session → về `/`. Đây là ranh giới xác thực THẬT đầu tiên của hệ thống (song song, KHÔNG
hợp nhất, với mock `role` của F007/F008 — xem `docs/vi/system/architecture.md`
§ Authentication Layer). Feature-spec đầy đủ (business-context/technical-spec/screens/
edge-cases) chưa được sinh trong lượt này — cần chạy pass feature-spec riêng để có tài
liệu tại `docs/vi/features/login-supabase-auth/`.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 7

**Related Screens**:
- SCR007_Login: Login

**Related User Stories**:
- US020_ViewLoginScreen: Xem màn hình đăng nhập
- US021_SignInWithGoogle: Đăng nhập bằng Google
- US022_SeeLoginErrorMessage: Thấy thông báo lỗi khi đăng nhập thất bại/huỷ
- US023_RedirectedAwayWhenAlreadyAuthenticated: Bị đưa về trang chủ nếu đã đăng nhập

**Related APIs/Routes**:
- (page) /login — ROUTE009
- (route handler) GET /auth/callback — ROUTE008

**Related Data Models**:
- Không có `MODEL###` mới — Supabase tự quản lý schema `auth.users` của nó, app không viết
  migration/model nào (xem `entities.md` § Supabase Session)

**Related Background Logic**:
- BL002_OAuthCallbackExchange (`behavior-logic.md`) — type `integration`
- BL001_PrelaunchLaunchGate (`behavior-logic.md`) — cập nhật, nay cũng refresh session
  Supabase trên mọi request trước khi chạy gate

**Related Permissions**:
- PERM004_LoginRouteAuthGate (`permissions-matrix.md`) — type `route-guard`, kiểm tra THẬT
  phía server, chỉ chi phối `/login`

---

### F012_AwardSystemPage: Award System Page — thêm 2026-08-20

**Type**: ui
**Description**: Trang nội dung `/awards` trình bày đầy đủ 6 hạng mục giải thưởng SAA 2025 —
thay phần placeholder cũ vốn chỉ giữ chỗ 6 neo `#<slug>` cho F003_AwardDiscovery ở trang chủ.
Gồm hero thu nhỏ (ROOT FURTHER, không đếm ngược/CTA), khối tiêu đề hai dòng, nav danh mục dính
bên trái 6 mục có trạng thái active bám theo khối đang xem (`IntersectionObserver`), 6 khối chi
tiết xen kẽ ảnh/nội dung (ảnh 336×336 + mô tả dài + số lượng + giá trị giải), và khối quảng bá
Sun* Kudos dùng lại nguyên `components/home/kudos-section.tsx` của F004. Chỉ đọc — không có
persistence, không có API, không có route guard (bảo vệ route vẫn hoãn từ lượt F011). Chi tiết
đầy đủ: `docs/vi/features/award-system-page/technical-spec.md`.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 5

**Related Screens**:
- SCR002_Awards: Awards — màn hình đã có trong `screen-list.md`, lượt này mới có nội dung thật

**Related User Stories**:
- US001_XemNoiDungTrangGiaiThuong: Xem nội dung trang hệ thống giải thưởng
- US002_DieuHuongQuaMucNavDanhMuc: Điều hướng qua nav danh mục bên trái
- US003_KhamPhaSunKudosTuTrangGiaiThuong: Khám phá Sun* Kudos từ trang giải thưởng

  (mã US### cục bộ của feature-spec; hợp nhất vào `user-stories.md` ở lượt rebuild-spec kế tiếp)

**Related APIs/Routes**:
- (page) /awards — ROUTE002, đã tồn tại; lượt này thay nội dung, không đổi đường dẫn
- 6 neo `#<slug>` trên chính route đó — hợp đồng deep-link dùng chung với F003_AwardDiscovery

**Related Data Models**:
- Không có `MODEL###` mới — `lib/awards.ts` được mở rộng thêm trường (mô tả dài, số lượng, giá
  trị giải), là dữ liệu tĩnh trong mã nguồn chứ không phải entity có persistence

**Related Background Logic**:
- Không có — trang chỉ đọc, không có job/middleware nào thuộc feature này

**Related Permissions**:
- Không có — `/awards` công khai cho mọi actor. TC ID-1 (khách chưa đăng nhập bị đưa sang
  đăng nhập) KHÔNG được assert ở lượt này: bảo vệ route vẫn hoãn theo quyết định của lượt
  F011 (`plans/260820-1020-award-system-page/clarifications.md` quyết định 2)

---

### F013_KudosLiveBoard: Kudos Live Board — thêm 2026-08-21

**Type**: ui
**Description**: Trang nội dung `/kudos` — điền nội dung thật vào placeholder cũ (`app/kudos/page.tsx`)
vốn chỉ giữ chỗ cho link Kudos ở header/footer và khối quảng bá F004_KudosPromotion. Gồm banner + pill
mời gửi kudos, khối HIGHLIGHT KUDOS (carousel 5 thẻ nhiều tim nhất, 3 hiển thị cùng lúc, 2 dropdown
lọc), khối SPOTLIGHT BOARD (word cloud ~100 tên + tìm kiếm), khối ALL KUDOS (feed thẻ hiện dần theo
đà cuộn), và sidebar thống kê cá nhân + bảng xếp hạng. Toàn bộ dữ liệu là module tĩnh mới `lib/kudos/`
(tách nhiều file theo giới hạn 200 dòng, cùng tiền lệ `lib/awards.ts`) — không có bảng CSDL, không có
API route, không có persistence. Bốn đích điều hướng frame tham chiếu nhưng chưa có frame riêng (gửi
kudos, chi tiết kudos, hồ sơ Sunner, Secret Box) dừng ở mức trigger render + focusable, không xây
đích. Chi tiết đầy đủ: `docs/vi/features/kudos-live-board/technical-spec.md`.

**Workspace**: my-app
**Languages**: TypeScript, TSX
**Components**: 10 (mới, dưới `components/kudos/`; chưa tính `SiteHeader`/`SiteFooter` tái dùng)

**Related Screens**:
- SCR008_KudosLiveBoard: Sun* Kudos - Live board — màn hình mới, thêm 2026-08-21 (`screen-list.md`)

**Related User Stories**:
- US001_XemVaLocHighlightKudos: Xem và lọc HIGHLIGHT KUDOS
- US002_DieuHuongCarouselHighlightKudos: Điều hướng carousel HIGHLIGHT KUDOS
- US003_XemVaCuonAllKudos: Xem và cuộn ALL KUDOS
- US004_ThaTimKudos: Thả tim (like) một kudos
- US005_SaoChepLinkKudos: Sao chép link một kudos
- US006_LocTheoHashtagPhongBan: Lọc HIGHLIGHT và ALL KUDOS theo Hashtag/Phòng ban
- US007_XemVaTimKiemSpotlightBoard: Xem và tìm kiếm SPOTLIGHT BOARD
- US008_XemThongKeCaNhanVaBangXepHang: Xem thống kê cá nhân và bảng xếp hạng ở sidebar
- US009_TruyCapCacDichChuaXayDung: Truy cập các đích điều hướng chưa được xây

  (mã US### cục bộ của feature-spec; hợp nhất vào `user-stories.md` ở lượt rebuild-spec kế tiếp)

**Related APIs/Routes**:
- (page) /kudos — ROUTE003, đã tồn tại dưới dạng placeholder có chủ đích; lượt này thay nội dung,
  không đổi đường dẫn và không cấp ROUTE### mới

**Related Data Models**:
- Không có `MODEL###` mới — `lib/kudos/` là dữ liệu tĩnh trong mã nguồn (KudosRecord, SpotlightEntry,
  LeaderboardEntry, FilterVocabulary, ViewerStats), không phải entity có persistence. Xem
  `## Key Entities` trong technical-spec để biết hình dạng từng hằng số

**Related Background Logic**:
- Không có — trang chỉ đọc, không có job/middleware nào thuộc feature này

**Related Permissions**:
- Không có `PERM###` mới được cấp. `/kudos` công khai cho mọi actor. Feature mở rộng mock session
  (`lib/session/session-provider.tsx`) thêm danh tính người xem để vô hiệu nút tim trên chính kudos
  người xem đã gửi — đây là affordance UI trên dữ liệu tĩnh, không phải điểm gate theo vai trò, và
  giữ trạng thái `TBD (draft)` trong `permissions-matrix.md` cho tới khi được cấp mã thật. Bảo vệ
  route vẫn hoãn theo quyết định của lượt F011

---

### F014_SendKudosWishes: Send Kudos Wishes — thêm 2026-08-24

**Type**: ui
**Description**: Trang `/kudos/send` — form "Gửi lời chúc Kudos" cho phép một Sunner đã đăng nhập
soạn và gửi lời cảm ơn tới đồng đội. Đây là feature ĐẦU TIÊN của repo có bảng dữ liệu riêng do app
định nghĩa (`profiles`, `hashtags`, `kudos` + một bucket Supabase Storage cho ảnh) và cũng là route
ĐẦU TIÊN có cổng xác thực thật phía server (chưa đăng nhập → chuyển `/login`, TC ID-0/ID-1). Form
gồm: chọn Người nhận (autocomplete trên `profiles`), Danh hiệu (free text, bắt buộc, tối đa 100 ký
tự — trường này KHÔNG có spec ở bất kỳ frame nào, xem clarifications.md defect 1), khối soạn nội dung
với 6 nút định dạng markdown-lite + bộ đếm cứng 1.000 ký tự, Hashtag chọn từ danh sách 8 giá trị
(toggle, tối đa 5, hàng chưa chọn bị disable khi đủ 5), Image (tối đa 5, `.jpg`/`.png`), checkbox ẩn
danh mở ra trường Nickname bắt buộc, và footer Hủy/Gửi với Gửi disabled tới khi đủ trường bắt buộc.

**Ranh giới có chủ đích**: bảng mới CHỈ được ghi bởi feature này. Trang `/kudos` (F013) vẫn đọc dữ
liệu tĩnh trong `lib/kudos/` — nghĩa là **một kudos vừa gửi sẽ KHÔNG xuất hiện trên board**. Đây là
quyết định 1 của `clarifications.md`, không phải lỗi. Việc chuyển các bề mặt đọc sang CSDL là feature
riêng, đã ghi ở Next Steps.

**Workspace**: my-app
**Languages**: TypeScript, TSX

**Related Screens**:
- Màn hình mới "Gửi lời chúc Kudos" (frame `JsTvi8KVQA`) — **SCR### chưa được cấp**; cần một lượt
  doc-writer/rebuild-spec cập nhật `screen-list.md`. Hành vi thật lấy từ frame component
  `ihQ26W78P2` (26 spec item, 57 test case) vì frame đích không có spec nào.

**Related User Stories**:
- US001…US009 trong `docs/vi/features/F014_SendKudosWishes/technical-spec.md`
  (mã US### cục bộ của feature-spec; hợp nhất vào `user-stories.md` ở lượt rebuild-spec kế tiếp —
  cùng tình trạng với US cục bộ của F012 và F013)

**Related APIs/Routes**:
- (page) /kudos/send — route MỚI, **ROUTE### chưa được cấp**; cần cập nhật `route-list.md`

**Related Data Models**:
- Bảng `profiles`, `hashtags`, `kudos` + bucket Storage — **MODEL### chưa được cấp**. Đây là tier
  persistence đầu tiên do app sở hữu; `entities.md` hiện vẫn ghi "Total Entities: 1
  (MODEL001_Award)" và cần được cập nhật.

**Related Background Logic**:
- Không có BL### mới — không job/cron nào thuộc feature này. Server Action gửi form là luồng
  request-response đồng bộ, không phải background logic.

**Related Permissions**:
- Cổng route thật trên `/kudos/send` — **PERM### chưa được cấp**; `permissions-matrix.md` cần thêm
  hàng. Đây là guard thật thứ hai sau `PERM004_LoginRouteAuthGate` và chặn theo chiều ngược lại.
  RLS bắt buộc `sender` suy ra từ `auth.uid()`, không nhận từ client. Mock `role`/`userId` trong
  `lib/session/session-provider.tsx` vẫn KHÔNG phải ranh giới phân quyền và không được hợp nhất ở
  lượt này.

---

## Summary

- **Total Features**: 15
- **Total Screens**: 8
- **Total User Stories**: 23
- **Total Routes**: 8 (ROUTE001–ROUTE005, ROUTE007–ROUTE009; ROUTE006 `/_not-found` loại khỏi mapping — tự sinh bởi Next.js, không có source file, cùng phạm vi loại trừ đã áp dụng ở `screen-list.md`)
- **Total Data Models**: 1 (MODEL001_Award)
- **Total Background Logic**: 2 (BL001_PrelaunchLaunchGate, BL002_OAuthCallbackExchange)
- **Total Permissions**: 4
- **Languages Detected**: TypeScript, TSX (Next.js App Router)

**Ghi chú (lượt Kudos Live board, 2026-08-21)**: `Total Features` được sửa 11 → 13 và
`Total Screens` 7 → 8. Con số cũ (11) đã lệch từ trước lượt này — `F012_AwardSystemPage` được
thêm ở lượt 2026-08-20 nhưng phần Summary không được cập nhật cùng; lượt này đếm lại đúng theo
bảng Feature Hierarchy (13 dòng) và `screen-list.md` (8 mục `## SCR###`). Các con số còn lại
không đổi và đó là đúng: `F013_KudosLiveBoard` dùng lại `ROUTE003` (`/kudos`, placeholder có chủ
đích từ lượt homepage) nên không có route mới; không có `MODEL###` mới (dữ liệu tĩnh trong
`lib/kudos/`, không có persistence); không có `BL###` mới (trang chỉ đọc); không có `PERM###` mới
được cấp. `Total User Stories` giữ ở 23 vì 9 US của feature này là mã **cục bộ** trong
`docs/vi/features/kudos-live-board/technical-spec.md`, chưa được hợp nhất vào `user-stories.md` —
cùng tình trạng với US cục bộ của `F012_AwardSystemPage`.

**Ghi chú (lượt Login, 2026-08-19)**: `F011_GoogleOAuthLogin` được thêm bằng cách đối chiếu
ngược trực tiếp từ source đã shipped (`app/login/`, `app/auth/callback/`, `lib/supabase/`),
KHÔNG đi qua toàn bộ pipeline Wave 1→5 như 10 feature trước. Đây là bổ sung inventory tối
thiểu (route/screen/US/BL/PERM), không thay thế một lượt feature-spec đầy đủ — xem advisory
ở cuối tài liệu.

## Cross-Reference Validation

- [x] All F### codes are unique
- [ ] All F### codes are referenced in UserStories.md — pending: `user-stories.md` được sinh trước Wave 5 nên chưa mang cột F### (ghi nhận rõ ở dòng "All US### codes are referenced in FeatureList.md — pending Wave 5" của chính tài liệu đó); cần một lượt cập nhật ngược `user-stories.md` sau bước này, ngoài phạm vi task hiện tại
- [x] All screen references are valid (SCR### hoặc SCR###/REG### trong ScreenList — không có REG### nào trong hệ thống)
- [x] All user story references are valid (US### trong UserStories, đủ cả 23/23 sau khi thêm US020–US023)
- [x] All route references are valid (ROUTE### trong RouteList)
- [x] All data model references are valid (MODEL001 trong DataModel)
- [x] All behavior logic references are valid (BL001 → F010, BL002 → F011)
- [x] All permission references are valid (PERM### trong permissions-matrix.md, đủ cả PERM001–004)
- [x] Every US has a parent feature (F###) — 23/23 US mapped, không US nào orphan
- [x] Every screen has a parent feature (F###) — SCR001 (F001–F009), SCR002 (F003, F012), SCR003 (F004), SCR004 (F007), SCR005 (F007), SCR006 (F010), SCR007 (F011), SCR008 (F013)
- [x] Every route maps to a feature (F###) — ROUTE001–ROUTE005, ROUTE007–ROUTE009 đều có ≥1 feature owner (ROUTE003 `/kudos`: F004 quảng bá + F013 nội dung trang, thêm 2026-08-21); ROUTE006 ngoài phạm vi (không có source file)
- [x] Every data model maps to a feature (F###) — MODEL001 → F003
- [x] Every background logic maps to a feature (F###) — BL001 → F010, BL002 → F011

**Advisory (lượt Login, 2026-08-19)**: `F011_GoogleOAuthLogin` chưa có thư mục feature-spec
đầy đủ (`docs/vi/features/login-supabase-auth/{business-context,technical-spec,screens,
edge-cases}.md`) — tạo mới thư mục per-feature nằm ngoài quyền surgical-edit của lượt này.
**Khuyến nghị: chạy `/tkm:rebuild-spec --features F011`** để sinh bộ feature-spec đầy đủ cho
`F011_GoogleOAuthLogin`.
- [x] Every permission maps to a feature (F###) — PERM001/PERM002 → F007, PERM003 → F008

**Ghi chú (lượt Send Kudos wishes, 2026-08-24)**: `Total Features` 13 → 14 cho `F014_SendKudosWishes`. Các con số `Total Screens`/`Routes`/`Data Models`/`Permissions` GIỮ NGUYÊN ở lượt này và đang THIẾU so với thực tế: feature này thêm 1 screen, 1 route, 3 bảng và 1 permission nhưng chưa mã nào được cấp — các inventory sinh tự động (`screen-list.md`, `route-list.md`, `entities.md`, `permissions-matrix.md`) thuộc quyền surgical-edit của doc-writer/rebuild-spec, không phải của bước promote. Ghi rõ ở đây để khoảng lệch không bị đọc thành đã hoàn tất.

---

### F015_LikeKudos: Like Kudos (thả tim) — thêm 2026-08-25

**Type**: mixed
**Description**: Lượt thả tim trên live board `/kudos` trở thành dữ liệu thật lưu trong Supabase.
Trước feature này, nút trái tim chỉ là `useState(false)` trong `components/kudos/kudos-card-actions.tsx`
— bấm thì số nhảy, tải lại trang là mất sạch. F015 thêm bảng `kudos_likes` (một dòng = một lượt thả
tim của một người cho một kudos, unique trên cặp `(kudos_id, user_id)`), bảng `special_days` để cấu
hình ngày nhân đôi tim, và cột `profiles.auth_user_id` làm cầu nối giữa `auth.uid()` với profile slug.

Quy tắc nghiệp vụ lấy từ spec row C.4.1 `Hearts` của frame `MaZUn5xHXZ`: mỗi người chỉ thả một tim
cho một kudos; người gửi kudos không được tự thả tim cho bài của mình (chặn ở cả UI lẫn database);
mỗi lượt thả tim cộng 1 tim cho **người gửi** kudos, hoặc 2 tim nếu rơi vào ngày đặc biệt; huỷ tim
thu hồi **đúng số đã cộng**, đọc từ cờ `is_special` đóng cứng trên chính dòng lượt tim đó chứ không
tính lại theo ngày hiện tại.

Đây là feature ĐẦU TIÊN enforce một quy tắc nghiệp vụ ở tầng database thay vì chỉ ở client: trước
đó nút tim bị vô hiệu hoá dựa trên mock session trong `localStorage`, thứ ai mở DevTools cũng sửa
được. `/kudos` vẫn công khai — khách chưa đăng nhập đọc được bảng và thấy số tim thật, chỉ hành động
thả tim là bị chặn (không redirect sang `/login`).

**Ranh giới có chủ ý**: bảng live board VẪN đọc nội dung thẻ từ `lib/kudos/kudos-records.ts` (9 record
tĩnh). F015 chỉ thay phần lượt thả tim. Seam mà F014 ghi nhận — "kudos bạn gửi không xuất hiện trên
bảng" — vẫn còn nguyên. Vì thế `kudos_likes.kudos_id` để kiểu `text` chứ không phải khoá ngoại sang
`kudos.id`; ép khoá ngoại sẽ buộc phải seed 9 record tĩnh vào database, tức là làm luôn phần rewire
đã hoãn.

**Sai lệch so với spec (có chủ ý, ghi lại)**: row C.4.1 tự mâu thuẫn — câu cộng tim ghi "tài khoản
gửi", câu thu hồi ghi "tài khoản nhận". Theo clarifications quyết định 3, cộng cho **người gửi**;
chữ "nhận" ở câu thu hồi coi là lỗi soạn spec.

**Chưa làm**: chưa có màn admin cho `special_days` (cấu hình bằng SQL — không frame MoMorph nào vẽ
màn này); quy tắc "hoa thị" vẫn ăn theo `kudosReceived` tĩnh; bốn dòng còn lại của khối thống kê
sidebar vẫn là placeholder `25`, chỉ dòng "Số tim bạn nhận được" đọc sổ cái thật.

**User stories**: US001…US005 trong `docs/vi/features/F015_LikeKudos/technical-spec.md`
**Screens**: SCR008_KudosLiveBoard (dùng lại, không thêm màn mới)

**Ghi chú (lượt Like Kudos, 2026-08-25)**: `Total Features` 14 → 15 cho `F015_LikeKudos` — con số
14 ở lượt trước đã thiếu tính chính feature này dù bảng Feature Hierarchy đã có dòng F015.
`Total Screens`/`Routes`/`Permissions` GIỮ NGUYÊN đúng: không route/màn hình mới, không mã
`PERM###` mới được cấp (xem `permissions.md` § Delta Thả tim Kudos). Khác với lượt F014 — lượt
này `entities.md` ĐÃ được cập nhật (§ Pending, doc-writer) để ghi nhận 3 bảng mới
(`kudos_likes`, `special_days`, `kudos_static_authors`) và cột mới `profiles.auth_user_id`, cùng
lúc backfill luôn 5 bảng còn thiếu từ F014 — `Total Data Models` ở trên vẫn giữ `1` vì các bảng
này chưa qua rebuild-spec để cấp mã `MODEL###` chính thức.
