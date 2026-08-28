import type { Page } from '@playwright/test';

/**
 * Scrolls the ALL KUDOS lazy-load sentinel into view repeatedly until every filtered record is
 * revealed (all-kudos-feed.tsx drops the sentinel once `revealedCount >= filtered.length`).
 * Assertions that need to reason about the full record set — not just whichever records the
 * REVEAL_BATCH of 4 happens to land on first — must call this before reading card content:
 * batch composition depends on feed order (`sortLatestFirst` in kudos-queries.ts) and is not a
 * stable thing to assert against.
 */
export async function revealAllKudosCards(page: Page): Promise<void> {
  const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
  const revealSentinel = allKudosSection.locator('div.h-px.w-full[aria-hidden="true"]');
  while ((await revealSentinel.count()) > 0) {
    await revealSentinel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
  }
}
