'use client';

// FR-011 — hero CTA pair (mms_B3_Call-To-Action). Rendered with `role="button"` since
// the frame styles these as buttons even though they navigate (Next Link renders `<a>`).
// mm:I2167:9063;186:1766
// mm:I2167:9064;186:2761

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/locale-provider';

export function HeroCta() {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href="/awards"
        role="button"
        className="saa-glow flex items-center gap-2 rounded-lg bg-accent px-6 py-4 text-lg font-bold text-accent-foreground hover:brightness-95"
      >
        {t('hero.ctaAwards')}
        <Image src="/saa/Up.svg" alt="" width={24} height={24} aria-hidden="true" />
      </Link>
      <Link
        href="/kudos"
        role="button"
        className="flex items-center gap-2 rounded-lg border border-border-accent bg-secondary-button-bg px-6 py-4 text-lg font-bold text-white hover:bg-secondary-button-bg/70"
      >
        {t('hero.ctaKudos')}
        <Image src="/saa/Up.svg" alt="" width={24} height={24} aria-hidden="true" />
      </Link>
    </div>
  );
}
