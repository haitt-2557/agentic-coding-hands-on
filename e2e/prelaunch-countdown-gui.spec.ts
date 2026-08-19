import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';

test.describe('Prelaunch - Countdown GUI & Values (Future Event)', () => {
  test.beforeEach(seedDefaultSession);

  test.describe('GUI Structure (Title, Labels, Digits)', () => {
    test('displays title and countdown structure', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/prelaunch');

      // Title visible in correct language
      await expect(page.getByText(/Sự kiện sẽ bắt đầu sau|Event starts in/i)).toBeVisible();

      // Labels present
      await expect(page.getByText(/\bDAYS\b/)).toBeVisible();
      await expect(page.getByText(/\bHOURS\b/)).toBeVisible();
      await expect(page.getByText(/\bMINUTES\b/)).toBeVisible();
    });

    test('digits render in 2-digit zero-padded format', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/prelaunch');

      const allDigits = page.getByText(/\d{2}/);
      const digitCount = await allDigits.count();
      expect(digitCount).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Countdown Values & Ranges', () => {
    test('displays correct values for given target date', async ({ page }) => {
      // 17:00:30 to 18:30:00 = 01 hour 29 minutes, 00 days
      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/prelaunch');

      const hoursUnit = page.getByText(/^\d{2}HOURS$/);
      const minutesUnit = page.getByText(/^\d{2}MINUTES$/);

      await expect(hoursUnit).toHaveText('01HOURS');
      await expect(minutesUnit).toHaveText('29MINUTES');
    });

    test('shows 00 days when countdown < 24 hours', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/prelaunch');

      const daysUnit = page.getByText(/^\d{2}DAYS$/);
      await expect(daysUnit).toHaveText('00DAYS');
    });

    test('shows 00 digits 30 seconds before target (zero-digit state)', async ({ page }) => {
      // At 30 seconds before target: isExpired = false, but all digits = 00
      // This is the genuine 00/00/00 case without triggering unlock redirect
      const targetTime = new Date('2026-12-19T18:30:00+07:00').getTime();
      const timeBeforeTarget = new Date(targetTime - 30 * 1000);

      await page.clock.install({ time: timeBeforeTarget });
      await page.goto('/prelaunch');

      const daysUnit = page.getByText(/^\d{2}DAYS$/);
      const hoursUnit = page.getByText(/^\d{2}HOURS$/);
      const minutesUnit = page.getByText(/^\d{2}MINUTES$/);

      await expect(daysUnit).toHaveText('00DAYS');
      await expect(hoursUnit).toHaveText('00HOURS');
      await expect(minutesUnit).toHaveText('00MINUTES');
    });
  });

  test.describe('Auto-Update Behavior', () => {
    test('countdown updates as time progresses', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/prelaunch');

      const minutesUnit = page.getByText(/^\d{2}MINUTES$/);
      await expect(minutesUnit).toHaveText('29MINUTES');

      await page.clock.fastForward('00:01:00');
      await expect(minutesUnit).toHaveText('28MINUTES');

      await page.clock.fastForward('00:01:00');
      await expect(minutesUnit).toHaveText('27MINUTES');
    });

    test('countdown crosses hour boundary correctly', async ({ page }) => {
      // Start at 1h00m30s before target so the countdown renders 01HOURS / 00MINUTES.
      // The 30-second offset ensures page-load drift won't cause rounding to flip the hour digit.
      // After fastForward by 1 minute, remaining drops to 59m30s → 00HOURS / 59MINUTES.
      await page.clock.install({ time: new Date('2026-12-19T17:29:30+07:00') });
      await page.goto('/prelaunch');

      const hoursUnit = page.getByText(/^\d{2}HOURS$/);
      const minutesUnit = page.getByText(/^\d{2}MINUTES$/);

      // Verify we start just above the 1-hour boundary
      await expect(hoursUnit).toHaveText('01HOURS');
      await expect(minutesUnit).toHaveText('00MINUTES');

      // Fast-forward 1 minute: countdown decreases, crossing into 00-hour territory
      await page.clock.fastForward('00:01:00');

      // Verify we crossed the boundary
      await expect(hoursUnit).toHaveText('00HOURS');
      await expect(minutesUnit).toHaveText('59MINUTES');
    });
  });

  test.describe('Hydration & Errors', () => {
    test('page loads without console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.toString()));

      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/prelaunch');
      await page.waitForTimeout(500);

      expect(errors, `uncaught page errors: ${errors.join(' | ')}`).toEqual([]);
    });

    test('page structure renders on initial load', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-12-19T17:00:30+07:00') });
      await page.goto('/prelaunch');

      const title = page.getByText(/Sự kiện sẽ bắt đầu sau|Event starts in/i);
      const dayUnit = page.getByText(/\bDAYS\b/);
      const hourUnit = page.getByText(/\bHOURS\b/);
      const minuteUnit = page.getByText(/\bMINUTES\b/);

      await expect(title).toBeVisible();
      await expect(dayUnit).toBeVisible();
      await expect(hourUnit).toBeVisible();
      await expect(minuteUnit).toBeVisible();
    });
  });
});
