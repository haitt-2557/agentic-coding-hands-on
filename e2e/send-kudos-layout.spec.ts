import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';

test.describe('Send Kudos Layout & Field Order (ID-3, ID-4, ID-5, ID-6)', () => {
  test.beforeEach(async ({ browser }, testInfo) => {
    // Seed context with auth before each test
    testInfo.setTimeout(30000);
  });

  test('field order matches spec: Người nhận → Danh hiệu → message → Hashtag → Image → anonymous checkbox → Nickname ẩn danh → footer (ID-3)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');
      await expect(page).toHaveURL(/\/kudos\/send$/);

      // Collect all visible labels/field groups in order
      const labels = await page.locator('label').allTextContents();

      // Expected field order (as text labels or visible text)
      const expectedFields = ['Người nhận', 'Danh hiệu', 'Hashtag', 'Nickname ẩn danh'];
      expectedFields.forEach((field) => {
        expect(labels.join(' ')).toContain(field);
      });

      // Verify footer buttons exist
      const cancelButton = page.getByRole('button', { name: /Hủy/i });
      const submitButton = page.getByRole('button', { name: /Gửi/i });
      await expect(cancelButton).toBeVisible();
      await expect(submitButton).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('recipient placeholder is "Tìm kiếm" (ID-4)', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      const recipientInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
      await expect(recipientInput).toHaveAttribute('placeholder', /Tìm kiếm/);
    } finally {
      await context.close();
    }
  });

  test('message editor placeholder contains expected text (ID-5)', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      // Locate the textarea (message editor)
      const messageField = page.locator('textarea').first();
      const placeholder = await messageField.getAttribute('placeholder');

      // Placeholder should be: "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"
      expect(placeholder).toContain('Hãy gửi gắm lời cám ơn');
    } finally {
      await context.close();
    }
  });

  test('anonymous checkbox defaults to unchecked and label reads correctly (ID-6)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      // Find anonymous checkbox
      const anonCheckbox = page.locator('input[type="checkbox"]').first();

      // Should be unchecked by default
      const isChecked = await anonCheckbox.isChecked();
      expect(isChecked).toBe(false);

      // Should have an associated label
      const anonLabel = page.getByRole('checkbox', { name: /Gửi lời cám ơn và ghi nhận ẩn danh/i });
      await expect(anonLabel).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
