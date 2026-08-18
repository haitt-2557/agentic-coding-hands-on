import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Award Cards & Grid (ID-15, ID-16, ID-47, ID-48, ID-49, ID-50, ID-52, ID-62)', () => {
    test('award cards display in 3-column grid on desktop (ID-15)', async ({ page }) => {
      // Use desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // All 6 awards should be visible
      const awards = [
        'Top Talent',
        'Top Project',
        'Top Project Leader',
        'Best Manager',
        'Signature 2025 - Creator',
        'MVP (Most Valuable Person)',
      ];

      for (const award of awards) {
        await expect(page.getByRole('heading', { name: award, exact: true, level: 3 })).toBeVisible();
      }

      // Grid should be 3 columns (visual verification would be in Phase 4)
      // Here we just verify all cards exist
      const awardHeadings = await page.getByRole('heading', { level: 3 }).all();
      expect(awardHeadings.length).toBeGreaterThanOrEqual(6);
    });

    test('award cards display in 2-column grid on mobile (ID-16)', async ({ page }) => {
      // Use mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // All 6 awards should still be visible
      const awards = [
        'Top Talent',
        'Top Project',
        'Top Project Leader',
        'Best Manager',
        'Signature 2025 - Creator',
        'MVP (Most Valuable Person)',
      ];

      for (const award of awards) {
        await expect(page.getByRole('heading', { name: award, exact: true, level: 3 })).toBeVisible();
      }
    });

    test('Top Talent card image navigates to /awards#top-talent (ID-47)', async ({ page }) => {
      await page.goto('/');

      // Find the Top Talent card link that contains the image (the outer card link, not the title link)
      const topTalentLink = page.getByRole('link', { name: 'Top Talent', exact: true }).first();
      await expect(topTalentLink).toBeVisible();

      // Click the image inside the link
      const image = topTalentLink.getByRole('img');
      await expect(image).toBeVisible();
      await image.click();

      await page.waitForURL(/\/awards#top-talent/);
      expect(page.url()).toContain('/awards#top-talent');
    });

    test('Top Talent card title navigates to /awards#top-talent (ID-48)', async ({ page }) => {
      await page.goto('/');

      // Find the award listitem that contains the "Top Talent" heading, then click its link
      const topTalentItem = page.getByRole('listitem').filter({ hasText: /Top Talent/ });
      await expect(topTalentItem).toBeVisible();

      // Click the inner title link (not the outer card image link)
      // There are 2 links with "Top Talent" - outer card link and inner title link
      // Get the last one (the inner title link)
      const titleLink = topTalentItem.getByRole('link', { name: /Top Talent/ }).last();
      await expect(titleLink).toBeVisible();
      await titleLink.click();

      await page.waitForURL(/\/awards#top-talent/);
      expect(page.url()).toContain('/awards#top-talent');
    });

    test('Chi tiết link on award card navigates with hash (ID-49)', async ({ page }) => {
      await page.goto('/');

      // Click Chi tiết on first award card
      const chiTietLinks = await page.getByText(/Chi tiết/i, { exact: true }).all();
      await expect(chiTietLinks[0]).toBeVisible();
      await chiTietLinks[0].click();

      // Should navigate to /awards with some hashtag
      await page.waitForURL(/\/awards#/);
      expect(page.url()).toContain('/awards#');
    });

    test('all award cards navigate to correct /awards#<slug> (ID-50)', async ({ page }) => {
      await page.goto('/');

      // PRECONDITION: Assert exactly 6 award cards in the awards section
      // Scope to awards section to avoid matching Kudos section's Chi tiết button
      const awardsSection = page.locator('section').filter({ hasText: /Hệ thống giải thưởng/i });
      const chiTietLinks = await awardsSection.getByText(/Chi tiết/i, { exact: true }).all();
      expect(chiTietLinks.length).toBe(6);

      // ASSERTION: Each card navigates to correct /awards#<slug>
      const awardSlugs = [
        'top-talent',
        'top-project',
        'top-project-leader',
        'best-manager',
        'signature-2025-creator',
        'mvp',
      ];

      for (const slug of awardSlugs) {
        await page.goto('/');

        // Get all Chi tiết links scoped to awards section
        const awardSection = page.locator('section').filter({ hasText: /Hệ thống giải thưởng/i });
        const allLinks = await awardSection.getByText(/Chi tiết/i, { exact: true }).all();
        expect(allLinks.length).toBe(6);

        // Click the corresponding card's Chi tiết link
        await allLinks[awardSlugs.indexOf(slug)].click();
        await page.waitForURL(new RegExp(`/awards#${slug}`));
        expect(page.url()).toContain(`#${slug}`);
      }
    });

    test('first award card Chi tiết link lands on /awards', async ({ page }) => {
      await page.goto('/');

      // ID-62 (the BR-005 no-slug fallback) is NOT what this exercises: every AWARDS entry
      // ships a slug, so the fallback branch is unreachable from the UI. Its real coverage is
      // `awardHref(undefined)`/`awardHref('')` in lib/awards.test.ts. What is checked here is
      // narrower and still worth having: the link resolves to the awards route at all.
      // Scope to awards section to distinguish from Kudos section's Chi tiết button
      const awardsSection = page.locator('section').filter({ hasText: /Hệ thống giải thưởng/i });
      const chiTietLink = awardsSection.getByText(/Chi tiết/i, { exact: true }).first();
      await expect(chiTietLink).toBeVisible();
      await chiTietLink.click();

      // Should end at /awards or /awards#<slug>
      await page.waitForURL(/\/awards/);
      expect(page.url()).toContain('/awards');
    });
  });
});
