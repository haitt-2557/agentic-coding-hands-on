// Shared env accessor for the Supabase browser/server clients (FR-002..FR-004).
//
// Read at call time, never at module load: a build (`next build`) must not fail just
// because `.env.local` isn't populated yet (R7). Throwing a named error here, instead of
// a bare `!` assertion, means a missing var fails loudly with the variable name instead of
// a generic "Cannot read properties of undefined" deep inside the Supabase SDK.

const DEFAULT_SITE_URL = 'http://localhost:3000';

// Security review finding (High) — `app/auth/callback/route.ts` must never build a redirect
// target from `request.nextUrl.origin` (Next derives that from the incoming `Host` /
// `X-Forwarded-Host` header, which is attacker-controlled on an unauthenticated route once
// deployed behind infrastructure that doesn't pin `Host`). `getSiteUrl()` is the trusted
// replacement: config-driven, never request-derived. Defaults to `http://localhost:3000`,
// matching `supabase/config.toml`'s `site_url` / `additional_redirect_urls` (Supabase matches
// those exactly, so keep them in sync when this default or the env var changes). Read at call
// time, same as `requireSupabaseEnv`, for the same build-time reason.
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;

  if (!raw) {
    return DEFAULT_SITE_URL;
  }

  try {
    // `.origin` both validates the value is a well-formed absolute URL and normalizes away
    // a trailing slash/path, so callers can safely template `${getSiteUrl()}/some/path`.
    return new URL(raw).origin;
  } catch {
    throw new Error(
      `Invalid environment variable NEXT_PUBLIC_SITE_URL: expected an absolute URL, got "${raw}"`
    );
  }
}

export function requireSupabaseEnv(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!publishableKey) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  }

  return { url, publishableKey };
}
