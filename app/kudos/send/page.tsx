// FR-001, FR-013 — `/kudos/send` (frame JsTvi8KVQA). Thin server shell: gate first, then the
// two parallel reads, then hand off to the client wrapper that owns the success navigation
// half of E5. Deliberately does NOT render `KudosActionBar` (D1) — its Sunner-search
// placeholder would collide with the recipient field's own "Tìm kiếm" input.

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { requireSupabaseUser } from '@/lib/kudos/send/auth-gate';
import { listProfiles, listHashtags } from '@/lib/kudos/send/queries';
import { KudosSendPageClient } from '@/components/kudos/kudos-send-page-client';

export default async function KudosSendPage() {
  await requireSupabaseUser();

  const [profiles, hashtags] = await Promise.all([listProfiles(), listHashtags()]);

  return (
    <div className="flex min-h-full w-full flex-col bg-background">
      <SiteHeader />
      <main className="flex w-full flex-col items-center">
        <KudosSendPageClient profiles={profiles} hashtags={hashtags} />
      </main>
      <SiteFooter />
    </div>
  );
}
