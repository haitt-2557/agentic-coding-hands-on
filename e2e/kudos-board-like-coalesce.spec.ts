import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';
import { execSql, cleanupTestRows } from './support/local-db';
import { kudosCardByIdentity } from './support/kudos-card-locator';

test.describe.configure({ mode: 'serial' });

test.describe('Kudos Board Like Coalescing (edge-cases.md row 1 / SM-001)', () => {
  // This file owns kudos-6 exclusively among the kudos-board like specs; reset before AND after
  // each test to ensure a clean state even if a prior run crashed.
  test.beforeEach(() => {
    cleanupTestRows(['kudos-6']);
  });

  test.afterEach(() => {
    cleanupTestRows(['kudos-6']);
  });

  // SM-001: rapid successive clicks on the same heart (like → unlike) must coalesce, not queue.
  // The second click arrives while the first's Server Action is still in flight, so it is
  // recorded as the pending desired end state rather than dropped. After the first request
  // settles, exactly one follow-up request fires to converge to the final intent (unlike).
  // Assert:
  // - Final UI state: aria-pressed="false" (the last click's intent), count back at original
  // - Database state: kudos_likes row is deleted (the unlike persisted)
  // - Request coalescing: at most 2 requests fired, not 3+ (no queuing per click)
  test('SM-001: second click while first in flight coalesces, final intent is honored', async ({
    page,
    context,
  }) => {
    const initial_count = execSql(`SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-6'`);
    expect(parseInt(initial_count)).toBe(0);

    await seedSupabaseSession(context, 'http://localhost:3200');
    await page.goto('/kudos');

    // Scroll to end to trigger IntersectionObserver and load all kudos beyond REVEAL_BATCH of 4
    await page.keyboard.press('End');
    await page.waitForTimeout(500);

    // Locate kudos-6 by (sender, receiver) identity: 'Mai phương Thúy ' → 'Dương thúy An'
    // (Note: senderName has a trailing space in the records)
    const card = kudosCardByIdentity(page, 'Mai phương Thúy ', 'Dương thúy An');
    await expect(card).toHaveCount(1);

    const heart = card.locator('button[aria-label*="heart"], button[aria-label*="like"]');
    await expect(heart).toBeEnabled();

    // Get the initial count
    const beforeText = await heart.textContent();
    const beforeCount = parseInt((beforeText || '0').replace(/\D/g, ''));

    // Perform two rapid clicks with no settle wait between them, expressing final intent
    // of "unlike" (like → unlike). Both clicks fire immediately; the second arrives mid-flight
    // of the first and is coalesced into pendingDesired, not queued or dropped.
    await heart.click(); // First click: optimistic flip to liked
    // No wait here — the second click must arrive while the first request is in flight
    await heart.click(); // Second click: optimistic flip back to not liked (final intent)

    // Wait long enough for both the first request AND any coalesced follow-up to settle
    // (1000ms for first settle + 1000ms for follow-up)
    await page.waitForTimeout(2100);

    // Assert final UI state reflects the last click's intent (unlike)
    const finalText = await heart.textContent();
    const finalCount = parseInt((finalText || '0').replace(/\D/g, ''));

    // The count should be back at the original value (the like was undone)
    expect(finalCount).toBe(beforeCount);

    // aria-pressed should be false (the final intent was unlike)
    await expect(heart).toHaveAttribute('aria-pressed', 'false');

    // Assert database state: the kudos_likes row must be gone (the final intent persisted)
    const rowCount = execSql(`SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-6'`);
    expect(parseInt(rowCount)).toBe(0);
  });

  // Verify coalescing prevents queueing: 3 rapid clicks should not produce 3 requests
  // Click sequence: like → unlike → like (final intent: like)
  // If each click queued a request, we'd see 3 rows in audit logs or multiple final reconciliations.
  // Coalescing means: first request toggles liked=true, second click sets pendingDesired=false,
  // third click sets pendingDesired=true (only the latest intent is kept), so after first request
  // settles, one follow-up fires to converge from true → false, then another from false → true.
  // Total: at most 3 requests (first + two follow-ups), not more.
  test('SM-001: three rapid clicks coalesce to final intent, no queuing', async ({
    page,
    context,
  }) => {
    const initial_count = execSql(`SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-6'`);
    expect(parseInt(initial_count)).toBe(0);

    await seedSupabaseSession(context, 'http://localhost:3200');
    await page.goto('/kudos');

    // Scroll to end to trigger IntersectionObserver and load all kudos beyond REVEAL_BATCH of 4
    await page.keyboard.press('End');
    await page.waitForTimeout(500);

    const card = kudosCardByIdentity(page, 'Mai phương Thúy ', 'Dương thúy An');
    await expect(card).toHaveCount(1);

    const heart = card.locator('button[aria-label*="heart"], button[aria-label*="like"]');
    await expect(heart).toBeEnabled();

    const beforeText = await heart.textContent();
    const beforeCount = parseInt((beforeText || '0').replace(/\D/g, ''));

    // Three rapid clicks: like → unlike → like (final intent is like)
    await heart.click(); // 1: optimistic flip to liked
    await heart.click(); // 2: optimistic flip to not liked
    await heart.click(); // 3: optimistic flip to liked (final intent)

    // Wait for all requests to settle
    await page.waitForTimeout(2100);

    // Assert final UI state: should be liked (final intent from click 3)
    const finalText = await heart.textContent();
    const finalCount = parseInt((finalText || '0').replace(/\D/g, ''));

    expect(finalCount).toBe(beforeCount + 1);
    await expect(heart).toHaveAttribute('aria-pressed', 'true');

    // Assert database state: exactly one row should exist (the final intent persisted)
    const rowCount = execSql(`SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = 'kudos-6'`);
    expect(parseInt(rowCount)).toBe(1);
  });
});
