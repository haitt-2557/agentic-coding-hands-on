import { test, expect } from '@playwright/test';

test.describe('Homepage SAA - Invalid Environment (ID-60)', () => {
  test('invalid event datetime env falls back to zero-state without crashing', async ({ page }) => {
    // "without crashing" is half the title, so it needs a real assertion. The listener must
    // be attached BEFORE goto — an uncaught error thrown during hydration fires while the
    // page loads, and a listener registered afterwards never sees it.
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.toString()));

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

    // The page still renders its hero — an unparseable env value must degrade the countdown,
    // not white-screen the route.
    const heroSection = page.getByRole('heading', { name: /ROOT|FURTHER/i });
    await expect(heroSection).toBeVisible();

    // ID-60: and it renders without throwing on the way. Reported with the error text so a
    // failure names the exception instead of just a count.
    expect(pageErrors, `uncaught page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });
});
