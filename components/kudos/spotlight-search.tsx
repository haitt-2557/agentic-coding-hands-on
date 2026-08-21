'use client';

// mms_B.7.3 — spotlight search box, instance of `186:2757`. Filters/highlights matches in
// the name cloud via the parent's `searchTerm` state (spotlight-board.tsx). `maxLength={100}`
// and the verbatim placeholder `"Tìm kiếm "` (trailing space intact) are frozen by
// dom-contract.md F34 — this is the only `<input>` inside the SPOTLIGHT BOARD section.
//
// Design note: §4.4 records `padding: 16.378px 10.919px` on the 219x39 instance, but that
// vertical figure (16.378 top+bottom) does not reconcile with the 39px box height once the
// ~17px text row is added — it reads like it was extracted from a nested auto-layout node,
// not the outer instance. Rather than invent a corrected number, the vertical padding is
// dropped in favour of flex centering (which needs no numeric value of its own) and only
// the horizontal figure — a real, reconcilable design value — is kept as padding-inline.
// mm:2940:14833

import { useI18n } from '@/lib/i18n/locale-provider';
import { BOARD_WIDTH, BOARD_HEIGHT } from '@/lib/kudos/spotlight-names';

interface SpotlightSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/** design/kudos-content.md §4.4 — instance box at absolute (167, 1684), board origin (142, 1658). */
const SEARCH_REL = { x: 25, y: 26, width: 219, height: 39 };

function cqw(px: number): string {
  return `${(px / BOARD_WIDTH) * 100}cqw`;
}

export function SpotlightSearch({ value, onChange }: SpotlightSearchProps) {
  const { t } = useI18n();

  return (
    // mm:2940:14833
    <div
      className="absolute flex items-center gap-[5.459cqw] bg-secondary-button-bg"
      style={{
        left: `${(SEARCH_REL.x / BOARD_WIDTH) * 100}%`,
        top: `${(SEARCH_REL.y / BOARD_HEIGHT) * 100}%`,
        width: cqw(SEARCH_REL.width),
        height: cqw(SEARCH_REL.height),
        border: `${cqw(0.682)} solid var(--border-accent)`,
        borderRadius: cqw(46.404),
        paddingInline: cqw(10.919),
      }}
    >
      {/* mm:I2940:14833;186:2759 (MM_MEDIA_Search) */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-white"
        style={{ width: cqw(16), height: cqw(16) }}
      >
        <path
          d="M9.5 3C11.2239 3 12.8772 3.68482 14.0962 4.90381C15.3152 6.12279 16 7.77609 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16C7.77609 16 6.12279 15.3152 4.90381 14.0962C3.68482 12.8772 3 11.2239 3 9.5C3 7.77609 3.68482 6.12279 4.90381 4.90381C6.12279 3.68482 7.77609 3 9.5 3ZM9.5 5C7 5 5 7 5 9.5C5 12 7 14 9.5 14C12 14 14 12 14 9.5C14 7 12 5 9.5 5Z"
          fill="currentColor"
        />
      </svg>
      {/* mm:I2940:14833;186:2760 */}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={100}
        placeholder={t('kudosPage.spotlightSearchPlaceholder')}
        className="min-w-0 flex-1 bg-transparent font-medium text-white placeholder:text-white focus:outline-none"
        style={{ fontSize: cqw(10.919), lineHeight: cqw(16.378), letterSpacing: cqw(0.102) }}
      />
    </div>
  );
}
