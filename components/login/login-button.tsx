'use client';

// Login button (mms_B.3_Login / Button-IC About, node 662:14425 / 662:14426) —
// pale-yellow CTA, label then Google mark. Controlled: Track B owns the click
// handler and the Supabase auth call; this component never imports
// `@/lib/supabase/*` (plan.md § Integration contract). `aria-busy` plus the visible
// spinner are the loading hooks the E2E asserts (test case 37eae882).
// mm:662:14425
// mm:662:14426
// mm:I662:14426;186:1568
// mm:I662:14426;186:1766

import Image from 'next/image';
import { useI18n } from '@/lib/i18n/locale-provider';

interface LoginButtonProps {
  loading: boolean;
  onClick: () => void;
}

export function LoginButton({ loading, onClick }: LoginButtonProps) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      className="saa-glow flex w-[305px] items-center justify-center gap-2 rounded-lg bg-accent px-6 py-4 text-[22px] font-bold leading-7 text-accent-foreground hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {t('login.button')}
      {loading ? (
        <span
          aria-hidden="true"
          className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground"
        />
      ) : (
        <Image src="/saa/Google_Mark.svg" alt="" width={24} height={24} aria-hidden="true" />
      )}
    </button>
  );
}
