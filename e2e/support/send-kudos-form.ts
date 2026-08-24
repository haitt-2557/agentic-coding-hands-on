import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Fill the recipient field by typing and selecting the first matching option.
 * Asserts preconditions at each step instead of guarding them.
 */
export async function fillRecipient(page: Page, name: string): Promise<void> {
  const recipientInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
  await expect(recipientInput).toBeVisible();

  await recipientInput.fill(name);
  await page.waitForTimeout(300);

  const recipientOption = page.locator('[role="option"]').first();
  await expect(recipientOption).toBeVisible();
  await recipientOption.click();
}

/**
 * Fill the Danh hiệu (title) field.
 * Asserts preconditions at each step instead of guarding them.
 */
export async function fillTitle(page: Page, title: string): Promise<void> {
  const titleField = page.locator('input[placeholder*="Dành tặng một danh hiệu"]');
  await expect(titleField).toBeVisible();
  await titleField.fill(title);
}

/**
 * Fill the message field.
 * Asserts preconditions at each step instead of guarding them.
 */
export async function fillMessage(page: Page, message: string): Promise<void> {
  const messageField = page.locator('textarea').first();
  await expect(messageField).toBeVisible();
  await messageField.fill(message);
}

/**
 * Select the first hashtag from the dropdown.
 * Opens the dropdown by clicking the + Hashtag button first (Clarifications C3).
 * Asserts preconditions at each step instead of guarding them.
 */
export async function selectFirstHashtag(page: Page): Promise<void> {
  // Click the + Hashtag button to open the dropdown (spec row E: "Click '+ Hashtag': mở dropdown để thêm")
  const hashtagButton = page.locator('button').filter({ hasText: /\+ Hashtag|Tối đa 5/i }).first();
  await expect(hashtagButton).toBeVisible();
  await hashtagButton.click();

  // Now select the first hashtag option from the opened dropdown
  const hashtagOption = page.locator('[role="option"]').first();
  await expect(hashtagOption).toBeVisible();
  await hashtagOption.click();
  await page.waitForTimeout(200);
}

/**
 * Fill all required fields: recipient, title, message, and one hashtag.
 * Each step asserts its precondition instead of guarding it.
 */
export async function fillAllRequiredFields(
  page: Page,
  recipient: string = 'Thái Anh',
  title: string = 'Test Title',
  message: string = 'Test message content'
): Promise<void> {
  await fillRecipient(page, recipient);
  await fillTitle(page, title);
  await fillMessage(page, message);
  await selectFirstHashtag(page);
}
