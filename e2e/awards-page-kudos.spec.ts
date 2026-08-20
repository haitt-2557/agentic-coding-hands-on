import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Award System Page /awards', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Kudos Block CTA (A11)', () => {
    test('Kudos "Chi tiết" link navigates to /kudos', async ({ page }) => {
      await page.goto('/awards');

      const kudosLink = page.getByRole('link', { name: /Chi tiết/i });
      await expect(kudosLink).toHaveAttribute('href', '/kudos');
    });
  });
});
