import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Award System Page /awards', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Layout & Copy (A1, A3, A5, A6, A11, A13)', () => {
    test('renders full page structure with header, hero, title, nav, 6 sections, Kudos, footer (A1)', async ({
      page,
    }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto('/awards');

      // Verify no uncaught errors (A13)
      expect(pageErrors).toEqual([]);

      // Header exists
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Hero keyvisual exists — ROOT FURTHER logo + no countdown/CTA (FR-001 requirement, not testing class name)
      const rootFurtherLogo = page.locator('img[src*="Root_Further_Logo"]');
      await expect(rootFurtherLogo).toBeVisible();
      // Verify no countdown timer exists in the hero section
      const hero = page.locator('main').locator(':scope > section').first();
      const countdownInHero = hero.locator('[role="timer"]');
      await expect(countdownInHero).not.toBeVisible();

      // Title block: muted subtitle + gold heading (A3)
      const subtitle = page.locator('text=Sun* Annual Awards 2025');
      const heading = page.locator('h1:has-text("Hệ thống giải thưởng SAA 2025")');
      await expect(subtitle).toBeVisible();
      await expect(heading).toBeVisible();

      // Category nav with 6 items — scope to the awards nav (not header or footer nav)
      const nav = page.locator('nav').filter({ has: page.locator('a[href*="#"]') });
      await expect(nav).toBeVisible();
      const navItems = nav.locator('a[href*="#"]');
      const itemCount = await navItems.count();
      expect(itemCount).toBe(6);

      // Six award sections with content (A5)
      const awardTitles = [
        'Top Talent',
        'Top Project',
        'Top Project Leader',
        'Best Manager',
        'Signature 2025 - Creator',
        'MVP (Most Valuable Person)',
      ];

      for (const title of awardTitles) {
        const section = page.locator(`section:has-text("${title}")`).first();
        await expect(section).toBeVisible();

        // Long description exists
        const desc = section.locator('p');
        await expect(desc.first()).toBeVisible();

        // Quantity label and value — use :first() in case of multiple rows (Signature has 2 prize rows)
        const quantityLabel = section.locator('text=Số lượng giải thưởng:').first();
        await expect(quantityLabel).toBeVisible();

        // Prize label and value — use :first() in case of multiple rows (Signature has 2 prize rows)
        const prizeLabel = section.locator('text=Giá trị giải thưởng:').first();
        await expect(prizeLabel).toBeVisible();

        // Award graphic with alt text (A6)
        const graphic = section.locator(`img[alt="${title}"]`);
        await expect(graphic).toBeVisible();
      }

      // Kudos block (A11) — scope to the section containing these elements (not header/footer links)
      const kudosSection = page.locator('section').filter({ has: page.locator('text=Phong trào ghi nhận') });
      const kudosLabel = kudosSection.locator('text=Phong trào ghi nhận');
      const kudosTitle = kudosSection.locator('h2:text-is("Sun* Kudos")');
      await expect(kudosLabel).toBeVisible();
      await expect(kudosTitle).toBeVisible();

      // Kudos CTA
      const kudosLink = page.getByRole('link', { name: /Chi tiết/i });
      await expect(kudosLink).toBeVisible();

      // Footer exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('award sections render exact quantities and prizes (A5)', async ({ page }) => {
      await page.goto('/awards');

      // Top Talent: 10 Cá nhân / 7.000.000 VNĐ — cho mỗi giải thưởng
      const topTalent = page.locator('section:has-text("Top Talent")').first();
      await expect(topTalent.locator('text=10')).toBeVisible();
      // Scope "Cá nhân" to the quantity row only (not the description which also contains "cá nhân")
      await expect(topTalent.locator('span:text-is("Cá nhân")')).toBeVisible();
      await expect(topTalent.locator('text=7.000.000 VNĐ')).toBeVisible();
      await expect(topTalent.locator('text=cho mỗi giải thưởng')).toBeVisible();

      // Top Project: 02 Tập thể / 15.000.000 VNĐ
      const topProject = page.locator('section:has-text("Top Project")').first();
      await expect(topProject.locator('text=02')).toBeVisible();
      // Scope "Tập thể" to the quantity unit (exact match to avoid description text)
      await expect(topProject.locator('span:text-is("Tập thể")')).toBeVisible();
      await expect(topProject.locator('text=15.000.000 VNĐ')).toBeVisible();

      // Best Manager: 01 Cá nhân / 10.000.000 VNĐ (NO note row)
      const bestManager = page.locator('section:has-text("Best Manager")').first();
      await expect(bestManager.locator('text=01')).toBeVisible();
      await expect(bestManager.locator('text=10.000.000 VNĐ')).toBeVisible();
      // Verify the note row is NOT present for Best Manager
      const bestMgrNote = bestManager.locator('text=cho mỗi giải thưởng');
      await expect(bestMgrNote).not.toBeVisible();

      // Signature 2025 - Creator: two prize lines with "Hoặc" separator
      const signature = page.locator('section:has-text("Signature 2025 - Creator")').first();
      await expect(signature.locator('text=5.000.000 VNĐ')).toBeVisible();
      await expect(signature.locator('text=8.000.000 VNĐ')).toBeVisible();
      // "Hoặc" appears in the separator between prize rows (not in description)
      await expect(signature.locator('span:text-is("Hoặc")')).toBeVisible();

      // MVP: 01 Cá nhân / 15.000.000 VNĐ (NO note row)
      const mvp = page.locator('section:has-text("MVP (Most Valuable Person)")').first();
      await expect(mvp.locator('text=01')).toBeVisible();
      await expect(mvp.locator('text=15.000.000 VNĐ')).toBeVisible();
      // Verify the note row is NOT present for MVP
      const mvpNote = mvp.locator('text=cho mỗi giải thưởng');
      await expect(mvpNote).not.toBeVisible();
    });
  });
});
