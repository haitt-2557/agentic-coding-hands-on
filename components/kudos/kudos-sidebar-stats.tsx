'use client';

// mms_D.1 (design/kudos-content.md §6.1) — sidebar stat rows: FR-013, dom-contract F39/F41.
// Frame is truth over the spec CSV's six rows: five verbatim labels, all value `25` (design
// defect #3/#14). D.1.4 additionally carries an inline heart + `x2` artwork and an 80px-wide
// value box (not 46px like the other rows) — the frame's own irregular layout, reproduced as
// drawn rather than normalised. The `Mở Secret Box` button is a real, focusable, inert trigger
// (FR-018) — frame wins over the spec CSV's `Mở quà` (design defect #2).
// FR-008 — row 3 ("Số tim bạn nhận được:") reads the real weighted like ledger for the signed-in
// viewer via `useLikes()` (components/kudos/likes-provider.tsx, computed in phase 03/04). The
// other four rows stay the static placeholder on purpose (clarifications decision 6).

import { Fragment } from 'react';
import Image from 'next/image';
import { buildStatRows } from '@/lib/kudos/viewer-stats';
import { useLikes } from '@/components/kudos/likes-provider';

// design/kudos-content.md §6.1 — D.1.4 "Số tim bạn nhận được:" is the third of five rows and the
// only one that inserts the heart+x2 artwork and the wider 80px value box.
const HEART_ROW_INDEX = 2;

export function KudosSidebarStats() {
  const { heartsReceived } = useLikes();
  const rows = buildStatRows(heartsReceived);

  return (
    // mm:2940:13489
    <div className="flex w-full flex-col gap-4 rounded-[17px] border border-border-accent bg-kudos-sidebar-bg p-6">
      {/* mm:2940:13490 */}
      <div className="flex w-full flex-col gap-4">
        {rows.map((row, index) => (
          <Fragment key={row.label}>
            {/* mm:2940:1349{1,2,3,6,7} */}
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-right text-[22px] leading-7 font-bold text-foreground">{row.label}</span>
              {index === HEART_ROW_INDEX ? (
                // mm:3241:14931
                <div className="flex items-center gap-1">
                  {/* mm:3241:14932 + mm:3241:14933 */}
                  <span className="relative inline-block h-10 w-[34px] shrink-0">
                    <Image src="/saa/Heart.svg" alt="" fill sizes="34px" className="object-contain" />
                    <span
                      className="absolute inset-x-0 bottom-1 text-center text-[17.538px] leading-[23.385px] font-bold text-foreground"
                      style={{ WebkitTextStroke: '1.04px #000' }}
                    >
                      x2
                    </span>
                  </span>
                  {/* mm:3241:14886 — 80px wide, wider than the other rows' 46px value box */}
                  <span className="w-20 text-right text-[32px] leading-10 font-bold text-accent">{row.value}</span>
                </div>
              ) : (
                <span className="w-[46px] text-right text-[32px] leading-10 font-bold text-accent">{row.value}</span>
              )}
            </div>
            {/* mm:2940:13494 */}
            {index === HEART_ROW_INDEX && <div className="h-px w-full bg-divider" />}
          </Fragment>
        ))}
      </div>
      {/* mm:2940:13497 */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent p-4 text-[22px] leading-7 font-bold text-background"
      >
        Mở Secret Box
        {/* mm:I2940:13497;186:1766 */}
        <Image src="/saa/Open_Gift.svg" alt="" width={24} height={24} aria-hidden="true" />
      </button>
    </div>
  );
}
