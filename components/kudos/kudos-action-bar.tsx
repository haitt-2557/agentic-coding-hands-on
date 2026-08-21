'use client';

// mms_Button chuc nang (design/kudos-content.md §2) — submit pill (read-only trigger for the
// deferred kudos submit dialog, FR-015) + Sunner search (functionality deferred — profile
// pages have no frame of their own, clarifications.md "Triggers real, destinations deferred").
// Owns its own sibling <section> (F2/F5) — never inside the banner. dom-contract.md F11: the
// submit pill must stay visible, enabled and focusable with its verbatim placeholder (leading
// + 3 trailing spaces, never trimmed).
// mm:2940:13448

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';

export function KudosActionBar() {
  const { t } = useI18n();

  return (
    // mm:2940:13448
    <section className="flex w-full flex-col gap-4 px-6 py-6 sm:flex-row sm:px-16 lg:px-36">
      {/* mm:2940:13449 */}
      <div className="flex w-full items-center gap-4 rounded-[68px] border border-border-accent bg-secondary-button-bg px-4 py-6 sm:flex-1 lg:w-[738px] lg:flex-none">
        {/* mm:I2940:13449;186:2759 */}
        <Image src="/saa/Pen.svg" alt="" width={24} height={24} aria-hidden="true" />
        {/* mm:I2940:13449;186:2760 */}
        <input
          readOnly
          aria-haspopup="dialog"
          placeholder={t('kudosPage.submitPillPlaceholder')}
          className="w-full bg-transparent text-center text-base leading-6 font-bold tracking-[0.15px] text-white placeholder:text-white focus:outline-none"
        />
      </div>
      {/* mm:2940:13450 */}
      <div className="flex w-full items-center gap-4 rounded-[68px] border border-border-accent bg-secondary-button-bg px-4 py-6 sm:w-[381px]">
        {/* mm:I2940:13450;186:2759 */}
        <Image src="/saa/Search.svg" alt="" width={24} height={24} aria-hidden="true" />
        {/* mm:I2940:13450;186:2760 */}
        <input
          placeholder={t('kudosPage.sunnerSearchPlaceholder')}
          className="w-full bg-transparent text-center text-base leading-6 font-bold tracking-[0.15px] text-white placeholder:text-white focus:outline-none"
        />
      </div>
    </section>
  );
}
