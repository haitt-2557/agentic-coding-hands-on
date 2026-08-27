import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage i18n Content Gap - Regression (Bug: untranslated body content blocks on EN switch)', () => {
  test.beforeEach(seedDefaultSession);

  test('Root Further blockquote gloss translates VI→EN and back (regression)', async ({ page }) => {
    await page.goto('/');

    // PRECONDITION: Vietnamese gloss is visible
    await expect(
      page.getByText('(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)')
    ).toBeVisible();

    // Switch to EN
    const langButton = page.getByRole('button', { name: /VN|VI/i });
    await langButton.click();
    const enOption = page.getByRole('menuitem', { name: /EN/i });
    await expect(enOption).toBeVisible();
    await enOption.click();

    // ASSERTION: Vietnamese gloss is gone
    await expect(
      page.getByText('(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)')
    ).toHaveCount(0);
    // ASSERTION: English proverb is visible (use regex to avoid quote style brittleness)
    await expect(
      page.getByText(/A tree with deep roots fears no storm/)
    ).toBeVisible();
    // STRENGTHEN: Assert the EN gloss is visible (this is truly EN-specific)
    await expect(
      page.getByText('(English proverb)')
    ).toBeVisible();

    // Switch back to VI
    const enTrigger = page.getByRole('button', { name: /EN/i });
    await enTrigger.click();
    const viOption = page.getByRole('menuitem', { name: /VN|VI/i });
    await expect(viOption).toBeVisible();
    await viOption.click();

    // ASSERTION: Vietnamese gloss is back
    await expect(
      page.getByText('(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)')
    ).toBeVisible();
    // ASSERTION: EN gloss is gone
    await expect(
      page.getByText('(English proverb)')
    ).toHaveCount(0);
  });

  test('Root Further theme paragraphs translate VI→EN and back (regression)', async ({ page }) => {
    await page.goto('/');

    // PRECONDITION: distinctive fragment from first theme paragraph is visible
    await expect(
      page.getByText(/Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI/)
    ).toBeVisible();

    // Switch to EN
    const langButton = page.getByRole('button', { name: /VN|VI/i });
    await langButton.click();
    const enOption = page.getByRole('menuitem', { name: /EN/i });
    await expect(enOption).toBeVisible();
    await enOption.click();

    // ASSERTION: Vietnamese text is gone
    await expect(
      page.getByText(/Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI/)
    ).toHaveCount(0);

    // Switch back to VI
    const enTrigger = page.getByRole('button', { name: /EN/i });
    await enTrigger.click();
    const viOption = page.getByRole('menuitem', { name: /VN|VI/i });
    await expect(viOption).toBeVisible();
    await viOption.click();

    // ASSERTION: Vietnamese text is back
    await expect(
      page.getByText(/Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI/)
    ).toBeVisible();
  });

  test('Kudos section heading and promo translate VI→EN and back (regression)', async ({ page }) => {
    await page.goto('/');

    // PRECONDITION: Vietnamese heading is visible
    await expect(page.getByText('ĐIỂM MỚI CỦA SAA 2025')).toBeVisible();

    // PRECONDITION: Vietnamese promo body is visible
    await expect(
      page.getByText(/Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên/)
    ).toBeVisible();

    // Switch to EN
    const langButton = page.getByRole('button', { name: /VN|VI/i });
    await langButton.click();
    const enOption = page.getByRole('menuitem', { name: /EN/i });
    await expect(enOption).toBeVisible();
    await enOption.click();

    // ASSERTION: Vietnamese heading is gone
    await expect(page.getByText('ĐIỂM MỚI CỦA SAA 2025')).toHaveCount(0);

    // ASSERTION: Vietnamese promo body is gone
    await expect(
      page.getByText(/Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên/)
    ).toHaveCount(0);

    // Switch back to VI
    const enTrigger = page.getByRole('button', { name: /EN/i });
    await enTrigger.click();
    const viOption = page.getByRole('menuitem', { name: /VN|VI/i });
    await expect(viOption).toBeVisible();
    await viOption.click();

    // ASSERTION: Vietnamese heading is back
    await expect(page.getByText('ĐIỂM MỚI CỦA SAA 2025')).toBeVisible();

    // ASSERTION: Vietnamese promo body is back
    await expect(
      page.getByText(/Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên/)
    ).toBeVisible();
  });

  test('Award card descriptions translate VI→EN and back (regression)', async ({ page }) => {
    await page.goto('/');

    // PRECONDITION: Top Talent award description in Vietnamese is visible
    await expect(
      page.getByText('Vinh danh top cá nhân xuất sắc trên mọi phương diện')
    ).toBeVisible();

    // Switch to EN
    const langButton = page.getByRole('button', { name: /VN|VI/i });
    await langButton.click();
    const enOption = page.getByRole('menuitem', { name: /EN/i });
    await expect(enOption).toBeVisible();
    await enOption.click();

    // ASSERTION: Vietnamese description is gone
    await expect(
      page.getByText('Vinh danh top cá nhân xuất sắc trên mọi phương diện')
    ).toHaveCount(0);

    // Switch back to VI
    const enTrigger = page.getByRole('button', { name: /EN/i });
    await enTrigger.click();
    const viOption = page.getByRole('menuitem', { name: /VN|VI/i });
    await expect(viOption).toBeVisible();
    await viOption.click();

    // ASSERTION: Vietnamese description is back
    await expect(
      page.getByText('Vinh danh top cá nhân xuất sắc trên mọi phương diện')
    ).toBeVisible();
  });
});
