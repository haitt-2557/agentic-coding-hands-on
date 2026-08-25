import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';
import { cleanupTestRows } from './support/local-db';
import { kudosCardByIdentity } from './support/kudos-card-locator';
import { clickHeartAndSettle } from './support/heart-toggle';

// Defect A: this file is the exclusive owner of kudos-1 among the kudos-board like specs
// (kudos-board-like-rules.spec.ts owns kudos-3/4, kudos-board-like-sidebar.spec.ts owns kudos-2).
// `fullyParallel: true` lets this file's own tests run concurrently with each other on different
// workers with no ordering guarantee, which is exactly how SC-001 and FR-003 raced on kudos-1 in
// the original failing run (both target "the first enabled heart", which resolves to kudos-1 —
// see kudos-board-like-rules.spec.ts's comment on the same resolution). `mode: 'serial'` plus a
// clean-slate reset before AND after every test (idempotent — safe from a dirty database left by
// a crashed prior run) removes that race entirely.
test.describe.configure({ mode: 'serial' });

test.describe('Kudos Board Like Persistence /kudos (e2e-red-first gate)', () => {
  test.beforeEach(() => cleanupTestRows(['kudos-1']));
  test.afterEach(() => cleanupTestRows(['kudos-1']));

  // SC-001 (FR-001/FR-002) — the core RED: heart state must survive reload
  // The fixture user's auth_user_id bridges to 'nguyen-hoang-linh', so we must click a heart
  // on a kudos sent by SOMEONE ELSE to avoid BR-002 (sender cannot like own kudos).
  test('SC-001: clicking heart increments count and survives reload, then toggle reverts on second reload', async ({
    page,
    context,
  }) => {
    // Seed a real Supabase session into the browser context
    await seedSupabaseSession(context, 'http://localhost:3200');

    await page.goto('/kudos');

    // Locate the ALL KUDOS section and find a heart button on a kudos NOT sent by fixture user
    const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
    const heartButtons = allKudosSection.locator('button[aria-label*="heart"], button[aria-label*="like"]');

    // Ensure at least one heart is enabled (not the sender)
    const enabledHearts = allKudosSection.locator(
      'button[aria-label*="heart"]:not([disabled]), button[aria-label*="like"]:not([disabled])'
    );
    expect(await enabledHearts.count()).toBeGreaterThan(0);

    const firstEnabledHeart = enabledHearts.first();
    const initialCountText = await firstEnabledHeart.textContent();
    const initialCount = parseInt((initialCountText || '0').replace(/\D/g, ''));

    // FR-001: Click to like — count should increment and aria-pressed should be true. Waits for
    // the toggle's Server Action to actually finish (e2e/support/heart-toggle.ts) — the very next
    // step reloads the page and reads the DB fresh, so if that reload raced ahead of the insert
    // actually committing, it would read stale (pre-like) state and fail the persistence check
    // for reasons that have nothing to do with FR-001 itself.
    await clickHeartAndSettle(page, firstEnabledHeart);

    const afterClickText = await firstEnabledHeart.textContent();
    const afterClickCount = parseInt((afterClickText || '0').replace(/\D/g, ''));
    expect(afterClickCount).toBe(initialCount + 1);
    await expect(firstEnabledHeart).toHaveAttribute('aria-pressed', 'true');

    // FR-001: Reload the page and assert the like persists
    await page.reload();
    await page.waitForTimeout(300);

    const reloadedButton = page
      .locator('section:has(h2:text-is("ALL KUDOS"))')
      .first()
      .locator('button[aria-label*="heart"], button[aria-label*="like"]')
      .first();

    const reloadedCountText = await reloadedButton.textContent();
    const reloadedCount = parseInt((reloadedCountText || '0').replace(/\D/g, ''));
    expect(reloadedCount).toBe(initialCount + 1);
    await expect(reloadedButton).toHaveAttribute('aria-pressed', 'true');

    // FR-002: Click again to unlike — same reasoning as the like click above.
    await clickHeartAndSettle(page, reloadedButton);

    const afterUnlikeText = await reloadedButton.textContent();
    const afterUnlikeCount = parseInt((afterUnlikeText || '0').replace(/\D/g, ''));
    expect(afterUnlikeCount).toBe(initialCount);
    await expect(reloadedButton).toHaveAttribute('aria-pressed', 'false');

    // FR-002: Reload again and assert the unlike also persists
    await page.reload();
    await page.waitForTimeout(300);

    const finalButton = page
      .locator('section:has(h2:text-is("ALL KUDOS"))')
      .first()
      .locator('button[aria-label*="heart"], button[aria-label*="like"]')
      .first();

    const finalCountText = await finalButton.textContent();
    const finalCount = parseInt((finalCountText || '0').replace(/\D/g, ''));
    expect(finalCount).toBe(initialCount);
    await expect(finalButton).toHaveAttribute('aria-pressed', 'false');
  });

  // SC-003 (BR-002) — sender cannot like own kudos. The fixture user's real auth bridges to
  // 'nguyen-hoang-linh', who is MOCK_VIEWER_ID. But kudos-2 is sent by mock viewer, so:
  // First we neutralize the mock by setting localStorage['saa.mock-user-id'] to an unrelated
  // slug. Then we assert the heart on kudos-2 is still disabled due to the REAL auth bridge.
  test('SC-003: own-kudos heart is disabled because real auth_user_id matches sender', async ({
    page,
    context,
  }) => {
    await seedSupabaseSession(context, 'http://localhost:3200');

    // Neutralize the mock viewer so it no longer interferes with BR-002
    // Set it to a different slug that doesn't send any kudos
    await page.addInitScript(() => {
      localStorage.setItem('saa.mock-user-id', 'unrelated-slug');
    });

    await page.goto('/kudos');

    // Find kudos-2 by its (sender, receiver) identity — 'Nguyễn Hoàng Linh' → 'Mai phương Thúy'
    // is the only such pair in lib/kudos/kudos-records.ts, so it identifies kudos-2 uniquely.
    // Defect C: the original locator additionally matched on the static heartCount ('45'), which
    // is mutable — kudos-2 is the same kudos kudos-board-like-sidebar.spec.ts's SC-008 places a
    // secondary like on, and the instant that like lands the rendered count becomes '46', so a
    // concurrently-running SC-003 would search for a '45' that no longer exists on the page and
    // fail with "Should find kudos-2...". Matching the sender/receiver identity instead is
    // unaffected by how many likes the kudos currently has.
    const card = kudosCardByIdentity(page, 'Nguyễn Hoàng Linh', 'Mai phương Thúy');
    await expect(card).toHaveCount(1);

    const heart = card.locator('button[aria-label*="heart"], button[aria-label*="like"]');
    await expect(heart).toBeDisabled();
  });

  // SC-004 (FR-005) — unauthenticated viewer: /kudos loads, real counts display, hearts disabled
  test('SC-004: unauthenticated viewer sees disabled hearts with explanatory aria-label', async ({
    page,
  }) => {
    // Do NOT call seedSupabaseSession; the page sees no authenticated user

    await page.goto('/kudos');

    // Page should load successfully, not redirect to login
    expect(page.url()).toContain('/kudos');

    const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
    await expect(allKudosSection).toBeVisible();

    // Every heart should be disabled
    const allHearts = allKudosSection.locator('button[aria-label*="heart"], button[aria-label*="like"]');
    const disabledHearts = allKudosSection.locator(
      'button[aria-label*="heart"][disabled], button[aria-label*="like"][disabled]'
    );
    const enabledHearts = allKudosSection.locator(
      'button[aria-label*="heart"]:not([disabled]), button[aria-label*="like"]:not([disabled])'
    );

    expect(await allHearts.count()).toBeGreaterThan(0);
    expect(await enabledHearts.count()).toBe(0);
    expect(await disabledHearts.count()).toBe(await allHearts.count());

    // Each disabled heart should have an explanatory aria-label (not the generic like/unlike message)
    for (let i = 0; i < (await disabledHearts.count()); i++) {
      const heart = disabledHearts.nth(i);
      const label = await heart.getAttribute('aria-label');
      // FR-005: explanatory label for unauthenticated viewers
      expect(label).toBeTruthy();
      expect(label).toContain('like');
    }
  });

  // FR-003 — displayed count = static heartCount + real like delta
  // This test verifies the rendering formula; the actual persistence is covered by SC-001.
  test('FR-003: displayed count equals static heartCount plus real-like delta', async ({
    page,
    context,
  }) => {
    await seedSupabaseSession(context, 'http://localhost:3200');

    await page.goto('/kudos');

    const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
    const enabledHearts = allKudosSection.locator(
      'button[aria-label*="heart"]:not([disabled]), button[aria-label*="like"]:not([disabled])'
    );

    expect(await enabledHearts.count()).toBeGreaterThan(0);

    const heart = enabledHearts.first();
    const beforeText = await heart.textContent();
    const before = parseInt((beforeText || '0').replace(/\D/g, ''));

    // Click to like: delta = +1
    await clickHeartAndSettle(page, heart);

    const afterText = await heart.textContent();
    const after = parseInt((afterText || '0').replace(/\D/g, ''));

    expect(after).toBe(before + 1);
  });
});
