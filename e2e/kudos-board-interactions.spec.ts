import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';
import { revealAllKudosCards } from './support/reveal-kudos-feed';

test.describe('Kudos Board Carousel & Filters /kudos', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Carousel Navigation (81446f61)', () => {
    test('carousel next advances slide and updates indicator (81446f61)', async ({ page }) => {
      await page.goto('/kudos');

      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const indicator = highlightSection.locator('text=/^\\d+\\/5$/');
      const nextButton = highlightSection.locator('button[aria-label*="next"], button[aria-label*="Next"]');

      const initialText = await indicator.textContent();
      expect(initialText).toMatch(/^\d+\/5$/);
      const initialSlide = parseInt(initialText!.split('/')[0]);

      await nextButton.click();
      await page.waitForTimeout(500); // Allow animation

      const updatedText = await indicator.textContent();
      const updatedSlide = parseInt(updatedText!.split('/')[0]);
      expect(updatedSlide).toBeGreaterThan(initialSlide);
    });

    test('carousel prev goes back one slide (81446f61)', async ({ page }) => {
      await page.goto('/kudos');

      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const indicator = highlightSection.locator('text=/^\\d+\\/5$/');
      const nextButton = highlightSection.locator('button[aria-label*="next"], button[aria-label*="Next"]');
      const prevButton = highlightSection.locator('button[aria-label*="prev"], button[aria-label*="Previous"]');

      // Advance to slide 2
      await nextButton.click();
      await page.waitForTimeout(500);

      // Go back
      await prevButton.click();
      await page.waitForTimeout(500);

      const finalText = await indicator.textContent();
      const finalSlide = parseInt(finalText!.split('/')[0]);
      expect(finalSlide).toBe(1);
    });

    test('prev button is disabled on slide 1 (81446f61)', async ({ page }) => {
      await page.goto('/kudos');

      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const prevButton = highlightSection.locator('button[aria-label*="prev"], button[aria-label*="Previous"]');

      await expect(prevButton).toBeDisabled();
    });

    test('next button is disabled on slide 5 (81446f61)', async ({ page }) => {
      await page.goto('/kudos');

      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const nextButton = highlightSection.locator('button[aria-label*="next"], button[aria-label*="Next"]');
      const indicator = highlightSection.locator('text=/^\\d+\\/5$/');

      // Advance to slide 5
      for (let i = 0; i < 4; i++) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }

      const slideText = await indicator.textContent();
      const slide = parseInt(slideText!.split('/')[0]);
      expect(slide).toBe(5);

      await expect(nextButton).toBeDisabled();
    });
  });

  test.describe('Filter Dropdowns (0e56cacb, 159fed13, d01729d4)', () => {
    test('Hashtag filter: open dropdown, select option, filter applies (0e56cacb)', async ({ page }) => {
      await page.goto('/kudos');

      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const hashtagButton = highlightSection.locator('button:has-text("Hashtag")');
      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
      const cards = allKudosSection.locator('div[role="article"], article');
      const options = page.locator('[role="option"], [role="menuitem"]');

      // Deliberately option index 1, NOT 0: `#Dedicated` (index 0) sits on 4 of the 9 seeded
      // records and `#Inspring` (index 1, frozen by dom-contract S3/F21) on 5, so whichever one
      // would otherwise leave every visible card sharing the same tag is avoided independent of
      // feed order. Reveal every batch first (see reveal-kudos-feed.ts) — the ALL KUDOS feed
      // renders latest-first (`sortLatestFirst`), so which 4 records land in the initial
      // REVEAL_BATCH depends on that order and is not a stable thing to assert against.
      await revealAllKudosCards(page);
      const unfilteredTexts = await cards.allTextContents();

      await hashtagButton.click();
      await expect(options.first()).toBeVisible();
      const tag = ((await options.nth(1).textContent()) ?? '').trim();
      await options.nth(1).click();

      // Every visible card must carry the selected tag — this is the filter contract.
      expect(await cards.count()).toBeGreaterThan(0);
      for (const card of await cards.all()) {
        await expect(card).toContainText(tag);
      }
      // And the view must actually have changed: the unfiltered feed held a card lacking this tag.
      expect(unfilteredTexts.some((t) => !t.includes(tag))).toBe(true);

      // Clearing restores records that do not carry the tag (TC 0e56cacb, third step). Reveal
      // again: clearing the filter resets `revealedCount` back to the first REVEAL_BATCH too.
      await hashtagButton.click();
      await options.filter({ hasText: 'Tất cả' }).first().click();
      await revealAllKudosCards(page);
      const clearedTexts = await cards.allTextContents();
      expect(clearedTexts.some((t) => !t.includes(tag))).toBe(true);
    });

    test('Department filter: open dropdown, select option, filter applies (159fed13)', async ({
      page,
    }) => {
      await page.goto('/kudos');

      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const deptButton = highlightSection.locator('button:has-text("Phòng ban")');
      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
      const cards = allKudosSection.locator('div[role="article"], article');
      const options = page.locator('[role="option"], [role="menuitem"]');

      // Option index 1 for the same reason as the hashtag test above: option 0 (`CEVC10`) sits
      // on 7 of the 9 seeded records and option 1 (`CECV10`, frozen by dom-contract S3/F21) on 2,
      // so the count/content assertions stay genuinely falsifiable independent of feed order.
      // Reveal every batch first — see the hashtag test's comment above for why.
      await revealAllKudosCards(page);
      const unfilteredTexts = await cards.allTextContents();

      await deptButton.click();
      await expect(options.first()).toBeVisible();
      const dept = ((await options.nth(1).textContent()) ?? '').trim();
      await options.nth(1).click();

      expect(await cards.count()).toBeGreaterThan(0);
      for (const card of await cards.all()) {
        await expect(card).toContainText(dept);
      }
      expect(unfilteredTexts.some((t) => !t.includes(dept))).toBe(true);

      // Clearing restores records from other departments (TC 159fed13, third step).
      await deptButton.click();
      await options.filter({ hasText: 'Tất cả' }).first().click();
      await revealAllKudosCards(page);
      const clearedTexts = await cards.allTextContents();
      expect(clearedTexts.some((t) => !t.includes(dept))).toBe(true);
    });

    test('clicking hashtag inside kudos card re-filters both sections & resets carousel (d01729d4)', async ({
      page,
    }) => {
      await page.goto('/kudos');

      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const carouselIndicator = highlightSection.locator('text=/^\\d+\\/\\d+$/');

      // Advance the carousel off page 1 FIRST. Without this, asserting "resets to page 1" is
      // trivially satisfied by a carousel that never moved.
      const nextButton = highlightSection.locator(
        'button[aria-label*="next"], button[aria-label*="Next"]'
      );
      await nextButton.click();
      await expect(carouselIndicator).not.toHaveText(/^1\//);

      const hashtag = allKudosSection.locator('button:has-text("#")').first();
      await expect(hashtag).toBeVisible();
      const tag = ((await hashtag.textContent()) ?? '').trim();
      expect(tag.startsWith('#')).toBe(true);

      await hashtag.click();

      // TC d01729d4 — pagination resets to page 1 ...
      await expect(carouselIndicator).toHaveText(/^1\//);

      // ... and BOTH regions now show only kudos carrying the clicked tag. Asserting every
      // visible card contains it is the actual filter contract; a non-zero count is not.
      const allCards = allKudosSection.locator('div[role="article"], article');
      expect(await allCards.count()).toBeGreaterThan(0);
      for (const card of await allCards.all()) {
        await expect(card).toContainText(tag);
      }

      const highlightCards = highlightSection.locator('[role="group"] > *');
      expect(await highlightCards.count()).toBeGreaterThan(0);
      for (const card of await highlightCards.all()) {
        await expect(card).toContainText(tag);
      }
    });
  });

});
