'use client';

// mms_B.6/B.7 — SPOTLIGHT BOARD region: subtitle/divider/heading, the 1157x548 bordered
// board and its three interactive children (search, name cloud, ticker). Owns `searchTerm`
// as local state — this region shares no state with the rest of the page (dom-contract.md
// §12: SpotlightBoard "owns its own search term; no shared filter").
//
// Background artwork (design/kudos-content.md §4.2): two of the three layers (`image 25`
// mm:2940:14181, `Root further mo rong 1` mm:2940:14173) are recorded as genuinely
// unfetchable — no working export path via any MoMorph tool for this run. The third
// (`image 24` mm:2940:14178) carries no background URL in the design data at all. Per
// clarifications, the honest result is the board's own border/radius over the page ground
// (`--background`), with none of the three substituted by invented artwork.
// mm:2940:14170 (section) / 2940:14174 (board)

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/locale-provider';
import { BOARD_WIDTH, BOARD_HEIGHT, SPOTLIGHT_TOTAL_LABEL } from '@/lib/kudos/spotlight-names';
import { SpotlightSearch } from './spotlight-search';
import { SpotlightNameCloud } from './spotlight-name-cloud';
import { SpotlightTicker } from './spotlight-ticker';

/** design/kudos-content.md §4.3 — "388 KUDOS" at absolute (612, 1672), board origin (142, 1658). */
const TOTAL_LABEL_REL = { x: 470, y: 14 };
const TOTAL_LABEL_FONT_SIZE = 36;
const TOTAL_LABEL_LINE_HEIGHT = 44;

/**
 * Converts a design pixel value into a `cqw` unit scaled against the board's own inline
 * size (1157px at 1x). The board container below sets `container-type: inline-size`, so
 * every value expressed this way keeps its design ratio as the board shrinks toward the
 * 375px floor — a rendering technique, not a second, invented set of numbers.
 */
function cqw(px: number): string {
  return `${(px / BOARD_WIDTH) * 100}cqw`;
}

export function SpotlightBoard() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    // mm:2940:14170
    <section className="w-full bg-background">
      <div className="mx-auto flex w-full max-w-[1157px] flex-col gap-4 px-4 py-10 sm:px-6">
        {/* mm:2940:13477 */}
        <p className="text-[18px] leading-[24px] font-bold text-white sm:text-[24px] sm:leading-[32px]">
          {t('kudosPage.sectionSubtitle')}
        </p>
        {/* mm:2940:13478 */}
        <div className="h-px w-full bg-divider" />
        {/* mm:2940:13480 */}
        <h2 className="text-[32px] leading-[1.1] font-bold tracking-[-0.25px] text-accent sm:text-[57px] sm:leading-[64px]">
          {t('kudosPage.spotlightHeading')}
        </h2>

        {/* mm:2940:14174 — position:relative makes this the cloud's coordinate space */}
        <div
          className="relative mt-2 w-full [container-type:inline-size]"
          style={{
            aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
            border: '1px solid var(--border-accent)',
            borderRadius: cqw(47.14),
          }}
        >
          {/* mm:3007:17482 */}
          <p
            className="absolute font-bold whitespace-nowrap text-white"
            style={{
              left: `${(TOTAL_LABEL_REL.x / BOARD_WIDTH) * 100}%`,
              top: `${(TOTAL_LABEL_REL.y / BOARD_HEIGHT) * 100}%`,
              fontSize: cqw(TOTAL_LABEL_FONT_SIZE),
              lineHeight: cqw(TOTAL_LABEL_LINE_HEIGHT),
            }}
          >
            {SPOTLIGHT_TOTAL_LABEL}
          </p>

          <SpotlightSearch value={searchTerm} onChange={setSearchTerm} />
          <SpotlightNameCloud searchTerm={searchTerm} />
          <SpotlightTicker />
        </div>
      </div>
    </section>
  );
}
