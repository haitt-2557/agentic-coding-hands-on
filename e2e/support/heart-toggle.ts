import type { Locator, Page } from '@playwright/test';

// Root cause this settles for (found while verifying the isolation fixes in the like-* specs):
// `components/kudos/likes-provider.tsx`'s `toggle()` flips its state optimistically and
// synchronously, so a short wait after `.click()` reliably observes the OPTIMISTIC UI update but
// says nothing about whether the underlying `toggleKudosLike` Server Action has actually
// committed to Postgres. `toggle()` also holds a per-kudos-id in-flight guard for a second click
// on the same id while the first click's request is still pending — CURRENT behavior (see
// `likes-provider.tsx`'s `pendingDesired` coalescing, lines ~147-166) queues that second click's
// intent and replays it once the in-flight request settles, rather than dropping it. Under the
// load of Playwright's `fullyParallel` workers all sharing one dev server and one Postgres
// container, the round trip can still outlast a short wait; a "click again to toggle off" fired
// too soon then only *appears* dropped because its effect is deferred to the coalesced replay,
// not applied immediately — the DOM doesn't change and the row from the first click isn't removed
// until that replay lands. (Evidence: polling `kudos_likes` during a failing run at the old 300ms
// showed exactly one row, from the first click, still present seconds after the second click
// should have deleted it.)
//
// Two more precise alternatives were tried and rejected before this one:
// - Waiting for the network response carrying Next's `Next-Action` request header: hung for the
//   full test timeout even under zero concurrent load, because `request.headers()` does not
//   reliably surface that header at the time `page.waitForResponse`'s predicate runs.
// - Polling `kudos_likes` directly via `execSql` (a `docker exec` per poll tick): correct in
//   principle, but spawning a subprocess every 50ms from up to 4 concurrent workers added enough
//   system load on its own to roughly double total suite time and introduce new, unrelated
//   flakiness elsewhere on the page.
// A longer fixed settle is the simplest thing that is actually reliable here.
const SETTLE_MS = 1000;

/** Clicks a heart/like toggle button and waits long enough for the toggle's Server Action to
 * have committed, not just for the optimistic client-side UI update. See the module comment
 * above for why this needs to be longer than a "should be enough" guess. */
export async function clickHeartAndSettle(page: Page, heart: Locator): Promise<void> {
  await heart.click();
  await page.waitForTimeout(SETTLE_MS);
}
