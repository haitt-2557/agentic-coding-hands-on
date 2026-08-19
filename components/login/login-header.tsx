// Login Header (mms_A_Header) — logo (no link/button ancestor, per the accessible-name
// freeze) + the shared language selector only. The login frame does not carry the
// site's nav links or account menu (clarifications.md — Orchestrator Assumptions:
// "Login has its own header and footer, not the site chrome").
// mm:662:14391
// mm:I662:14391;178:1033;178:1030

import Image from 'next/image';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export function LoginHeader() {
  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-between gap-6 bg-[rgba(11,15,18,0.8)] px-6 py-3 lg:px-36">
      <Image
        src="/saa/Logo.png"
        alt="Sun* Annual Awards 2025"
        width={52}
        height={48}
        className="h-12 w-[52px] shrink-0 object-contain"
      />
      <LanguageSwitcher />
    </header>
  );
}
