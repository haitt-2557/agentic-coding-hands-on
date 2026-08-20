import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Award System Page /awards', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Deep Links & Hash Behavior (A9, A10, A12)', () => {
    test('deep link to #mvp loads MVP in view with active nav (A9)', async ({ page }) => {
      await page.goto('/awards#mvp');

      // MVP section should be in viewport — exact match
      const mvpSection = page.locator('section:has-text("MVP (Most Valuable Person)")').first();
      await expect(mvpSection).toBeInViewport();

      // MVP nav item should be active on load — use exact: true
      const nav = page.locator('nav');
      const mvpLink = nav.getByRole('link', { name: 'MVP (Most Valuable Person)', exact: true });
      await expect(mvpLink).toHaveAttribute('aria-current', 'location');

      // Scroll away and back — hash should not be rewritten
      const topTalentSection = page.locator('section:has-text("Top Talent")').first();
      await topTalentSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Scroll back to MVP
      await mvpSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // URL should still be /awards#mvp (hash unchanged)
      const urlAfterScroll = page.url();
      expect(urlAfterScroll).toContain('#mvp');
    });

    test('invalid hash navigates cleanly with no console error (A10)', async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto('/awards#khong-ton-tai');

      // No console errors
      expect(pageErrors).toEqual([]);

      // scrollY should be 0 (no scroll jump)
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);

      // No nav item should be active
      const nav = page.locator('nav');
      const activeItems = nav.locator('[aria-current="location"]');
      const activeCount = await activeItems.count();
      expect(activeCount).toBe(0);
    });

    test('all six section ids exist in server HTML (A12)', async ({ page }) => {
      const response = await page.request.get('/awards');
      const html = await response.text();

      const expectedIds = [
        'id="top-talent"',
        'id="top-project"',
        'id="top-project-leader"',
        'id="best-manager"',
        'id="signature-2025-creator"',
        'id="mvp"',
      ];

      for (const id of expectedIds) {
        expect(html).toContain(id);
      }
    });
  });

});
