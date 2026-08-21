// FR-002 — Vietnamese dictionary. Source of truth: `lang: vi` (see clarifications.md).
// Scope: short, enumerable UI chrome copy (header/hero/section labels/CTAs/footer/
// notification/account menu/quick-action widget). The long-form Root Further body
// paragraphs and the Kudos promo body are static content owned by Track A's
// presentational components (`components/home/root-further-content.tsx`,
// `components/home/kudos-section.tsx`) and are intentionally not duplicated here —
// see the Phase 3 implementer report for the reasoning.
//
// `kudosPage.*` (Phase 3, /kudos screen) — same short-chrome scope. The kudos card message
// bodies, the three BR-005 star tooltips and the sidebar stat labels are frame-mandated data
// tied to a specific business rule or record shape, so they live as literal strings in
// `lib/kudos/*.ts` next to the rule/record they belong to, not here (avoids a second source of
// truth for the same frozen string). This screen has no English frame, so `en.ts` mirrors these
// values verbatim rather than inventing a translation, matching this file's existing precedent
// for proper-noun-like chrome (e.g. `nav.kudos`).
export const vi = {
  'nav.about': 'About SAA 2025',
  'nav.awards': 'Award Information',
  'nav.kudos': 'Sun* Kudos',
  'language.optionVi': 'VN',
  'language.optionEn': 'EN',
  'hero.title': 'ROOT FURTHER',
  'hero.comingSoon': 'Coming soon',
  'hero.eventInfo':
    'Thời gian: 26/12/2025 · Địa điểm: Âu Cơ Art Center · Tường thuật trực tiếp qua sóng Livestream',
  'hero.ctaAwards': 'ABOUT AWARDS',
  'hero.ctaKudos': 'ABOUT KUDOS',
  'countdown.days': 'DAYS',
  'countdown.hours': 'HOURS',
  'countdown.minutes': 'MINUTES',
  'awards.caption': 'Sun* annual awards 2025',
  'awards.heading': 'Hệ thống giải thưởng',
  'awards.detailLink': 'Chi tiết',
  'awardsPage.subtitle': 'Sun* Annual Awards 2025',
  'awardsPage.heading': 'Hệ thống giải thưởng SAA 2025',
  'awardsPage.quantityLabel': 'Số lượng giải thưởng:',
  'awardsPage.prizeLabel': 'Giá trị giải thưởng:',
  'awardsPage.prizeOr': 'Hoặc',
  'kudos.label': 'Phong trào ghi nhận',
  'kudos.title': 'Sun* Kudos',
  'kudos.detailLink': 'Chi tiết',
  'footer.copyright': 'Bản quyền thuộc về Sun* © 2025',
  'footer.generalStandards': 'Tiêu chuẩn chung',
  'notification.title': 'Thông báo',
  'notification.empty': 'Không có thông báo mới',
  'account.profile': 'Profile',
  'account.signOut': 'Sign out',
  'account.adminDashboard': 'Admin Dashboard',
  'widget.writeKudos': 'Viết Kudos',
  'widget.aboutSaa': 'Về SAA 2025',
  'prelaunch.title': 'Sự kiện sẽ bắt đầu sau',
  'login.subtitle': 'Bắt đầu hành trình của bạn cùng SAA 2025.',
  'login.tagline': 'Đăng nhập để khám phá!',
  'login.button': 'LOGIN With Google',
  'login.error': 'Đăng nhập không thành công. Vui lòng thử lại.',
  'kudosPage.bannerTitle': 'Hệ thống ghi nhận và cảm ơn',
  'kudosPage.submitPillPlaceholder': ' Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?   ',
  'kudosPage.sunnerSearchPlaceholder': 'Tìm kiếm profile Sunner',
  'kudosPage.sectionSubtitle': 'Sun* Annual Awards 2025',
  'kudosPage.highlightHeading': 'HIGHLIGHT KUDOS',
  'kudosPage.spotlightHeading': 'SPOTLIGHT BOARD',
  'kudosPage.allKudosHeading': 'ALL KUDOS',
  'kudosPage.filterHashtagLabel': 'Hashtag',
  'kudosPage.filterDepartmentLabel': 'Phòng ban',
  'kudosPage.spotlightSearchPlaceholder': 'Tìm kiếm ',
  'kudosPage.emptyState': 'Hiện tại chưa có Kudos nào.',
  'kudosPage.copyLinkButton': 'Copy Link',
  'kudosPage.copyLinkToast': 'Link copied — ready to share!',
  'kudosPage.viewDetailButton': 'Xem chi tiết',
  'kudosPage.secretBoxButton': 'Mở Secret Box',
} as const;

export type DictionaryKey = keyof typeof vi;
