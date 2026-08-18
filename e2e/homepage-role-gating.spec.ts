import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Role Gating & Authentication (ID-1, ID-5, ID-6, ID-11, ID-27, ID-28, ID-29, ID-36, ID-37, ID-38)', () => {
    test('guest user does not see notification bell or account menu (ID-0, ID-1)', async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'guest');
      });

      await page.goto('/');

      // PRECONDITION: Assert header and public content IS rendered
      const header = page.getByRole('banner');
      await expect(header).toBeVisible();
      const heroSection = page.getByRole('heading', { name: /ROOT|FURTHER/i });
      await expect(heroSection).toBeVisible();

      // ID-0/ID-1: both controls return null for `guest` (notification-bell.tsx:16,
      // account-menu.tsx:16), so they must be absent from the DOM — not merely hidden.
      await expect(page.getByRole('button', { name: /notification|bell/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /account|profile|user/i })).toHaveCount(0);
    });

    test('authenticated user sees notification bell and account menu', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'user');
      });

      await page.goto('/');

      // User should see notification bell
      const notificationBell = page.getByRole('button', { name: /notification|bell/i });
      await expect(notificationBell).toBeVisible();

      // User should see account menu
      const accountMenu = page.getByRole('button', { name: /account|profile|user/i });
      await expect(accountMenu).toBeVisible();
    });

    test('admin user sees Admin Dashboard option (ID-5, ID-37)', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'admin');
      });

      await page.goto('/');

      const accountMenu = page.getByRole('button', { name: /account|profile|user/i });
      await expect(accountMenu).toBeVisible();
      await accountMenu.click();

      // Admin should see Admin Dashboard option
      await expect(page.getByRole('menuitem', { name: /Admin Dashboard/i })).toBeVisible();
    });

    test('every account-menu destination resolves for admin (ID-59)', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'admin');
      });

      await page.goto('/');
      await page.getByRole('button', { name: /account|profile|user/i }).click();

      // The menu is the only place `/profile` and `/admin` are reachable, and it renders
      // for no other role — so a 404 behind either item is invisible to every other test.
      const destinations = await page
        .getByRole('menuitem')
        .filter({ hasNotText: /sign out|đăng xuất/i })
        .evaluateAll((items) => items.map((item) => item.getAttribute('href')));

      expect(destinations).toEqual(['/profile', '/admin']);

      for (const href of destinations) {
        const response = await page.goto(href!);
        expect(response?.status(), `${href} must not be a broken link`).toBe(200);
      }
    });

    test('regular user does not see Admin Dashboard (ID-6, ID-38)', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'user');
      });

      await page.goto('/');

      const accountMenu = page.getByRole('button', { name: /account|profile|user/i });
      await expect(accountMenu).toBeVisible();
      await accountMenu.click();

      // User should NOT see Admin Dashboard
      await expect(page.getByRole('menuitem', { name: /Admin Dashboard/i })).not.toBeVisible();
    });

    test('notification badge shows only when unread > 0 (ID-28)', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'user');
        localStorage.setItem('saa.mock-unread', '5');
      });

      await page.goto('/');

      // Badge should be visible - role="status" for the notification badge
      const badge = page.getByRole('status');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText('5');
    });

    test('notification badge hidden when unread = 0 (ID-29)', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'user');
        localStorage.setItem('saa.mock-unread', '0');
      });

      await page.goto('/');

      // PRECONDITION: Assert notification bell IS rendered (user role)
      const notificationBell = page.getByRole('button', { name: /notification|bell/i });
      await expect(notificationBell).toBeVisible();

      // ID-29: the badge (role="status", notification-bell.tsx:33) renders only when
      // unreadCount > 0, so at zero it must be absent from the DOM.
      await expect(page.getByRole('status')).toHaveCount(0);
    });

    test('notification panel opens and shows empty state (ID-27)', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('saa.mock-role', 'user');
      });

      await page.goto('/');

      const notificationBell = page.getByRole('button', { name: /notification|bell/i });
      await notificationBell.click();

      // Panel should show empty state
      await expect(page.getByText(/Không có thông báo|No notifications/i)).toBeVisible();
    });
  });
});
