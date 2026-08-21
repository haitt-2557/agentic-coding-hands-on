'use client';

// mms_B.3.2/B.3.6 (BR-005) — the "hoa thị" (star tier) indicator beside each sender/receiver
// name. The frame draws exactly one visual for this at every tier: a 4×4 grey dot
// (design/kudos-content.md §3.3 "star dot", node 335:9443;256:4754 / 335:9446;256:4754).
// Below tier 1 (kudosReceived < 10) there is no tooltip copy at all (star-tiers.ts NO_TIER),
// so the dot renders inert rather than pretending to be an interactive trigger.
// dom-contract.md F32 — at most one role="tooltip" may exist in the DOM at a time — so this
// component only mounts its tooltip while actively hovered or focused, never permanently.

import { useState } from 'react';
import { starTierFor } from '@/lib/kudos/star-tiers';

interface StarTierTooltipProps {
  kudosReceived: number;
}

const DOT_CLASSES = 'h-1 w-1 shrink-0 rounded-full bg-muted-text opacity-40';

export function StarTierTooltip({ kudosReceived }: StarTierTooltipProps) {
  const [open, setOpen] = useState(false);
  const tier = starTierFor(kudosReceived);

  if (tier.stars === 0) {
    // mm:335:9443;256:4754
    return <span aria-hidden="true" className={DOT_CLASSES} />;
  }

  return (
    <span className="relative inline-flex">
      {/* mm:335:9443;256:4754 */}
      <button
        type="button"
        aria-label="Sunner tier"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={DOT_CLASSES}
      />
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-accent bg-kudos-card-ground p-3 text-left text-sm leading-5 font-bold text-background shadow-lg"
        >
          {tier.tooltip}
        </span>
      )}
    </span>
  );
}
