'use client';

// R5 Sun* Kudos promo (mms_D1_Sunkudos) — FR-018: "Chi tiết" navigates to `/kudos`. All copy,
// including the badge label and long-form body paragraph, comes from the shared dictionary
// (`kudos.*` in `lib/i18n/dictionaries/{vi,en}.ts`) so it follows the language switcher.
// mm:I3390:10349;313:8416
// mm:I3390:10349;313:8426;186:1766
// mm:I3390:10349;329:2948

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/locale-provider';

export function KudosSection() {
  const { t } = useI18n();

  return (
    <section className="mx-auto w-full max-w-[1512px] px-6 pb-20 sm:px-16 lg:px-36">
      <div className="relative flex w-full flex-col items-start gap-8 overflow-hidden rounded-2xl bg-[#0F0F0F] p-8 sm:p-14 lg:flex-row lg:items-center lg:justify-between lg:p-20">
        <Image
          src="/saa/Kudos_Background.png"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover"
        />
        <div className="relative flex max-w-xl flex-col items-start gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-2xl font-bold text-white">{t('kudos.label')}</p>
            <h2 className="text-4xl font-bold tracking-tight text-accent sm:text-5xl lg:text-[57px] lg:leading-[64px]">
              {t('kudos.title')}
            </h2>
            <p className="text-base font-bold text-white">
              <span className="block">{t('kudos.badge')}</span>
              {t('kudos.body')}
            </p>
          </div>
          <Link
            href="/kudos"
            className="saa-glow flex items-center gap-2 rounded bg-accent px-4 py-4 text-base font-bold text-accent-foreground hover:brightness-95"
          >
            {t('kudos.detailLink')}
            <Image src="/saa/Up.svg" alt="" width={24} height={24} aria-hidden="true" />
          </Link>
        </div>
        <Image
          src="/saa/Kudos_Wordmark.svg"
          alt="Sun* Kudos"
          width={364}
          height={74}
          className="relative h-auto w-56 self-center lg:w-[364px]"
        />
      </div>
    </section>
  );
}
