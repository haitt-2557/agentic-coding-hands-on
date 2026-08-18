import { test, expect } from '@playwright/test';
import { computeCountdown } from './countdown';

// ALG-001 / BR-001 / BR-002 / BR-003 — pure countdown logic, `now` injected (no Date.now()).

test.describe('computeCountdown', () => {
  test('pads single-digit hours and minutes to 2 digits (ID-40)', () => {
    const now = new Date('2026-01-30T10:00:00Z');
    const target = '2026-01-30T15:30:00Z'; // +5h30m, same day
    const result = computeCountdown(target, now);

    expect(result.days).toBe('00');
    expect(result.hours).toBe('05');
    expect(result.minutes).toBe('30');
    expect(result.isExpired).toBe(false);
    expect(result.isInvalid).toBe(false);
  });

  test('splits days/hours/minutes across a month boundary (ID-12, ID-56, ID-57)', () => {
    const now = new Date('2026-01-30T22:15:00Z');
    const target = '2026-03-01T05:20:00Z'; // crosses Jan -> Feb -> Mar
    const result = computeCountdown(target, now);

    // Hand-verified: 30 days - 16h55m = 29 days + 7h05m
    expect(result.days).toBe('29');
    expect(result.hours).toBe('07');
    expect(result.minutes).toBe('05');
    expect(result.isExpired).toBe(false);
    expect(result.isInvalid).toBe(false);
  });

  test('exact day boundary with no time-of-day remainder (ID-56)', () => {
    const now = new Date('2026-01-30T00:00:00Z');
    const target = '2026-03-01T00:00:00Z'; // exactly 30 days later
    const result = computeCountdown(target, now);

    expect(result.days).toBe('30');
    expect(result.hours).toBe('00');
    expect(result.minutes).toBe('00');
    expect(result.isExpired).toBe(false);
  });

  test('is expired exactly at the target instant (ID-41)', () => {
    const now = new Date('2026-12-19T18:30:00+07:00');
    const result = computeCountdown('2026-12-19T18:30:00+07:00', now);

    expect(result.isExpired).toBe(true);
    expect(result.isInvalid).toBe(false);
    expect(result).toMatchObject({ days: '00', hours: '00', minutes: '00' });
  });

  test('is expired after the target instant (ID-42)', () => {
    const now = new Date('2026-12-19T18:30:00+07:00');
    const oneDayLater = new Date(now.getTime() + 86_400_000);
    const result = computeCountdown('2026-12-19T18:30:00+07:00', oneDayLater);

    expect(result.isExpired).toBe(true);
    expect(result).toMatchObject({ days: '00', hours: '00', minutes: '00' });
  });

  test('is not expired one millisecond before the target instant (ID-43)', () => {
    const target = '2026-12-19T18:30:00+07:00';
    const now = new Date(new Date(target).getTime() - 1);
    const result = computeCountdown(target, now);

    expect(result.isExpired).toBe(false);
    expect(result.isInvalid).toBe(false);
  });

  test('is invalid when the env value is undefined (ID-60)', () => {
    const result = computeCountdown(undefined, new Date('2026-01-01T00:00:00Z'));

    expect(result.isInvalid).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result).toMatchObject({ days: '00', hours: '00', minutes: '00' });
  });

  test('is invalid when the env value is an empty string (ID-60)', () => {
    const result = computeCountdown('', new Date('2026-01-01T00:00:00Z'));

    expect(result.isInvalid).toBe(true);
    expect(result).toMatchObject({ days: '00', hours: '00', minutes: '00' });
  });

  test('is invalid when the env value is unparseable garbage (ID-60)', () => {
    const result = computeCountdown('not-a-date', new Date('2026-01-01T00:00:00Z'));

    expect(result.isInvalid).toBe(true);
    expect(result).toMatchObject({ days: '00', hours: '00', minutes: '00' });
  });

  test('never throws regardless of input shape', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    expect(() => computeCountdown(undefined, now)).not.toThrow();
    expect(() => computeCountdown('', now)).not.toThrow();
    expect(() => computeCountdown('not-a-date', now)).not.toThrow();
    expect(() => computeCountdown('2026-99-99T99:99:99Z', now)).not.toThrow();
    expect(() => computeCountdown('2026-12-19T18:30:00+07:00', now)).not.toThrow();
  });
});
