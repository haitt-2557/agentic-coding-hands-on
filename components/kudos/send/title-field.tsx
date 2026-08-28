'use client';

// FR-003, US003, BR-002 — Danh hiệu (frame node I662:9637;1688:10448, label beside input on
// one row, helper text below the input). No spec row anywhere defines this field
// (clarifications.md design defect #1 / decision 6) — required free text, max 100 chars, copy
// verbatim from the frame.
//
// dom-contract.md D5 — exactly ONE input[placeholder*="Dành tặng một danh hiệu"], maxLength=100.

import { useId } from 'react';
import { TITLE_MAX } from '@/lib/kudos/send/validation';
import { useI18n } from '@/lib/i18n/locale-provider';
import { FieldErrorText, fieldBorderClass } from './field-error-text';

interface TitleFieldProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function TitleField({ value, error, onChange, onBlur }: TitleFieldProps) {
  const { t } = useI18n();
  const inputId = useId();

  return (
    // mm:I662:9637;1688:10448
    <div className="flex w-full max-w-[672px] items-center gap-4">
      {/* mm:I662:9637;1688:10436 */}
      <label
        htmlFor={inputId}
        className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[22px] leading-7 font-bold text-background"
      >
        {t('sendKudos.titleLabel')}
        <span className="text-badge-danger">*</span>
      </label>
      <div className="flex flex-1 flex-col gap-2">
        {/* mm:I662:9637;1688:10437 */}
        <input
          id={inputId}
          type="text"
          value={value}
          maxLength={TITLE_MAX}
          placeholder={t('sendKudos.titlePlaceholder')}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={`h-14 w-full max-w-[514px] rounded-lg border bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-background placeholder:text-muted-text focus:outline-none ${fieldBorderClass(Boolean(error))}`}
        />
        {/* mm:I662:9637;1688:10447 */}
        <p className="max-w-[418px] text-base leading-6 font-bold tracking-[0.15px] text-muted-text">
          {t('sendKudos.titleHelperExample')}
          <br />
          {t('sendKudos.titleHelperUsage')}
        </p>
        {error && <FieldErrorText text={error} />}
      </div>
    </div>
  );
}
