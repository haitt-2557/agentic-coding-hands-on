import { test, expect } from '@playwright/test';
import { withRetry } from './retry';

// Bounded retry for the transient GoTrue/PostgREST `iat` skew (see queries.ts header) —
// exercised here as a pure helper, with no live Supabase involved.

test.describe('withRetry', () => {
  test('resolves on the first try without retrying', async () => {
    let calls = 0;
    const result = await withRetry(async () => {
      calls += 1;
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(calls).toBe(1);
  });

  test('resolves after a transient failure on a later attempt', async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls < 2) {
          throw new Error('transient');
        }
        return 'recovered';
      },
      { retries: 2, baseDelayMs: 0 }
    );

    expect(result).toBe('recovered');
    expect(calls).toBe(2);
  });

  test('rethrows the last error unchanged once retries are exhausted', async () => {
    let calls = 0;
    const attempts: number[] = [];

    await expect(
      withRetry(
        async () => {
          calls += 1;
          attempts.push(calls);
          throw new Error(`fail-${calls}`);
        },
        { retries: 2, baseDelayMs: 0 }
      )
    ).rejects.toThrow('fail-3');

    // 1 initial try + 2 retries = 3 total attempts, never fewer, never more.
    expect(calls).toBe(3);
    expect(attempts).toEqual([1, 2, 3]);
  });

  test('never returns a fallback value on exhaustion — only throws', async () => {
    await expect(
      withRetry(
        async () => {
          throw new Error('always fails');
        },
        { retries: 0, baseDelayMs: 0 }
      )
    ).rejects.toThrow('always fails');
  });

  // Escalating backoff (100ms -> 200ms -> 400ms in production) — exercised here with a small
  // baseDelayMs chosen far from the default so a caller that silently ignored the option
  // (falling back to its own default) would be caught, not just "growth happened somehow".
  // Timings assert doubling within a tolerance band, since real setTimeout has scheduler
  // jitter, not exact ms.
  test('escalates the backoff delay before each retry (doubles each time)', async () => {
    const timestamps: number[] = [];

    await expect(
      withRetry(
        async () => {
          timestamps.push(Date.now());
          throw new Error('always fails');
        },
        { retries: 3, baseDelayMs: 5 }
      )
    ).rejects.toThrow('always fails');

    expect(timestamps).toHaveLength(4);
    const gap1 = timestamps[1] - timestamps[0];
    const gap2 = timestamps[2] - timestamps[1];
    const gap3 = timestamps[3] - timestamps[2];

    // Nominal schedule is 5ms, 10ms, 20ms. The upper bound on gap1 is well below what a
    // caller ignoring baseDelayMs and falling back to a ~50ms default would produce.
    expect(gap1).toBeLessThan(25);
    expect(gap2).toBeGreaterThan(gap1 * 1.5);
    expect(gap3).toBeGreaterThan(gap2 * 1.5);
  });

  test('still gives up after exactly the configured retry count once backoff escalates', async () => {
    let calls = 0;

    await expect(
      withRetry(
        async () => {
          calls += 1;
          throw new Error(`fail-${calls}`);
        },
        { retries: 3, baseDelayMs: 5 }
      )
    ).rejects.toThrow('fail-4');

    // 1 initial try + 3 retries = 4 total attempts.
    expect(calls).toBe(4);
  });
});
