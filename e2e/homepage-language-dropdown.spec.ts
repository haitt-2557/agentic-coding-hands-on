import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage Language Dropdown — Design Contract (F005)', () => {
  test.beforeEach(seedDefaultSession);

  test('Design contract: panel chrome, row styling, flags, selected state, trigger update, and locale swap', async ({ page }) => {
    await page.goto('/');

    // Precondition: Verify Vietnamese copy is present before switching
    await expect(page.getByRole('heading', { name: 'Hệ thống giải thưởng' })).toBeVisible();

    // Step 1: Click language trigger to open the dropdown menu
    const langButton = page.getByRole('button', { name: /VN|VI/i });
    await expect(langButton).toBeVisible();
    await langButton.click();

    // Assertion 1: Panel chrome — background-color, border-radius, padding, border
    // NOTE: aria-labelledby beats aria-label, so menu's accessible name is the trigger text,
    // not "Language". Select with getByRole('menu') alone.
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // Background color: rgb(0, 7, 12)
    await expect(menu).toHaveCSS('background-color', 'rgb(0, 7, 12)');

    // Border radius: 8px
    await expect(menu).toHaveCSS('border-radius', '8px');

    // Padding: 6px
    await expect(menu).toHaveCSS('padding', '6px');

    // Border: 1px solid rgb(153, 140, 95)
    await expect(menu).toHaveCSS('border-width', '1px');
    await expect(menu).toHaveCSS('border-style', 'solid');
    await expect(menu).toHaveCSS('border-color', 'rgb(153, 140, 95)');

    // Assertion 2: Flag images in each row
    const rows = page.getByRole('menuitem');
    const allRows = await rows.all();
    expect(allRows.length).toBe(2);

    // VN row (first) should contain Flag_VN.svg
    const vnFlag = allRows[0].locator('img');
    await expect(vnFlag).toBeVisible();
    const vnSrc = await vnFlag.getAttribute('src');
    expect(vnSrc).toContain('Flag_VN.svg');

    // EN row (second) should contain Flag_EN.svg
    const enFlag = allRows[1].locator('img');
    await expect(enFlag).toBeVisible();
    const enSrc = await enFlag.getAttribute('src');
    expect(enSrc).toContain('Flag_EN.svg');

    // Assertion 3: Selected row background (VN at default locale)
    // VN row is first; at default locale it should be selected with aria-current="true"
    const vnRow = allRows[0];
    const isCurrent = await vnRow.getAttribute('aria-current');
    expect(isCurrent).toBe('true');

    // Selected row background: rgba(255, 234, 158, 0.2)
    await expect(vnRow).toHaveCSS('background-color', 'rgba(255, 234, 158, 0.2)');

    // Unselected row (EN, second row) should NOT have this background
    const unselectedRow = allRows[1];
    const unselectedBg = await unselectedRow.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    // Should be transparent or the panel background, not the selected highlight
    expect(unselectedBg).not.toBe('rgba(255, 234, 158, 0.2)');

    // Assertion 4: Row box size (~110×56px) and label text/styling
    // Both rows should be ~110×56px; allow ±1px tolerance per spec
    const rowBounds = await allRows[0].boundingBox();
    expect(rowBounds).not.toBeNull();
    if (rowBounds) {
      expect(rowBounds.width).toBeGreaterThanOrEqual(109);
      expect(rowBounds.width).toBeLessThanOrEqual(111);
      expect(rowBounds.height).toBeGreaterThanOrEqual(55);
      expect(rowBounds.height).toBeLessThanOrEqual(57);
    }

    // Label text: VN (selected) and EN (unselected)
    const vnLabel = allRows[0].getByText('VN');
    const enLabel = allRows[1].getByText('EN');
    await expect(vnLabel).toBeVisible();
    await expect(enLabel).toBeVisible();

    // Font weight: 700
    await expect(vnLabel).toHaveCSS('font-weight', '700');
    await expect(enLabel).toHaveCSS('font-weight', '700');

    // Font size: 16px
    await expect(vnLabel).toHaveCSS('font-size', '16px');
    await expect(enLabel).toHaveCSS('font-size', '16px');

    // Line height: 24px
    await expect(vnLabel).toHaveCSS('line-height', '24px');
    await expect(enLabel).toHaveCSS('line-height', '24px');

    // Assertion 5: Trigger shows EN flag after locale switch
    // Click the EN row to switch locale
    const enRow = allRows[1];
    await enRow.click();

    // Menu should close after clicking
    await expect(menu).toHaveCount(0);

    // Trigger button should update to show EN flag
    const updatedTrigger = page.getByRole('button', { name: /EN/i });
    await expect(updatedTrigger).toBeVisible();

    // The trigger should contain an img with Flag_EN.svg
    // NOTE: trigger has two images (flag + chevron), so scope to flag only with src attribute filter
    const triggerFlag = updatedTrigger.locator('img[src*="Flag_"]');
    await expect(triggerFlag).toBeVisible();
    const triggerSrc = await triggerFlag.getAttribute('src');
    expect(triggerSrc).toContain('Flag_EN.svg');

    // Assertion 6: Clicking EN row closes panel AND swaps copy (proves SM-001 not broken)
    // Reopen the menu to verify it's closed after the interaction
    const reopenTrigger = page.getByRole('button', { name: /EN/i });
    await expect(reopenTrigger).toBeVisible();

    // Verify locale swap worked: Vietnamese copy gone, English copy present
    // "Award System" should be visible (English heading for "Hệ thống giải thưởng")
    await expect(page.getByRole('heading', { name: 'Award System' })).toBeVisible();

    // Vietnamese copy should be gone
    await expect(page.getByText('Hệ thống giải thưởng')).toHaveCount(0);

    // Verify the menu is closed by reopening and checking state
    await reopenTrigger.click();
    const reopenedMenu = page.getByRole('menu');
    await expect(reopenedMenu).toBeVisible();

    // EN row should now be selected (aria-current="true") — get fresh menuitems from reopened menu
    const reopenedRows = page.getByRole('menuitem');
    const reopenedAllRows = await reopenedRows.all();
    const enRowNow = reopenedAllRows[1];
    const isCurrentNow = await enRowNow.getAttribute('aria-current');
    expect(isCurrentNow).toBe('true');

    // EN row should have the selected highlight background
    await expect(enRowNow).toHaveCSS('background-color', 'rgba(255, 234, 158, 0.2)');
  });
});
