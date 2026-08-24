// Bounded retry for the transient GoTrue/PostgREST `iat` clock skew documented in this
// directory's queries.ts header. Deliberately pure and Supabase-agnostic — it knows nothing
// about what it retries, only "run this thunk, retry a bounded number of times on failure
// with an escalating backoff, then rethrow the last error exactly as thrown" — so it is
// unit-testable without a live Supabase instance.

export interface RetryOptions {
  /** Retry attempts after the first try. 0 means "try once, never retry". */
  retries: number;
  /** Backoff before the Nth retry: baseDelayMs * 2^(N-1) — doubles each attempt. */
  baseDelayMs: number;
}

// 3 retries at 100ms -> 200ms -> 400ms: ~700ms worst-case added latency on a page that
// already does two network reads, in exchange for absorbing the clock blips that outlast a
// shorter window (see queries.ts header for the incident this schedule was tuned against).
const DEFAULT_RETRY_OPTIONS: RetryOptions = { retries: 3, baseDelayMs: 100 };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Backoff before the Nth retry (1-indexed): doubles each time, starting at baseDelayMs. */
function backoffMs(baseDelayMs: number, retryNumber: number): number {
  return baseDelayMs * 2 ** (retryNumber - 1);
}

/**
 * Runs `thunk`, retrying on failure up to `options.retries` additional times with an
 * escalating (doubling) backoff between attempts. On final failure it rethrows the last error
 * unchanged — it never swallows the error and never substitutes a fallback value.
 */
export async function withRetry<T>(
  thunk: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { retries, baseDelayMs } = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const maxAttempts = Math.max(0, retries) + 1;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await thunk();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(backoffMs(baseDelayMs, attempt));
      }
    }
  }

  throw lastError;
}
