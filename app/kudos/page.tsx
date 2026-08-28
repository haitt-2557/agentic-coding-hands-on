// /kudos — Sun* Kudos Live board (frame MaZUn5xHXZ). Replaces the homepage run's placeholder
// (dom-contract.md F1) with the real server shell: SiteHeader -> <main> -> SiteFooter around
// KudosBoard, which owns the shared filter state and the five sibling <section>s (F2/F3).
// mm:2940:13431
//
// Phase 04 — architecture.md §1's "one page, two data sources": the 9 static records
// (lib/kudos/kudos-records.ts) still render every card, while this Server Component resolves
// the real Supabase side (viewer identity + like ledger) and hands it down as one `likes` prop
// so `KudosBoard` can mount `LikesProvider`. `/kudos` stays public (FR-005) — there is no
// `requireSupabaseUser()` here and no redirect; `getSupabaseUserOrNull()` degrades a signed-out
// visitor to `user: null` rather than throwing, and every read below degrades to an empty/zero
// state on its own failure (see their headers) so a Supabase outage never crashes this page.
//
// `createClient()` reads the request's cookies, which opts this route out of static rendering —
// deliberate (verified by `next build` in this phase and re-verified in phase 08 R3).

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { KudosBoard } from '@/components/kudos/kudos-board';
import { KudosSentToast } from '@/components/kudos/kudos-sent-toast';
import { getSupabaseUserOrNull } from '@/lib/supabase/current-user';
import { resolveViewerSlug } from '@/lib/kudos/viewer-identity';
import { loadBoardLikeState } from '@/lib/kudos/likes/queries';
import { loadBoardKudos } from '@/lib/kudos/board-feed';
import { heartsReceivedBySlug } from '@/lib/kudos/likes/ledger';
import type { LikeBoardState } from '@/components/kudos/likes-provider';

export default async function KudosPage() {
  const user = await getSupabaseUserOrNull();
  const userId = user?.id ?? null;

  // `slug`, `boardState` and `dbRecords` are mutually independent, so they run concurrently;
  // `hearts` depends on the resolved `slug` and follows once it settles (architecture §1).
  // `dbRecords` is the board-rewire read side (TC ca8f60b3): kudos persisted by the send flow
  // render in ALL KUDOS alongside the 9 static records.
  const [slug, boardState, dbRecords] = await Promise.all([
    resolveViewerSlug(userId),
    loadBoardLikeState(userId),
    loadBoardKudos(),
  ]);
  const heartsReceived = await heartsReceivedBySlug(slug);

  const likes: LikeBoardState = {
    isAuthenticated: user !== null,
    viewerSlug: slug,
    counts: boardState.counts,
    likedIds: boardState.likedIds,
    heartsReceived,
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-background">
      <SiteHeader />
      <main className="flex w-full flex-col">
        <KudosBoard likes={likes} dbRecords={dbRecords} />
      </main>
      <SiteFooter />
      {/* F014 E5 — renders nothing unless a send-kudos success flag was just set */}
      <KudosSentToast />
    </div>
  );
}
