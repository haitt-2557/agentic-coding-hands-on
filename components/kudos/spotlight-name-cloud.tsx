'use client';

// mms_B.7 word cloud — 106 absolutely-positioned name nodes from SPOTLIGHT_NODES
// (lib/kudos/spotlight-names.ts, Phase 3). Coordinates and font sizes are the frame's own
// (dom-contract.md F38) — no word-cloud library, no recomputed layout. Position and font
// size both scale via the board's `cqw` container-query unit (container set on the board
// wrapper in spotlight-board.tsx) so the arrangement survives a narrower viewport.
//
// Each node renders `<button type="button" role="button" title={name}>`. The explicit
// `role="button"` is deliberate and MUST stay even though the tag is already a real
// <button>: the frozen locator in dom-contract.md F35 is `[role="button"], span[title],
// div[title]`, which matches the ATTRIBUTE, not the tag — a bare <button> with no explicit
// role would not be found. Do not "clean up" this redundant role in a later refactor.
//
// At most one [role="tooltip"] may exist at a time (dom-contract.md F32) — a single shared
// tooltip is mounted only for the hovered/focused node id, never one per node. It shows the
// node's name; the frame's data model (SpotlightNode) carries no per-node timestamp, so no
// "time" claim is rendered — inventing one would violate "do not invent data" (see report).
//
// Search: a non-empty term dims non-matching names and tints matching ones with the
// existing `--accent` token (reused, not a new colour) so a match reads distinctly from the
// frame's own highlighted node, which always keeps `--spotlight-highlight` regardless of
// search state — that colour is a design value, not a search result.

import { useState } from 'react';
import { SPOTLIGHT_NODES, BOARD_WIDTH, BOARD_HEIGHT } from '@/lib/kudos/spotlight-names';

interface SpotlightNameCloudProps {
  searchTerm: string;
}

function cqw(px: number): string {
  return `${(px / BOARD_WIDTH) * 100}cqw`;
}

export function SpotlightNameCloud({ searchTerm }: SpotlightNameCloudProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const term = searchTerm.trim().toLowerCase();
  const activeNode = SPOTLIGHT_NODES.find((node) => node.id === activeId) ?? null;

  const clearIfCurrent = (id: string) => {
    setActiveId((current) => (current === id ? null : current));
  };

  return (
    <>
      {/*
        Names are clipped to the board's bounds. Four of the 106 nodes carry a `relY` beyond
        BOARD_HEIGHT (555/561/578/593 vs 548 — see lib/kudos/spotlight-names.ts), so without a
        clip they render BELOW the bordered box against the page ground. They are outside the
        container in the design data too; Figma only hides it because the board's three artwork
        layers overhang the border (`Root further mo rong 1` is 1819x583 against a 1157x548
        board), and those layers are the ones recorded as unfetchable — so here the escape is
        plainly visible. Reported as a design defect; clipping introduces no invented value.

        The clip lives on this inner layer, NOT on the board container, so the tooltip below
        stays outside it. The tooltip's padding and text size are fixed px while the board
        scales via `cqw`, so near the 375px floor a top-row node's tooltip sits slightly above
        the board — clipping at the container would swallow it.

        `pointer-events-none` is required: this layer spans the full board and is painted after
        SpotlightSearch, so without it the transparent overlay would intercept clicks meant for
        the search input. Each button re-enables events for itself.
      */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ borderRadius: 'inherit' }}
      >
        {SPOTLIGHT_NODES.map((node) => {
          const matches = term !== '' && node.name.toLowerCase().includes(term);
          const dimmed = term !== '' && !node.highlighted && !matches;
          const colorClass = node.highlighted
            ? 'text-spotlight-highlight'
            : matches
              ? 'text-accent'
              : 'text-white';

          return (
            // mm:{node.id}
            <button
              key={node.id}
              type="button"
              role="button" // F35 — redundant role required by the frozen attribute locator
              title={node.name}
              onMouseEnter={() => setActiveId(node.id)}
              onMouseLeave={() => clearIfCurrent(node.id)}
              onFocus={() => setActiveId(node.id)}
              onBlur={() => clearIfCurrent(node.id)}
              className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-transparent p-0 text-center font-bold ${colorClass}`}
              style={{
                left: `${(node.relX / BOARD_WIDTH) * 100}%`,
                top: `${(node.relY / BOARD_HEIGHT) * 100}%`,
                fontSize: cqw(node.fontSize),
                letterSpacing: cqw(0.208),
                opacity: dimmed ? 0.35 : 1,
              }}
            >
              {node.name}
            </button>
          );
        })}
      </div>

      {activeNode && (
        // mm:tooltip (shared single instance — F32)
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-[#00101a] px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg"
          style={{
            left: `${(activeNode.relX / BOARD_WIDTH) * 100}%`,
            top: `${(activeNode.relY / BOARD_HEIGHT) * 100}%`,
            marginTop: cqw(-8),
          }}
        >
          {activeNode.name}
        </div>
      )}
    </>
  );
}
