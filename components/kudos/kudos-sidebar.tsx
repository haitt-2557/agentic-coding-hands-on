// mms_D (design/kudos-content.md §6) — the sidebar shell: FR-013/FR-014, dom-contract F7/F41.
// The only `<aside>` on this page (dom-contract.md's ownership table) — composes the two
// identically-chromed blocks with the frame's own 24px gap. Sidebar scroll independence (§6.5)
// has no bespoke JS in the design data beyond the drawn scrollbar rectangle the leaderboard
// already renders, so none is added here (KISS).

import { KudosSidebarStats } from './kudos-sidebar-stats';
import { KudosLeaderboard } from './kudos-leaderboard';

export function KudosSidebar() {
  return (
    // mm:2940:13488
    <aside className="flex w-full flex-col gap-6 lg:w-[422px] lg:shrink-0">
      <KudosSidebarStats />
      <KudosLeaderboard />
    </aside>
  );
}
