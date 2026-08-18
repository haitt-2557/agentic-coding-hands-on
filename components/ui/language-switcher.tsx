'use client';

// FR-002/FR-015 + BR-006 — VN/EN language switcher. Exactly two options (YAGNI — no
// extra locales until requested). Built on the shared SM-001 dropdown primitive.
// mm:I2167:9091;186:1696;186:1821;186:1709;178:1010
// mm:I2167:9091;186:1696;186:1821;186:1441

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';
import { DropdownMenu } from './dropdown-menu';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const options = [
    { code: 'vi' as const, label: t('language.optionVi'), flag: '/saa/Flag_VN.svg' },
    { code: 'en' as const, label: t('language.optionEn'), flag: undefined },
  ];
  const current = options.find((option) => option.code === locale) ?? options[0];

  return (
    <DropdownMenu
      align="right"
      menuLabel="Language"
      trigger={(triggerProps, open) => (
        <button
          type="button"
          {...triggerProps}
          className="flex items-center gap-0.5 rounded p-2 text-base font-bold tracking-wide text-white hover:bg-secondary-button-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {current.flag && (
            <Image
              src={current.flag}
              alt=""
              width={20}
              height={15}
              aria-hidden="true"
              className="h-auto w-5"
            />
          )}
          <span>{current.label}</span>
          <Image
            src="/saa/Down.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
            className={open ? 'rotate-180' : undefined}
          />
        </button>
      )}
    >
      {({ close }) => (
        <>
          {options.map((option) => (
            <button
              key={option.code}
              type="button"
              role="menuitem"
              onClick={() => {
                setLocale(option.code);
                close();
              }}
              aria-current={option.code === locale ? 'true' : undefined}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-bold text-white hover:bg-secondary-button-bg"
            >
              {option.label}
            </button>
          ))}
        </>
      )}
    </DropdownMenu>
  );
}
