// FR-005 — the board must still render when the like ledger is unreadable, so
// `loadBoardLikeState` swallows query failures and degrades to an empty state instead of
// throwing. That makes this log line the ONLY signal a developer gets that the counts on
// screen are silently wrong, which is why it carries more than `message`:
//
//   - `code` is what actually identifies the fault. PostgREST reports host/VM clock skew as
//     `PGRST303` ("JWT issued at future") — the exact failure `e2e/support/docker-clock-skew-guard.ts`
//     exists to diagnose — and a message-only log throws that identifier away.
//   - the guard clause is `if (error || !data)`, and its `!data` half has NO error object.
//     `error?.message` rendered that branch as the bare string "undefined", which says
//     nothing about what went wrong.

import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Builds the one-line server log for a failed like-ledger read.
 *
 * @param query Which of the two reads failed — `count` (all viewers) or `viewer` (own likes).
 * @param error The PostgREST error, or `null` when the query returned no rows AND no error.
 *              That second case is a distinct fault and gets its own wording.
 */
export function formatQueryFailure(query: string, error: PostgrestError | null): string {
  const prefix = `loadBoardLikeState ${query} query failed:`;

  if (!error) {
    return `${prefix} query returned no rows and no error`;
  }

  // Empty strings are dropped rather than joined, so a sparse error does not produce a line
  // trailing in stray " | " separators.
  const parts = [
    error.code && `code=${error.code}`,
    error.message,
    error.details,
    error.hint && `hint=${error.hint}`,
  ].filter((part): part is string => Boolean(part));

  return `${prefix} ${parts.join(' | ')}`;
}
