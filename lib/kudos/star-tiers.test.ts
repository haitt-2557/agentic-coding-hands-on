import { test, expect } from '@playwright/test';
import { starTierFor } from './star-tiers';

// BR-005_TangHangSaoTheoSoKudosNhanDuoc — threshold table: 1 star at 10, 2 at 20, 3 at 50.
// Tooltip text is frozen data from technical-spec.md, copied verbatim.

test.describe('starTierFor', () => {
  test('below 10 kudos received yields no star and no tooltip', () => {
    expect(starTierFor(0)).toEqual({ stars: 0, tooltip: '' });
    expect(starTierFor(9)).toEqual({ stars: 0, tooltip: '' });
  });

  test('10-19 kudos received yields exactly 1 star with the tier-1 tooltip', () => {
    const tier1 = starTierFor(10);
    expect(tier1.stars).toBe(1);
    expect(tier1.tooltip).toBe(
      'Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung quanh.',
    );
    expect(starTierFor(19)).toEqual(tier1);
  });

  test('20-49 kudos received yields exactly 2 stars with the tier-2 tooltip', () => {
    const tier2 = starTierFor(20);
    expect(tier2.stars).toBe(2);
    expect(tier2.tooltip).toBe(
      'Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động lan tỏa tích cực mỗi ngày.',
    );
    expect(starTierFor(49)).toEqual(tier2);
  });

  test('50+ kudos received yields exactly 3 stars with the tier-3 tooltip', () => {
    const tier3 = starTierFor(50);
    expect(tier3.stars).toBe(3);
    expect(tier3.tooltip).toBe(
      'Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*.',
    );
    expect(starTierFor(1000)).toEqual(tier3);
  });

  test('rejects a negative or non-finite input defensively, returning the zero tier', () => {
    expect(starTierFor(-5)).toEqual({ stars: 0, tooltip: '' });
    expect(starTierFor(Number.NaN)).toEqual({ stars: 0, tooltip: '' });
  });
});
