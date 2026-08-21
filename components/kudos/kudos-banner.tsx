// mms_A (design/kudos-content.md §1) — read-only banner region: title, KUDOS wordmark and the
// KV background with its gradient cover. Non-interactive per clarifications.md ("banner is
// display-only") and dom-contract.md F5: the submit pill and Sunner search live in
// kudos-action-bar.tsx, never here. Owns its own <section> root (F2/F3 — the first sibling
// section on the page), matching the convention spotlight-board.tsx already set for this
// screen. Server-renderable — no client state needed.
// mm:2940:13436

import Image from 'next/image';

const BANNER_TITLE = 'Hệ thống ghi nhận và cảm ơn';

export function KudosBanner() {
  return (
    // mm:2940:13437
    <section className="relative w-full overflow-hidden">
      {/* mm:I2940:13432;2167:5141 */}
      <Image
        src="/saa/Kudos_Board_KV_Background.png"
        alt=""
        aria-hidden="true"
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* mm:I2940:13432;1210:12612 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(25deg, #00101A 14.74%, rgba(0, 19, 32, 0) 47.8%)' }}
      />
      <div className="flex w-full flex-col gap-6 px-6 py-14 sm:px-16 sm:py-20 lg:gap-10 lg:px-36 lg:py-28">
        {/* mm:2940:13439 */}
        <p className="text-[28px] leading-[1.2] font-bold text-accent sm:text-[36px] sm:leading-[44px]">
          {BANNER_TITLE}
        </p>
        {/* mm:2940:13440 */}
        <Image
          src="/saa/Kudos_Board_Wordmark.svg"
          alt="Sun* KUDOS"
          width={593}
          height={106}
          className="h-auto w-52 sm:w-[420px] lg:w-[593px]"
        />
      </div>
    </section>
  );
}
