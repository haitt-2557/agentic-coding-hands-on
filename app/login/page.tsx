// FR-004 — Server Component: an already-authenticated visitor is redirected to `/` before
// any render (getUser(), never getSession() — see lib/supabase/server.ts). Otherwise
// composes the frozen Track A shell around the Track B login-client island.
//
// BR-002 — `?error` on the URL (set by app/auth/callback/route.ts on failure/cancellation)
// is only ever used as a boolean gate for the fixed error string; its value is never
// rendered into the DOM.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginHeader } from '@/components/login/login-header';
import { LoginMain } from '@/components/login/login-main';
import { LoginIntro } from '@/components/login/login-intro';
import { LoginFooter } from '@/components/login/login-footer';
import { LoginClient } from './login-client';

interface LoginPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  const errored = Boolean((await searchParams).error);

  return (
    <>
      <LoginHeader />
      <LoginMain>
        <LoginIntro>
          <LoginClient errored={errored} />
        </LoginIntro>
      </LoginMain>
      <LoginFooter />
    </>
  );
}
