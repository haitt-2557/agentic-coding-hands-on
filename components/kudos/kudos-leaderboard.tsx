// mms_D.3 (design/kudos-content.md §6.3) — sidebar leaderboard: FR-014, dom-contract F40/F41/F43.
// Frame is truth over the spec CSV's second "thăng hạng" list, which has no node anywhere on
// this frame (design defect #1) — one leaderboard only, five rows. The title is rendered as a
// single text node containing a real newline with `whitespace-pre-line`, never `<br/>`: a
// `<br/>` would drop that whitespace from `textContent` and break the frozen `text=` locator
// (F40). The empty state comes solely from `leaderboardOrEmpty()` (F43, TC d662780b, closed at
// the unit level in lib/kudos/leaderboard.test.ts) — no second empty-state branch is added here.

import Image from 'next/image';
import { LEADERBOARD, LEADERBOARD_TITLE, leaderboardOrEmpty } from '@/lib/kudos/leaderboard';

export function KudosLeaderboard() {
  const rows = leaderboardOrEmpty(LEADERBOARD);

  return (
    // mm:2940:13510
    <div className="flex w-full flex-col gap-4 rounded-[17px] border border-border-accent bg-kudos-sidebar-bg py-6 pr-4 pl-6">
      {/* mm:2940:13513 */}
      <p className="whitespace-pre-line text-center text-[22px] leading-7 font-bold text-accent">
        {LEADERBOARD_TITLE}
      </p>
      {/* mm:2940:13514 */}
      <div className="flex w-full items-start gap-4">
        {/* mm:2940:13515 */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {typeof rows === 'string' ? (
            <p className="text-center text-base leading-6 font-bold text-foreground">{rows}</p>
          ) : (
            rows.map((entry) => (
              // mm:2940:1351{6..20}
              <div key={entry.rank} className="flex w-full items-center gap-2">
                {/* mm:;256:7460 */}
                <Image
                  src="/saa/Avatar_Leaderboard.png"
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full border-[1.869px] border-foreground object-cover"
                />
                {/* mm:;256:7461 */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-left text-[22px] leading-7 font-bold text-accent">
                    {entry.name}
                  </span>
                  <span className="text-right text-base leading-6 font-bold tracking-[0.15px] text-foreground">
                    {entry.prizeDescription}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {/* mm:2940:13521 — independent-scroll affordance for the list, drawn as-is (§6.5: no
            scroll behaviour is specified beyond this rectangle, so none is invented) */}
        <div aria-hidden="true" className="h-[245px] w-0.5 shrink-0 rounded-lg bg-muted-text" />
      </div>
    </div>
  );
}
