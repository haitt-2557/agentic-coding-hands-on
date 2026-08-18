'use client';

// R6 Quick-action widget (mms_6_Widget Button) — fixed floating trigger, always visible
// while scrolling. FR-019: exactly the two options the design's two icons depict
// (clarifications — nothing invented beyond what the frame shows).
// mm:I5022:15169;214:3839;186:1763
// mm:I5022:15169;214:3839;186:1766;214:3762

import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/locale-provider';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

export function QuickActionWidget() {
  const { t } = useI18n();
  return (
    <div className="fixed right-4 top-1/2 z-30 -translate-y-1/2 sm:right-5">
      <DropdownMenu
        align="right"
        menuLabel="Quick actions"
        trigger={(triggerProps) => (
          <button
            type="button"
            {...triggerProps}
            aria-label="Quick action widget"
            className="saa-glow flex items-center gap-2 rounded-full bg-accent px-4 py-4 text-accent-foreground"
          >
            <Image src="/saa/Pen.svg" alt="" width={24} height={24} aria-hidden="true" />
            <span aria-hidden="true">/</span>
            <Image
              src="/saa/Widget_Kudos_Logo.svg"
              alt=""
              width={20}
              height={19}
              aria-hidden="true"
              className="h-auto w-5"
            />
          </button>
        )}
      >
        {({ close }) => (
          <div className="flex w-48 flex-col text-sm font-bold text-white">
            <Link
              href="/kudos"
              role="menuitem"
              onClick={close}
              className="px-4 py-2 hover:bg-secondary-button-bg"
            >
              {t('widget.writeKudos')}
            </Link>
            <Link
              href="/awards"
              role="menuitem"
              onClick={close}
              className="px-4 py-2 hover:bg-secondary-button-bg"
            >
              {t('widget.aboutSaa')}
            </Link>
          </div>
        )}
      </DropdownMenu>
    </div>
  );
}
