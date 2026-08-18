// FR-013/014 + BR-005 — static award category data + slug -> href derivation.
// Titles/descriptions are copied verbatim from the rendered MoMorph frame (copy authority
// per clarifications.md "Frame wins on copy and layout"). Best Manager, Signature 2025 -
// Creator, and MVP share identical description text in the frame itself — that is a design
// defect in the source file, not a mistake introduced here; reproduced as-is rather than
// inventing distinct copy (see implementer report for the design-owner follow-up).

export interface Award {
  slug: string;
  title: string;
  description: string;
  /** Path under `public/` where Track A places the downloaded MoMorph thumbnail. */
  image: string;
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
  },
  {
    slug: 'top-project',
    title: 'Top Project',
    description: 'Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật',
    image: '/images/awards/top-project.png',
  },
  {
    slug: 'top-project-leader',
    title: 'Top Project Leader',
    description: 'Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá,',
    image: '/images/awards/top-project-leader.png',
  },
  {
    slug: 'best-manager',
    title: 'Best Manager',
    description: 'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    image: '/images/awards/best-manager.png',
  },
  {
    slug: 'signature-2025-creator',
    title: 'Signature 2025 - Creator',
    description: 'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    image: '/images/awards/signature-2025-creator.png',
  },
  {
    slug: 'mvp',
    title: 'MVP (Most Valuable Person)',
    description: 'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    image: '/images/awards/mvp.png',
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
