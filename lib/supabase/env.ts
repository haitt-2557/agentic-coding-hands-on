// Shared env accessor for the Supabase browser/server clients (FR-002..FR-004).
//
// Read at call time, never at module load: a build (`next build`) must not fail just
// because `.env.local` isn't populated yet (R7). Throwing a named error here, instead of
// a bare `!` assertion, means a missing var fails loudly with the variable name instead of
// a generic "Cannot read properties of undefined" deep inside the Supabase SDK.

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
