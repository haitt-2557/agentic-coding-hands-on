// FR-002, FR-007 — the two read-only lookups the form needs: recipient candidates and the
// fixed hashtag vocabulary. Both run server-side with the caller's own session, so phase-01's
// `select`-to-`authenticated` RLS policies on `profiles`/`hashtags` apply — an unauthenticated
// request never reaches these functions because `requireSupabaseUser()` runs first.
//
// Rows are mapped from DB snake_case to the phase-03 contract's camelCase here, so no
// component downstream ever sees a raw Supabase row shape.
//
// On any Supabase error this throws (naming the table) rather than returning `[]` — an empty
// picker from a swallowed error would look like a UI bug, not an infrastructure failure.

import { createClient } from '@/lib/supabase/server';
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
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, department')
    .order('display_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to load profiles: ${error.message}`);
  }

  return (data as ProfileRow[]).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    department: row.department,
  }));
}

/** The fixed 8-value hashtag vocabulary (S1), in a stable order. */
export async function listHashtags(): Promise<HashtagOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('hashtags').select('id').order('id', {
    ascending: true,
  });

  if (error) {
    throw new Error(`Failed to load hashtags: ${error.message}`);
  }

  return (data as HashtagRow[]).map((row) => ({ id: row.id }));
}
