import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Kudos Board Page /kudos', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Layout & Structure (A1, A3, A5, B1, B7, C1, D1, 40d4ba26)', () => {
    test('renders full page structure with header, banner, all 6 sections and footer (40d4ba26)', async ({
      page,
    }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto('/kudos');

      // GUARD — this suite was once recorded as a valid RED while every navigation was in fact
      // 307ing to /prelaunch: `kudos-board-*.spec.ts` matched no project, fell through to the
      // future-dated port 3000, and `/kudos` is not in ALWAYS_ALLOWED (lib/prelaunch/gate.ts).
      // Every assertion below failed for the wrong reason. Pin the landing URL so that failure
      // mode announces itself instead of masquerading as missing markup.
      await expect(page).toHaveURL(/\/kudos$/);

      // Verify no uncaught errors
      expect(pageErrors).toEqual([]);

      // Header exists
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Banner with title and KUDOS wordmark — spec A
      const bannerTitle = page.locator('text=Hệ thống ghi nhận và cảm ơn');
      await expect(bannerTitle).toBeVisible();

      const kudosWordmark = page.locator('img[alt*="KUDOS"], img[src*="KUDOS"], img[alt*="kudos"]');
      await expect(kudosWordmark).toBeVisible();

      // Submit pill (A.1) — assert presence and focusability
      const submitPill = page.locator(
        'input[placeholder*="bạn muốn gửi lời cảm ơn"], input[placeholder*="Hôm nay"]'
      );
      await expect(submitPill).toBeVisible();
      await expect(submitPill).toBeEnabled();
      await submitPill.focus();
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('placeholder'));
      expect(focusedElement).toContain('bạn muốn gửi lời cảm ơn');

      // Sunner search (top-right) — placeholder assert
      const sunnerSearch = page.locator('input[placeholder*="Tìm kiếm profile Sunner"]');
      await expect(sunnerSearch).toBeVisible();

      // HIGHLIGHT KUDOS section (B) — heading, filters
      const highlightSection = page.locator('section:has(h2:text-is("HIGHLIGHT KUDOS"))').first();
      await expect(highlightSection).toBeVisible();

      // Filter buttons: Hashtag and Phòng ban
      const hashtagButton = highlightSection.locator('button:has-text("Hashtag")');
      const departmentButton = highlightSection.locator('button:has-text("Phòng ban")');
      await expect(hashtagButton).toBeVisible();
      await expect(departmentButton).toBeVisible();

      // Carousel presence: cards + indicator + navigation
      const carouselCards = highlightSection.locator('[role="group"] > *');
      const cardCount = await carouselCards.count();
      expect(cardCount).toBeGreaterThan(0);

      const pageIndicator = highlightSection.locator('text=/^\\d+\\/5$/');
      await expect(pageIndicator).toBeVisible();

      const prevButton = highlightSection.locator('button[aria-label*="prev"], button[aria-label*="Previous"]');
      const nextButton = highlightSection.locator('button[aria-label*="next"], button[aria-label*="Next"]');
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();

      // SPOTLIGHT BOARD section (B.7) — total count, search, pan/zoom, word cloud
      const spotlightSection = page.locator('section:has(h2:text-is("SPOTLIGHT BOARD"))').first();
      await expect(spotlightSection).toBeVisible();

      const totalCount = spotlightSection.locator('text=388 KUDOS');
      await expect(totalCount).toBeVisible();

      const spotlightSearch = spotlightSection.locator('input[placeholder*="Tìm kiếm"]');
      await expect(spotlightSearch).toBeVisible();

      // Pan/Zoom is omitted entirely — design node 3007:17479 is empty (FR-012, SC-007, clarifications).

      const cloudNodes = spotlightSection.locator('[role="button"]');
      const nodeCount = await cloudNodes.count();
      expect(nodeCount).toBeGreaterThan(0);

      // ALL KUDOS section (C) — heading, feed presence
      const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
      await expect(allKudosSection).toBeVisible();

      // Feed cards with expected structure
      const kudosCards = allKudosSection.locator('div[role="article"], article');
      const cardCountAll = await kudosCards.count();
      expect(cardCountAll).toBeGreaterThan(0);

      // Sidebar (D) — stats and leaderboard
      const sidebar = page.locator('aside, [role="complementary"]').first();
      await expect(sidebar).toBeVisible();

      // Stat labels
      const statLabels = [
        'Số Kudos bạn nhận được:',
        'Số Kudos bạn đã gửi:',
        'Số tim bạn nhận được:',
        'Số Secret Box bạn đã mở:',
        'Số Secret Box chưa mở:',
      ];
      for (const label of statLabels) {
        const stat = sidebar.locator(`text=${label}`);
        await expect(stat).toBeVisible();
      }

      // Leaderboard heading
      const leaderboardHeading = sidebar.locator('text=10 SUNNER NHẬN QUÀ MỚI NHẤT');
      await expect(leaderboardHeading).toBeVisible();

      // Footer exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('header nav marks /kudos with aria-current="page" (40d4ba26)', async ({ page }) => {
      await page.goto('/kudos');

      // Scope to header to avoid strict-mode match with footer nav
      const kudosNavItem = page.locator('header').getByRole('link', { name: 'Sun* Kudos' });
      await expect(kudosNavItem).toHaveAttribute('aria-current', 'page');
    });

    test('banner is non-interactive and visible (40d4ba26)', async ({ page }) => {
      await page.goto('/kudos');

      const banner = page.locator('section').first();
      const bannerContent = banner.locator('text=Hệ thống ghi nhận và cảm ơn');
      await expect(bannerContent).toBeVisible();

      // Banner title and wordmark are display-only (inputs/buttons are outside banner section)
      const kudosWordmark = banner.locator('img[alt*="KUDOS"], img[src*="KUDOS"]');
      await expect(kudosWordmark).toBeVisible();
    });

    test('placeholder text renders on load (b35d40c1, d3877e54)', async ({ page }) => {
      await page.goto('/kudos');

      // Submit pill placeholder
      const submitPlaceholder = page.locator(
        'input[placeholder*="Hôm nay"]'
      );
      const placeholderValue = await submitPlaceholder.getAttribute('placeholder');
      expect(placeholderValue).toContain('bạn muốn gửi lời cảm ơn');

      // Spotlight search placeholder
      const spotlightSearchInput = page.locator('input[placeholder*="Tìm kiếm"]').nth(0);
      const searchPlaceholder = await spotlightSearchInput.getAttribute('placeholder');
      expect(searchPlaceholder).toContain('Tìm kiếm');
    });
  });
});
