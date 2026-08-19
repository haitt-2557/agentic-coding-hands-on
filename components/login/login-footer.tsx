'use client';

// Login Footer (mms_D_Footer) — centred copyright line alone; no logo or nav links
// (clarifications.md — Orchestrator Assumptions). Reuses the existing
// `footer.copyright` key verbatim, matching the site footer string exactly.
// mm:662:14447

import { useI18n } from '@/lib/i18n/locale-provider';

export function LoginFooter() {
  const { t } = useI18n();

  return (
    <footer className="flex w-full items-center justify-center border-t border-divider px-6 py-10 sm:px-16 lg:px-[90px]">
      <p className="text-center text-sm font-bold text-white">{t('footer.copyright')}</p>
    </footer>
  );
}
