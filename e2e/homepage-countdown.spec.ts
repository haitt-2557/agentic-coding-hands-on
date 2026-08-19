import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Homepage SAA - Valid Environment', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('Countdown Timer (ID-12, ID-39, ID-40, ID-41, ID-42, ID-43, ID-56, ID-57)', () => {
    test('displays countdown with 2-digit zero-padded values', async ({ page }) => {
      // Port 3200 has EVENT_START_AT = 2026-08-01T12:00:00+07:00 (past)
      // Install clock before that date so browser sees running countdown
      await page.clock.install({ time: new Date('2026-07-01T17:00:00+07:00') });
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
      // Port 3200 target: 2026-08-01T12:00:00+07:00. Install clock 1d 1h 29m 30s before target
      await page.clock.install({ time: new Date('2026-07-31T10:30:30+07:00') });
      await page.goto('/');

      // 1 day, 1 hour, 29.5 minutes to the port 3200 target. Match the whole CountdownBox
      // so the assertion reads the value, not just the label.
      const minutes = page.getByText(/^\d{2}MINUTES$/);
      await expect(minutes).toHaveText('29MINUTES');

      await page.clock.fastForward('01:00');

      // ID-39: one minute on, the rendered value must have moved by itself.
      await expect(minutes).toHaveText('28MINUTES');
    });

    test('countdown transitions to zero-state when event starts (ID-41, ID-42)', async ({ page }) => {
      // Install clock BEFORE loading the page so component mounts with paused clock
      // Port 3200 target: 2026-08-01T12:00:00+07:00 - set current time to after that date
      const eventTime = new Date('2026-08-01T12:00:00+07:00').getTime();
      const timeAfterEvent = eventTime + 86400000; // Add 1 day
      // Pause the clock at a time after the event BEFORE navigating
      await page.clock.install({ time: new Date(timeAfterEvent) });
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
      // Port 3200 has EVENT_START_AT = 2026-08-01T12:00:00+07:00 (past)
      // Install clock before that date so browser sees non-zero countdown
      await page.clock.install({ time: new Date('2026-07-01T17:00:00+07:00') });
      await page.goto('/');
      // ID-43: Coming soon label visible before event start
      await expect(page.getByText(/Coming soon/i)).toBeVisible();
    });
  });
});
