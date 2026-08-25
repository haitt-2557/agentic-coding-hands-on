// DEC-002 / BR-002 — bridges a real `auth.uid()` to the static profile slug space the board
// renders (`senderId`/`receiverId` on `KUDOS_RECORDS`). The two identity spaces do not otherwise
// meet (clarifications.md "The identity spaces do not meet"): board records key on profile
// slugs, auth keys on uuid. `profiles.auth_user_id` (phase 01's migration) is the only place they
// touch.
//
// A missing bridge row is not an error — DEC-002 says that viewer simply matches no sender, so
// their heart button stays enabled (edge-cases.md row 7). This function must never throw: a
// bridge lookup failure would otherwise take down the whole board render for every visitor.
//
// Rework (Stage 5 inspection, finding 1): `authenticated` no longer holds SELECT on
// `profiles.auth_user_id` at all — not even to use it in a `WHERE` filter, since Postgres
// requires SELECT privilege on any column a query references, not only ones it outputs. The
// bridge lookup is routed through the `resolve_viewer_slug` security-definer RPC (migration
// `20260825140000_kudos_likes_tables.sql`) instead of a raw `.from('profiles')` select, mirroring
// how the insert policy itself reaches the sealed column via `is_static_kudos_author`.

import { createClient } from '@/lib/supabase/server';

/**
 * Resolves the viewer's static profile slug from their Supabase auth id, or `null` when the
 * viewer is signed out, unbridged, or the lookup fails. Never throws.
 */
export async function resolveViewerSlug(userId: string | null): Promise<string | null> {
  if (userId === null) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('resolve_viewer_slug', { p_user: userId });

    if (error || !data) {
      return null;
    }

    return data as string;
  } catch (error) {
    console.error('resolveViewerSlug failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
