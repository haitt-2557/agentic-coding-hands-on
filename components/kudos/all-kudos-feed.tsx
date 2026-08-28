'use client';

// mms_C (design/kudos-content.md §5) — ALL KUDOS section: FR-004/005, dom-contract F2/F4/F25/F42,
// SM-002 (progressive reveal over a finite static list). Owns `revealedCount` and the sentinel;
// the shared `filter` is a prop from Phase 5's shell, never a second local filter (DEC-001 —
// the specific bug that rule exists to prevent). `onCopied` is accepted for API parity with
// dom-contract.md §12's frozen `AllKudosFeed` signature but intentionally unused: Phase 4's
// `KudosCardActions` already mounts its own `KudosToast` per card (accepted deviation, job
// card) — wiring a second consumer here would risk a second toast instance and break the
// singleton `text=Link copied — ready to share!` assertion (TC 0adfd7ce).

import { useEffect, useRef, useState } from 'react';
import { KudosCard } from './kudos-card';
import { KudosSidebar } from './kudos-sidebar';
import type { KudosRecord } from '@/lib/kudos/kudos-records';
import { filterRecords, sortLatestFirst, type KudosFilter } from '@/lib/kudos/kudos-queries';

// dom-contract.md Key Insights / S4 / S6 — the frame draws four post cards; the seed contract's
// filter-count (0e56cacb/159fed13) and heart-ownership (63645b03) assertions are calibrated to
// this exact batch size. Do not change it without re-checking those tests.
const REVEAL_BATCH = 4;

interface AllKudosFeedProps {
  /** Full record pool in authored order (static seed + DB rows, board rewire) — the shell owns
   * composition so this feed and the highlight carousel always read the same pool (DEC-001's
   * one-source discipline extended to the records themselves). */
  records: KudosRecord[];
  filter: KudosFilter;
  viewerId: string;
  onHashtagClick: (hashtag: string) => void;
  onCopied: (message: string) => void;
}

function filterIdentity(filter: KudosFilter): string {
  return `${filter.hashtag ?? ''}|${filter.department ?? ''}`;
}

export function AllKudosFeed({ records, filter, viewerId, onHashtagClick }: AllKudosFeedProps) {
  const filtered = sortLatestFirst(filterRecords(records, filter));
  const [revealedCount, setRevealedCount] = useState(REVEAL_BATCH);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset to the first batch when the shared filter changes (SM-002 transition rules). Derived
  // during render rather than in an effect so there is no post-mount flash of the stale, larger
  // list (phase file Risk Assessment).
  const filterKey = filterIdentity(filter);
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setRevealedCount(REVEAL_BATCH);
  }

  const exhausted = revealedCount >= filtered.length;

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || exhausted) {
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setRevealedCount((current) => Math.min(current + REVEAL_BATCH, filtered.length));
        }
      }
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [exhausted, filtered.length]);

  const visible = filtered.slice(0, revealedCount);

  return (
    // mm:2940:13475
    <section className="flex w-full flex-col gap-10 py-10">
      {/* mm:2940:14221 */}
      <div className="flex w-full flex-col gap-8 px-6 lg:px-36">
        {/* mm:2940:14222 */}
        <p className="text-2xl leading-8 font-bold text-foreground">Sun* Annual Awards 2025</p>
        {/* mm:2940:14223 */}
        <div className="h-px w-full bg-divider" />
        {/* mm:2940:14225 */}
        <h2 className="text-[57px] leading-[64px] font-bold tracking-[-0.25px] text-accent">ALL KUDOS</h2>
      </div>
      {/* mm:2940:13481 */}
      <div className="flex w-full flex-col gap-10 px-6 lg:flex-row lg:justify-between lg:gap-20 lg:px-36">
        {/* mm:2940:13482 */}
        <div className="flex w-full flex-col gap-6 lg:w-[680px]">
          {visible.length === 0 ? (
            <p className="text-base leading-6 font-bold text-foreground">Hiện tại chưa có Kudos nào.</p>
          ) : (
            visible.map((record) => (
              // mm:3127:21871 (card shell shared with Phase 4's KudosCard)
              <KudosCard
                key={record.id}
                record={record}
                variant="post"
                viewerId={viewerId}
                onHashtagClick={onHashtagClick}
              />
            ))
          )}
          {!exhausted && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />}
        </div>
        <KudosSidebar />
      </div>
    </section>
  );
}
