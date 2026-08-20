'use client';

// mms_3_Keyvisual + Bìa/KV Frame 482 — small awards-page hero: full-bleed wave background +
// ROOT FURTHER logo only, no countdown/event-info/CTA row (clarifications.md "the hero
// keyvisual is the existing artwork" — a smaller hero is built rather than adding variant
// props to HeroKeyvisual, YAGNI). `preload` replaces the deprecated `priority` prop for LCP
// hero images (Next 16).
// mm:313:8437
// mm:2789:12915

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';

export function AwardsHero() {
  const { t } = useI18n();

  return (
    // mm:313:8437
    <section className="relative isolate w-full overflow-hidden">
      <Image
        src="/saa/Keyvisual_BG.png"
        alt=""
        aria-hidden="true"
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-background" />
      <div className="mx-auto flex max-w-[1512px] flex-col px-6 pb-10 pt-14 sm:px-16 lg:px-36">
        {/* mm:313:8451 (Frame 482 1152x150) / mm:2789:12915 */}
        <Image
          src="/saa/Root_Further_Logo.png"
          alt={t('hero.title')}
          width={451}
          height={200}
          preload
          className="h-auto w-64 sm:w-80 lg:w-[397px]"
        />
      </div>
    </section>
  );
}
