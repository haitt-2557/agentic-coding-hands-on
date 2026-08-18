import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Quick Action Widget (ID-54)', () => {
    test('widget button opens quick action menu with two options', async ({ page }) => {
      await page.goto('/');

      // Find and click widget button (fixed bottom right)
      const widgetButton = page.getByRole('button', { name: /widget|action|quick/i });
      await expect(widgetButton).toBeVisible();
      await widgetButton.click();

      // Menu should show two options - scope to the menu popover
      const widgetMenu = page.locator('[role="menu"], [role="dialog"]').filter({ hasText: /Viết Kudos/i });
      await expect(widgetMenu.getByText(/Viết Kudos|Write Kudos/i)).toBeVisible();
      // FR-019 names both options, so assert the second one's copy — a wrong link dropped in
      // that slot would still be "visible".
      await expect(widgetMenu.getByRole('menuitem').nth(1)).toHaveText(
        /Về SAA 2025|About SAA 2025/,
      );
    });
  });

  test.describe('Kudos Section (ID-53)', () => {
    test('Chi tiết button in Kudos section navigates to /kudos', async ({ page }) => {
      await page.goto('/');

      // Find the Chi tiết link in the Kudos section
      // First, identify all Chi tiết links on the page
      const allChiTietLinks = await page.getByRole('link', { name: /Chi tiết|Detail/i }).all();

      // The Kudos section's Chi tiết link is the last one (it comes after the 6 award cards)
      const kudosChiTietLink = allChiTietLinks[allChiTietLinks.length - 1];
      await expect(kudosChiTietLink).toBeVisible();
      await kudosChiTietLink.click();

      await page.waitForURL(/\/kudos/);
      expect(page.url()).toContain('/kudos');
    });
  });
});
