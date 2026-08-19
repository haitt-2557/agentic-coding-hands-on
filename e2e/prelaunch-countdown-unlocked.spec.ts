import { test, expect } from '@playwright/test';

test.describe('Prelaunch - Gate Unlocked (Past Event)', () => {
  test.describe('Server-Side Redirect When Gate Open', () => {
    test('/prelaunch redirects to / when event has passed', async ({ page }) => {
      // Port 3200 has NEXT_PUBLIC_EVENT_START_AT in the past
      // Middleware should redirect /prelaunch to / immediately
      await page.goto('/prelaunch', { waitUntil: 'domcontentloaded' });

      expect(page.url()).toMatch(/\/$/);
      expect(page.url()).not.toContain('/prelaunch');
    });

    test('locked routes remain open when gate is unlocked', async ({ page }) => {
      // When countdown has passed, /awards should NOT redirect to /prelaunch
      await page.goto('/awards', { waitUntil: 'domcontentloaded' });

      expect(page.url()).toContain('/awards');
    });
  });
});
