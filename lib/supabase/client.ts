// FR-002 — browser-side Supabase client for `signInWithOAuth`. Used only from
// `app/login/login-client.tsx` (a Client Component); never from server code.

import { createBrowserClient } from '@supabase/ssr';
import { requireSupabaseEnv } from './env';

export function createClient() {
  const { url, publishableKey } = requireSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
