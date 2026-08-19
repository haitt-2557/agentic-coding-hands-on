// FR-003 — exchanges the Supabase OAuth `code` for a session, then redirects `/` on
// success and `/login?error=<msg>` on failure or cancellation. Never renders an error page
// (BR-002 renders the fixed error string on `/login` itself).
//
// Order matters (R4): check `error_description` BEFORE assuming `code` exists — a cancelled
// Google consent screen redirects back with `?error=access_denied&error_description=...`,
// query params, not an exception, and reading `code` first would fall through to the
// generic `missing_code` case instead of surfacing the real reason.
//
// `exchangeCodeForSession` can throw instead of returning `{ error }` in some auth-js
// versions (auth-js#782) — wrapped in try/catch regardless of what the type signature
// promises (R3).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const errorDescription = searchParams.get('error_description');
  const code = searchParams.get('code');

  if (errorDescription) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription)}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}/`);
      }
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    } catch (thrown) {
      const message = thrown instanceof Error ? thrown.message : 'exchange_failed';
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
