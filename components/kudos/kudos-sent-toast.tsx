'use client';

// E5 — the only user-visible confirmation of a successful kudos send (clarifications decision
// 1: the board is untouched, so nothing else on `/kudos` reflects the new row). Reads AND
// removes the flag on mount so a page refresh never re-shows the toast, and renders `null`
// when the flag is absent — this must not become a second permanent `role="status"` node on
// `/kudos` (the kudos-board suite already owns one via `KudosToast` in kudos-card-actions.tsx).

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/locale-provider';
import { KudosToast } from './kudos-toast';

/** Shared with `kudos-send-page-client.tsx` so the flag name has exactly one source. */
export const KUDOS_SENT_FLAG_KEY = 'saa.kudos-sent';

export function KudosSentToast() {
  const { t } = useI18n();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const flagWasSet = window.sessionStorage.getItem(KUDOS_SENT_FLAG_KEY) === '1';
    if (flagWasSet) {
      window.sessionStorage.removeItem(KUDOS_SENT_FLAG_KEY);
      // Reacting to a flag set by a prior navigation, not to a prop/state change — same
      // justified pattern as kudos-toast.tsx and locale-provider.tsx's own disable for this rule.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldShow(true);
    }
  }, []);

  return <KudosToast message={shouldShow ? t('sendKudos.successToast') : null} />;
}
