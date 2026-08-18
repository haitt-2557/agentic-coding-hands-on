'use client';

// FR-017 + DISC-001 — account menu. Hidden entirely for `guest` (BR-007). Admin gets an
// extra "Admin Dashboard" item; the route itself is out of scope for this screen.
// mm:I2167:9091;186:1597;186:1420

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from '@/lib/session/session-provider';
import { useI18n } from '@/lib/i18n/locale-provider';
import { DropdownMenu } from './dropdown-menu';

export function AccountMenu() {
  const { role } = useSession();
  const { t } = useI18n();
  if (role === 'guest') return null;

  return (
    <DropdownMenu
      align="right"
      menuLabel="Account"
      trigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          aria-label="Account"
          className="flex h-10 w-10 items-center justify-center rounded border border-border-accent hover:bg-secondary-button-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Image src="/saa/User_Profile.svg" alt="" width={24} height={24} aria-hidden="true" />
        </button>
      )}
    >
      {({ close }) => (
        <div className="flex w-44 flex-col text-sm font-medium text-white">
          <Link
            href="/profile"
            role="menuitem"
            onClick={close}
            className="px-4 py-2 hover:bg-secondary-button-bg"
          >
            {t('account.profile')}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={close}
            className="px-4 py-2 text-left hover:bg-secondary-button-bg"
          >
            {t('account.signOut')}
          </button>
          {role === 'admin' && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={close}
              className="px-4 py-2 hover:bg-secondary-button-bg"
            >
              {t('account.adminDashboard')}
            </Link>
          )}
        </div>
      )}
    </DropdownMenu>
  );
}
