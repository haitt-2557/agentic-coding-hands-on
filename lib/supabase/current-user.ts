// INT-001 — a non-redirecting sibling of `lib/kudos/send/auth-gate.ts`'s `requireSupabaseUser()`.
// `/kudos` stays public (FR-005): an unauthenticated visitor must still get a rendered board, not
// a `redirect()` throw. That is the entire reason this file exists next to auth-gate.ts instead
// of adding an `optional` flag there — `requireSupabaseUser()` is used by `/kudos/send`, which
// DOES want the throw-and-redirect behavior, and callers of it must never wrap it in try/catch
// (see that file's header). Branching one function two ways would make that contract fuzzy for
// every future reader; two small functions keep both contracts obvious from the name alone.
//
// `getUser()`, never `getSession()` — same reasoning as auth-gate.ts: a session cookie is
// attacker-controlled input on the server, and only `getUser()` re-validates it against Supabase
// Auth. This duplicates four lines from auth-gate.ts on purpose (recorded in clarifications.md /
// phase-03's Key Insights as a deliberate, bounded duplication) rather than refactoring
// auth-gate.ts and dragging the send feature into this phase's blast radius.

import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Returns the authenticated Supabase user, or `null` when no session exists. Never redirects and
 * never throws on a missing session — callers on public routes (like `/kudos`) render for
 * signed-out visitors too.
 */
export async function getSupabaseUserOrNull(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}
