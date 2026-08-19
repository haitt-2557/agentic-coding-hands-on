// FR-002 — Vietnamese dictionary. Source of truth: `lang: vi` (see clarifications.md).
// Scope: short, enumerable UI chrome copy (header/hero/section labels/CTAs/footer/
// notification/account menu/quick-action widget). The long-form Root Further body
// paragraphs and the Kudos promo body are static content owned by Track A's
// presentational components (`components/home/root-further-content.tsx`,
// `components/home/kudos-section.tsx`) and are intentionally not duplicated here —
// see the Phase 3 implementer report for the reasoning.
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
} as const;

export type DictionaryKey = keyof typeof vi;
