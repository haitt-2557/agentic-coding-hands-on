'use client';

// FR-002 / BR-001 / SM-001 — owns the click → loading → navigate-or-error round trip.
// `signInWithOAuth` is same-tab (the Supabase default; the only flow that survives a
// browser blocking popups — see clarifications.md design note 5). The button stays
// disabled with its loader from click until the browser navigates away to Google or a
// throw/`{ error }` puts it back down (BR-001/SM-001).
//
// BR-002 — the fixed error string renders whenever `?error` was present on load (a prior
// callback failure/cancellation) OR this click itself failed locally; the underlying
// message is never surfaced to the user, only the boolean.

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoginButton } from '@/components/login/login-button';
import { LoginErrorAlert } from '@/components/login/login-error-alert';

interface LoginClientProps {
  errored: boolean;
}

export function LoginClient({ errored }: LoginClientProps) {
  const [loading, setLoading] = useState(false);
  const [failedLocally, setFailedLocally] = useState(false);

  async function handleClick() {
    setLoading(true);
    setFailedLocally(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        setFailedLocally(true);
        setLoading(false);
      }
      // On success the browser is mid-navigation to Google's consent screen; leaving
      // `loading` true until then is correct, there is nothing left to reset it to.
    } catch {
      setFailedLocally(true);
      setLoading(false);
    }
  }

  return (
    <>
      <LoginButton loading={loading} onClick={handleClick} />
      {(errored || failedLocally) && <LoginErrorAlert />}
    </>
  );
}
