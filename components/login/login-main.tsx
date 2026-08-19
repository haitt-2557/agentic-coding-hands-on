// Login main (mms_B_Bìa, node 662:14393) — dark ground + wave key visual anchored
// right, ROOT FURTHER logo; `children` is the intro slot (`LoginIntro`), composed
// by Track B.
//
// `Login_Keyvisual.png` is an artwork-only crop of the composed frame render
// (`get_frame_image`): x660-1440 (safely past the widest foreground extent, text
// node 662:14753 at endX=640), y88-933 — zero baked text/UI pixels, real MCP
// pixels only. The source fill on node 662:14389 has no standalone export path in
// this project (`get_figma_image` HTTP 500, `get_media_file` HTTP 401, absent from
// `list_media_items`/`get_media_files`); flagged as a design-owner note, not a
// substitution. Rendered anchored to the right with the solid dark ground
// (`#00101a`, this app's `--background` family) carrying the rest — hidden below
// `sm` where the intro's 496px column needs the full viewport width anyway, and
// sized above that so the slot's left edge never starts before the intro column's
// own right edge (padding + `pl-4` 16px + max-w 496px): 576px at `sm` (64px
// padding) and 656px at `lg` (144px padding). This guarantees the artwork can
// never sit under the live text/button at any width — the original defect (a
// duplicate of the foreground baked into the background) is eliminated at the
// source, not papered over — and gives the intro copy reliable contrast at every
// breakpoint (previously marginal at 375px against baked wave color bands).
//
// The slot's own left edge fades into the dark ground rather than cutting: an
// overlay reuses the frame's real `#00101A -> transparent` gradient (node
// 662:14392 "Rectangle 57", also node 662:14390 "Cover") verbatim — same colors,
// same stop percentages — rescoped from the full 1440-wide frame to this
// (narrower) slot so the same authored falloff shape dissolves the artwork's
// left edge instead of stopping in a hard vertical line. Percentage stops scale
// with the slot automatically, so one definition covers both `sm` and `lg`.
// mm:662:14393
// mm:662:14395
// mm:2939:9548
// mm:662:14392
// mm:662:14390

import Image from 'next/image';
import type { ReactNode } from 'react';

export function LoginMain({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex w-full flex-col items-start overflow-hidden bg-[#00101a] px-6 py-12 sm:px-16 sm:py-16 lg:min-h-[845px] lg:px-36 lg:py-24">
      <div className="absolute inset-y-0 right-0 -z-10 hidden overflow-hidden sm:block sm:w-[calc(100%-576px)] lg:w-[calc(100%-656px)]">
        <Image
          src="/saa/Login_Keyvisual.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1024px) calc(100vw - 656px), calc(100vw - 576px)"
          className="object-cover object-right"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0, 16, 26, 0) 100%)',
          }}
        />
      </div>
      <div className="flex w-full flex-1 flex-col items-start justify-center gap-20">
        <div className="w-full max-w-[1152px]">
          <Image
            src="/saa/Root_Further_Logo.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            className="h-auto w-56 sm:w-72 lg:w-[451px]"
          />
        </div>
        {children}
      </div>
    </main>
  );
}
