// FR-002 + BR-004/BR-005 + DEC-001 — app-wide launch-timing gate. Thin adapter: reads the
// public target instant, delegates the actual decision to the pure, unit-tested
// `resolveGateRedirect`, and turns its answer into a redirect or a pass-through.
//
// Next 16 renamed `middleware.ts` to `proxy.ts` (deprecated convention) — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Proxy defaults to the Node.js runtime; setting `runtime` here throws, so it is left unset.
//
// This is launch timing, not authorization: it never reads `lib/session/session-provider.tsx`
// or any cookie/role. `/prelaunch` is reachable by every actor at every time.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveGateRedirect } from '@/lib/prelaunch/gate';

export function proxy(request: NextRequest) {
  const target = resolveGateRedirect(
    request.nextUrl.pathname,
    process.env.NEXT_PUBLIC_EVENT_START_AT,
    new Date(),
  );

  if (target === null) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
  // Excludes _next/static, _next/image, favicon.ico, and every dotted public asset
  // (fonts, images, css) — without this, /prelaunch would redirect its own background
  // image, font, and stylesheet requests into itself and render naked.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
