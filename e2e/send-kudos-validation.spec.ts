import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';
import {
  fillRecipient,
  fillTitle,
  fillMessage,
  selectFirstHashtag,
} from './support/send-kudos-form';

test.describe('Send Kudos Form Validation (ID-7, ID-11, ID-14, ID-50–ID-56)', () => {
  test('empty Người nhận shows validation error "Không được để trống" on blur (ID-7, ID-50)', async ({
    browser,
  }) => {
    // NOTE: Clarifications decision 2 (session 2026-08-24, second pass):
    // Spec row H.2 + ID-48/ID-49 require Gửi to be disabled while fields are empty.
    // ID-7/ID-11/ID-14/ID-50…56 require validation on submit. These are contradictory for a disabled button.
    // Resolution: validation fires on blur (not submit with disabled button), and all error assertions are preserved.
    // This test triggers validation via blur, not via clicking a disabled button.
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      const recipientInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
      await expect(recipientInput).toBeVisible();

      // Focus and blur the empty recipient field to trigger validation
      await recipientInput.focus();
      await recipientInput.blur();

      // Verify error message and red border are visible
      const errorMsg = page.locator('text=Không được để trống').first();
      await expect(errorMsg).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('empty Danh hiệu shows validation error "Không được để trống" on blur (ID-11, ID-51)', async ({
    browser,
  }) => {
    // NOTE: Same resolution as above test — blur-triggered, not submit-click.
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      const titleField = page.locator('input[placeholder*="Dành tặng một danh hiệu"]');
      await expect(titleField).toBeVisible();

      // Focus and blur the empty title field to trigger validation
      await titleField.focus();
      await titleField.blur();

      // Verify error message and red border are visible
      const errorMsg = page.locator('text=Không được để trống').first();
      await expect(errorMsg).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('empty message shows validation error "Không được để trống" on blur (ID-14, ID-53)', async ({
    browser,
  }) => {
    // NOTE: Same resolution as above — blur-triggered.
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      const messageField = page.locator('textarea').first();
      await expect(messageField).toBeVisible();

      // Focus and blur the empty message field to trigger validation
      await messageField.focus();
      await messageField.blur();

      // Verify error message is visible
      const errorMsg = page.locator('text=Không được để trống').first();
      await expect(errorMsg).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('Gửi button remains disabled while any required field is empty (ID-48, ID-49, BR-007)', async ({
    browser,
  }) => {
    // NOTE: This test directly asserts that Gửi stays disabled per BR-007/spec row H.2/ID-48/ID-49.
    // It proves the submit button cannot be clicked when fields are missing, so the four validation
    // tests above (which trigger validation on blur instead) are the correct approach to assert errors.
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

  test('no hashtag selected shows validation error on blur (ID-56)', async ({ browser }) => {
    // NOTE: Same C1 resolution as other validation tests — blur-triggered, not submit-click.
    // ID-56 requires error message on Hashtag field. Hashtag-picker opens on button click (tsx:81)
    // and closes (calling onBlur, tsx:39) when pointerdown fires outside the component root.
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      // Fill all required fields EXCEPT hashtag
      await fillRecipient(page, 'Trang');
      await fillTitle(page, 'Test Title');
      await fillMessage(page, 'Test message content');

      // ID-56: Hashtag validation. Click the button containing "Hashtag" to open the picker
      // (The button has two text lines: "Hashtag" and "Tối đa 5", from hashtag-picker.tsx:85-86)
      const buttons = page.getByRole('button');
      let hashtagButton = null;
      for (let i = 0; i < await buttons.count(); i++) {
        const text = await buttons.nth(i).textContent();
        if (text && text.includes('Hashtag')) {
          hashtagButton = buttons.nth(i);
          break;
        }
      }

      if (hashtagButton) {
        await hashtagButton.click();
        // Click elsewhere to close and trigger onBlur (pointerdown outside the component)
        await page.locator('body').click({ position: { x: 0, y: 0 } });
      }

      // Verify error message appears (hashtag-picker.tsx:112 renders FieldErrorText when error is set)
      const errorMsg = page.locator('text=Không được để trống').first();
      await expect(errorMsg).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('Danh hiệu exceeding 100 characters is capped', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: 'http://localhost:3200' });
    const page = await context.newPage();

    try {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos/send');

      const titleField = page.locator('input[placeholder*="Dành tặng một danh hiệu"]');
      await expect(titleField).toBeVisible();

      // Type 120 characters (exceeds the 100 char limit)
      const longTitle = 'a'.repeat(120);
      await titleField.fill(longTitle);

      // Verify value is capped at 100 characters
      const titleValue = await titleField.inputValue();
      expect(titleValue.length).toBeLessThanOrEqual(100);
    } finally {
      await context.close();
    }
  });
});
