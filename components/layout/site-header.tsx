'use client';

// R1 Header (mms_A1_Header) — sticky top nav. FR-009/FR-010: logo scrolls to top of `/`,
// nav links go to `/awards` / `/kudos`. FR-002: the current-page indicator now derives from
// the route via `usePathname()` — "About SAA 2025" is active on `/`, "Award Information" is
// active on `/awards` (clarifications.md "header nav current-page state moves"); both stay
// visible cross-page links regardless of which one is current.
// mm:I2167:9091;178:1033;178:1030

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/locale-provider';
import { AccountMenu } from '@/components/ui/account-menu';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { NotificationBell } from '@/components/ui/notification-bell';

const ACTIVE_NAV_CLASSES =
  'rounded border-b-2 border-accent px-4 py-2 text-sm font-bold tracking-wide text-accent [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]';
const INACTIVE_NAV_CLASSES =
  'rounded px-4 py-2 text-sm font-bold tracking-wide text-white hover:bg-secondary-button-bg';

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();

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
            aria-current={pathname === '/' ? 'page' : undefined}
            className={pathname === '/' ? ACTIVE_NAV_CLASSES : INACTIVE_NAV_CLASSES}
          >
            {t('nav.about')}
          </Link>
          <Link
            href="/awards"
            aria-current={pathname === '/awards' ? 'page' : undefined}
            className={pathname === '/awards' ? ACTIVE_NAV_CLASSES : INACTIVE_NAV_CLASSES}
          >
            {t('nav.awards')}
          </Link>
          <Link href="/kudos" className={INACTIVE_NAV_CLASSES}>
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
