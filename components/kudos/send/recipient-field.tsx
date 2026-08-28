'use client';

// FR-002, US002 — Người nhận autocomplete (frame node I662:9637;520:9871, row layout: label
// beside control, gap 16px, alignItems center; control I662:9637;520:9873 flex:1 0 0, border
// #998C5F / border-accent, radius 8px, placeholder "Tìm kiếm" per spec B.2 — the frame image's
// filled value is treated as the filled state of the same control, not a second placeholder,
// per clarifications.md design defect #2).
//
// dom-contract.md:
// D1  — exactly one input whose placeholder contains "Tìm kiếm" on this page.
// D2  — options are role="option" inside role="listbox", present only while filtering
//       (non-empty query), closes on selection.
// D15 — <label> containing "Người nhận" must be visible.
// S5  — filterProfiles() already trims + matches case-insensitively; do not re-implement here.
//
// Selection model: this field owns its own text `query` separately from `recipientId` (the
// draft only stores the id, never free text — FR-014 keeps identity server-derived). Typing
// away from a confirmed selection clears the id; only picking a listbox row sets it again.

import Image from 'next/image';
import { useEffect, useId, useState } from 'react';
import { filterProfiles } from '@/lib/kudos/send/validation';
import type { ProfileOption } from '@/lib/kudos/send/types';
import { useI18n } from '@/lib/i18n/locale-provider';
import { FieldErrorText, fieldBorderClass } from './field-error-text';

interface RecipientFieldProps {
  profiles: ProfileOption[];
  recipientId: string | null;
  error?: string;
  onSelect: (recipientId: string | null) => void;
  onBlur: () => void;
}

export function RecipientField({ profiles, recipientId, error, onSelect, onBlur }: RecipientFieldProps) {
  const { t } = useI18n();
  const inputId = useId();
  const [query, setQuery] = useState(() => profiles.find((p) => p.id === recipientId)?.displayName ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Synchronizing the local text query with an externally-driven reset (e.g. "Hủy" clearing
    // the whole draft) — the query has no other way to learn the id was cleared from outside.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (recipientId === null) setQuery('');
  }, [recipientId]);

  const filtered = filterProfiles(profiles, query);
  const isFiltering = query.trim().length > 0;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setQuery(next);
    setOpen(true);
    if (recipientId !== null) onSelect(null);
  }

  function handleSelect(profile: ProfileOption) {
    setQuery(profile.displayName);
    onSelect(profile.id);
    setOpen(false);
  }

  function handleInputBlur() {
    // Deferred close: an option's onMouseDown already prevents this blur from firing before
    // its onClick runs, so this only fires for a genuine click-away or Tab.
    window.setTimeout(() => setOpen(false), 0);
    onBlur();
  }

  return (
    // mm:I662:9637;520:9871
    <div className="flex w-full max-w-[672px] items-center gap-4">
      {/* mm:I662:9637;520:9872 */}
      <label
        htmlFor={inputId}
        className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[22px] leading-7 font-bold text-background"
      >
        {t('sendKudos.recipientLabel')}
        <span className="text-badge-danger">*</span>
      </label>
      <div className="flex flex-1 flex-col gap-2">
        <div
          className={`relative flex h-14 w-full items-center justify-between gap-2 rounded-lg border bg-white px-6 py-4 ${fieldBorderClass(Boolean(error))}`}
        >
          {/* mm:I662:9637;520:9873 */}
          <input
            id={inputId}
            type="text"
            autoComplete="off"
            value={query}
            placeholder={t('sendKudos.recipientPlaceholder')}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onBlur={handleInputBlur}
            className="w-full bg-transparent text-base leading-6 font-bold tracking-[0.15px] text-background placeholder:text-muted-text focus:outline-none"
          />
          {/* mm:I662:9637;520:9873;186:1862 */}
          <Image src="/saa/Down.svg" alt="" width={24} height={24} aria-hidden="true" className={open ? 'rotate-180' : undefined} />
          {open && isFiltering && (
            // mm:QIMJNgFb8K (dropdown frame, no dedicated spec — behaviour from ihQ26W78P2 row B)
            <div
              role="listbox"
              aria-label={t('sendKudos.recipientLabel')}
              className="absolute top-[calc(100%+8px)] left-0 z-20 max-h-60 w-full overflow-auto rounded-lg border border-border-accent bg-white py-1 shadow-lg"
            >
              {filtered.length === 0 ? (
                <p className="px-4 py-2 text-sm text-muted-text">{t('sendKudos.recipientNoResults')}</p>
              ) : (
                filtered.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    role="option"
                    aria-selected={profile.id === recipientId}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(profile)}
                    className="block w-full px-4 py-2 text-left text-sm font-bold text-background hover:bg-kudos-message-tint"
                  >
                    {profile.displayName}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {error && <FieldErrorText text={error} />}
      </div>
    </div>
  );
}
