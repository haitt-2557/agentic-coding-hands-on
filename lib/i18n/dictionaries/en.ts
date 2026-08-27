// FR-002 — English dictionary. Same key set as `./vi.ts` by construction: an assignment to
// `Record<DictionaryKey, string>` fails to compile if a key is missing or misspelled here.
import type { DictionaryKey } from './vi';

export const en: Record<DictionaryKey, string> = {
  'nav.about': 'About SAA 2025',
  'nav.awards': 'Award Information',
  'nav.kudos': 'Sun* Kudos',
  'language.optionVi': 'VN',
  'language.optionEn': 'EN',
  'hero.title': 'ROOT FURTHER',
  'hero.comingSoon': 'Coming soon',
  'hero.eventInfo': 'Time: 26/12/2025 · Venue: Âu Cơ Art Center · Live broadcast via Livestream',
  'hero.ctaAwards': 'ABOUT AWARDS',
  'hero.ctaKudos': 'ABOUT KUDOS',
  'countdown.days': 'DAYS',
  'countdown.hours': 'HOURS',
  'countdown.minutes': 'MINUTES',
  'awards.caption': 'Sun* annual awards 2025',
  'awards.heading': 'Award System',
  'awards.detailLink': 'Detail',
  'awardsPage.subtitle': 'Sun* Annual Awards 2025',
  'awardsPage.heading': 'SAA 2025 Award System',
  'awardsPage.quantityLabel': 'Award quantity:',
  'awardsPage.prizeLabel': 'Prize value:',
  'awardsPage.prizeOr': 'Or',
  'kudos.label': 'Recognition movement',
  'kudos.title': 'Sun* Kudos',
  'kudos.detailLink': 'Detail',
  'footer.copyright': 'Copyright © 2025 Sun*',
  'footer.generalStandards': 'General Standards',
  'notification.title': 'Notifications',
  'notification.empty': 'No new notifications',
  'account.profile': 'Profile',
  'account.signOut': 'Sign out',
  'account.adminDashboard': 'Admin Dashboard',
  'widget.writeKudos': 'Write Kudos',
  'widget.aboutSaa': 'About SAA 2025',
  'prelaunch.title': 'Event starts in',
  'login.subtitle': 'Begin your journey with SAA 2025.',
  'login.tagline': 'Log in to explore!',
  'login.button': 'LOGIN With Google',
  'login.error': 'Login failed. Please try again.',
  // No English frame exists for /kudos (clarifications.md) — mirrored verbatim, same as
  // `nav.kudos` above, rather than inventing a translation of frame-mandated copy.
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
  // sendKudos.* (F014) — no English frame exists for /kudos/send either, so frame-mandated
  // copy (labels, placeholders, hints) is mirrored verbatim, matching this file's existing
  // precedent above. Only the two toolbar aria-label-style strings (already English words)
  // stay as-is.
  'sendKudos.pageTitle': 'Gửi lời cám ơn và ghi nhận đến đồng đội',
  'sendKudos.recipientLabel': 'Người nhận',
  'sendKudos.recipientPlaceholder': 'Tìm kiếm',
  'sendKudos.recipientNoResults': 'Không tìm thấy Sunner phù hợp',
  'sendKudos.titleLabel': 'Danh hiệu',
  'sendKudos.titlePlaceholder': 'Dành tặng một danh hiệu cho đồng đội',
  'sendKudos.titleHelperExample': 'Ví dụ: Người truyền động lực cho tôi.',
  'sendKudos.titleHelperUsage': 'Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.',
  'sendKudos.messagePlaceholder':
    'Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!\nVD: Cảm ơn bạn vì tinh thần dẫn dắt và khả năng "giữ nhịp" cực kỳ tốt trong giai đoạn nước rút của dự án...',
  'sendKudos.messageHint': 'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác',
  'sendKudos.communityStandardsLink': 'Tiêu chuẩn cộng đồng',
  'sendKudos.toolbarBoldLabel': 'Bold',
  'sendKudos.toolbarItalicLabel': 'Italic',
  'sendKudos.toolbarStrikeLabel': 'Strikethrough',
  'sendKudos.toolbarNumberedListLabel': 'Numbered list',
  'sendKudos.toolbarLinkLabel': 'Link',
  'sendKudos.toolbarQuoteLabel': 'Quote',
  'sendKudos.hashtagLabel': 'Hashtag',
  'sendKudos.hashtagAddButton': 'Hashtag',
  'sendKudos.hashtagMaxHint': 'Tối đa 5',
  'sendKudos.hashtagRemoveLabel': 'Bỏ chọn hashtag',
  'sendKudos.imageLabel': 'Image',
  // Design copy is authoritative here, NOT the D12 locator. Frame JsTvi8KVQA renders this
  // control as "Image" over "Tối đa 5", mirroring the "+ Hashtag / Tối đa 5" control beside it —
  // "Thêm" appears nowhere on the frame. D12's "visible text containing Thêm" (used here in an
  // earlier revision) was product copy bent to dodge a locator collision with the "Image" field
  // label to the left of the thumbnail row, the same inversion corrected on the anonymous
  // checkbox. tester is retargeting that locator onto input[type="file"] (D11 already guarantees
  // exactly one), so the collision is solved structurally instead of by rewriting copy.
  'sendKudos.imageAddButton': 'Image',
  'sendKudos.imageMaxHint': 'Tối đa 5',
  'sendKudos.imageRemoveLabel': 'Xóa ảnh',
  'sendKudos.imageFormatError': 'Chỉ chấp nhận định dạng .jpg hoặc .png',
  // Design copy is authoritative here, NOT the D9 locator. The frame image, spec row G of
  // ihQ26W78P2 ("nhãn hiển thị 'Gửi lời cám ơn và ghi nhận ẩn danh'") and TC ID-41 all agree on
  // this full string as the user-visible label. "Gửi ẩn danh" (used here in an earlier revision)
  // is the Figma NODE NAME of I1612:5057;520:14099, not rendered copy — it was a locator-driven
  // mistake, not a genuine design contradiction. Per clarifications.md's standing rule (test
  // locator vs. design copy: copy wins, the locator gets fixed), tester is retargeting D9 to
  // match this checkbox by role + accessible name instead of a text substring.
  'sendKudos.anonymousLabel': 'Gửi lời cám ơn và ghi nhận ẩn danh',
  'sendKudos.nicknameLabel': 'Nickname ẩn danh',
  'sendKudos.nicknamePlaceholder': 'Nhập Nickname ẩn danh của bạn',
  'sendKudos.cancelButton': 'Hủy',
  'sendKudos.submitButton': 'Gửi',
  'sendKudos.submitErrorFallback': 'Gửi Kudos không thành công. Vui lòng thử lại.',
  'sendKudos.successToast': 'Gửi lời cám ơn và ghi nhận thành công!',
  // rootFurther.* / kudos.badge / kudos.body / awards.*.description — draft EN copy pending
  // Comms/BTC review (bug fix task: homepage body copy must follow the language switcher).
  'rootFurther.p1':
    'Facing the breakneck change of the AI era and ever-rising client expectations, Sun* has chosen a strategy of diversifying capability — not merely to excel in our own field, but to reach for something higher: a place where every Sunner is a "problem-solver", an expert at resolving any issue and finding answers for our projects, our clients and society.',
  'rootFurther.p2':
    'Inspired by that diversity of capability, by the ability to grow flexibly, and by the spirit of digging deeper to break through in the AI era, "Root Further" was chosen as the official theme of the Sun* Annual Awards 2025.',
  'rootFurther.p3':
    'Beyond its surface meaning, "Root Further" is the journey of reaching ever further, rooting ever deeper, touching the hidden "geological" layers so we can endure, rise, and keep alive the burning passion for creating value that defines Sun* people. Borrowing the image of roots driving relentlessly into the earth, threading through each layer of "sediment" to absorb what is purest, Sun* people are likewise drawing nutrients from the age and from the market\'s challenges to renew themselves every day, widening their capability and rooting firmly into the AI era — a wholly new "geological" layer, complex and hard to predict, yet holding boundless potential and opportunity.',
  'rootFurther.quote': 'A tree with deep roots fears no storm',
  'rootFurther.quoteGloss': '(English proverb)',
  'rootFurther.p4':
    'In a storm, only trees whose roots are strong enough will stand. An organisation of individuals confident in their diverse capabilities, ready to create and to meet challenges, in command of change — that is an organisation that not only holds firm through upheaval but turns every advantage to account and conquers the challenges of its time. More than the name of a new chapter in our organisation\'s journey, "Root Further" is an encouragement: dare to believe in yourself, dare to dig deep, dare to unlock every potential, dare to break your limits, dare to become the most versatile and excellent version of yourself. Because in the AI era, diverse capability and harnessing the strength of the times are the prerequisites for lasting.',
  'rootFurther.p5':
    'No one can foresee how many mysterious "geological" layers still lie deep in the earth of the technology industry and the modern market. We know only that once "Root Further" has become our root-deep spirit, we will meet any uncharted territory on the road ahead without fear — with eagerness instead. Because we believe that within those very boundless reaches wait countless wonders, and the chance to rise.',
  'kudos.badge': "WHAT'S NEW AT SAA 2025",
  'kudos.body':
    "A recognition and thank-you activity for colleagues — held for the first time, open to every Sunner. Running from November 2025, it invites Sun* people to share recognition and thanks for their colleagues on the platform announced by the organising committee. These messages will inform the Heads Council as it selects the award recipients.",
  'awards.topTalent.description': 'Honouring the top individuals who excel in every respect',
  'awards.topProject.description':
    'Honouring projects that excel in every respect, with outstanding revenue',
  'awards.topProjectLeader.description':
    'Honouring the manager who inspires and leads a project to break through,',
  'awards.bestManager.description':
    'Honouring the manager with strong management ability who leads their team',
  'awards.signatureCreator.description':
    'Honouring the manager with strong management ability who leads their team',
  'awards.mvp.description':
    'Honouring the manager with strong management ability who leads their team',
};
