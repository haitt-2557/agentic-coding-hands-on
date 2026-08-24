// Phase 03 — shared pure validation contract for `/kudos/send` (dom-contract.md D5-D14, C1;
// technical-spec.md BR-002..BR-007, DEC-001, SC-003, SC-008). No React, no Supabase: both the
// client form (phase-06) and the server action (phase-05) import these functions so the two
// enforcement points can never drift apart (architecture.md §4 — client validation is always
// defeatable via DevTools, so the server MUST re-run the same checks, not reimplement them).

import type { KudosDraft, KudosFieldErrors, KudosFieldName, ProfileOption } from './types';

export { applyMarkdown, type MarkdownKind } from './markdown';

export const TITLE_MAX = 100;
export const MESSAGE_MAX = 1000;
export const HASHTAG_MIN = 1;
export const HASHTAG_MAX = 5;
export const IMAGE_MAX = 5;
// Unresolved #4 — no byte cap is specified by any spec/test case; 5 MiB is an implementation
// assumption recorded in clarifications.md ("Assumptions made explicit for the unresolved items").
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;
// D14 — exact copy asserted by validation.spec.ts:34/74/113/148. Grep-verified to exist in
// exactly one place in lib/ (this file) per phase-03's Success Criteria.
export const REQUIRED_FIELD_ERROR = 'Không được để trống';
// D7 — dotted-thousands counter label, e.g. `0/1.000`.
export const MESSAGE_COUNTER_MAX_LABEL = '1.000';

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * DEC-001 — one predicate over all four gating fields (plus the nickname-when-anonymous
 * addition from BR-006), never four independent toggles. The UI's `Gửi` button and the
 * server action's guard both call this so they cannot disagree.
 */
export function canSubmit(draft: KudosDraft): boolean {
  const hasRecipient = draft.recipientId !== null && isNonEmpty(draft.recipientId);
  const hasTitle = isNonEmpty(draft.title);
  const hasMessage = isNonEmpty(draft.message);
  const hasHashtag = draft.hashtagIds.length >= HASHTAG_MIN;
  const nicknameOk = !draft.isAnonymous || isNonEmpty(draft.nickname);

  return hasRecipient && hasTitle && hasMessage && hasHashtag && nicknameOk;
}

/**
 * C1 — called on blur of a touched field (and again on submit) so validation can fire even
 * though `Gửi` stays disabled while a required field is empty. Returns `undefined` when the
 * field is currently valid.
 */
export function validateField(field: KudosFieldName, draft: KudosDraft): string | undefined {
  switch (field) {
    case 'recipientId':
      return draft.recipientId !== null && isNonEmpty(draft.recipientId)
        ? undefined
        : REQUIRED_FIELD_ERROR;

    case 'title':
      if (!isNonEmpty(draft.title)) return REQUIRED_FIELD_ERROR;
      if (draft.title.length > TITLE_MAX) return `Tối đa ${TITLE_MAX} ký tự`;
      return undefined;

    case 'message':
      if (!isNonEmpty(draft.message)) return REQUIRED_FIELD_ERROR;
      if (draft.message.length > MESSAGE_MAX) return `Tối đa ${MESSAGE_COUNTER_MAX_LABEL} ký tự`;
      return undefined;

    case 'hashtagIds':
      if (draft.hashtagIds.length < HASHTAG_MIN) return REQUIRED_FIELD_ERROR;
      if (draft.hashtagIds.length > HASHTAG_MAX) return `Tối đa ${HASHTAG_MAX} hashtag`;
      return undefined;

    case 'nickname':
      return draft.isAnonymous && !isNonEmpty(draft.nickname) ? REQUIRED_FIELD_ERROR : undefined;
  }
}

const ALL_FIELDS: KudosFieldName[] = [
  'recipientId',
  'title',
  'message',
  'hashtagIds',
  'nickname',
];

/** Runs `validateField` over every field, collecting only the ones that actually fail. */
export function validateDraft(draft: KudosDraft): KudosFieldErrors {
  const errors: KudosFieldErrors = {};

  for (const field of ALL_FIELDS) {
    const error = validateField(field, draft);
    if (error) errors[field] = error;
  }

  return errors;
}

/** BR-005 — type allow-list plus the byte cap. Server-side re-check; a passing client check
 * (or a missing one, via DevTools) authorises nothing. */
export function isAcceptedImage(file: File): boolean {
  return (
    (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type) &&
    file.size <= IMAGE_MAX_BYTES
  );
}

/** S5 / ID-10 — trims the query first; an empty (or all-whitespace) query yields no options
 * rather than the full list, matching the closed-by-default autocomplete. */
export function filterProfiles(profiles: ProfileOption[], query: string): ProfileOption[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const needle = trimmed.toLowerCase();
  return profiles.filter((profile) => profile.displayName.toLowerCase().includes(needle));
}
