'use client';

// FR-010/FR-011/FR-012, US008, BR-007/BR-008, DEC-001 — footer buttons (frame node
// I1612:5057;520:9905: "Hủy" node 520:9906, "Gửi" node 520:9907 bg #FFEA9E / accent).
//
// dom-contract.md D13 — exactly ONE button matching /Gửi/i and exactly ONE matching /Hủy/i;
// Gửi disabled until DEC-001's four fields are filled; Hủy always enabled.

import { useI18n } from '@/lib/i18n/locale-provider';

interface FormFooterProps {
  canSubmit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function FormFooter({ canSubmit, isSubmitting, onCancel, onSubmit }: FormFooterProps) {
  const { t } = useI18n();

  return (
    // mm:I1612:5057;520:9905
    <div className="flex w-full max-w-[672px] items-start gap-6">
      {/* mm:I1612:5057;520:9906 — `text-white` was correct while this button sat directly on
          the dark page background; now that the whole form is a cream card (kudos-send-form.tsx),
          `bg-secondary-button-bg`'s 10%-opacity fill reads as near-white, so white text on it is
          the same contrast defect the labels had, just on this button. `text-background` matches
          every other dark-on-cream label/value already rendered inside this same card. */}
      <button
        type="button"
        onClick={onCancel}
        className="self-stretch rounded border border-border-accent bg-secondary-button-bg px-10 py-4 text-base leading-6 font-bold tracking-[0.15px] text-background"
      >
        {t('sendKudos.cancelButton')}
      </button>
      {/* mm:I1612:5057;520:9907 */}
      <button
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        className="flex h-[60px] flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-4 text-base leading-6 font-bold tracking-[0.15px] text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('sendKudos.submitButton')}
      </button>
    </div>
  );
}
