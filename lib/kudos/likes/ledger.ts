// FR-006/FR-007/ALG-001, FR-008 — the application-side half of the heart ledger aggregate.
//
// This cannot be one SQL query: hearts credit the kudos *sender*, but `kudos_likes.kudos_id` is
// a bare `text` id (`kudos-1` … `kudos-9`) with no FK to anything that names a sender — the
// database has never heard of who sent `kudos-1`. That mapping lives only in
// `lib/kudos/kudos-records.ts` (`KUDOS_RECORDS[].senderId`). So the join happens here: slug ->
// the static ids that slug authored -> one `kudos_likes` query filtered to those ids -> weighted
// sum via `ledgerTotal`. Still an aggregate, still no counter column (architecture.md §3) — the
// join simply lives where the data that makes it meaningful actually is.

import { createClient } from '@/lib/supabase/server';
import { KUDOS_RECORDS } from '@/lib/kudos/kudos-records';
import { ledgerTotal } from './heart-math';

/**
 * Total hearts credited to a profile slug across every static kudos they authored. `null` (no
 * bridged slug) and "authored nothing" both short-circuit to 0 without a query.
 */
export async function heartsReceivedBySlug(slug: string | null): Promise<number> {
  if (slug === null) {
    return 0;
  }

  const authoredIds = KUDOS_RECORDS.filter((record) => record.senderId === slug).map(
    (record) => record.id
  );

  if (authoredIds.length === 0) {
    return 0;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('kudos_likes')
      .select('is_special')
      .in('kudos_id', authoredIds);

    if (error || !data) {
      console.error('heartsReceivedBySlug query failed:', error?.message);
      return 0;
    }

    return ledgerTotal(data as { is_special: boolean }[]);
  } catch (error) {
    console.error('heartsReceivedBySlug failed:', error instanceof Error ? error.message : error);
    return 0;
  }
}
