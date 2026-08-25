import type { Locator, Page } from '@playwright/test';

/**
 * Locates a single kudos card by its (sender, receiver) name pair rather than by DOM position or
 * by matching against a rendered heart count.
 *
 * Every static record in `lib/kudos/kudos-records.ts` has a unique (senderName, receiverName)
 * pair, so this identifies exactly one card deterministically. Matching on the heart-count number
 * instead (as earlier revisions of these specs did) is inherently racy: `displayedCount =
 * record.heartCount + likeCount(record.id)` (components/kudos/kudos-card-actions.tsx) changes the
 * instant ANY viewer — including a concurrently-running test in another spec file — likes that
 * kudos, so a locator built from that number can stop matching mid-test for reasons that have
 * nothing to do with the behavior under test.
 */
export function kudosCardByIdentity(page: Page, senderName: string, receiverName: string): Locator {
  const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
  return allKudosSection
    .locator('article')
    .filter({ hasText: senderName })
    .filter({ hasText: receiverName });
}
