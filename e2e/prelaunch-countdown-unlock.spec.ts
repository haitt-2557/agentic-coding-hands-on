import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Prelaunch - Client-Side Unlock & Gate (Future Event)', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Client-Side Unlock (router.replace when countdown reaches zero)', () => {
    test('initiates navigation to / when countdown expires (client-side only)', async ({ page }) => {
      // SCOPE NOTE: This test verifies the client-side unlock fires at T-0.
      // It asserts request initiation only, not final destination, because on port 3000
      // the server gate will reject the navigation. In production both clocks are real
      // and aligned; server-side unlock behavior is tested separately on port 3200.

      const eventTime = new Date('2026-12-19T18:30:00+07:00').getTime();
      const startTime = new Date(eventTime - 2 * 1000);

      await page.clock.install({ time: startTime });
      await page.goto('/prelaunch');

      expect(page.url()).toContain('/prelaunch');

      // Watch for a navigation request to / before fast-forwarding.
      // Match on the exact pathname, never `url().includes('/')` — every URL contains a
      // slash, so that predicate resolves on the first unrelated request (an RSC prefetch,
      // the font, the background image) and the test would go green without the unlock
      // ever firing.
      const navigationPromise = page.waitForRequest(
        (req) => new URL(req.url()).pathname === '/',
      );

      // Fast-forward past the target — this should trigger router.replace('/')
      await page.clock.fastForward('00:00:03');

      // Assert the client initiated a request to / (the unlock fired)
      const navRequest = await navigationPromise;
      expect(new URL(navRequest.url()).pathname).toBe('/');
    });
  });

  test.describe('Gate Lock: Locked Routes Redirect to /prelaunch', () => {
    test('locked route /awards redirects to /prelaunch while countdown > 0', async ({ page }) => {
      // Countdown is in the future on port 3000, so proxy gate is locked
      await page.clock.install({ time: new Date('2026-12-19T17:00:00+07:00') });

      // Attempt to visit a locked route
      await page.goto('/awards');

      // Should be redirected to /prelaunch by proxy.ts gate
      expect(page.url()).toContain('/prelaunch');

      // Verify prelaunch countdown is rendered
      await expect(page.getByText(/Sự kiện sẽ bắt đầu sau|Event starts in/i)).toBeVisible();
    });

    test('locked route /kudos redirects to /prelaunch while countdown > 0', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:00+07:00') });

      await page.goto('/kudos');

      expect(page.url()).toContain('/prelaunch');
    });

    test('locked route /profile redirects to /prelaunch while countdown > 0', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:00+07:00') });

      await page.goto('/profile');

      expect(page.url()).toContain('/prelaunch');
    });

    test('homepage / redirects to /prelaunch while countdown > 0', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:00+07:00') });

      await page.goto('/');

      expect(page.url()).toContain('/prelaunch');
    });
  });
});
