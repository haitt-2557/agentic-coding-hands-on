// FR-002, FR-007 — the two read-only lookups the form needs: recipient candidates and the
// fixed hashtag vocabulary. Both run server-side with the caller's own session, so phase-01's
// `select`-to-`authenticated` RLS policies on `profiles`/`hashtags` apply — an unauthenticated
// request never reaches these functions because `requireSupabaseUser()` runs first.
//
// Rows are mapped from DB snake_case to the phase-03 contract's camelCase here, so no
// component downstream ever sees a raw Supabase row shape.
//
// Both reads run through `withRetry` (./retry.ts): a transient sub-second clock skew between
// GoTrue (stamps the JWT's `iat`) and PostgREST (validates it) can make a token that was just
// issued look "issued in the future", failing the read with an intermittent 500 for one
// request in several. The skew usually self-corrects within a couple hundred ms, so the
// default escalating backoff (100ms -> 200ms -> 400ms, 3 retries, ~700ms worst case added
// latency) turns that flake into a transparent success — do not remove this as dead code.
//
// This is a bounded retry, not a guarantee: a clock blip that outlasts the ~700ms window is
// environmental, not a logic bug, and will still surface as the original 500 below. Widening
// the window further is a one-line change to the `withRetry` call sites' options, not a
// reason to add unbounded retrying or to catch-and-continue instead of throwing.
//
// On any Supabase error — once retries are exhausted — this throws (naming the table) rather
// than returning `[]`: an empty picker from a swallowed error would look like a UI bug, not an
// infrastructure failure.

import { createClient } from '@/lib/supabase/server';
import { withRetry } from './retry';
import type { HashtagOption, ProfileOption } from './types';

interface ProfileRow {
  id: string;
  display_name: string;
  department: string | null;
}

interface HashtagRow {
  id: string;
}

/** All seeded recipient candidates, ordered by display name (S2/S5). */
export async function listProfiles(): Promise<ProfileOption[]> {
  const supabase = await createClient();
  const rows = await withRetry(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, department')
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(`Failed to load profiles: ${error.message}`);
    }

    return data as ProfileRow[];
  });

  return rows.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    department: row.department,
  }));
}

/** The fixed 8-value hashtag vocabulary (S1), in a stable order. */
export async function listHashtags(): Promise<HashtagOption[]> {
  const supabase = await createClient();
  const rows = await withRetry(async () => {
    const { data, error } = await supabase.from('hashtags').select('id').order('id', {
      ascending: true,
    });

    if (error) {
      throw new Error(`Failed to load hashtags: ${error.message}`);
    }

    return data as HashtagRow[];
  });

  return rows.map((row) => ({ id: row.id }));
}
