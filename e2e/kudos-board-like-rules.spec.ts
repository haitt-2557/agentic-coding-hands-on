import { test, expect } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';
import { seedSupabaseSession } from './support/supabase-session';
import { execSql, withSpecialDay, cleanupTestRows } from './support/local-db';
import { kudosCardByIdentity } from './support/kudos-card-locator';
import { clickHeartAndSettle } from './support/heart-toggle';
import { revealAllKudosCards } from './support/reveal-kudos-feed';

test.describe.configure({ mode: 'serial' });

test.describe('Kudos Board Like Rules (SC-002, SC-005, SC-006, SC-007, BR-002 DB-level)', () => {
  // This file owns kudos-3/kudos-4 exclusively among the kudos-board like specs; reset before AND
  // after each test so a crashed prior run cannot leave a dirty starting state (Defect A).
  test.beforeEach(() => {
    cleanupTestRows();
  });

  test.afterEach(() => {
    cleanupTestRows();
  });

  // SC-002 (BR-001): second insert for same pair is rejected with code 23505
  test('SC-002: unique constraint rejects duplicate (kudos_id, user_id) pair', async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const testEmail = process.env.E2E_TEST_USER_EMAIL;
    const testPassword = process.env.E2E_TEST_USER_PASSWORD;

    if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
      throw new Error('INFRA: Missing Supabase env vars');
    }

    const capturedCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const client = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => [],
        setAll: (cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>) => {
          capturedCookies.push(...cookies);
        },
      },
    });

    await client.auth.signInWithPassword({ email: testEmail, password: testPassword });

    // First insert succeeds
    const userId = (await client.auth.getUser()).data.user?.id;
    const { data: first, error: err1 } = await client
      .from('kudos_likes')
      .insert({ kudos_id: 'kudos-3', user_id: userId })
      .select()
      .single();
    expect(err1).toBeNull();
    expect(first).toBeTruthy();

    // Second insert for same pair fails with code 23505 (unique violation)
    const { error: err2 } = await client
      .from('kudos_likes')
      .insert({ kudos_id: 'kudos-3', user_id: (await client.auth.getUser()).data.user?.id });
    expect(err2).toBeTruthy();
    expect(err2?.code).toBe('23505');

    // Assert exactly one row exists
    const count = execSql(`SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-3'`);
    expect(count).toBe('1');
  });

  // SC-007 (BR-006): forged user_id rejected by RLS, paired with successful anon read
  test('SC-007: RLS rejects forged user_id; anon read succeeds (permissions §6)', async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('INFRA: Missing Supabase env vars');
    }

    // Authenticated client with captured session
    const capturedCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const authClient = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => [],
        setAll: (cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>) => {
          capturedCookies.push(...cookies);
        },
      },
    });

    const { error: signInErr } = await authClient.auth.signInWithPassword({
      email: process.env.E2E_TEST_USER_EMAIL!,
      password: process.env.E2E_TEST_USER_PASSWORD!,
    });
    expect(signInErr).toBeNull();

    const userId = (await authClient.auth.getUser()).data.user?.id;
    const forgedUserId = crypto.randomUUID();

    // Attempt to insert with forged user_id — RLS must reject it
    const { error: insertErr } = await authClient
      .from('kudos_likes')
      .insert({ kudos_id: 'kudos-4', user_id: forgedUserId });
    expect(insertErr).toBeTruthy();
    expect(insertErr?.message).toMatch(/policy|permission/i);

    // Anon read must succeed (permissions §6: grant exists)
    const anonClient = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });
    const { data: anonData, error: anonErr } = await anonClient
      .from('kudos_likes')
      .select('*')
      .eq('kudos_id', 'kudos-4');
    expect(anonErr).toBeNull();
    expect(Array.isArray(anonData)).toBe(true);

    // Assert the forged insert was never written
    const likeCount = execSql(`SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-4' AND user_id = '${forgedUserId}'`);
    expect(likeCount).toBe('0');
  });

  // Rework (Stage 5 inspection, finding 3): edge-cases.md row 3 (severity "high") — "sender calls
  // the action directly, bypassing the disabled UI" — has correct code (toggle-like.ts's app
  // check + the insert policy's is_static_kudos_author clause) but, until now, no test proving
  // the DATABASE independently rejects it. Follows SC-007's exact pattern (direct
  // `createServerClient` insert, bypassing the server action entirely) but targets kudos-2 —
  // the fixture user's real `auth_user_id` bridges to 'nguyen-hoang-linh' (supabase/seed.sql),
  // who is kudos-2's sender (lib/kudos/kudos-records.ts) — since kudos-3/4 (this file's owned
  // ids) are sent by other slugs and would never trigger BR-002 regardless of caller identity.
  // Asserts the rejection is specifically an RLS policy violation, not a missing-GRANT error
  // (also SQLSTATE 42501, but message "permission denied for table ...") and not the BR-001
  // unique-constraint path (SQLSTATE 23505) — the exact INT-002-style trap this project has
  // already hit once (permissions.md §6). Only the (kudos-2, fixture-user) pair is touched: no
  // other spec ever writes a like row for that specific pair (kudos-board-like-sidebar.spec.ts,
  // which owns kudos-2, only ever likes it via a SECONDARY user through `insertSecondaryLike`),
  // so this test needs no shared ownership of kudos-2's cleanup rotation.
  test('BR-002 (DB): sender liking own kudos is rejected by RLS, not by grant or unique constraint', async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const testEmail = process.env.E2E_TEST_USER_EMAIL;
    const testPassword = process.env.E2E_TEST_USER_PASSWORD;

    if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
      throw new Error('INFRA: Missing Supabase env vars');
    }

    const client = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });

    const { error: signInErr } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    expect(signInErr).toBeNull();

    const userId = (await client.auth.getUser()).data.user?.id;
    expect(userId).toBeTruthy();

    try {
      // Direct insert, bypassing the disabled UI button and the server action's app-level check
      // entirely — this is the "sender calls the action directly" bypass edge-cases.md describes.
      const { error: insertErr } = await client
        .from('kudos_likes')
        .insert({ kudos_id: 'kudos-2', user_id: userId });

      expect(insertErr).toBeTruthy();
      // Must be the RLS WITH CHECK rejection specifically...
      expect(insertErr?.code).toBe('42501');
      expect(insertErr?.message).toMatch(/row-level security policy/i);
      // ...not a missing-GRANT error (same SQLSTATE, different message: "permission denied for
      // table ...")...
      expect(insertErr?.message).not.toMatch(/permission denied/i);
      // ...and not BR-001's unique-constraint path (a different SQLSTATE and message entirely).
      expect(insertErr?.code).not.toBe('23505');
      expect(insertErr?.message).not.toMatch(/duplicate key/i);

      // Assert the self-like was never written.
      const count = execSql(
        `SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-2' AND user_id = '${userId}'`
      );
      expect(count).toBe('0');
    } finally {
      execSql(`DELETE FROM public.kudos_likes WHERE kudos_id = 'kudos-2' AND user_id = '${userId}'`);
    }
  });

  // SC-005 (BR-004): like placed while special day covers today grants 2
  test('SC-005: like during special day grants 2 hearts (is_special=true)', async ({
    page,
    context,
  }) => {
    const todayForSpecial = new Date().toISOString().split('T')[0];
    await withSpecialDay(todayForSpecial, todayForSpecial, async () => {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos');

      // Defect E: "the first enabled heart" on /kudos does not reliably resolve to kudos-4 —
      // kudos-2 is the only disabled one (viewer's own kudos), but which OTHER id renders first
      // depends on feed order (`sortLatestFirst` in kudos-queries.ts). Clicking "first enabled"
      // liked the wrong id, and the SQL check against kudos-4 deterministically found zero rows
      // regardless of database isolation or timing. Locating kudos-4 by identity fixes the
      // mismatch at its source; reveal every batch first since kudos-4 is not guaranteed to sit
      // in the initial REVEAL_BATCH of 4 (components/kudos/all-kudos-feed.tsx).
      await revealAllKudosCards(page);
      const card = kudosCardByIdentity(page, 'Nguyễn Văn Quy', 'Nguyễn Bá Chức');
      await expect(card).toHaveCount(1);
      const heart = card.locator('button[aria-label*="heart"], button[aria-label*="like"]');
      await expect(heart).toBeEnabled();
      // Waits for the Server Action to actually finish (e2e/support/heart-toggle.ts) — the next
      // lines read the row straight from Postgres via execSql, so a fixed delay that races ahead
      // of the real insert would read an empty table for reasons unrelated to BR-004 itself.
      await clickHeartAndSettle(page, heart);

      // Assert is_special flag is true on the stored row
      const isSpecial = execSql(
        `SELECT is_special FROM public.kudos_likes WHERE kudos_id = 'kudos-4' ORDER BY created_at DESC LIMIT 1`
      );
      expect(isSpecial).toBe('t');

      // Assert the weighted sum is 2 (since no other likes exist on kudos-4)
      const weightedSum = execSql(
        `SELECT SUM(CASE WHEN is_special THEN 2 ELSE 1 END) FROM public.kudos_likes WHERE kudos_id = 'kudos-4'`
      );
      expect(weightedSum).toBe('2');
    });
  });

  // Edge case row 6: overlapping special_days ranges still yield single is_special
  test('Edge case 6: overlapping special_days ranges yield single is_special=true', async () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    // Get a real user from the database to use in the like
    const testUser = execSql(`SELECT id FROM auth.users LIMIT 1`);

    try {
      // Insert two overlapping ranges covering today
      execSql(
        `INSERT INTO public.special_days (id, starts_on, ends_on) ` +
        `VALUES ('${id1}', '${today}', '${tomorrow}')`
      );
      execSql(
        `INSERT INTO public.special_days (id, starts_on, ends_on) ` +
        `VALUES ('${id2}', '${today}', '${today}')`
      );

      // Insert a like using the real test user — the trigger should set is_special=true
      execSql(
        `INSERT INTO public.kudos_likes (kudos_id, user_id, is_special) ` +
        `VALUES ('kudos-4', '${testUser}', false)`
      );

      // The trigger should have set it to true (because today is covered by special_days)
      const isSpecial = execSql(
        `SELECT is_special FROM public.kudos_likes WHERE kudos_id = 'kudos-4' ORDER BY created_at DESC LIMIT 1`
      );
      expect(isSpecial).toBe('t');
    } finally {
      execSql(`DELETE FROM public.special_days WHERE id IN ('${id1}', '${id2}')`);
    }
  });

  // SC-006 (BR-005): flag is frozen — after deleting special_days, unlike still revokes 2
  test('SC-006: unlike revokes exact amount granted; is_special flag is frozen', async ({
    page,
    context,
  }) => {
    const todayForSC006 = new Date().toISOString().split('T')[0];

    await withSpecialDay(todayForSC006, todayForSC006, async () => {
      await seedSupabaseSession(context, 'http://localhost:3200');
      await page.goto('/kudos');

      // Like during special day. Defect E (same as SC-005): locate kudos-4 explicitly rather
      // than "the first enabled heart", and reveal every batch first (kudos-4's position in the
      // feed depends on `sortLatestFirst`, not a fixed REVEAL_BATCH).
      await revealAllKudosCards(page);
      const card = kudosCardByIdentity(page, 'Nguyễn Văn Quy', 'Nguyễn Bá Chức');
      await expect(card).toHaveCount(1);
      const heart = card.locator('button[aria-label*="heart"], button[aria-label*="like"]');
      await expect(heart).toBeEnabled();
      await clickHeartAndSettle(page, heart);

      // Verify is_special is stored as true
      const isSpecialBefore = execSql(
        `SELECT is_special FROM public.kudos_likes WHERE kudos_id = 'kudos-4' ORDER BY created_at DESC LIMIT 1`
      );
      expect(isSpecialBefore).toBe('t');

      // Verify the special day is in effect
      const specialDayExists = execSql(`SELECT COUNT(*) FROM public.special_days WHERE '${todayForSC006}' BETWEEN starts_on AND ends_on`);
      expect(specialDayExists).toBe('1');
    });

    // After special_days row is deleted, verify is_special flag is still true on the stored like row
    const isSpecialAfter = execSql(
      `SELECT is_special FROM public.kudos_likes WHERE kudos_id = 'kudos-4' ORDER BY created_at DESC LIMIT 1`
    );
    expect(isSpecialAfter).toBe('t');

    // Verify special day is now gone
    const todayForCheck = new Date().toISOString().split('T')[0];
    const specialDayGone = execSql(
      `SELECT public.is_special_day('${todayForCheck}'::date)`
    );
    expect(specialDayGone).toBe('f');

    // Now unlike through the UI — should revoke 2, not 1.
    // Defect (found while verifying the isolation fix above): the previous version searched the
    // WHOLE section for `button[aria-pressed="true"]` — not scoped to kudos-4. Under
    // `fullyParallel: true`, other kudos-board-like-*.spec.ts files own and toggle their OWN ids
    // (kudos-1, kudos-6) concurrently, and while one of them happens to be mid-like at the moment
    // this test reloads, that OTHER card also renders `aria-pressed="true"` and — being earlier
    // in DOM order — becomes `.first()`'s match instead of kudos-4's own heart. This test would
    // then click and revert that unrelated test's like, while kudos-4's own row was never
    // touched (observed: kudos-4's row count stayed 1 while the clicked button's own
    // `aria-pressed` never changed, because each poll re-resolved `.first()` to a DIFFERENT
    // still-"true" card once the previous match had already flipped). Scoping to kudos-4 by
    // identity (same helper as the like click above) removes the ambiguity entirely.
    await seedSupabaseSession(context, 'http://localhost:3200');
    await page.goto('/kudos');
    await revealAllKudosCards(page);
    const kudos4Card = kudosCardByIdentity(page, 'Nguyễn Văn Quy', 'Nguyễn Bá Chức');
    await expect(kudos4Card).toHaveCount(1);
    const likedHeart = kudos4Card.locator('button[aria-label*="heart"], button[aria-label*="like"]');
    await expect(likedHeart).toHaveAttribute('aria-pressed', 'true');
    await clickHeartAndSettle(page, likedHeart);

    // Verify the like row was deleted
    const likeCount = execSql(`SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-4'`);
    expect(likeCount).toBe('0');
  });
});
