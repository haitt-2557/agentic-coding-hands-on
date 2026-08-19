// FR-002 + BR-004/BR-005 + DEC-001 — app-wide launch-timing gate, merged with the Supabase
// session refresh (FR-003..FR-005). Next 16 loads exactly one proxy.ts, so both concerns
// live in this one file: refresh the Supabase session first, then run the pure, unit-tested
// `resolveGateRedirect`, so the gate always reads an up-to-date cookie.
//
// Next 16 renamed `middleware.ts` to `proxy.ts` (deprecated convention) — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Proxy defaults to the Node.js runtime; setting `runtime` here throws, so it is left unset.
//
// The gate itself is launch timing, not authorization: it never reads
// `lib/session/session-provider.tsx` or any cookie/role. `/prelaunch` is reachable by every
// actor at every time.
//
// R1 — the single highest-risk defect in this phase: @supabase/ssr writes refreshed auth
// cookies onto the response object it was given. If the gate below then ships a *different*
// `NextResponse.redirect`, those cookies are silently dropped and the user is signed out on
// every gated request. So every refreshed cookie is copied onto whichever response actually
// ships, whether that's the gate's redirect or the pass-through from the refresh itself.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveGateRedirect } from '@/lib/prelaunch/gate';
import { updateSupabaseSession } from '@/lib/supabase/proxy-session';

export async function proxy(request: NextRequest) {
  const { response: refreshedResponse, supabaseCookies } = await updateSupabaseSession(request);

  const target = resolveGateRedirect(
    request.nextUrl.pathname,
    process.env.NEXT_PUBLIC_EVENT_START_AT,
    new Date(),
  );

  if (target === null) {
    return refreshedResponse;
  }

  const gateResponse = NextResponse.redirect(new URL(target, request.url));
  supabaseCookies.forEach(({ name, value, options }) => {
    gateResponse.cookies.set(name, value, options);
  });

  return gateResponse;
}

export const config = {
  // Excludes _next/static, _next/image, favicon.ico, and every dotted public asset
  // (fonts, images, css) — without this, /prelaunch would redirect its own background
  // image, font, and stylesheet requests into itself and render naked.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
