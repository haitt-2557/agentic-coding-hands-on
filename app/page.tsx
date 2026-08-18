import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { QuickActionWidget } from '@/components/layout/quick-action-widget';
import { HeroKeyvisual } from '@/components/home/hero-keyvisual';
import { RootFurtherContent } from '@/components/home/root-further-content';
import { AwardsSection } from '@/components/home/awards-section';
import { KudosSection } from '@/components/home/kudos-section';

export default function Home() {
  return (
    <div className="flex min-h-full w-full flex-col bg-background">
      <SiteHeader />
      <main className="flex w-full flex-col">
        <HeroKeyvisual />
        <RootFurtherContent />
        <AwardsSection />
        <KudosSection />
      </main>
      <QuickActionWidget />
      <SiteFooter />
    </div>
  );
}
