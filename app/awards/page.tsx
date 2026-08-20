// /awards — SAA 2025 Award System page (frame zFYDgyj_pD). Composes the reused chrome
// (SiteHeader/SiteFooter/KudosSection) with the awards-specific small hero, title block,
// sticky category nav and the six alternating award detail sections. Route stays `/awards`
// per clarifications.md decision 1 ("keep /awards, fill in the existing placeholder").
// mm:313:8436

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { AwardsHero } from '@/components/awards/awards-hero';
import { AwardSectionTitle } from '@/components/awards/award-section-title';
import { AwardCategoryNav } from '@/components/awards/award-category-nav';
import { AwardDetailList } from '@/components/awards/award-detail-list';
import { KudosSection } from '@/components/home/kudos-section';

export default function AwardsPage() {
  return (
    <div className="flex min-h-full w-full flex-col bg-background">
      <SiteHeader />
      <main className="flex w-full flex-col gap-16 pb-20 lg:gap-24">
        <AwardsHero />
        <AwardSectionTitle />
        {/* mm:313:8458 (mms_B_Hệ thống giải thưởng) */}
        <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-10 px-6 sm:px-16 lg:flex-row lg:gap-20 lg:px-36">
          <AwardCategoryNav />
          <AwardDetailList />
        </div>
        <KudosSection />
      </main>
      <SiteFooter />
    </div>
  );
}
