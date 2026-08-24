'use client';

// FR-013, E5 — owns the success half of the submit flow that `submitKudos` (phase-05)
// deliberately does not: on a successful result, sets a `sessionStorage` flag and navigates
// with the router, rather than a server-side `redirect()` with a query string (the anchored
// `toHaveURL(/\/kudos$/)` assertion forbids the latter). This wrapper exists purely to keep
// that navigation logic out of `components/kudos/send/**` (phase-06's file) — Track A's
// `KudosSendForm` renders `{ ok:false }` results inline itself and never navigates on success.

import { useRouter } from 'next/navigation';
import { submitKudos } from '@/lib/kudos/send/submit-kudos';
import { KudosSendForm } from '@/components/kudos/send/kudos-send-form';
import type { HashtagOption, ProfileOption, SubmitKudosInput, SubmitKudosResult } from '@/lib/kudos/send/types';
import { KUDOS_SENT_FLAG_KEY } from './kudos-sent-toast';

interface KudosSendPageClientProps {
  profiles: ProfileOption[];
  hashtags: HashtagOption[];
}

export function KudosSendPageClient({ profiles, hashtags }: KudosSendPageClientProps) {
  const router = useRouter();

  async function handleSubmit(input: SubmitKudosInput): Promise<SubmitKudosResult> {
    const result = await submitKudos(input);

    if (result.ok) {
      window.sessionStorage.setItem(KUDOS_SENT_FLAG_KEY, '1');
      router.push('/kudos');
    }

    return result;
  }

  return <KudosSendForm profiles={profiles} hashtags={hashtags} onSubmit={handleSubmit} />;
}
