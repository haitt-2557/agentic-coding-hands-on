// D.Danh sách giải thưởng — maps AWARDS to AwardDetailCard in order (BR-001, never a second
// list). Plain server component; the alternating-side behavior lives in AwardDetailCard.
// mm:313:8466

import { AWARDS } from '@/lib/awards';
import { AwardDetailCard } from './award-detail-card';

export function AwardDetailList() {
  return (
    // mm:313:8466
    <div className="flex w-full min-w-0 flex-col gap-16 lg:gap-20">
      {AWARDS.map((award, index) => (
        <AwardDetailCard key={award.slug} award={award} index={index} />
      ))}
    </div>
  );
}
