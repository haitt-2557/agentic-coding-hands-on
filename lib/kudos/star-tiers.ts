// BR-005_TangHangSaoTheoSoKudosNhanDuoc — star-count threshold table for the "hoa thị" indicator
// beside sender/receiver names. The three tooltip sentences are frozen data, copied verbatim
// from technical-spec.md (clarifications.md: "It is data, not prose invented at implementation
// time"). Consumed by components/kudos/kudos-card.tsx (Phase 4).

export interface StarTier {
  stars: 0 | 1 | 2 | 3;
  tooltip: string;
}

const TIER_1_TOOLTIP =
  'Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung quanh.';
const TIER_2_TOOLTIP =
  'Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động lan tỏa tích cực mỗi ngày.';
const TIER_3_TOOLTIP =
  'Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*.';

const NO_TIER: StarTier = { stars: 0, tooltip: '' };

/**
 * Pure threshold lookup — no star below 10, 1 star at [10,20), 2 stars at [20,50), 3 stars
 * at 50+. A negative or non-finite input (defensive: this is static data today, but the
 * function is a public export) falls back to the zero tier rather than throwing.
 */
export function starTierFor(kudosReceived: number): StarTier {
  if (!Number.isFinite(kudosReceived) || kudosReceived < 0) return NO_TIER;
  if (kudosReceived >= 50) return { stars: 3, tooltip: TIER_3_TOOLTIP };
  if (kudosReceived >= 20) return { stars: 2, tooltip: TIER_2_TOOLTIP };
  if (kudosReceived >= 10) return { stars: 1, tooltip: TIER_1_TOOLTIP };
  return NO_TIER;
}
