'use client';

// mms_B/C (dom-contract.md §12 seam) — the client shell for `/kudos`. Owns the ONE shared
// filter state that BR-003/DEC-001 require: a hashtag or department selection re-filters both
// HIGHLIGHT KUDOS (`highlightTop5`) and ALL KUDOS (`filterRecords`, Phase 7) and resets the
// carousel to page 1. Renders the five sibling <section>s in F3 order; F2 forbids any section
// wrapping another, so KudosBanner/KudosActionBar/SpotlightBoard/AllKudosFeed each own their
// own <section> root and are rendered directly here — AllKudosFeed already composes its own
// "ALL KUDOS" heading and `<KudosSidebar />` internally (components/kudos/all-kudos-feed.tsx),
// so this shell must NOT re-wrap it in a second <section>/<h2> or mount a second sidebar.
// The HIGHLIGHT KUDOS region is the one exception: it is composed here from two components
// (KudosFilterBar + HighlightCarousel) that do not own a shared section between them, so this
// shell supplies that single wrapping <section>.
//
// The Copy Link toast is deliberately NOT lifted into a second piece of state here: Phase 4's
// kudos-card-actions.tsx already mounts one KudosToast per card (accepted deviation recorded in
// this phase's job card). A page-level toast on top of that would make
// `text=Link copied — ready to share!` match twice and break the strict Copy Link test.
// mm:2940:13451 (HIGHLIGHT KUDOS section)

import { useState } from 'react';
import { useSession } from '@/lib/session/session-provider';
import { KUDOS_RECORDS, MOCK_VIEWER_ID, type KudosRecord } from '@/lib/kudos/kudos-records';
import { highlightTop5, type KudosFilter } from '@/lib/kudos/kudos-queries';
import { LikesProvider, type LikeBoardState } from './likes-provider';
import { KudosBanner } from './kudos-banner';
import { KudosActionBar } from './kudos-action-bar';
import { KudosFilterBar } from './kudos-filter-bar';
import { HighlightCarousel } from './highlight-carousel';
import { SpotlightBoard } from './spotlight-board';
import { AllKudosFeed } from './all-kudos-feed';

const INITIAL_FILTER: KudosFilter = { hashtag: null, department: null };
const NOOP_ON_COPIED = () => {};

interface KudosBoardProps {
  likes: LikeBoardState;
  /** DB-persisted kudos from Supabase local (board rewire, TC ca8f60b3) — already mapped to
   * KudosRecord and ordered oldest-first, so appending after KUDOS_RECORDS keeps one global
   * authored-order array for `sortLatestFirst` to flip. */
  dbRecords?: KudosRecord[];
}

export function KudosBoard({ likes, dbRecords = [] }: KudosBoardProps) {
  const { userId } = useSession();
  const [filter, setFilter] = useState<KudosFilter>(INITIAL_FILTER);

  const viewerId = userId || MOCK_VIEWER_ID;
  // One record pool for both sections. DB rows carry heartCount 0, so highlightTop5's static
  // ranking is unchanged in practice (min static count is 95) — no special-casing needed.
  const allRecords = [...KUDOS_RECORDS, ...dbRecords];
  const highlightRecords = highlightTop5(allRecords, filter);

  function handleHashtagClick(hashtag: string) {
    setFilter((current) => ({ ...current, hashtag }));
  }

  return (
    <LikesProvider initial={likes}>
      <KudosBanner />
      <KudosActionBar />
      {/* mm:2940:13451 */}
      <section className="flex w-full flex-col gap-10 px-6 py-10 sm:px-16 lg:px-36">
        <KudosFilterBar filter={filter} onFilterChange={setFilter} />
        <HighlightCarousel
          records={highlightRecords}
          filter={filter}
          viewerId={viewerId}
          onHashtagClick={handleHashtagClick}
        />
      </section>
      <SpotlightBoard />
      <AllKudosFeed
        records={allRecords}
        filter={filter}
        viewerId={viewerId}
        onHashtagClick={handleHashtagClick}
        onCopied={NOOP_ON_COPIED}
      />
    </LikesProvider>
  );
}
