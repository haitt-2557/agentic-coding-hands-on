'use client';

// mms_B.7 ticker — six identical activity-log lines drawn at a 19px pitch (design/kudos-
// content.md §4.6). Five `3004:*` nodes are stacked duplicates of the original `2940:14230`
// layer; all six carry the same `SPOTLIGHT_TICKER_LINE` string (lib/kudos/spotlight-names.ts,
// Phase 3) and there is no spec CSV row for them — reproduced as drawn.

import { SPOTLIGHT_TICKER_LINE, BOARD_WIDTH, BOARD_HEIGHT } from '@/lib/kudos/spotlight-names';

/**
 * design/kudos-content.md §4.6 — x=191 absolute, board origin (142, 1658) -> relX 49.
 * relY values (board-relative), sorted ascending top-to-bottom, 19px pitch:
 * 3004:15999 -> 410, 3004:15998 -> 429, 3004:15997 -> 448, 3004:15996 -> 467,
 * 3004:15995 -> 486, 2940:14230 -> 505 (the original layer, lowest line).
 */
const TICKER_REL_X = 49;
const TICKER_REL_Y = [410, 429, 448, 467, 486, 505];
const TICKER_WIDTH = 565;
const TICKER_FONT_SIZE = 14;
const TICKER_LINE_HEIGHT = 20;

function cqw(px: number): string {
  return `${(px / BOARD_WIDTH) * 100}cqw`;
}

export function SpotlightTicker() {
  return (
    <>
      {TICKER_REL_Y.map((relY) => (
        // mm:ticker-line (3004:15995..15999 / 2940:14230)
        <p
          key={relY}
          className="absolute font-bold text-white"
          style={{
            left: `${(TICKER_REL_X / BOARD_WIDTH) * 100}%`,
            top: `${(relY / BOARD_HEIGHT) * 100}%`,
            width: cqw(TICKER_WIDTH),
            fontSize: cqw(TICKER_FONT_SIZE),
            lineHeight: cqw(TICKER_LINE_HEIGHT),
            letterSpacing: cqw(0.1),
          }}
        >
          {SPOTLIGHT_TICKER_LINE}
        </p>
      ))}
    </>
  );
}
