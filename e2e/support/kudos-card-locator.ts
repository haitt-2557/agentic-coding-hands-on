import type { Locator, Page } from '@playwright/test';

/**
 * Locates a single kudos card by its (sender, receiver) name pair rather than by DOM position or
 * by matching against a rendered heart count.
 *
 * Every static record in `lib/kudos/kudos-records.ts` has a unique (senderName, receiverName)
 * pair, but two records can share the same two names in swapped roles (kudos-6 sends Mai phương
 * Thúy → Dương thúy An; kudos-9 sends Dương thúy An → Mai phương Thúy) — matching on "card text
 * contains both names" alone resolves to both. `KudosCardPeople` always renders the sender's
 * PersonBlock first and the receiver's last within its row, so this checks each name against its
 * role's position rather than just presence, and identifies exactly one card deterministically.
 * Matching on the heart-count number instead (as earlier revisions of these specs did) is
 * inherently racy: `displayedCount = record.heartCount + likeCount(record.id)`
 * (components/kudos/kudos-card-actions.tsx) changes the instant ANY viewer — including a
 * concurrently-running test in another spec file — likes that kudos, so a locator built from
 * that number can stop matching mid-test for reasons that have nothing to do with the behavior
 * under test.
 */
export function kudosCardByIdentity(page: Page, senderName: string, receiverName: string): Locator {
  const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
  const peopleRow = 'div.flex.w-full.items-center.justify-between.gap-6';
  const senderIsFirst = page.locator(`${peopleRow} > div:first-child`).filter({ hasText: senderName });
  const receiverIsLast = page.locator(`${peopleRow} > div:last-child`).filter({ hasText: receiverName });
  return allKudosSection
    .locator('article')
    .filter({ has: senderIsFirst })
    .filter({ has: receiverIsLast });
}
