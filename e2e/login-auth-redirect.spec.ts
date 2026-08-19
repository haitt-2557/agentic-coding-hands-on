import { test, expect, type Browser } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';

test.describe('Login - Authentication Redirect (Unlocked Gate)', () => {
  test.describe('Access Control (A11)', () => {
    test('authenticated user is redirected from /login to / (A11)', async ({
      browser,
    }) => {
      // This test runs on port 3200 where the gate is UNLOCKED (NEXT_PUBLIC_EVENT_START_AT is in the past).
      // Port 3000 has the gate locked (future date), so this requirement cannot be tested there.
      // Create a fresh context for this test so the cookie doesn't leak
      const context = await browser.newContext({
        baseURL: 'http://localhost:3200',
      });
      const pageInstance = await context.newPage();

      try {
        // Seed the Supabase session
        await seedSupabaseSession(context, 'http://localhost:3200');

        // Navigate to login
        await pageInstance.goto('/login');

        // Should be redirected exactly to /
        expect(pageInstance.url()).toBe('http://localhost:3200/');

        // Login button should not be visible on the redirected page
        const loginButton = pageInstance.getByRole('button', { name: /LOGIN\s+With\s+Google/i });
        const isVisible = await loginButton.isVisible().catch(() => false);
        expect(isVisible).toBe(false);
      } finally {
        await context.close();
      }
    });
  });
});
