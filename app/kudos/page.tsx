// /kudos — Sun* Kudos Live board (frame MaZUn5xHXZ). Replaces the homepage run's placeholder
// (dom-contract.md F1) with the real server shell: SiteHeader -> <main> -> SiteFooter around
// KudosBoard, which owns the shared filter state and the five sibling <section>s (F2/F3).
// mm:2940:13431

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { KudosBoard } from '@/components/kudos/kudos-board';
import { KudosSentToast } from '@/components/kudos/kudos-sent-toast';

export default function KudosPage() {
  return (
    <div className="flex min-h-full w-full flex-col bg-background">
      <SiteHeader />
      <main className="flex w-full flex-col">
        <KudosBoard />
      </main>
      <SiteFooter />
      {/* F014 E5 — renders nothing unless a send-kudos success flag was just set */}
      <KudosSentToast />
    </div>
  );
}
