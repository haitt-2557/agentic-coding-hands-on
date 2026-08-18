// R2 Hero / Keyvisual (mms_3.5_Keyvisual + Bìa/Frame 487) — full-bleed background,
// ROOT FURTHER title, countdown, event info, CTAs. `preload` replaces the deprecated
// `priority` prop for LCP hero images (Next 16).
// mm:2167:9028
// mm:2788:12911

import Image from 'next/image';
import { CountdownTimer } from './countdown-timer';
import { EventInfo } from './event-info';
import { HeroCta } from './hero-cta';

export function HeroKeyvisual() {
  return (
    // `isolate` is load-bearing: `relative` alone leaves z-index: auto, which does NOT
    // create a stacking context, so the `-z-10` layers below paint behind the opaque
    // `body { background }` and the keyvisual never appears. isolate scopes them to this section.
    <section className="relative isolate w-full overflow-hidden">
      <Image
        src="/saa/Keyvisual_BG.png"
        alt=""
        aria-hidden="true"
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-background" />
      <div className="mx-auto flex max-w-[1512px] flex-col gap-10 px-6 pb-24 pt-14 sm:px-16 lg:gap-14 lg:px-36 lg:pt-20">
        <h1 className="w-fit">
          <Image
            src="/saa/Root_Further_Logo.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            preload
            className="h-auto w-64 sm:w-80 lg:w-[397px]"
          />
        </h1>
        <div className="flex flex-col gap-6">
          <CountdownTimer />
          <EventInfo />
        </div>
        <HeroCta />
      </div>
    </section>
  );
}
