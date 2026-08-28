import { test, expect } from '@playwright/test';
import { seedDefaultSession } from './support/seed-defaults';
import { seedSupabaseSession } from './support/supabase-session';
import { execSql } from './support/local-db';
import { revealAllKudosCards } from './support/reveal-kudos-feed';
import { clickHeartAndSettle } from './support/heart-toggle';

// TC ca8f60b3 (board half) — "Kudos is saved to the database; a new entry appears in the Kudos
// feed." The send flow already persists rows into public.kudos (submit-kudos.ts); this spec pins
// the read side: a row in Supabase local's kudos table renders as a card in ALL KUDOS, newest
// first (`sortLatestFirst`), with its recipient, sender, hashtags and a zero heart count.
//
// The row is inserted directly via psql (superuser — bypasses RLS deliberately: this spec tests
// the feed's READ path, not the insert policies, which kudos-board-like-rules.spec.ts owns for
// likes and SC-009 owns for sends). Fixed uuid so cleanup is deterministic; this file owns that
// id exclusively. Sender is the e2e fixture user, whose auth uuid is bridged to
// 'nguyen-hoang-linh' (supabase/seed.sql) — the (Nguyễn Hoàng Linh → Dương thúy An) identity
// pair matches no static record, so locators cannot collide with any other spec's cards.
// Both tests below insert under the same fixed id, so they must never overlap in time —
// `fullyParallel: true` would otherwise race them onto a duplicate-key error (observed on the
// first RED run). Same remedy as the other kudos-board like specs.
test.describe.configure({ mode: 'serial' });

const TEST_KUDOS_ID = 'eeeeeeee-0000-4000-8000-00000000e2e0';
const FIXTURE_AUTH_UID = '11111111-1111-1111-1111-111111111111';
// A second auth identity used as the DB row's SENDER in the like test, so the fixture viewer
// is not the author and BR-002 leaves the heart actionable. Unbridged on purpose (no profiles
// row points at it) — the card renders the 'Sunner' fallback.
const SECONDARY_AUTH_UID = 'eeeeeeee-0000-4000-8000-00000000e2e1';
const TEST_MESSAGE = 'E2E-DB-FEED: thanks for the board rewire';

function cleanupTestKudos(): void {
  // kudos_hashtags/kudos_images cascade from the parent row.
  execSql(`DELETE FROM public.kudos_likes WHERE kudos_id = '${TEST_KUDOS_ID}'`);
  execSql(`DELETE FROM public.kudos WHERE id = '${TEST_KUDOS_ID}'`);
  execSql(`DELETE FROM auth.users WHERE id = '${SECONDARY_AUTH_UID}'`);
}

test.describe('Kudos Board DB Feed (ca8f60b3 board half)', () => {
  test.beforeEach(async ({ page }) => {
    await seedDefaultSession({ page });
    cleanupTestKudos();
  });

  test.afterEach(() => {
    cleanupTestKudos();
  });

  test('a kudos row in Supabase local renders as the newest card in ALL KUDOS', async ({ page }) => {
    execSql(
      `INSERT INTO public.kudos (id, sender_id, recipient_id, title, message, is_anonymous) ` +
        `VALUES ('${TEST_KUDOS_ID}', '${FIXTURE_AUTH_UID}', 'duong-thuy-an', 'Board rewire', '${TEST_MESSAGE}', false)`
    );
    execSql(
      `INSERT INTO public.kudos_hashtags (kudos_id, hashtag_id) VALUES ('${TEST_KUDOS_ID}', '#WASSHOI')`
    );

    await page.goto('/kudos');

    const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
    const cards = allKudosSection.locator('article');

    // ca8f60b3: the persisted row renders as a card, with its people, hashtags and content.
    const myCard = cards.filter({ hasText: TEST_MESSAGE });
    await expect(myCard).toHaveCount(1);
    await expect(myCard).toContainText('Nguyễn Hoàng Linh'); // bridged sender profile
    await expect(myCard).toContainText('Dương thúy An'); // recipient profile
    await expect(myCard).toContainText('#WASSHOI');

    // Feed sort contract ("latest on top"): every DB row is newer than every static record, so
    // this card must precede the first STATIC card. Discriminate by the category label — all 9
    // static records carry 'IDOL GIỚI TRẺ', DB rows carry none — rather than asserting "first
    // card", which would race any OTHER db row a concurrently-running send spec persists.
    // Reveal every batch first: with DB rows on top, the initial REVEAL_BATCH of 4 may hold no
    // static card at all.
    await revealAllKudosCards(page);
    const texts = await cards.allTextContents();
    const myIndex = texts.findIndex((t) => t.includes(TEST_MESSAGE));
    const firstStaticIndex = texts.findIndex((t) => t.includes('IDOL GIỚI TRẺ'));
    expect(myIndex).toBeGreaterThanOrEqual(0);
    expect(firstStaticIndex).toBeGreaterThanOrEqual(0);
    expect(myIndex).toBeLessThan(firstStaticIndex);

    // No likes exist on the fresh row: displayed count = 0 static hearts + 0 live likes.
    const heart = myCard.locator('button[aria-label*="heart"], button[aria-label*="like"]');
    await expect(heart).toContainText('0');
  });

  test('an anonymous kudos row shows its nickname, never the sender profile name', async ({ page }) => {
    execSql(
      `INSERT INTO public.kudos (id, sender_id, recipient_id, title, message, is_anonymous, nickname) ` +
        `VALUES ('${TEST_KUDOS_ID}', '${FIXTURE_AUTH_UID}', 'le-kieu-trang', 'Anon', '${TEST_MESSAGE}', true, 'Sunner bí ẩn')`
    );

    await page.goto('/kudos');

    const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
    const myCard = allKudosSection.locator('article').filter({ hasText: TEST_MESSAGE });

    await expect(myCard).toHaveCount(1);
    await expect(myCard).toContainText('Sunner bí ẩn');
    // The sender's real bridged name must not leak on an anonymous card. The receiver block
    // renders 'Lê Kiều Trang', so scope the negative assertion to the sender's PersonBlock
    // (first child of the people row — see kudos-card-people.tsx structure).
    const senderBlock = myCard
      .locator('div.flex.w-full.items-center.justify-between.gap-6 > div:first-child')
      .first();
    await expect(senderBlock).not.toContainText('Nguyễn Hoàng Linh');
  });

  test('the heart on a DB-persisted kudos toggles and persists a like row', async ({ page, context }) => {
    // Sender is a second, unbridged auth user, so the fixture viewer is NOT the author and
    // both BR-002 controls (UI disable, RLS `is_dynamic_kudos_author`) leave the heart usable.
    execSql(
      `INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at) ` +
        `VALUES ('${SECONDARY_AUTH_UID}', 'e2e-db-feed-sender@example.com', '{}', now(), now())`
    );
    execSql(
      `INSERT INTO public.kudos (id, sender_id, recipient_id, title, message, is_anonymous) ` +
        `VALUES ('${TEST_KUDOS_ID}', '${SECONDARY_AUTH_UID}', 'mai-phuong-thuy', 'Like me', '${TEST_MESSAGE}', false)`
    );
    await seedSupabaseSession(context, 'http://localhost:3200');

    await page.goto('/kudos');

    const allKudosSection = page.locator('section:has(h2:text-is("ALL KUDOS"))').first();
    const myCard = allKudosSection.locator('article').filter({ hasText: TEST_MESSAGE });
    await expect(myCard).toHaveCount(1);

    const heart = myCard.locator('button[aria-label*="heart"], button[aria-label*="like"]');
    await expect(heart).toBeEnabled();

    // Like through the UI. The optimistic flip alone must not satisfy this test — the count
    // has to HOLD (server action committed), and the row must exist in Postgres.
    await clickHeartAndSettle(page, heart);
    const readCount = async () => parseInt(((await heart.textContent()) || '0').replace(/\D/g, ''));
    await expect.poll(readCount, { timeout: 10_000 }).toBe(1);
    await expect(heart).toHaveAttribute('aria-pressed', 'true');

    const rowCount = execSql(
      `SELECT COUNT(*) FROM public.kudos_likes WHERE kudos_id = '${TEST_KUDOS_ID}'`
    );
    expect(parseInt(rowCount)).toBe(1);
  });
});
