'use client';

// mms_B.1 (design/kudos-content.md §3.1–§3.2) — HIGHLIGHT KUDOS section header (subtitle,
// divider, <h2>) plus the two filter dropdowns, built on the shared SM-001 DropdownMenu
// primitive (dom-contract.md F19 — no second dropdown primitive, DRY). F20: each trigger keeps
// its literal `Hashtag` / `Phòng ban` text and renders the selection as a suffix, never a
// replacement, so `button:has-text(...)` keeps matching after a selection is made. F21: option
// order is static, data order from lib/kudos/filters.ts, `Tất cả` last, single-select.
// mm:2940:13452

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { HASHTAG_OPTIONS, DEPARTMENT_OPTIONS, CLEAR_OPTION_LABEL } from '@/lib/kudos/filters';
import type { KudosFilter } from '@/lib/kudos/kudos-queries';

interface KudosFilterBarProps {
  filter: KudosFilter;
  onFilterChange: (next: KudosFilter) => void;
}

interface FilterDropdownProps {
  label: string;
  options: readonly string[];
  value: string | null;
  onSelect: (next: string | null) => void;
}

/** One filter trigger + its menu (F19–F22). Shared shape for both Hashtag and Phòng ban. */
function FilterDropdown({ label, options, value, onSelect }: FilterDropdownProps) {
  const triggerLabel = value ? `${label}: ${value}` : label;

  return (
    <DropdownMenu
      menuLabel={label}
      trigger={(triggerProps, open) => (
        // mm:2940:13459 / mm:2940:13460
        <button
          type="button"
          {...triggerProps}
          className="flex items-center justify-center gap-2 rounded border border-border-accent bg-secondary-button-bg px-4 py-4 text-base leading-6 font-bold tracking-[0.15px] whitespace-nowrap text-white"
        >
          {triggerLabel}
          {/* mm:I2940:13459;186:2761 / mm:I2940:13460;186:2761 */}
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
              key={option}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect(option === CLEAR_OPTION_LABEL ? null : option);
                close();
              }}
              className="block w-full px-4 py-2 text-left text-sm font-bold text-white hover:bg-secondary-button-bg"
            >
              {option}
            </button>
          ))}
        </>
      )}
    </DropdownMenu>
  );
}

export function KudosFilterBar({ filter, onFilterChange }: KudosFilterBarProps) {
  const { t } = useI18n();

  return (
    // mm:2940:13453
    <div className="flex w-full flex-col gap-4">
      {/* mm:2940:13454 */}
      <p className="text-lg leading-8 font-bold text-white sm:text-2xl">
        {t('kudosPage.sectionSubtitle')}
      </p>
      {/* mm:2940:13455 */}
      <div className="h-px w-full bg-divider" />
      {/* mm:2940:13456 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* mm:2940:13457 */}
        <h2 className="text-[32px] leading-[1.1] font-bold tracking-[-0.25px] text-accent sm:text-[57px] sm:leading-[64px]">
          {t('kudosPage.highlightHeading')}
        </h2>
        {/* mm:2940:13458 */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label={t('kudosPage.filterHashtagLabel')}
            options={HASHTAG_OPTIONS}
            value={filter.hashtag}
            onSelect={(next) => onFilterChange({ ...filter, hashtag: next })}
          />
          <FilterDropdown
            label={t('kudosPage.filterDepartmentLabel')}
            options={DEPARTMENT_OPTIONS}
            value={filter.department}
            onSelect={(next) => onFilterChange({ ...filter, department: next })}
          />
        </div>
      </div>
    </div>
  );
}
