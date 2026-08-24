// FR-001, BR-001 — the app's second real route guard and the first that EJECTS the
// unauthenticated visitor (permissions.md §1). Mirrors app/login/page.tsx's condition,
// inverted: that page redirects an already-authenticated visitor away from `/login`; this
// guard redirects an unauthenticated visitor away from `/kudos/send`.
//
// `getUser()`, never `getSession()` — a session cookie is attacker-controlled input on the
// server, and `getSession()` trusts it without a round trip to Supabase Auth. `getUser()`
// re-validates against Supabase Auth on every call. The repo has zero `getSession()` calls;
// keep it that way (documented in lib/supabase/proxy-session.ts and cited again here).
//
// `redirect()` (next/navigation) throws a `NEXT_REDIRECT` control-flow error to terminate
// rendering of the calling Server Component. Callers of `requireSupabaseUser()` MUST NOT
// wrap it in a `try/catch` that would swallow that throw — call it before any risky work,
// not inside a guarded block.
//
// Identity here comes ONLY from `auth.uid()` via the real Supabase session. The mock
// `role`/`userId` in lib/session/session-provider.tsx is never consulted (permissions.md §3).

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Returns the authenticated Supabase user, or redirects to `/login` (throwing) when no
 * session exists. Must be awaited and called before any data is read, so an unauthenticated
 * visitor never triggers a Supabase query for content they should not see (US001 scenario 2).
 */
export async function requireSupabaseUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}
