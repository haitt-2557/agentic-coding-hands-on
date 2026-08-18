'use client';

// R7 Footer (mms_7_Footer) — logo + nav links + copyright. "Tiêu chuẩn chung" has no known
// destination (clarifications) — rendered as plain text, not a link, so it never 404s.
// mm:I5001:14800;342:1408;178:1030

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/locale-provider';

export function SiteFooter() {
  const { t } = useI18n();

  function handleScrollTop() {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  return (
    <footer className="flex w-full flex-col items-center gap-6 border-t border-divider px-6 py-10 sm:flex-row sm:justify-between sm:px-16 lg:px-[90px]">
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
        <Link href="/" onClick={handleScrollTop} className="block h-16 w-[69px] shrink-0">
          <Image
            src="/saa/Logo.png"
            alt="Sun* Annual Awards 2025"
            width={69}
            height={64}
            className="h-full w-full object-contain"
          />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            onClick={handleScrollTop}
            aria-current="page"
            className="rounded px-4 py-2 text-sm font-bold tracking-wide text-white"
          >
            {t('nav.about')}
          </Link>
          <Link
            href="/awards"
            className="rounded bg-secondary-button-bg px-4 py-2 text-sm font-bold tracking-wide text-white [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] hover:bg-secondary-button-bg/70"
          >
            {t('nav.awards')}
          </Link>
          <Link
            href="/kudos"
            className="rounded px-4 py-2 text-sm font-bold tracking-wide text-white hover:bg-secondary-button-bg"
          >
            {t('nav.kudos')}
          </Link>
          <span className="rounded px-4 py-2 text-sm font-bold tracking-wide text-white/60">
            {t('footer.generalStandards')}
          </span>
        </nav>
      </div>
      <p className="font-alt text-center text-sm font-bold text-white">
        {t('footer.copyright')}
      </p>
    </footer>
  );
}
