'use client';

// mms_B.2/B.5 (design/kudos-content.md §3.3–§3.4) — the 3-of-5 carousel: track (role="group"),
// both arrow pairs sharing SM-001 state, the `n/total` indicator and the two gradient overlays
// that dim the side cards (dom-contract.md F18 — no invented opacity/scale/blur; the fade is
// two #00101A → transparent gradient frames, reproduced exactly as drawn per design/kudos-
// content.md §3.3). F16 is binding: only the 48px pagination pair may carry `prev`/`next` in its
// aria-label (English); the 80px overlay pair — design defect #5, both pairs are drawn so both
// are built and wired to the same state — gets Vietnamese labels containing none of those four
// substrings, or the two pairs would be a strict-mode ambiguity for every Playwright locator.
// SM-001: page ∈ 1..total, total = filtered.length (no padding, F13); a filter change resets
// page to 1 (BR-003/DEC-001) via the effect below, following the same "sync state to a changed
// prop" pattern (and its matching lint suppression) already used by session-provider.tsx and
// kudos-toast.tsx.
//
// Slide width is a CSS custom property (`--slide-w`/`--slide-gap`), not a JS pixel constant:
// below the design's 1440 frame width there is no mobile frame, so each slide fills 100% of the
// carousel viewport (a real 1-up slide, not a clipped 528px one — the fix for the 375px
// page-level horizontal-scroll defect Phase 8 measured, `scrollWidth` 704 vs `clientWidth` 375).
// At >= 1440px the custom properties resolve back to the frame's exact 528px card / 24px gap,
// so the `translateX` formula below is byte-identical to before at the design width — nothing
// about the desktop 3-up layout or its centering math changes.
// mm:2940:13463 (track) / mm:2940:13471 (pagination)

import { useEffect, useState } from 'react';
import type { KudosRecord } from '@/lib/kudos/kudos-records';
import type { KudosFilter } from '@/lib/kudos/kudos-queries';
import { useI18n } from '@/lib/i18n/locale-provider';
import { KudosCard } from './kudos-card';

// Tailwind arbitrary properties: `--slide-w`/`--slide-gap` default to a full-bleed 1-up slide,
// then switch to the frame's exact 528/24 at the design's own 1440px width (no default Tailwind
// breakpoint sits at 1440, so this uses an arbitrary `min-[1440px]:` variant rather than `lg:`).
const TRACK_RESPONSIVE_VARS =
  '[--slide-w:100%] [--slide-gap:0px] min-[1440px]:[--slide-w:528px] min-[1440px]:[--slide-gap:24px]';

interface HighlightCarouselProps {
  records: KudosRecord[];
  filter: KudosFilter;
  viewerId: string;
  onHashtagClick: (hashtag: string) => void;
}

/** mm:I2940:13470;186:1420 / mm:I2940:13468;186:1420 / mm:I2940:13472;186:1420 / mm:I2940:13474;186:1420 */
function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  const d =
    direction === 'left'
      ? 'M15.41 16.58L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.58Z'
      : 'M8.58 16.48L13.16 11.9L8.58 7.31L9.99 5.9L15.99 11.9L9.99 17.9L8.58 16.48Z';
  return (
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function HighlightCarousel({ records, filter, viewerId, onHashtagClick }: HighlightCarouselProps) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const total = records.length;

  useEffect(() => {
    // BR-003/DEC-001: any filter change resets the carousel to page 1.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [filter.hashtag, filter.department]);

  if (total === 0) {
    return (
      <p className="w-full py-10 text-center text-lg font-bold text-white">
        {t('kudosPage.emptyState')}
      </p>
    );
  }

  const canPrev = page > 1;
  const canNext = page < total;
  const goPrev = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () => setPage((current) => Math.min(total, current + 1));

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* mm:2940:13461 — viewport */}
      <div className="relative w-full overflow-hidden">
        {/* mm:2940:13463 — track */}
        <div
          role="group"
          className={`flex items-center ${TRACK_RESPONSIVE_VARS}`}
          style={{
            gap: 'var(--slide-gap)',
            transform: `translateX(calc(50% - var(--slide-w) / 2 - ${page - 1} * (var(--slide-w) + var(--slide-gap))))`,
          }}
        >
          {records.map((record) => (
            <div key={record.id} className="shrink-0" style={{ width: 'var(--slide-w)' }}>
              <KudosCard
                record={record}
                variant="highlight"
                viewerId={viewerId}
                onHashtagClick={onHashtagClick}
              />
            </div>
          ))}
        </div>

        {/* mm:2940:13469 — left gradient overlay + 80px prev (B.2.1) */}
        <div
          aria-hidden={false}
          className="pointer-events-none absolute inset-y-0 left-0 flex w-[25%] min-w-16 items-center justify-start pl-3 min-[1440px]:min-w-25 min-[1440px]:pl-10"
          style={{ background: 'linear-gradient(90deg, #00101A 50%, rgba(255,255,255,0) 100%)' }}
        >
          {/* mm:2940:13470 */}
          <button
            type="button"
            aria-label="Lùi một thẻ Kudos"
            disabled={!canPrev}
            onClick={goPrev}
            className="pointer-events-auto flex h-16 w-16 shrink-0 items-center justify-center rounded p-2 text-white disabled:opacity-30 min-[1440px]:h-20 min-[1440px]:w-20"
          >
            <ArrowIcon direction="left" />
          </button>
        </div>
        {/* mm:2940:13467 — right gradient overlay + 80px next (B.2.2) */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-[25%] min-w-16 items-center justify-end pr-3 min-[1440px]:min-w-25 min-[1440px]:pr-10"
          style={{ background: 'linear-gradient(270deg, #00101A 50%, rgba(255,255,255,0) 100%)' }}
        >
          {/* mm:2940:13468 */}
          <button
            type="button"
            aria-label="Tiến một thẻ Kudos"
            disabled={!canNext}
            onClick={goNext}
            className="pointer-events-auto flex h-16 w-16 shrink-0 items-center justify-center rounded p-2 text-white disabled:opacity-30 min-[1440px]:h-20 min-[1440px]:w-20"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      {/* mm:2940:13471 — pagination row */}
      <div className="flex items-center gap-8">
        {/* mm:2940:13472 */}
        <button
          type="button"
          aria-label="Previous slide"
          disabled={!canPrev}
          onClick={goPrev}
          className="flex h-12 w-12 items-center justify-center rounded p-2 text-muted-text disabled:opacity-30"
        >
          <ArrowIcon direction="left" />
        </button>
        {/* mm:2940:13473 */}
        <span className="text-[28px] leading-9 font-bold text-muted-text">{`${page}/${total}`}</span>
        {/* mm:2940:13474 */}
        <button
          type="button"
          aria-label="Next slide"
          disabled={!canNext}
          onClick={goNext}
          className="flex h-12 w-12 items-center justify-center rounded p-2 text-muted-text disabled:opacity-30"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  );
}
