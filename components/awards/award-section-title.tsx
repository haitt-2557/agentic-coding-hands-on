'use client';

// mms_A_Title hệ thống giải thưởng — muted subtitle over a gold <h1>, divider between.
// Copy is a new pair of strings distinct from the homepage's `awards.heading`
// (clarifications.md "the section title block is a new pair of strings" — note the
// trailing "SAA 2025" the homepage heading does not have).
// mm:313:8453

import { useI18n } from '@/lib/i18n/locale-provider';

export function AwardSectionTitle() {
  const { t } = useI18n();

  return (
    // mm:313:8453
    <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-4 px-6 sm:px-16 lg:px-36">
      {/* mm:313:8454 */}
      <p className="text-center text-2xl font-bold text-white">{t('awardsPage.subtitle')}</p>
      {/* mm:313:8455 */}
      <div className="h-px w-full bg-divider" />
      {/* mm:313:8456 */}
      <div className="flex items-center justify-center py-4">
        {/* mm:313:8457 */}
        <h1 className="text-4xl font-bold tracking-tight text-accent sm:text-5xl lg:text-[57px] lg:leading-[64px]">
          {t('awardsPage.heading')}
        </h1>
      </div>
    </div>
  );
}
