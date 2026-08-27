// FR-002 — Vietnamese dictionary. Source of truth: `lang: vi` (see clarifications.md).
// Scope: short, enumerable UI chrome copy (header/hero/section labels/CTAs/footer/
// notification/account menu/quick-action widget) PLUS the long-form Root Further body
// paragraphs, the Kudos promo body, and the homepage award-card descriptions
// (`rootFurther.*`, `kudos.badge`/`kudos.body`, `awards.*.description`). These used to be
// excluded as "static Track A content", but that left `setLocale('en')` unable to swap
// them — the content is now keyed here so it participates in locale switching.
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
  // sendKudos.* (F014, /kudos/send, frame JsTvi8KVQA) — Track A's own copy namespace. The
  // exact required-field string (D14) lives ONLY in lib/kudos/send/validation.ts
  // (REQUIRED_FIELD_ERROR) and is intentionally NOT duplicated here — components import the
  // constant directly so phase-03's "exists in exactly one place in lib/" check still holds.
  'sendKudos.pageTitle': 'Gửi lời cám ơn và ghi nhận đến đồng đội',
  'sendKudos.recipientLabel': 'Người nhận',
  'sendKudos.recipientPlaceholder': 'Tìm kiếm',
  'sendKudos.recipientNoResults': 'Không tìm thấy Sunner phù hợp',
  'sendKudos.titleLabel': 'Danh hiệu',
  'sendKudos.titlePlaceholder': 'Dành tặng một danh hiệu cho đồng đội',
  'sendKudos.titleHelperExample': 'Ví dụ: Người truyền động lực cho tôi.',
  'sendKudos.titleHelperUsage': 'Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.',
  // D6 — the placeholder MUST begin with this exact clause (tester-owned locator), which
  // differs slightly in spelling from the frame's own copy ("cảm ơn" vs "cám ơn"/"gắm").
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
  // rootFurther.* — R3 Root Further content (Frame 486 / mms_B4_content), moved here from
  // `components/home/root-further-content.tsx` so the language switcher can swap it.
  'rootFurther.p1':
    'Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng, Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là "problem-solver" - chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng và xã hội.',
  'rootFurther.p2':
    'Lấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt phá trong kỷ nguyên AI, "Root Further" đã được chọn để trở thành chủ đề chính thức của Lễ trao giải Sun* Annual Awards 2025.',
  'rootFurther.p3':
    'Vượt ra khỏi nét nghĩa bề mặt, "Root Further" chính là hành trình chúng ta không ngừng vươn xa hơn, cắm rễ mạnh hơn, chạm đến những tầng "địa chất" ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*. Mượn hình ảnh bộ rễ liên tục đâm sâu vào lòng đất, mạnh mẽ len lỏi qua từng lớp "trầm tích" để thẩm thấu những gì tinh tuý nhất, người Sun* cũng đang "hấp thụ" dưỡng chất từ thời đại và những thử thách của thị trường để làm mới mình mỗi ngày, mở rộng năng lực và mạnh mẽ "bén rễ" vào kỷ nguyên AI - một tầng "địa chất" hoàn toàn mới, phức tạp và khó đoán, nhưng cũng hội tụ vô vàn tiềm năng cùng cơ hội.',
  'rootFurther.quote': 'A tree with deep roots fears no storm',
  'rootFurther.quoteGloss': '(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)',
  'rootFurther.p4':
    'Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ chức, "Root Further" còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc nhất của mình. Bởi trong thời đại AI, đa dạng năng lực và tận dụng sức mạnh thời cuộc chính là điều kiện tiên quyết để trường tồn.',
  'rootFurther.p5':
    'Không ai biết trước ẩn sâu trong "lòng đất" của ngành công nghệ và thị trường hiện đại còn biết bao tầng "địa chất" bí ẩn. Chỉ biết rằng khi "Root Further" đã trở thành tinh thần cội rễ, chúng ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về phía trước. Vì ta luôn tin rằng, trong chính những miền vô tận đó, là bao điều kỳ diệu và cơ hội vươn mình đang chờ ta.',
  // kudos.badge / kudos.body — R5 Sun* Kudos promo (mms_D1_Sunkudos) body copy, moved here
  // from `components/home/kudos-section.tsx` for the same reason.
  'kudos.badge': 'ĐIỂM MỚI CỦA SAA 2025',
  'kudos.body':
    'Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.',
  // awards.*.description — homepage award-card descriptions (`lib/awards.ts` Award.descriptionKey),
  // moved here for the same reason. Titles stay untranslated proper nouns.
  'awards.topTalent.description': 'Vinh danh top cá nhân xuất sắc trên mọi phương diện',
  'awards.topProject.description':
    'Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật',
  'awards.topProjectLeader.description':
    'Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá,',
  'awards.bestManager.description':
    'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
  'awards.signatureCreator.description':
    'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
  'awards.mvp.description': 'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
} as const;

export type DictionaryKey = keyof typeof vi;
