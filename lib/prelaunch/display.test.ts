import { test, expect } from '@playwright/test';
import { capDisplayDays, MAX_DISPLAY_DAYS } from './display';
import { computeCountdown } from '@/lib/countdown';

// Regression cover for a silent truncation: the days unit has two digit boxes, and the
// renderer used to destructure the first two characters of the day string. A target more
// than 99 days out produced a 3-character value, so "122" rendered as "12" — understating
// the countdown by 110 days with nothing on screen to signal it. No E2E could catch it:
// every clock instant in that suite sits under 24 hours from the target.

test.describe('capDisplayDays', () => {
  test('passes through values that already fit two boxes', () => {
    expect(capDisplayDays('00')).toBe('00');
    expect(capDisplayDays('09')).toBe('09');
    expect(capDisplayDays('45')).toBe('45');
  });

  test('passes through the cap itself untouched', () => {
    expect(capDisplayDays('99')).toBe('99');
  });

  test('clamps anything above the cap', () => {
    expect(capDisplayDays('100')).toBe('99');
    expect(capDisplayDays('122')).toBe('99');
    expect(capDisplayDays('3650')).toBe('99');
  });

  test('never returns more characters than the two boxes can show', () => {
    for (const days of ['00', '07', '99', '100', '122', '9999']) {
      expect(capDisplayDays(days).length).toBeLessThanOrEqual(2);
    }
  });

  test('returns a non-numeric value unchanged rather than coercing it', () => {
    expect(capDisplayDays('')).toBe('');
  });
});

test.describe('integration with computeCountdown', () => {
  // The exact case the shipped .env.example produces: a target 122 days out.
  const target = '2026-12-19T18:30:00+07:00';

  test('a >99-day gap is reported truthfully by computeCountdown', () => {
    const result = computeCountdown(target, new Date('2026-08-19T10:00:00+07:00'));
    expect(result.days).toBe('122');
    expect(result.isExpired).toBe(false);
  });

  test('and is clamped to the cap before it reaches the digit boxes', () => {
    const result = computeCountdown(target, new Date('2026-08-19T10:00:00+07:00'));
    expect(capDisplayDays(result.days)).toBe(String(MAX_DISPLAY_DAYS));
  });

  test('a gap inside the range is displayed exactly, not clamped', () => {
    const result = computeCountdown(target, new Date('2026-11-19T10:00:00+07:00'));
    expect(result.days).toBe('30');
    expect(capDisplayDays(result.days)).toBe('30');
  });
});
