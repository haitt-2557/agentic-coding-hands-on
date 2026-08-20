// FR-013/014 + BR-005 — static award category data + slug -> href derivation.
// FR-003/FR-004 + BR-001 — awards-page fields (longDescription, quantity, prizeLines),
// added additively for the /awards detail page (screen zFYDgyj_pD). `description`/`image`
// stay the homepage card copy; `longDescription` is the awards-page body — the two surfaces
// genuinely show different text (clarifications.md).
// Titles/descriptions are copied verbatim from the rendered MoMorph frame (copy authority
// per clarifications.md "Frame wins on copy and layout"). Best Manager, Signature 2025 -
// Creator, and MVP share identical description text in the frame itself — that is a design
// defect in the source file, not a mistake introduced here; reproduced as-is rather than
// inventing distinct copy (see implementer report for the design-owner follow-up).
// `quantity`/`prizeLines` are transcribed verbatim from
// `plans/260820-1020-award-system-page/design/award-copy.md`; Top Talent's quantity unit is
// "Cá nhân" per the frame, not "Đơn vị" from the spec CSV (design defect #3 — frame wins).

/** One row of the awards-page "Số lượng giải thưởng:" field. */
export interface AwardQuantity {
  value: string;
  unit: string;
}

/** One row of the awards-page "Giá trị giải thưởng:" field. Most awards have one line; Signature has two. */
export interface AwardPrizeLine {
  amount: string;
  note?: string;
}

export interface Award {
  slug: string;
  title: string;
  description: string;
  /** Path under `public/` where Track A places the downloaded MoMorph thumbnail. */
  image: string;
  /** Awards-page body copy, 1–2 paragraphs, rendered as one `<p>` per entry. */
  longDescription: string[];
  quantity: AwardQuantity;
  prizeLines: AwardPrizeLine[];
}

export const EXPECTED_AWARD_SLUGS = [
  'top-talent',
  'top-project',
  'top-project-leader',
  'best-manager',
  'signature-2025-creator',
  'mvp',
] as const;

export const AWARDS: Award[] = [
  {
    slug: 'top-talent',
    title: 'Top Talent',
    description: 'Vinh danh top cá nhân xuất sắc trên mọi phương diện',
    image: '/images/awards/top-talent.png',
    longDescription: [
      'Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.',
    ],
    quantity: { value: '10', unit: 'Cá nhân' },
    prizeLines: [{ amount: '7.000.000 VNĐ', note: 'cho mỗi giải thưởng' }],
  },
  {
    slug: 'top-project',
    title: 'Top Project',
    description: 'Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật',
    image: '/images/awards/top-project.png',
    longDescription: [
      'Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc với kết quả kinh doanh vượt kỳ vọng, hiệu quả vận hành tối ưu và tinh thần làm việc tận tâm. Đây là các dự án có độ phức tạp kỹ thuật cao, hiệu quả tối ưu hóa nguồn lực và chi phí tốt, đề xuất các ý tưởng có giá trị cho khách hàng, đem lại lợi nhuận vượt trội và nhận được phản hồi tích cực từ khách hàng. Các thành viên tuân thủ nghiêm ngặt các tiêu chuẩn phát triển nội bộ trong phát triển dự án, tạo nên một hình mẫu về sự xuất sắc và chuyên nghiệp.',
    ],
    quantity: { value: '02', unit: 'Tập thể' },
    prizeLines: [{ amount: '15.000.000 VNĐ', note: 'cho mỗi giải thưởng' }],
  },
  {
    slug: 'top-project-leader',
    title: 'Top Project Leader',
    description: 'Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá,',
    image: '/images/awards/top-project-leader.png',
    longDescription: [
      'Giải thưởng Top Project Leader vinh danh những nhà quản lý dự án xuất sắc – những người hội tụ năng lực quản lý vững vàng, khả năng truyền cảm hứng mạnh mẽ, và tư duy “Aim High – Be Agile” trong mọi bài toán và bối cảnh. Dưới sự dẫn dắt của họ, các thành viên không chỉ cùng nhau vượt qua thử thách và đạt được mục tiêu đề ra, mà còn giữ vững ngọn lửa nhiệt huyết, tinh thần Wasshoi, và trưởng thành để trở thành phiên bản tinh hoa – hạnh phúc hơn của chính mình.',
    ],
    quantity: { value: '03', unit: 'Cá nhân' },
    prizeLines: [{ amount: '7.000.000 VNĐ', note: 'cho mỗi giải thưởng' }],
  },
  {
    slug: 'best-manager',
    title: 'Best Manager',
    description: 'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    image: '/images/awards/best-manager.png',
    longDescription: [
      'Giải thưởng Best Manager vinh danh những nhà lãnh đạo tiêu biểu – người đã dẫn dắt đội ngũ của mình tạo ra kết quả vượt kỳ vọng, tác động nổi bật đến hiệu quả kinh doanh và sự phát triển bền vững của tổ chức. Dưới sự lãnh đạo của họ, đội ngũ luôn chinh phục và làm chủ mọi mục tiêu bằng năng lực đa nhiệm, khả năng phối hợp hiệu quả, và tư duy ứng dụng công nghệ linh hoạt trong kỷ nguyên số. Họ truyền cảm hứng để tập thể trở nên tự tin tràn đầy năng lượng, sẵn sàng đón nhận, thậm chí dẫn dắt tạo ra những thay đổi có tính cách mạng.',
    ],
    quantity: { value: '01', unit: 'Cá nhân' },
    prizeLines: [{ amount: '10.000.000 VNĐ' }],
  },
  {
    slug: 'signature-2025-creator',
    title: 'Signature 2025 - Creator',
    description: 'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    image: '/images/awards/signature-2025-creator.png',
    longDescription: [
      'Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ.',
      'Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần “Creator” đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị.',
    ],
    quantity: { value: '01', unit: 'Cá nhân hoặc tập thể' },
    prizeLines: [
      { amount: '5.000.000 VNĐ', note: 'cho giải cá nhân' },
      { amount: '8.000.000 VNĐ', note: 'cho giải tập thể' },
    ],
  },
  {
    slug: 'mvp',
    title: 'MVP (Most Valuable Person)',
    description: 'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    image: '/images/awards/mvp.png',
    longDescription: [
      'Giải thưởng MVP vinh danh cá nhân xuất sắc nhất năm – gương mặt tiêu biểu đại diện cho toàn bộ tập thể Sun*. Họ là người đã thể hiện năng lực vượt trội, tinh thần cống hiến bền bỉ, và tầm ảnh hưởng sâu rộng, để lại dấu ấn mạnh mẽ trong hành trình của Sun* suốt năm qua.',
      'Không chỉ nổi bật bởi hiệu suất và kết quả công việc, họ còn là nguồn cảm hứng lan tỏa – thông qua suy nghĩ, hành động và ảnh hưởng tích cực của mình đối với tập thể. MVP là người hội tụ đầy đủ phẩm chất của người Sun* ưu tú, đồng thời mang trên mình trọng trách lớn lao: trở thành hình mẫu đại diện cho con người và tinh thần Sun*, góp phần dẫn dắt tập thể vươn tới những đỉnh cao mới.',
    ],
    quantity: { value: '01', unit: 'Cá nhân' },
    prizeLines: [{ amount: '15.000.000 VNĐ' }],
  },
];

/**
 * BR-005 — a card with a valid slug links to its `/awards#<slug>` anchor section; a card
 * with no slug (or an empty one) falls back to the bare `/awards` route with no hash and
 * no auto-scroll (ID-62).
 */
export function awardHref(slug: string | undefined): string {
  if (!slug) {
    return '/awards';
  }
  return `/awards#${slug}`;
}
