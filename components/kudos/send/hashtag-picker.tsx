'use client';

// FR-007, US005, BR-004 — Hashtag chips + dropdown (frame nodes I1612:5057;520:9890 label,
// 662:8595 chip row, 662:8910 "+ Hashtag" button). 8 fixed seeded values (S1, p9zO-c4a4x),
// toggled by check-icon rows, never free text (clarifications.md design defect #6/#10).
//
// dom-contract.md D3/D4 — 8 role="option" rows inside a listbox; at 5 selected every
// unselected row carries `disabled`. The frame shows the list CLOSED (chips + button only, no
// options visible) and spec row E says "Click '+ Hashtag': mở dropdown để thêm" — the
// clarifications second-pass session settled this AGAINST an always-open inline list (a
// standing tension with the D3 table wording, resolved there in favor of the frame + spec E
// reading): the dropdown opens on the "+ Hashtag" button click, closed by default.

import { useEffect, useRef, useState } from 'react';
import { HASHTAG_MAX } from '@/lib/kudos/send/validation';
import type { HashtagOption } from '@/lib/kudos/send/types';
import { useI18n } from '@/lib/i18n/locale-provider';
import { FieldErrorText } from './field-error-text';

interface HashtagPickerProps {
  hashtags: HashtagOption[];
  selectedIds: string[];
  error?: string;
  onToggle: (hashtagId: string) => void;
  onBlur: () => void;
}

export function HashtagPicker({ hashtags, selectedIds, error, onToggle, onBlur }: HashtagPickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        onBlur();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const atMax = selectedIds.length >= HASHTAG_MAX;

  return (
    // mm:I1612:5057;520:9890
    <div ref={rootRef} className="flex w-full max-w-[672px] items-start gap-4">
      {/* mm:I1612:5057;520:9891 */}
      <label className="flex items-center gap-0.5 pt-1 text-[22px] leading-7 font-bold whitespace-nowrap text-background">
        {t('sendKudos.hashtagLabel')}
        <span className="text-badge-danger">*</span>
      </label>
      <div className="relative flex flex-1 flex-col gap-2">
        {/* mm:I1612:5057;662:8595 */}
        <div className={`flex flex-wrap items-center gap-2 rounded-lg ${error ? 'border border-badge-danger p-2' : ''}`}>
          {selectedIds.map((id) => (
            // mm:I1612:5057;662:8631 (chip)
            <span
              key={id}
              className="flex items-center gap-2 rounded-lg border border-border-accent bg-white py-2 pr-2 pl-4 text-base leading-6 font-bold text-background"
            >
              {id}
              <button
                type="button"
                aria-label={`${t('sendKudos.hashtagRemoveLabel')}: ${id}`}
                onClick={() => onToggle(id)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-badge-danger"
              >
                ×
              </button>
            </span>
          ))}
          {/* mm:I1612:5057;662:8910 */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-border-accent bg-white px-2 py-1 text-[11px] leading-4 font-bold tracking-[0.5px] text-muted-text"
          >
            <span>{t('sendKudos.hashtagAddButton')}</span>
            <span>{t('sendKudos.hashtagMaxHint')}</span>
          </button>
        </div>
        {open && (
          // mm:p9zO-c4a4x — hashtag dropdown frame
          <div role="listbox" aria-label={t('sendKudos.hashtagLabel')} className="flex flex-col gap-1 rounded-lg border border-border-accent bg-white p-2">
            {hashtags.map((hashtag) => {
              const selected = selectedIds.includes(hashtag.id);
              const disabled = !selected && atMax;
              return (
                <button
                  key={hashtag.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  onClick={() => onToggle(hashtag.id)}
                  className="flex items-center justify-between rounded px-3 py-2 text-left text-sm font-bold text-background hover:bg-kudos-message-tint disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <span>{hashtag.id}</span>
                  {selected && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        )}
        {error && <FieldErrorText text={error} />}
      </div>
    </div>
  );
}
