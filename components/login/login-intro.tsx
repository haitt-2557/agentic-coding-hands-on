'use client';

// Login intro (Frame 550 / mms_B.2_content, node 662:14755 / 662:14753) — subtitle +
// tagline copy; `children` is the action slot (button + error alert), composed by
// Track B (`app/login/login-client.tsx`).
// mm:662:14755
// mm:662:14753

import type { ReactNode } from 'react';
import { useI18n } from '@/lib/i18n/locale-provider';

export function LoginIntro({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="flex w-full max-w-[496px] flex-col gap-6 pl-4">
      <p className="text-xl font-bold leading-10 tracking-[0.5px] text-white">
        {t('login.subtitle')}
        <br />
        {t('login.tagline')}
      </p>
      <div className="flex flex-col items-start gap-4">{children}</div>
    </div>
  );
}
