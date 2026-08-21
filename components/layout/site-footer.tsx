'use client';

// R7 Footer (mms_7_Footer) — logo + nav links + copyright. "Tiêu chuẩn chung" has no known
// destination (clarifications) — rendered as plain text, not a link, so it never 404s.
// dom-contract.md F9: the active nav item now derives from `usePathname()`, the same way
// site-header.tsx already does, and renders as a tinted `<span aria-current="page">` rather
// than an `<a>` — this is also what leaves exactly one `Sun* Kudos` link in the whole page
// (`page.getByRole('navigation').locator('a:has-text("Sun* Kudos")')` would otherwise match
// both the header and footer navs and fail on Playwright's strict mode). The previous
// hard-coded `aria-current="page"` on `/` and the hard-coded tint on `/awards` are both
// retired in favour of this single route-derived treatment (F10: verified safe — every
// `About SAA 2025` link assertion in e2e/ is scoped to `header`).
// mm:I5001:14800;342:1408;178:1030

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/locale-provider';

const ACTIVE_NAV_CLASSES =
  'rounded bg-secondary-button-bg px-4 py-2 text-sm font-bold tracking-wide text-white [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]';
const INACTIVE_NAV_CLASSES =
  'rounded px-4 py-2 text-sm font-bold tracking-wide text-white hover:bg-secondary-button-bg';

export function SiteFooter() {
  const { t } = useI18n();
  const pathname = usePathname();

  function handleScrollTop() {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const navItems = [
    { href: '/', label: t('nav.about'), onClick: handleScrollTop },
    { href: '/awards', label: t('nav.awards') },
    { href: '/kudos', label: t('nav.kudos') },
  ];

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
          {navItems.map((item) =>
            pathname === item.href ? (
              <span key={item.href} aria-current="page" className={ACTIVE_NAV_CLASSES}>
                {item.label}
              </span>
            ) : (
              <Link key={item.href} href={item.href} onClick={item.onClick} className={INACTIVE_NAV_CLASSES}>
                {item.label}
              </Link>
            ),
          )}
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
