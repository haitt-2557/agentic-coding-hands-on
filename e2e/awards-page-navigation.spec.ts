import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Award System Page /awards', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Category Nav (A4, A7, A8)', () => {
    test('nav renders exactly 6 items in AWARDS order (A4)', async ({ page }) => {
      await page.goto('/awards');
      const nav = page.locator('nav');
      const navItems = nav.locator('a[href*="#"]');

      const expectedNames = [
        'Top Talent',
        'Top Project',
        'Top Project Leader',
        'Best Manager',
        'Signature 2025 - Creator',
        'MVP (Most Valuable Person)',
      ];

      const count = await navItems.count();
      expect(count).toBe(6);

      for (let i = 0; i < expectedNames.length; i++) {
        const item = navItems.nth(i);
        await expect(item).toHaveText(expectedNames[i]);
      }
    });

    test('clicking nav item scrolls section into view and updates active state (A7)', async ({ page }) => {
      await page.goto('/awards');
      const nav = page.locator('nav');

      // Click "Top Project" nav item — use exact: true to avoid matching "Top Project Leader"
      const topProjectLink = nav.getByRole('link', { name: 'Top Project', exact: true });
      await topProjectLink.click();

      // Top Project section should be in viewport — use has-text().first() for exact match
      const topProjectSection = page.locator('section:has-text("Top Project")').first();
      await expect(topProjectSection).toBeInViewport();

      // Top Project nav item should have aria-current
      await expect(topProjectLink).toHaveAttribute('aria-current', 'location');

      // Top Talent link should NOT have aria-current
      const topTalentLink = nav.getByRole('link', { name: 'Top Talent', exact: true });
      await expect(topTalentLink).not.toHaveAttribute('aria-current', 'location');

      // Verify URL still has no hash (A7 - URL check)
      const url = page.url();
      expect(url).not.toMatch(/#/);
    });

    test('manual scroll updates nav active state without click (A8)', async ({ page }) => {
      await page.goto('/awards');
      const nav = page.locator('nav');

      // Scroll to MVP section manually — exact match with .first() to handle potential substrings
      const mvpSection = page.locator('section:has-text("MVP (Most Valuable Person)")').first();
      await mvpSection.scrollIntoViewIfNeeded();

      // Give IntersectionObserver time to fire
      await page.waitForTimeout(300);

      // MVP nav item should be active — use exact: true to avoid partial matches
      const mvpLink = nav.getByRole('link', { name: 'MVP (Most Valuable Person)', exact: true });
      await expect(mvpLink).toHaveAttribute('aria-current', 'location');
    });
  });

});
