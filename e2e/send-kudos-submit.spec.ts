import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';
import {
  fillRecipient,
  fillTitle,
  fillMessage,
  selectFirstHashtag,
} from './support/send-kudos-form';

test.describe('Send Kudos Submit State & Cancel (ID-45, ID-48, ID-49)', () => {
  test('Gửi button is disabled until all required fields are filled (ID-48, ID-49)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      const submitButton = page.getByRole('button', { name: /Gửi/i });

      // Initially disabled (all fields empty)
      await expect(submitButton).toBeDisabled();

      await fillRecipient(page, 'Trang');
      await expect(submitButton).toBeDisabled();

      await fillTitle(page, 'Test Title');
      await expect(submitButton).toBeDisabled();

      await fillMessage(page, 'Test message content here');
      await expect(submitButton).toBeDisabled();

      await selectFirstHashtag(page);

      // Now enabled
      await expect(submitButton).toBeEnabled();
    } finally {
      await context.close();
    }
  });

  test('Hủy button discards form and returns to /kudos without saving (ID-45)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      await fillRecipient(page, 'Trang');
      await fillTitle(page, 'Test Title');

      const cancelButton = page.getByRole('button', { name: /Hủy/i });
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();

      await expect(page).toHaveURL(/\/kudos$/);
    } finally {
      await context.close();
    }
  });
});
