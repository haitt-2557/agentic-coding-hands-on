import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Kudos Feed Interactions /kudos', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Heart Toggle (7a7ec63e, 63645b03)', () => {
    test('clicking heart toggles count increment on first click, decrement on second (7a7ec63e)', async ({
      page,
    }) => {
      await page.goto('/kudos');

      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
      const heartButtons = allKudosSection.locator('button[aria-label*="heart"], button[aria-label*="like"]');

      // Assert at least one heart exists (required by the test case)
      expect(await heartButtons.count()).toBeGreaterThan(0);

      const firstHeart = heartButtons.first();
      const initialCountText = await firstHeart.textContent();
      // Strip non-digit characters to handle thousands separators (e.g., "1.000" → "1000")
      const initialCount = parseInt((initialCountText || '0').replace(/\D/g, ''));

      // Click to increment (toggle on)
      await firstHeart.click();
      await page.waitForTimeout(300);

      const afterFirstClick = await firstHeart.textContent();
      const countAfterFirst = parseInt((afterFirstClick || '0').replace(/\D/g, ''));
      expect(countAfterFirst).toBe(initialCount + 1);

      // Active state must be explicit. `getAttribute('aria-pressed') ?? 'true'` would let a
      // component that never sets the attribute pass, leaving half of TC 7a7ec63e unverified.
      await expect(firstHeart).toHaveAttribute('aria-pressed', 'true');

      // Click again to decrement (toggle off)
      await firstHeart.click();

      const afterSecondClick = await firstHeart.textContent();
      const countAfterSecond = parseInt((afterSecondClick || '0').replace(/\D/g, ''));
      expect(countAfterSecond).toBe(initialCount);
      await expect(firstHeart).toHaveAttribute('aria-pressed', 'false');
    });

    test('heart button is disabled on kudos sent by the current viewer (63645b03)', async ({ page }) => {
      await page.goto('/kudos');

      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
      const kudosCards = allKudosSection.locator('div[role="article"], article');

      // Assert at least one card exists
      expect(await kudosCards.count()).toBeGreaterThan(0);

      // clarifications.md (second pass) requires the seed set to contain at least one kudos sent
      // BY the mock viewer and at least one sent by someone else. Both states must therefore be
      // observable on the page simultaneously — that pair is the contract asserted here.
      const disabledHearts = allKudosSection.locator(
        'button[aria-label*="heart"][disabled], button[aria-label*="like"][disabled]'
      );
      const enabledHearts = allKudosSection.locator(
        'button[aria-label*="heart"]:not([disabled]), button[aria-label*="like"]:not([disabled])'
      );

      // the viewer's own kudos — heart must be disabled (TC 63645b03)
      expect(await disabledHearts.count()).toBeGreaterThan(0);
      // someone else's kudos — heart must stay actionable, or the rule above proves nothing
      expect(await enabledHearts.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Copy Link Button (0adfd7ce)', () => {
    test('clicking Copy Link shows toast "Link copied — ready to share!" (0adfd7ce)', async ({ page }) => {
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto('/kudos');

      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
      const copyButtons = allKudosSection.locator('button:has-text("Copy Link")');

      // Assert button exists (required by the test case)
      expect(await copyButtons.count()).toBeGreaterThan(0);

      const firstCopyButton = copyButtons.first();
      await firstCopyButton.click();
      await page.waitForTimeout(300);

      // Check for toast with exact message
      const toast = page.locator('text=Link copied — ready to share!');
      await expect(toast).toBeVisible();
    });
  });

  test.describe('Spotlight Search Input (9e689933)', () => {
    test('spotlight search input enforces 100-character ceiling (9e689933)', async ({ page }) => {
      await page.goto('/kudos');

      const spotlightSection = page.locator('section:has(h2:text-is("SPOTLIGHT BOARD"))').first();
      const searchInput = spotlightSection.locator('input[placeholder*="Tìm kiếm"]');

      // Assert input exists and has maxlength attribute
      await expect(searchInput).toBeVisible();
      const maxlength = await searchInput.getAttribute('maxlength');
      expect(maxlength).toBe('100');

      // Type 101 characters and verify only 100 are accepted
      const text101 = 'a'.repeat(101);
      await searchInput.fill(text101);

      const actualValue = await searchInput.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(100);
    });
  });

  test.describe('Spotlight Hover Tooltip (33ca8f8a)', () => {
    test('hovering spotlight name node shows tooltip with that name (33ca8f8a)', async ({ page }) => {
      await page.goto('/kudos');

      const spotlightSection = page.locator('section:has(h2:text-is("SPOTLIGHT BOARD"))').first();
      const cloudNodes = spotlightSection.locator('[role="button"], span[title], div[title]');

      // Assert nodes exist
      expect(await cloudNodes.count()).toBeGreaterThan(0);

      const firstNode = cloudNodes.first();
      const nodeName = ((await firstNode.textContent()) ?? '').trim();
      expect(nodeName.length).toBeGreaterThan(0);

      await firstNode.hover();

      // TC 33ca8f8a — the tooltip must actually appear AND carry that node's name. A `title`
      // attribute alone does not satisfy this: spec B.7 asks for name + time shown on hover.
      const tooltip = page.locator('[role="tooltip"]');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText(nodeName);
    });
  });

  test.describe('Empty States (926d92a5)', () => {
    test('filtering to no matching kudos shows "Hiện tại chưa có Kudos nào." (926d92a5)', async ({
      page,
    }) => {
      await page.goto('/kudos');

      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();

      const options = page.locator('[role="option"], [role="menuitem"]');
      const emptyMessage = allKudosSection.getByText('Hiện tại chưa có Kudos nào.');

      // Pin the hashtag filter to its first option, then walk every department option looking
      // for a combination that matches nothing. clarifications.md (second pass) requires the
      // seed vocabularies to admit at least one such combination — so this loop MUST find one.
      // If it does not, the seed data breaks its own contract and this test is what catches it.
      const hashtagButton = highlightSection.locator('button:has-text("Hashtag")');
      await hashtagButton.click();
      await expect(options.first()).toBeVisible();
      await options.first().click();

      const deptButton = highlightSection.locator('button:has-text("Phòng ban")');
      await deptButton.click();
      await expect(options.first()).toBeVisible();
      const deptCount = await options.count();
      expect(deptCount).toBeGreaterThan(0);
      await page.keyboard.press('Escape');

      let reachedEmptyState = false;
      for (let i = 0; i < deptCount; i++) {
        await deptButton.click();
        await options.nth(i).click();
        if (await emptyMessage.isVisible()) {
          reachedEmptyState = true;
          break;
        }
      }

      expect(
        reachedEmptyState,
        'No hashtag+department combination produced the empty state. The seed vocabularies must ' +
          'admit at least one empty combination (clarifications.md, second pass) or TC 926d92a5 ' +
          'is unreachable through the UI.'
      ).toBe(true);

      // Both filtered regions must show the empty state — not one empty and one stale.
      await expect(emptyMessage).toBeVisible();
      await expect(highlightSection.getByText('Hiện tại chưa có Kudos nào.')).toBeVisible();
    });
  });

  test.describe('Submit Pill Accessibility', () => {
    test('submit pill input is visible, enabled and focusable (A.1 deferred)', async ({ page }) => {
      await page.goto('/kudos');

      const submitPill = page.locator('input[placeholder*="bạn muốn gửi lời cảm ơn"]').first();
      await expect(submitPill).toBeVisible();
      await expect(submitPill).toBeEnabled();

      await submitPill.focus();
      const isFocused = await page.evaluate(() => document.activeElement?.getAttribute('placeholder'));
      expect(isFocused).toContain('bạn muốn gửi lời cảm ơn');
    });
  });
});
