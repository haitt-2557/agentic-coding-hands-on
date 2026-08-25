import { test, expect } from '@playwright/test';
import { seedSupabaseSession } from './support/supabase-session';
import { insertSecondaryLike, execSql, cleanupTestRows } from './support/local-db';

test.describe.configure({ mode: 'serial' });

test.describe('Kudos Board Like Sidebar (SC-008)', () => {
  // Defect A (leftover row): this file owns kudos-2 exclusively among the kudos-board like specs
  // and is the only one that inserts a secondary like via `insertSecondaryLike`. The previous
  // `cleanupTestRows()` call (no args) defaulted to deleting kudos-3/4 — ids this file never
  // touches — so the secondary-liker row it created on kudos-2 was never removed and was found
  // still present after the run. Passing this file's own id fixes that directly.
  test.beforeEach(() => {
    cleanupTestRows(['kudos-2']);
  });

  test.afterEach(() => {
    cleanupTestRows(['kudos-2']);
  });

  // SC-008 (FR-008): sidebar "Số tim bạn nhận được:" reflects real weighted ledger
  test('SC-008: sidebar displays real heart ledger for authenticated viewer', async ({
    page,
    context,
  }) => {
    // Create a secondary like so we can verify the sidebar reflects it
    const secondaryUserId = await insertSecondaryLike('kudos-2');

    // Query the current ledger for the fixture user (who sent kudos-2)
    const ledgerResult = execSql(
      `SELECT COALESCE(SUM(CASE WHEN kl.is_special THEN 2 ELSE 1 END), 0) ` +
      `FROM public.kudos_likes kl ` +
      `JOIN public.kudos_static_authors ksa ON kl.kudos_id = ksa.kudos_id ` +
      `WHERE ksa.sender_slug = 'nguyen-hoang-linh'`
    );
    const expectedValue = parseInt(ledgerResult);

    // Log in with the fixture user (who maps to nguyen-hoang-linh)
    await seedSupabaseSession(context, 'http://localhost:3200');
    await page.goto('/kudos');

    // Find the sidebar stat "Số tim bạn nhận được:" and read the number beside it.
    // Defect (found while verifying the isolation fix, evidenced by "Expected: 1, Received: 21"):
    // the previous approach read the WHOLE row's concatenated textContent and regex-matched a
    // trailing digit run. But components/kudos/kudos-sidebar-stats.tsx renders the "x2" heart
    // badge as a sibling text node immediately before the value span with no separator between
    // them, so `textContent()` yields e.g. "...x2" + "1" = "...x21" — the regex then greedily
    // consumes the badge's trailing "2" as part of the number, turning a real value of 1 into a
    // parsed 21 (and any value into "2" + value, unconditionally, regardless of what the real
    // ledger is). Reading the value span directly (`.text-accent`, the only element in this row
    // with that class — the label and the "x2" badge both use `text-foreground`) sidesteps the
    // concatenation entirely.
    const sidebarRow = page.locator('text=Số tim bạn nhận được:').first();
    await expect(sidebarRow).toBeVisible();

    const container = sidebarRow.locator('..').first();
    const valueText = await container.locator('span.text-accent').first().textContent();
    // The value may still contain vi-VN thousands separators like "1.000"; strip non-digits.
    const displayedValue = parseInt((valueText || '0').replace(/\D/g, ''), 10) || 0;

    // The sidebar should reflect the current ledger (which includes the secondary like we just added)
    expect(displayedValue).toBe(expectedValue);
  });

  // Also verify the logged-out case: sidebar should show 0 for unauthenticated viewer
  test('SC-008: sidebar displays 0 hearts for unauthenticated viewer', async ({ page }) => {
    // Do NOT call seedSupabaseSession; the page sees no authenticated user
    await page.goto('/kudos');

    const sidebarRow = page.locator('text=Số tim bạn nhận được:').first();
    await expect(sidebarRow).toBeVisible();

    // Same fix as above: read the value span directly, not the "x2"-badge-concatenated row text.
    const container = sidebarRow.locator('..').first();
    const valueText = await container.locator('span.text-accent').first().textContent();
    const displayedValue = parseInt((valueText || '0').replace(/\D/g, ''), 10) || 0;

    // Unauthenticated viewer has no ledger, so should see 0
    expect(displayedValue).toBe(0);
  });
});
