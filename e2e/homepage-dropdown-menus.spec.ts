import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Dropdown Menu Behavior (ID-24, ID-25, ID-26, ID-30, ID-31, ID-32, ID-33, ID-34, ID-35)', () => {
    test('language button opens menu with VN/EN options (ID-24)', async ({ page }) => {
      await page.goto('/');
      const langButton = page.getByRole('button', { name: /VN|VI/i });
      await expect(langButton).toBeVisible();
      await langButton.click();

      // Menu should contain both VN and EN options
      await expect(page.getByRole('menuitem', { name: /VN|VI/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /EN/i })).toBeVisible();
    });

    test('language switch to EN changes interface (ID-25)', async ({ page }) => {
      await page.goto('/');

      // PRECONDITION: the Vietnamese copy is on screen first, so its absence after the
      // switch proves the locale changed rather than that the text never existed.
      await expect(page.getByRole('heading', { name: 'Hệ thống giải thưởng' })).toBeVisible();

      const langButton = page.getByRole('button', { name: /VN|VI/i });
      await langButton.click();

      const enOption = page.getByRole('menuitem', { name: /EN/i });
      await expect(enOption).toBeVisible();
      await enOption.click();

      // ID-25: the dictionary swap has to reach the rendered copy. Assert both directions —
      // the English string appears AND the Vietnamese one it replaced is gone — so the test
      // cannot pass on a page that merely still renders.
      await expect(page.getByRole('heading', { name: 'Award System' })).toBeVisible();
      await expect(page.getByText('Hệ thống giải thưởng')).toHaveCount(0);
      await expect(page.getByText(/Time: 26\/12\/2025/)).toBeVisible();
    });

    test('dropdown closes when clicking outside (ID-32)', async ({ page }) => {
      await page.goto('/');
      const langButton = page.getByRole('button', { name: /VN|VI/i });
      await langButton.click();

      // components/ui/dropdown-menu.tsx renders role="menu" on the popover.
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      // Click outside (on the main content area)
      await page.click('body', { position: { x: 100, y: 300 } });

      // ID-32: click-outside closes the menu. The popover unmounts, so assert absence.
      await expect(menu).toHaveCount(0);
    });

    test('dropdown opens with Enter key (ID-33)', async ({ page }) => {
      await page.goto('/');
      const langButton = page.getByRole('button', { name: /VN|VI/i });
      await langButton.focus();
      await page.keyboard.press('Enter');

      // Menu should be visible
      await expect(page.getByRole('menuitem', { name: /EN/i })).toBeVisible();
    });

    test('dropdown opens with Space key (ID-34)', async ({ page }) => {
      await page.goto('/');
      const langButton = page.getByRole('button', { name: /VN|VI/i });
      await langButton.focus();
      await page.keyboard.press('Space');

      // Menu should be visible
      await expect(page.getByRole('menuitem', { name: /EN/i })).toBeVisible();
    });

    test('dropdown closes with Escape key (ID-35)', async ({ page }) => {
      await page.goto('/');
      const langButton = page.getByRole('button', { name: /VN|VI/i });
      await langButton.click();

      // Menu should be visible
      await expect(page.getByRole('menuitem', { name: /EN/i })).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // ID-35: Escape closes the menu — every menuitem is removed from the DOM.
      await expect(page.getByRole('menuitem')).toHaveCount(0);
    });

    test('only VN and EN options available (ID-58)', async ({ page }) => {
      await page.goto('/');
      const langButton = page.getByRole('button', { name: /VN|VI/i });
      await langButton.click();

      const menuItems = await page.getByRole('menuitem').all();
      expect(menuItems.length).toBeLessThanOrEqual(2);
    });
  });
});
