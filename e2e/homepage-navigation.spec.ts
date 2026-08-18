import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Navigation (ID-18, ID-19, ID-20, ID-21, ID-22, ID-44, ID-45, ID-55, ID-59)', () => {
    test('header logo navigates to homepage and scrolls top (ID-18)', async ({ page }) => {
      await page.goto('/');
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Click header logo - find the link in header that wraps the logo image
      const header = page.getByRole('banner');
      const headerLogo = header.getByRole('link').filter({ has: page.getByRole('img') }).first();
      await expect(headerLogo).toBeVisible();
      await headerLogo.click();

      // Verify navigated to homepage
      expect(page.url()).toContain('/');

      // Verify scrolled to top
      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBeLessThan(100);
    });

    test('About Awards CTA button navigates to /awards', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.getByRole('button', { name: /ABOUT AWARDS/i });
      await expect(ctaButton).toBeVisible();
      await ctaButton.click();

      // Navigation should go to /awards
      await page.waitForURL(/\/awards/);
      expect(page.url()).toContain('/awards');
    });

    test('About Kudos CTA button navigates to /kudos', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.getByRole('button', { name: /ABOUT KUDOS/i });
      await expect(ctaButton).toBeVisible();
      await ctaButton.click();

      // Navigation should go to /kudos
      await page.waitForURL(/\/kudos/);
      expect(page.url()).toContain('/kudos');
    });

    test('Award Information header link navigates to /awards (ID-21)', async ({ page }) => {
      await page.goto('/');
      // Award Information link in header - scope to header to distinguish from footer
      const header = page.getByRole('banner');
      const awardLink = header.getByRole('link', { name: /Award Information/i });
      await expect(awardLink).toBeVisible();
      await awardLink.click();

      await page.waitForURL(/\/awards/);
      expect(page.url()).toContain('/awards');
    });

    test('Sun* Kudos header link navigates to /kudos (ID-22)', async ({ page }) => {
      await page.goto('/');
      // Sun* Kudos link in header - scope to header to distinguish from footer
      const header = page.getByRole('banner');
      const kudosLink = header.getByRole('link', { name: /Sun\* Kudos/i });
      await expect(kudosLink).toBeVisible();
      await kudosLink.click();

      await page.waitForURL(/\/kudos/);
      expect(page.url()).toContain('/kudos');
    });

    test('no broken links on page (ID-59)', async ({ page }) => {
      await page.goto('/');

      // PRECONDITION: Assert homepage content is rendered (links should exist)
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('heading', { name: /ROOT|FURTHER/i })).toBeVisible();

      // Every internal destination, fragment stripped and deduped — `/awards#top-talent`
      // and `/awards#mvp` are the same document, so fetching each slug separately would
      // only re-prove the same route.
      const hrefs = await page.getByRole('link').evaluateAll((links) =>
        links.map((link) => link.getAttribute('href')),
      );
      const destinations = [
        ...new Set(
          hrefs
            .filter((href): href is string => !!href && href.startsWith('/'))
            .map((href) => href.split('#')[0])
            .filter(Boolean),
        ),
      ];

      // Guard the guard: on the stock Next.js scaffold this list is empty and the loop
      // below would pass by doing nothing.
      expect(destinations.length).toBeGreaterThan(0);

      // ID-59: the test's name is "no broken links", so it has to actually resolve them.
      // page.request skips a full navigation per link while still making a real HTTP round
      // trip, which is what a 404 would show up in.
      for (const href of destinations) {
        const response = await page.request.get(href);
        expect(response.status(), `${href} must not be a broken link`).toBe(200);
      }
    });
  });
});
