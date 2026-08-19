import { test, expect } from '@playwright/test';
import { getSiteUrl } from './env';

// Security review finding (High) — the OAuth callback (`app/auth/callback/route.ts`) used to
// build every redirect from `request.nextUrl.origin`, which Next derives from the incoming
// `Host`/`X-Forwarded-Host` header. A forged header on that unauthenticated, internet-reachable
// route turns it into an open redirect. `getSiteUrl()` is the trusted, config-driven replacement:
// it never reads anything from the request, only from `NEXT_PUBLIC_SITE_URL` (falling back to
// the local-dev default), read at call time so a missing var never fails a production build.

const ENV_KEY = 'NEXT_PUBLIC_SITE_URL';

test.describe('getSiteUrl', () => {
  test.afterEach(() => {
    delete process.env[ENV_KEY];
  });

  test('falls back to http://localhost:3000 when unset', () => {
    delete process.env[ENV_KEY];
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });

  test('returns the configured origin when set to a valid absolute URL', () => {
    process.env[ENV_KEY] = 'https://saa2025.example.com';
    expect(getSiteUrl()).toBe('https://saa2025.example.com');
  });

  test('normalizes a trailing path/slash down to the bare origin', () => {
    process.env[ENV_KEY] = 'https://saa2025.example.com/';
    expect(getSiteUrl()).toBe('https://saa2025.example.com');
  });

  test('throws a named error when set to an unparsable value', () => {
    process.env[ENV_KEY] = 'not-a-url';
    expect(() => getSiteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  test('reads at call time, not module load (no stale caching)', () => {
    process.env[ENV_KEY] = 'https://first.example.com';
    expect(getSiteUrl()).toBe('https://first.example.com');
    process.env[ENV_KEY] = 'https://second.example.com';
    expect(getSiteUrl()).toBe('https://second.example.com');
  });
});
