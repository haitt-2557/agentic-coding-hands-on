'use client';

// R1 Header (mms_A1_Header) — sticky top nav. FR-009/FR-010: logo scrolls to top of `/`,
// nav links go to `/awards` / `/kudos`. "About SAA 2025" is the current-page indicator
// (frame's selected-state nav item), not a cross-page link.
// mm:I2167:9091;178:1033;178:1030

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/locale-provider';
import { AccountMenu } from '@/components/ui/account-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationBell } from '@/components/ui/notification-bell';

export function SiteHeader() {
  const { t } = useI18n();

  function handleLogoClick() {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-6 bg-header-bg px-6 py-3 lg:px-36">
      <div className="flex items-center gap-8 sm:gap-16">
        <Link href="/" onClick={handleLogoClick} className="block h-12 w-[52px] shrink-0">
          <Image
            src="/saa/Logo.png"
            alt="Sun* Annual Awards 2025"
            width={52}
            height={48}
            className="h-full w-full object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/"
            onClick={handleLogoClick}
            aria-current="page"
            className="rounded border-b-2 border-accent px-4 py-2 text-sm font-bold tracking-wide text-accent [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]"
          >
            {t('nav.about')}
          </Link>
          <Link
            href="/awards"
            className="rounded px-4 py-2 text-sm font-bold tracking-wide text-white hover:bg-secondary-button-bg"
          >
            {t('nav.awards')}
          </Link>
          <Link
            href="/kudos"
            className="rounded px-4 py-2 text-sm font-bold tracking-wide text-white hover:bg-secondary-button-bg"
          >
            {t('nav.kudos')}
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <NotificationBell />
        <AccountMenu />
      </div>
    </header>
  );
}
