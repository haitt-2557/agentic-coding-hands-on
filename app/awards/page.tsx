// Placeholder `/awards` route (clarifications.md — content out of scope this run).
// Carries the six `#<slug>` anchor sections so header/footer/CTA/card hash navigation
// and auto-scroll are real (TC ID-47-52, ID-62), not a 404.

import { AWARDS } from '@/lib/awards';

export default function AwardsPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1152px] flex-col gap-24 px-6 py-20 text-white">
      <h1 className="text-4xl font-bold text-accent">Award Information</h1>
      {AWARDS.map((award) => (
        <section key={award.slug} id={award.slug} className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-accent">{award.title}</h2>
          <p className="mt-2 text-base text-white/80">{award.description}</p>
        </section>
      ))}
    </main>
  );
}
