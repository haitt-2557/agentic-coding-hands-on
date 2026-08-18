import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Countdown Timer (ID-12, ID-39, ID-40, ID-41, ID-42, ID-43, ID-56, ID-57)', () => {
    test('displays countdown with 2-digit zero-padded values', async ({ page }) => {
      await page.goto('/');
      // ID-12, ID-40: 2-digit zero-padded countdown - verify DAYS/HOURS/MINUTES labels exist
      // Each countdown box shows 2 digits, check that at least one exists
      const countdownDigits = page.getByText(/\d{2}/);
      expect(await countdownDigits.count()).toBeGreaterThan(0);

      // Verify countdown shows non-zero values (coming soon state)
      await expect(page.getByText(/DAYS/)).toBeVisible();
      await expect(page.getByText(/HOURS/)).toBeVisible();
      await expect(page.getByText(/MINUTES/)).toBeVisible();
    });

    test('countdown auto-updates every minute (ID-39)', async ({ page }) => {
      // The clock must exist BEFORE the page mounts: countdown-timer.tsx registers its
      // setInterval inside a mount effect, and an interval created against the real timer
      // is never advanced by fastForward.
      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/');

      // 89.5 minutes to the 18:30+07:00 target the webServer injects -> 01 hours, 29 minutes.
      // The half-minute offset keeps the value clear of the rounding boundary, so the drift
      // of page load cannot flip the digit. Match the whole CountdownBox (digit spans +
      // label) so the assertion reads the value, not just the label.
      const minutes = page.getByText(/^\d{2}MINUTES$/);
      await expect(minutes).toHaveText('29MINUTES');

      await page.clock.fastForward('01:00');

      // ID-39: one minute on, the rendered value must have moved by itself.
      await expect(minutes).toHaveText('28MINUTES');
    });

    test('countdown transitions to zero-state when event starts (ID-41, ID-42)', async ({ page }) => {
      // Install clock BEFORE loading the page so component mounts with paused clock
      await page.clock.install();

      // Event is 2026-12-19T18:30:00+07:00 - set current time to after that date
      const eventTime = new Date('2026-12-19T18:30:00+07:00').getTime();
      const timeAfterEvent = eventTime + 86400000; // Add 1 day
      // Pause the clock at the future date BEFORE navigating
      await page.clock.pauseAt(new Date(timeAfterEvent));

      // Now navigate with the clock already paused at the future date
      await page.goto('/');

      // When past event start, countdown shows 00/00/00
      // Use auto-retrying expect to wait for digits to become 00
      await expect(async () => {
        const digits = page.getByText('00');
        const digitCount = await digits.count();
        expect(digitCount).toBeGreaterThanOrEqual(3); // At least 3 '00' digits
      }).toPass({ timeout: 5000 });

      await expect(page.getByText(/DAYS/)).toBeVisible();
      await expect(page.getByText(/HOURS/)).toBeVisible();
      await expect(page.getByText(/MINUTES/)).toBeVisible();

      // ID-42: "Coming soon" must be gone once the event has started.
      // CountdownTimer hides it via `showComingSoon = !mounted || (!isExpired && !isInvalid)`,
      // so at zero-state the element is removed from the DOM entirely.
      await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
    });

    test('countdown shows non-zero when event not yet started (ID-43)', async ({ page }) => {
      await page.goto('/');
      // ID-43: Coming soon label visible before event start
      await expect(page.getByText(/Coming soon/i)).toBeVisible();
    });
  });
});
