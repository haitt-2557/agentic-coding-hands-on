import { test, expect } from '@playwright/test';
import type { PostgrestError } from '@supabase/supabase-js';
import { formatQueryFailure } from './query-failure-log';

// FR-005 — `loadBoardLikeState` swallows query failures and degrades to an empty board rather
// than throwing, so this log line is the ONLY signal a developer gets that the counts on screen
// are wrong. Pure string building, no Supabase involved.

/** Builds a PostgrestError without asserting on fields the test does not care about. */
function pgError(fields: Partial<PostgrestError>): PostgrestError {
  return { name: 'PostgrestError', message: '', details: '', hint: '', code: '', ...fields } as PostgrestError;
}

test.describe('formatQueryFailure', () => {
  test('names which of the two reads failed', () => {
    expect(formatQueryFailure('count', pgError({ message: 'boom' }))).toContain(
      'loadBoardLikeState count query failed:'
    );
    expect(formatQueryFailure('viewer', pgError({ message: 'boom' }))).toContain(
      'loadBoardLikeState viewer query failed:'
    );
  });

  test('carries the PostgREST code — PGRST303 is how host/VM clock skew identifies itself', () => {
    const line = formatQueryFailure(
      'count',
      pgError({ code: 'PGRST303', message: 'JWT issued at future' })
    );
    expect(line).toContain('code=PGRST303');
    expect(line).toContain('JWT issued at future');
  });

  test('carries details and hint when PostgREST supplies them', () => {
    const line = formatQueryFailure(
      'count',
      pgError({ message: 'permission denied', details: 'row-level security', hint: 'check policy' })
    );
    expect(line).toContain('permission denied');
    expect(line).toContain('row-level security');
    expect(line).toContain('hint=check policy');
  });

  test('never prints "undefined" when the query returned no rows AND no error', () => {
    // The guard is `if (error || !data)`. The `!data` half has no error object at all, and the
    // previous `error?.message` form rendered that branch as the bare string "undefined".
    const line = formatQueryFailure('count', null);
    expect(line).not.toContain('undefined');
    expect(line).toContain('no rows and no error');
  });

  test('omits empty fields rather than emitting stray separators', () => {
    const line = formatQueryFailure('count', pgError({ message: 'boom' }));
    expect(line).toBe('loadBoardLikeState count query failed: boom');
  });
});
