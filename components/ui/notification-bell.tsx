'use client';

// FR-016 + BR-007/BR-008 — notification bell. Hidden entirely for `guest` (BR-007).
// Badge only renders when `unreadCount > 0` (BR-008). Panel has no real notification
// data yet (clarifications) — a fixed empty state is shown regardless of unread count.
// mm:I2167:9091;186:2101;186:2020;186:1420

import Image from 'next/image';
import { useSession } from '@/lib/session/session-provider';
import { useI18n } from '@/lib/i18n/locale-provider';
import { DropdownMenu } from './dropdown-menu';

export function NotificationBell() {
  const { role, unreadCount } = useSession();
  const { t } = useI18n();
  if (role === 'guest') return null;

  return (
    <DropdownMenu
      align="right"
      menuLabel="Notifications"
      trigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          aria-label="Notification"
          className="relative flex h-10 w-10 items-center justify-center rounded hover:bg-secondary-button-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Image src="/saa/Notification.svg" alt="" width={24} height={24} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              role="status"
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-badge-danger px-1 text-[10px] font-bold leading-none text-white"
            >
              {unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {() => (
        <div className="w-72 px-4 py-3 text-sm text-white">
          <p className="mb-2 font-bold">{t('notification.title')}</p>
          <p className="text-white/70">{t('notification.empty')}</p>
        </div>
      )}
    </DropdownMenu>
  );
}
