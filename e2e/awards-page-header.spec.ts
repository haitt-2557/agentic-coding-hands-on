import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Award System Page /awards', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Header Current-Page State (A2)', () => {
    test('Award Information link has aria-current on /awards, About SAA on / (A2)', async ({ page }) => {
      // On /awards — check header link specifically (scoped to header to avoid footer match)
      await page.goto('/awards');
      const headerAwardLink = page.locator('header').getByRole('link', { name: 'Award Information' });
      await expect(headerAwardLink).toHaveAttribute('aria-current', 'page');

      // On / (home) — header Award Information should NOT have aria-current
      await page.goto('/');
      const headerAwardLinkHome = page.locator('header').getByRole('link', { name: 'Award Information' });
      await expect(headerAwardLinkHome).not.toHaveAttribute('aria-current', 'page');

      const aboutLink = page.locator('header').getByRole('link', { name: 'About SAA 2025' });
      await expect(aboutLink).toHaveAttribute('aria-current', 'page');
    });
  });

});
