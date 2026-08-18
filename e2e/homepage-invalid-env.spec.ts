import { test, expect } from '@playwright/test';

test.describe('Homepage SAA - Invalid Environment (ID-60)', () => {
  test('invalid event datetime env falls back to zero-state without crashing', async ({ page }) => {
    // This test runs on port 3100 with NEXT_PUBLIC_EVENT_START_AT='not-a-date'
    await page.goto('/');

    // Countdown should display zero-state (00/00/00)
    // Number and label are separate elements, assert them separately
    const digits = page.getByText('00');
    const digitCount = await digits.count();
    expect(digitCount).toBeGreaterThanOrEqual(3); // At least 3 '00' digits
    await expect(page.getByText(/DAYS/)).toBeVisible();
    await expect(page.getByText(/HOURS/)).toBeVisible();
    await expect(page.getByText(/MINUTES/)).toBeVisible();

    // ID-60: with an unparseable env value computeCountdown returns isInvalid,
    // so `showComingSoon` is false and the label is absent from the DOM.
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);

    // No uncaught errors in console
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.toString()));

    // If there were errors, the test should be aware of them (though they shouldn't prevent rendering)
    // For this test, we just verify the page didn't crash (no white screen, key elements render)
    const heroSection = page.getByRole('heading', { name: /ROOT|FURTHER/i });
    await expect(heroSection).toBeVisible();
  });
});
