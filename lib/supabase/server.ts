// FR-003 / FR-004 — server-side Supabase client for Server Components (`app/login/page.tsx`)
// and Route Handlers (`app/auth/callback/route.ts`).
//
// `cookies()` from `next/headers` is async in this Next version (see
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md), so it must
// be awaited before being handed to the `getAll`/`setAll` adapter — the old three-method
// `get`/`set`/`remove` shape from `@supabase/auth-helpers-nextjs` is dead; do not use it.
//
// A Server Component render cannot write cookies (Next disallows it once streaming has
// started); a Route Handler can. `setAll` below is wrapped in try/catch so the same
// factory works from both call sites — the catch only ever fires from a Server Component,
// and is safe there because `proxy.ts` refreshes the session on every request anyway.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireSupabaseEnv } from './env';

export async function createClient() {
  const { url, publishableKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components can't write cookies. Safe to ignore here because
          // proxy.ts refreshes the session (and its cookies) on every request.
        }
      },
    },
  });
}
