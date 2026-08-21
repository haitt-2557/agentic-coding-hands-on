'use client';

// mms_B.2.3/B.3/B.4.4/C/C.4/C.4.2 — the toast raised by Copy Link (BR-007, TC 0adfd7ce).
// Mounted by kudos-card-actions.tsx, one instance per card (see that file's header for why the
// toast is card-local rather than lifted to a page-level shell — the same "nothing is lifted"
// reasoning the phase file already applies to heart state). Owns its own auto-hide timing so it
// can disappear without an onDismiss callback back up the tree. This is role="status", never
// role="tooltip" — dom-contract.md F32 only constrains the latter.

import { useEffect, useState } from 'react';

const AUTO_HIDE_MS = 3000;

interface KudosToastProps {
  message: string | null;
}

export function KudosToast({ message }: KudosToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    // Synchronizing visibility with an incoming message change — same justified pattern as
    // session-provider.tsx's own eslint-disable for this rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-accent bg-kudos-card-ground px-6 py-4 text-base leading-6 font-bold text-background shadow-lg"
    >
      {message}
    </div>
  );
}
