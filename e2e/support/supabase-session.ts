import type { BrowserContext } from '@playwright/test';
import type { SerializeOptions } from 'cookie';
import { createServerClient } from '@supabase/ssr';

/**
 * Establishes an authenticated Supabase session via the Node test process,
 * then feeds the captured cookies into the browser context.
 * Uses the library's own serializer for the auth token format.
 *
 * Throws an error containing "INFRA:" if authentication fails —
 * a sentinel so infrastructure issues are never mistaken for screen failures.
 */
export async function seedSupabaseSession(
  context: BrowserContext,
  baseURL: string
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const testEmail = process.env.E2E_TEST_USER_EMAIL;
  const testPassword = process.env.E2E_TEST_USER_PASSWORD;

  if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
    throw new Error(
      `INFRA: Missing Supabase environment variables. ` +
        `Expected: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, ` +
        `E2E_TEST_USER_EMAIL, E2E_TEST_USER_PASSWORD`
    );
  }

  // Capturing cookie jar: collect setAll calls during signInWithPassword
  const capturedCookies: Array<{
    name: string;
    value: string;
    options: Partial<SerializeOptions>;
  }> = [];

  const cookieAdapter = {
    getAll: () => {
      // Return empty at first; on real flows with existing sessions, fill this
      return [];
    },
    setAll: (
      cookies: Array<{
        name: string;
        value: string;
        options: Partial<SerializeOptions>;
      }>
    ) => {
      capturedCookies.push(...cookies);
    },
  };

  // Server-side Supabase client with the capturing adapter
  const client = createServerClient(supabaseUrl, supabaseKey, {
    cookies: cookieAdapter,
  });

  // Sign in with the test credentials
  const { error } = await client.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    throw new Error(
      `INFRA: Supabase signInWithPassword failed: ${error.message}`
    );
  }

  // Translate captured cookies into browser context format.
  // Use url form (not path/domain pair) to avoid Playwright validation conflicts.
  const browserCookies = capturedCookies.map((cookie) => {
    const sameSiteRaw = (cookie.options.sameSite as string | boolean | undefined) ?? 'Lax';
    // Normalize sameSite: Playwright expects 'Strict' | 'Lax' | 'None', not boolean or lowercase
    let sameSiteNorm: 'Strict' | 'Lax' | 'None' = 'Lax';
    if (typeof sameSiteRaw === 'string') {
      const normalized = sameSiteRaw.charAt(0).toUpperCase() + sameSiteRaw.slice(1).toLowerCase();
      if (normalized === 'Strict' || normalized === 'Lax' || normalized === 'None') {
        sameSiteNorm = normalized as 'Strict' | 'Lax' | 'None';
      }
    }

    return {
      name: cookie.name,
      value: cookie.value,
      url: baseURL,
      expires:
        (cookie.options.maxAge as number | undefined) !== undefined
          ? Date.now() / 1000 + (cookie.options.maxAge as number)
          : undefined,
      httpOnly: (cookie.options.httpOnly as boolean | undefined) ?? true,
      secure: (cookie.options.secure as boolean | undefined) ?? false,
      sameSite: sameSiteNorm,
    };
  });

  await context.addCookies(browserCookies);

  // Verify the auth cookie made it into the context
  const contextCookies = await context.cookies();
  const authCookiePresent = contextCookies.some(
    (c) =>
      c.name.includes('auth') ||
      c.name.includes('sb-') ||
      c.name.includes('session')
  );

  if (!authCookiePresent && browserCookies.length > 0) {
    throw new Error(
      `INFRA: Auth cookie failed to add to browser context. ` +
        `Captured ${browserCookies.length} cookies but none appear in context.`
    );
  }
}
