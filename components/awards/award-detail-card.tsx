'use client';

// mms_D.1..D.6 — one award detail section (image + content, alternating sides per BR-005).
// Image side: mm_media_Award-Thumb-Background (shared Award_BG.png) + per-award wordmark
// (Award.image), the same composite `components/home/award-card.tsx` already uses. Renders
// as a normal 'use client' component — Next SSRs it for the initial HTML same as any other,
// so the `id={award.slug}` anchor still lands in server-rendered markup (Phase 1 A12).
// mm:313:8467 (D.1) / 313:8468 (D.2) / 313:8469 (D.3) / 313:8470 (D.4) / 313:8471 (D.5) /
// 313:8510 (D.6)

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';
import type { Award } from '@/lib/awards';

interface AwardDetailCardProps {
  award: Award;
  index: number;
}

export function AwardDetailCard({ award, index }: AwardDetailCardProps) {
  const { t } = useI18n();
  const imageLeft = index % 2 === 0;

  return (
    // mm:313:8467 etc.
    <section id={award.slug} className="scroll-mt-24 border-b border-divider pb-10">
      <div
        className={`flex flex-col gap-10 lg:gap-20 ${imageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
      >
        {/* mm:214:2525 (Picture-Award instance) */}
        <div className="saa-glow relative aspect-square w-full max-w-[336px] shrink-0 self-center overflow-hidden rounded-3xl border border-accent lg:self-start">
          {/* mm:214:2525;81:2442 */}
          <Image
            src="/saa/Award_BG.png"
            alt=""
            fill
            aria-hidden="true"
            sizes="336px"
            className="object-cover mix-blend-screen"
          />
          {/* mm:214:2525;214:666 */}
          <Image
            src={award.image}
            alt={award.title}
            width={221}
            height={35}
            className="absolute inset-x-8 top-1/2 h-auto w-[calc(100%-4rem)] -translate-y-1/2"
          />
        </div>

        {/* mm:214:2526 (Content) */}
        <div className="flex w-full flex-col gap-6 lg:max-w-[480px]">
          {/* mm:214:2528 */}
          <h2 className="flex items-center gap-4 text-2xl font-bold text-accent">
            {/* mm:214:2529 */}
            <Image src="/saa/Target.svg" alt="" width={24} height={24} aria-hidden="true" />
            {award.title}
          </h2>
          {/* mm:214:2531 */}
          <div className="flex flex-col gap-4 text-justify text-base leading-6 font-bold tracking-[0.5px] text-white">
            {award.longDescription.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {/* mm:214:2532 */}
          <div className="h-px w-full bg-divider" />
          {/* mm:214:2533 quantity row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* mm:214:2535 (MM_MEDIA_Diamond) */}
            <Image src="/saa/Diamond.svg" alt="" width={24} height={24} aria-hidden="true" />
            {/* mm:214:2536 */}
            <span className="text-2xl font-bold text-accent">{t('awardsPage.quantityLabel')}</span>
            <span className="flex items-baseline gap-2">
              {/* mm:214:2538 */}
              <span className="text-4xl leading-[44px] font-bold text-white">
                {award.quantity.value}
              </span>
              {/* mm:214:3532 */}
              <span className="text-sm font-bold tracking-[0.1px] text-white">
                {award.quantity.unit}
              </span>
            </span>
          </div>
          {/* mm:214:2539 */}
          <div className="h-px w-full bg-divider" />
          {/* mm:214:2540 prize row(s) */}
          <div className="flex flex-col gap-4">
            {award.prizeLines.map((prize, prizeIndex) => (
              <div key={prize.amount} className="flex flex-col gap-4">
                {prizeIndex > 0 && (
                  // mm:313:8498 ("Hoặc" separator — Signature 2025 - Creator is the only
                  // award with two prize lines)
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-[0.1px] text-divider">
                      {t('awardsPage.prizeOr')}
                    </span>
                    <span className="h-px flex-1 bg-divider" />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-4">
                  {/* mm:214:2543 (MM_MEDIA_License) */}
                  <Image src="/saa/License.svg" alt="" width={24} height={24} aria-hidden="true" />
                  {/* mm:214:2544 */}
                  <span className="text-2xl font-bold text-accent">
                    {t('awardsPage.prizeLabel')}
                  </span>
                  {/* mm:214:2546 */}
                  <span className="text-4xl leading-[44px] font-bold text-white">
                    {prize.amount}
                  </span>
                </div>
                {prize.note && (
                  // mm:214:2547
                  <p className="text-sm font-bold tracking-[0.1px] text-white">{prize.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
