'use client';

// FR-002/FR-015 + BR-006 — VN/EN language switcher. Exactly two options (YAGNI — no
// extra locales until requested). Built on the shared SM-001 dropdown primitive, with a
// design-specific `menuClassName` panel chrome (mm:525:11713 — never shared with the
// account menu / notification bell / quick-action widget, see clarifications.md).
// mm:I525:11713;362:6085 — selected row (mm:186:1937 content frame, mm:186:1709 icon slot)
// mm:I525:11713;362:6128 — unselected row
// mm:186:1439 — label (Montserrat 700 16px)
// mm:178:1010 — VN flag · mm:178:946 — EN Union Flag

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';
import { DropdownMenu } from './dropdown-menu';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const options = [
    { code: 'vi' as const, label: t('language.optionVi'), flag: '/saa/Flag_VN.svg' },
    { code: 'en' as const, label: t('language.optionEn'), flag: '/saa/Flag_EN.svg' },
  ];
  const current = options.find((option) => option.code === locale) ?? options[0];

  return (
    <DropdownMenu
      align="right"
      menuLabel="Language"
      menuClassName="w-fit rounded-[8px] border border-border-accent bg-kudos-sidebar-bg p-[6px] mt-2"
      trigger={(triggerProps, open) => (
        <button
          type="button"
          {...triggerProps}
          className="flex items-center gap-1 rounded p-2 text-base font-bold leading-6 tracking-[0.15px] text-white hover:bg-secondary-button-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Image
            src={current.flag}
            alt=""
            width={20}
            height={15}
            aria-hidden="true"
            className="h-[15px] w-5"
          />
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
        <div className="flex flex-col">
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
              className={`flex h-14 w-[110px] items-center justify-center gap-1 rounded-[2px] text-center text-base font-bold leading-6 tracking-[0.15px] text-white hover:bg-secondary-button-bg ${
                option.code === locale ? 'bg-language-row-selected-bg' : ''
              }`}
            >
              <span className="flex size-6 items-center justify-center">
                <Image
                  src={option.flag}
                  alt=""
                  width={20}
                  height={15}
                  aria-hidden="true"
                  className="h-[15px] w-5"
                />
              </span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </DropdownMenu>
  );
}
