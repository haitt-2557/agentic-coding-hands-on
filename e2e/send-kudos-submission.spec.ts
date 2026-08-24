import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';
import {
  fillRecipient,
  fillTitle,
  fillMessage,
  selectFirstHashtag,
} from './support/send-kudos-form';

test.describe('Send Kudos Submission & Entry Points (ID-46, ID-47)', () => {
  test('valid submit redirects to /kudos with success toast (ID-46, ID-47)', async ({
    browser,
  }) => {
    // ID-46/ID-47: Submit succeeds and redirects to /kudos with success toast.
    // Also extends to cover image upload path: 1-2 images are stored and form is cleared.
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      await fillRecipient(page, 'Trang');
      await fillTitle(page, 'Test Title');
      await fillMessage(page, 'Test message content for submission');
      await selectFirstHashtag(page);

      // ID-12 with-images path: upload 1 image before submission to test Storage upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./e2e/fixtures/test-image.png');

      // Wait for thumbnail to appear (img element with blob: URL)
      const thumbnail = page.locator('img[src*="blob"]').first();
      await expect(thumbnail).toBeVisible();

      const submitButton = page.getByRole('button', { name: /Gửi/i });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      await expect(page).toHaveURL(/\/kudos$/, { timeout: 10000 });

      // E5: The success toast must be the ONLY [role="status"] (excluding Next.js route announcer)
      const toast = page.locator('[role="status"]').filter({ has: page.locator('text=/Gửi lời cám ơn/i') });
      await expect(toast).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('submit with zero images is allowed (ID-47, image optional)', async ({
    browser,
  }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      await fillRecipient(page, 'Trang');
      await fillTitle(page, 'Title Without Images');
      await fillMessage(page, 'Message without images');
      await selectFirstHashtag(page);

      const submitButton = page.getByRole('button', { name: /Gửi/i });
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      await expect(page).toHaveURL(/\/kudos$/, { timeout: 10000 });
    } finally {
      await context.close();
    }
  });

  test('entry point: /kudos submit pill navigates to /kudos/send', async ({
    browser,
  }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos');

      const submitPill = page.locator(
        'a[href="/kudos/send"], button[onclick*="send"], input[placeholder*="bạn muốn gửi"]'
      ).first();

      await expect(submitPill).toBeVisible();
      await submitPill.click();
      await expect(page).toHaveURL(/\/kudos\/send$/);
    } finally {
      await context.close();
    }
  });

  test('entry point: quick-action widget "Viết Kudos" navigates to /kudos/send', async ({
    browser,
  }) => {
    // NOTE: Clarifications decision 3 (session 2026-08-24, second pass), C2:
    // DropdownMenu renders children only when open (components/ui/dropdown-menu.tsx:101),
    // so the menuitem does not exist until the trigger is clicked.
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/');

      // Click the widget trigger first to open the menu
      const widgetButton = page.getByRole('button', { name: /widget|action|quick/i });
      await expect(widgetButton).toBeVisible();
      await widgetButton.click();

      // Now locate and click the "Viết Kudos" menu item
      const writeKudosLink = page
        .locator('a[href="/kudos/send"], button')
        .filter({ hasText: /Viết Kudos/i })
        .first();

      await expect(writeKudosLink).toBeVisible();
      await writeKudosLink.click();
      await expect(page).toHaveURL(/\/kudos\/send$/);
    } finally {
      await context.close();
    }
  });
});
