'use client';

// FR-004, US003, BR-003, ALG-001 — message textarea (frame node I1612:5057;520:9876) + toolbar
// + hint/counter row (node I1612:5057;520:9887). Composes MessageToolbar (own file, <200
// lines) so this file stays focused on textarea state + the markdown-apply wiring.
//
// dom-contract.md:
// D6 — exactly ONE <textarea> on the page; placeholder begins the frozen D6 string; hard
//      maxLength=1000 (MESSAGE_MAX).
// D7 — counter text matches /\d+\/1[.,]?000/ -> render `${count}/${MESSAGE_COUNTER_MAX_LABEL}`.

import { useRef } from 'react';
import { applyMarkdown, MESSAGE_MAX, MESSAGE_COUNTER_MAX_LABEL, type MarkdownKind } from '@/lib/kudos/send/validation';
import { useI18n } from '@/lib/i18n/locale-provider';
import { FieldErrorText, fieldBorderClass } from './field-error-text';
import { MessageToolbar } from './message-toolbar';

interface MessageEditorProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function MessageEditor({ value, error, onChange, onBlur }: MessageEditorProps) {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleFormat(kind: MarkdownKind) {
    // ALG-001 lives in lib/kudos/send/markdown.ts (imported via validation.ts's re-export) —
    // this handler only reads the current selection and writes the result back.
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const result = applyMarkdown(kind, value, start, end);
    onChange(result.value.slice(0, MESSAGE_MAX));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  return (
    // mm:I1612:5057;520:9875
    <div className="flex w-full max-w-[672px] flex-col items-end gap-1">
      {/* mm:I1612:5057;520:9876 */}
      <div className={`flex w-full flex-col overflow-hidden rounded-lg border ${fieldBorderClass(Boolean(error))}`}>
        <MessageToolbar onFormat={handleFormat} />
        {/* mm:I1612:5057;520:9886 */}
        <textarea
          ref={textareaRef}
          value={value}
          maxLength={MESSAGE_MAX}
          placeholder={t('sendKudos.messagePlaceholder')}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          rows={5}
          className="min-h-[120px] w-full resize-none bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-muted-text placeholder:text-muted-text focus:outline-none"
        />
      </div>
      {/* mm:I1612:5057;520:9887 */}
      <div className="flex w-full items-center justify-between">
        {/* mm:I1612:5057;520:9888 */}
        <p className="text-base leading-6 font-bold tracking-[0.5px] text-background">{t('sendKudos.messageHint')}</p>
        {/* mm:I1612:5057;520:9889 — D7 */}
        <p className="text-base leading-6 font-bold tracking-[0.5px] text-muted-text">
          {value.length}/{MESSAGE_COUNTER_MAX_LABEL}
        </p>
      </div>
      {error && <FieldErrorText text={error} />}
    </div>
  );
}
