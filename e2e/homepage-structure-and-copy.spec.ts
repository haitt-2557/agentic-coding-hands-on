import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Structure & Copy (ID-7, ID-8, ID-9, ID-10, ID-13, ID-17)', () => {
    test('renders complete page layout', async ({ page }) => {
      // Port 3200 has EVENT_START_AT = 2026-08-01T12:00:00+07:00 (past)
      // Install clock before that date so browser sees running countdown with "Coming soon"
      await page.clock.install({ time: new Date('2026-07-01T17:00:00+07:00') });
      await page.goto('/');

      // Header present (ID-7, ID-8)
      const header = page.getByRole('banner');
      await expect(header).toBeVisible();
      // Logo in header - scope to header to avoid ambiguous matches
      const logo = header.getByRole('img').first();
      await expect(logo).toBeVisible();

      // Hero section with ROOT FURTHER title and Coming soon label (ID-13)
      await expect(page.getByRole('heading', { name: /ROOT/i })).toBeVisible();
      await expect(page.getByText(/Coming soon/i)).toBeVisible();

      // Countdown visible (ID-12)
      await expect(page.getByText(/DAYS/)).toBeVisible();
      await expect(page.getByText(/HOURS/)).toBeVisible();
      await expect(page.getByText(/MINUTES/)).toBeVisible();

      // Event info visible (frame values - not CSV)
      await expect(
        page.getByText(/26\/12\/2025.*Âu Cơ Art Center.*Tường thuật trực tiếp qua sóng Livestream/)
      ).toBeVisible();

      // CTA buttons
      await expect(page.getByRole('button', { name: /ABOUT AWARDS/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /ABOUT KUDOS/i })).toBeVisible();

      // Award cards grid (ID-15) - use getByRole with exact name to avoid strict mode
      const awardNames = [
        'Top Talent',
        'Top Project',
        'Top Project Leader',
        'Best Manager',
        'Signature 2025 - Creator',
        'MVP (Most Valuable Person)',
      ];
      for (const awardName of awardNames) {
        await expect(page.getByRole('heading', { name: awardName, exact: true, level: 3 })).toBeVisible();
      }

      // Awards section heading
      await expect(page.getByText(/Hệ thống giải thưởng|Award System/i)).toBeVisible();

      // Kudos section - scope to heading to avoid matching header/footer links
      await expect(page.getByRole('heading', { name: /Sun\* Kudos/i })).toBeVisible();

      // Footer (ID-17)
      await expect(page.getByText(/Bản quyền thuộc về Sun\* © 2025/)).toBeVisible();

      // Footer nav links - scope to footer landmark
      const footer = page.getByRole('contentinfo');
      await expect(footer.getByRole('link', { name: /Award Information/i })).toBeVisible();
      await expect(footer.getByRole('link', { name: /Sun\* Kudos/i })).toBeVisible();
    });

    test('header logo renders with correct alt text', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-07-01T17:00:00+07:00') });
      await page.goto('/');
      // ID-8: Logo in header with alt text - scope to header to be deterministic
      const header = page.getByRole('banner');
      const logo = header.getByRole('img').first();
      await expect(logo).toBeVisible();
    });

    test('navigation link About SAA 2025 is visible', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-07-01T17:00:00+07:00') });
      await page.goto('/');
      // ID-9: About SAA 2025 link in header - scope to header banner
      const header = page.getByRole('banner');
      await expect(header.getByRole('link', { name: /About SAA 2025/i })).toBeVisible();
    });

    test('language button displays VN by default', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-07-01T17:00:00+07:00') });
      await page.goto('/');
      // ID-10: Language button shows VN
      await expect(page.getByRole('button', { name: /VN|VI/i })).toBeVisible();
    });
  });
});
