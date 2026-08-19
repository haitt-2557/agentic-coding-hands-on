// BR-005 — refresh the Supabase session on every request, from proxy.ts.
//
// The single highest-risk defect in this phase: @supabase/ssr writes refreshed auth
// cookies onto the response object it was handed via `setAll`. If proxy.ts then ships a
// *different* response (the prelaunch gate's own `NextResponse.redirect`), those refreshed
// cookies are silently dropped and the user is signed out on every gated request. So this
// module hands back the cookies it wrote, not just the response, and proxy.ts is
// responsible for copying them onto whatever response actually ships.
//
// `getUser()`, never `getSession()` — a cookie is attacker-controlled input on the server;
// `getUser()` round-trips to Supabase Auth and only returns a user for a token that is
// still genuinely valid.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireSupabaseEnv } from './env';

export interface SupabaseCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

export interface UpdateSupabaseSessionResult {
  response: NextResponse;
  supabaseCookies: SupabaseCookie[];
}

export async function updateSupabaseSession(
  request: NextRequest
): Promise<UpdateSupabaseSessionResult> {
  let response = NextResponse.next({ request });
  const supabaseCookies: SupabaseCookie[] = [];
  const { url, publishableKey } = requireSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
          supabaseCookies.push({ name, value, options });
        });
      },
    },
  });

  // Forces GoTrue to verify/refresh the token; the resulting Set-Cookie calls above are
  // what BR-005 depends on. The user value itself isn't needed here — resolveGateRedirect
  // stays timing-only, not auth-aware (see gate.ts).
  await supabase.auth.getUser();

  return { response, supabaseCookies };
}
