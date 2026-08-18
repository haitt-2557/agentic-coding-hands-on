'use client';

// R4 Awards grid (Hệ thống giải thưởng) — BR-004 responsive grid: 3 columns desktop,
// 2 columns tablet AND mobile (frame + TC ID-16 win over the stale English "3/2/1" CSV row).

import { useI18n } from '@/lib/i18n/locale-provider';
import { AWARDS } from '@/lib/awards';
import { AwardCard } from './award-card';

export function AwardsSection() {
  const { t } = useI18n();

  return (
    <section className="mx-auto flex w-full max-w-[1512px] flex-col gap-8 px-6 py-20 sm:px-16 lg:px-36">
      <div className="flex flex-col gap-4 border-b border-divider pb-8">
        <p className="text-2xl font-bold text-white">{t('awards.caption')}</p>
        <h2 className="text-4xl font-bold tracking-tight text-accent sm:text-5xl lg:text-[57px] lg:leading-[64px]">
          {t('awards.heading')}
        </h2>
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-3 lg:gap-x-20">
        {AWARDS.map((award) => (
          <AwardCard key={award.slug} award={award} />
        ))}
      </ul>
    </section>
  );
}
