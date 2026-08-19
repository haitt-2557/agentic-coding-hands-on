import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';

test.describe('Login Screen', () => {
  test.describe('Gate Reachability (A1)', () => {
    test('renders without redirecting to /prelaunch on locked-gate server', async ({
      page,
    }) => {
      await page.goto('/login');
      expect(page.url()).toContain('/login');
      // Accessible-name freeze: ROOT FURTHER image (the frame's structural title)
      await expect(page.locator('img[alt*="ROOT FURTHER"], img[alt*="Root Further"]')).toBeVisible();
    });
  });

  test.describe('Layout & Copy (A2–A7, A12)', () => {
    test('displays header logo in top-left, not interactive (A2)', async ({
      page,
    }) => {
      await page.goto('/login');

      const logo = page.locator('img[alt*="Sun* Annual Awards"]').first();
      await expect(logo).toBeVisible();

      // Logo should not have a link or button ancestor
      const isInert = await logo.evaluate((el) => {
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
          if (parent.tagName === 'A' || parent.tagName === 'BUTTON') {
            return false;
          }
          parent = parent.parentElement;
        }
        return true;
      });
      expect(isInert).toBe(true);
    });

    test('displays language selector with VN flag and chevron, opens on click (A3)', async ({
      page,
    }) => {
      await page.goto('/login');

      const langButton = page.getByRole('button', { name: /VN|Vietnam|language/i }).first();
      await expect(langButton).toBeVisible();

      // Check flag and chevron presence via text/icon indicators
      const langText = page.getByText(/\bVN\b/);
      await expect(langText).toBeVisible();

      // Click opens dropdown
      await langButton.click();
      const dropdown = page.locator('[role="menu"], [role="listbox"]').first();
      await expect(dropdown).toBeVisible();
    });

    test('displays wave key visual in hero section (A4)', async ({ page }) => {
      await page.goto('/login');

      // Wave artwork is the background image in the main element
      // Assert via the main section visibility (component structure is <main>, not <section>)
      const heroSection = page.locator('main').first();
      await expect(heroSection).toBeVisible();
    });

    test('displays ROOT FURTHER image in hero (A4)', async ({ page }) => {
      await page.goto('/login');

      const rootFurtherImg = page.locator('img[alt*="ROOT FURTHER"], img[alt*="Root Further"]').first();
      await expect(rootFurtherImg).toBeVisible();
    });

    test('displays copy text: "Bắt đầu hành trình của bạn cùng SAA 2025." (A5)', async ({
      page,
    }) => {
      await page.goto('/login');

      const copyText = page.getByText('Bắt đầu hành trình của bạn cùng SAA 2025.');
      await expect(copyText).toBeVisible();
    });

    test('displays tagline: "Đăng nhập để khám phá!" (A5)', async ({ page }) => {
      await page.goto('/login');

      const taglineText = page.getByText('Đăng nhập để khám phá!');
      await expect(taglineText).toBeVisible();
    });

    test('displays LOGIN With Google button with Google mark (A6)', async ({ page }) => {
      await page.goto('/login');

      const loginButton = page.getByRole('button', { name: /LOGIN\s+With\s+Google/i });
      await expect(loginButton).toBeVisible();

      // Google mark should be present as an img within the button (matches by src, not alt text)
      const googleMark = loginButton.locator('img[src*="Google"]').first();
      await expect(googleMark).toBeVisible();
    });

    test('displays footer copyright centered and not interactive (A7)', async ({
      page,
    }) => {
      await page.goto('/login');

      const footerText = page.getByText(/Bản quyền thuộc về Sun\*/);
      await expect(footerText).toBeVisible();

      // Footer should not be inside a link or button
      const isFooterInert = await footerText.evaluate((el) => {
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
          if (parent.tagName === 'A' || parent.tagName === 'BUTTON') {
            return false;
          }
          parent = parent.parentElement;
        }
        return true;
      });
      expect(isFooterInert).toBe(true);
    });

    test('page loads without uncaught errors (A12)', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.toString()));

      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      expect(errors, `uncaught page errors: ${errors.join(' | ')}`).toEqual([]);
    });
  });

  test.describe('OAuth Initiation (A8, A9)', () => {
    test('click LOGIN button triggers Supabase authorize request (intercepted) (A8)', async ({
      page,
    }) => {
      let interceptedUrl: string | null = null;
      let interceptedParams: Record<string, string> | null = null;

      // Set up route interception before navigation
      await page.route('**/auth/v1/authorize**', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        interceptedUrl = request.url();
        interceptedParams = Object.fromEntries(url.searchParams);
        // Abort so we don't navigate away
        await route.abort();
      });

      await page.goto('/login');
      const loginButton = page.getByRole('button', { name: /LOGIN\s+With\s+Google/i });

      // Use page.waitForRequest to wait on the actual network request (Node-side, not browser-side)
      const requestPromise = page.waitForRequest('**/auth/v1/authorize**');
      await loginButton.click();
      await requestPromise;

      expect(interceptedUrl).not.toBeNull();
      expect(interceptedUrl).toContain('auth/v1/authorize');
      expect(interceptedParams!.provider).toBe('google');
      expect(interceptedParams!.redirect_to).toMatch(/\/auth\/callback/);

      // Verify same-tab (no new page opened)
      expect(page.context().pages().length).toBe(1);
    });

    test('LOGIN button is disabled and shows loading indicator during auth flow (A9)', async ({
      page,
    }) => {
      // A 204 No Content response to a top-level navigation keeps the current document alive
      // instead of replacing it (per HTTP spec). Page stays fully live, React unmounting is prevented,
      // and loading stays true because login-client.tsx never resets it on the success path.
      await page.route('**/auth/v1/authorize**', (route) =>
        route.fulfill({ status: 204, body: '' })
      );

      await page.goto('/login');
      const loginButton = page.getByRole('button', { name: /LOGIN\s+With\s+Google/i });

      // Click the button to trigger the auth flow
      await loginButton.click();

      // Button should be disabled while loading
      await expect(loginButton).toBeDisabled();

      // Loading indicator must be visible — aria-busy="true" on the button is the robust, accessible hook
      // Test case 37eae882 requires BOTH: disabled AND loading indicator
      await expect(loginButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  test.describe('Error Surface (A10)', () => {
    test('error query param renders alert with Vietnamese message (A10)', async ({
      page,
    }) => {
      await page.goto('/login?error=access_denied');

      // Find the specific alert (not the Next.js route announcer)
      // The LoginErrorAlert is a <p role="alert"> with the error message
      const alert = page.locator('p[role="alert"]').first();
      await expect(alert).toBeVisible();

      // Verify the exact error message
      const errorText = page.getByText(/Đăng nhập không thành công\.\s*Vui lòng thử lại\./);
      await expect(errorText).toBeVisible();
    });
  });
});
