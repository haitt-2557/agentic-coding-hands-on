import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';

test.describe('Send Kudos Access Control (ID-0, ID-1)', () => {
  test.describe('Authentication (ID-0 Authenticated, ID-1 Unauthenticated)', () => {
    test('authenticated user sees the form (ID-0)', async ({ browser }) => {
      // Create a fresh context with auth session
      const context = await browser.newContext({
        baseURL: 'http://localhost:3200',
      });
      const page = await context.newPage();

      try {
        // Seed Supabase session — will throw INFRA: errors if auth fails
        await seedSupabaseSession(context, 'http://localhost:3200');

        // Navigate to /kudos/send
        await page.goto('/kudos/send', { waitUntil: 'networkidle' });

        // Guard: verify we landed on /kudos/send (not redirected to /prelaunch or elsewhere)
        await expect(page).toHaveURL(/\/kudos\/send$/);

        // Form should be visible (Người nhận field is the first required field)
        // D15: <label> elements exist containing 'Người nhận', ...
        const recipientField = page.locator('label').filter({ hasText: /Người nhận/ });
        await expect(recipientField).toBeVisible();
      } finally {
        await context.close();
      }
    });

    test('unauthenticated user is redirected to /login (ID-1)', async ({ page }) => {
      // Do NOT seed a session. Test the unauthenticated path on the UNLOCKED server (3200).
      // Port 3200 is used here so the prelaunch gate is open, allowing the auth check to run.
      await page.goto('/kudos/send');

      // Should be redirected to /login
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
