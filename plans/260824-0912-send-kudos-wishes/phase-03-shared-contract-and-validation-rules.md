# Phase 03 — Shared contract and validation rules

**Track:** B · **Owner agent:** `implementer` · **Priority:** P1 · **Status:** pending · **Effort:** 1h
**Depends on:** nothing (no DB access) · **Unblocks:** **04, 05, 06** — land this first, it is the seam

## Context Links

- [plan.md](plan.md) · [dom-contract.md](dom-contract.md) → D5, D6, D7, D13, D14, S5, C1
- [technical-spec.md](spec/send-kudos-wishes/technical-spec.md) → BR-002…BR-007, DEC-001, ALG-001, SM-001, SC-003, SC-008
- [clarifications.md](clarifications.md) decisions 5, 7

## Overview

The type + pure-logic module both tracks compile against. It touches no database and no React,
so it lands in minutes and unblocks Track A's typecheck immediately. **This is the whole reason
Track A and Track B can run concurrently** — the interface below is frozen here and neither
side may redefine it locally.

## Key Insights

- Track A (phase-06) must be able to typecheck before phases 04/05 exist. Types live here, not
  in the query or action modules.
- The Gửi-enabled rule (DEC-001) is one predicate over four fields, not four independent
  toggles. Put it in one function so the UI and the server action cannot disagree.
- Validation must be enforced **twice** — client for UX, server for safety (architecture.md §4:
  "validate client luôn vượt qua được bằng DevTools"). Sharing these pure functions is how the
  two stay identical (DRY).
- C1 forces a specific error-trigger contract: errors must be producible **on blur of a touched,
  empty required field**, not only on submit, because `Gửi` is disabled in exactly the state the
  validation specs try to submit from.
- Markdown wrapping (ALG-001) is pure string work on `(text, selectionStart, selectionEnd)` —
  keep it here, not inside a component, so it is unit-testable.

## Requirements

**Functional:** BR-002 (title ≤100, required), BR-003 (message ≤1000, required), BR-004 (hashtags 1–5), BR-005 (jpg/png, ≤5), BR-006 (nickname required iff anonymous), BR-007/DEC-001 (submit gate), ALG-001 (6 markdown transforms).
**Non-functional:** zero runtime deps; no React, no Supabase imports; every file <200 lines; unit tests colocated in the repo's existing `*.test.ts` style (`lib/kudos/*.test.ts` precedent).

## Architecture — the frozen integration contract

`lib/kudos/send/types.ts`:

```ts
export interface ProfileOption { id: string; displayName: string; department: string | null }
export interface HashtagOption { id: string }           // id IS the hashtag string, e.g. '#GO FAST'

export interface KudosDraft {
  recipientId: string | null;
  title: string;
  message: string;
  hashtagIds: string[];
  isAnonymous: boolean;
  nickname: string;
}

export type KudosFieldName = 'recipientId' | 'title' | 'message' | 'hashtagIds' | 'nickname';
export type KudosFieldErrors = Partial<Record<KudosFieldName, string>>;

export interface KudosSendFormProps {          // phase-06 renders this, phase-08 supplies it
  profiles: ProfileOption[];
  hashtags: HashtagOption[];
  onSubmit: (input: SubmitKudosInput) => Promise<SubmitKudosResult>;
}

export interface SubmitKudosInput {            // what the client sends; NOTE: no senderId
  recipientId: string; title: string; message: string;
  hashtagIds: string[]; isAnonymous: boolean; nickname: string | null;
  images: File[];
}

export type SubmitKudosResult =
  | { ok: true; kudosId: string }
  | { ok: false; error: string; field?: KudosFieldName };
```

`lib/kudos/send/validation.ts`:

```ts
export const TITLE_MAX = 100;
export const MESSAGE_MAX = 1000;
export const HASHTAG_MIN = 1;
export const HASHTAG_MAX = 5;
export const IMAGE_MAX = 5;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;              // assumption, unresolved #4
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;
export const REQUIRED_FIELD_ERROR = 'Không được để trống';    // D14 — exact copy
export const MESSAGE_COUNTER_MAX_LABEL = '1.000';             // D7 — dotted thousands

export function canSubmit(draft: KudosDraft): boolean;        // DEC-001, all four + nickname rule
export function validateDraft(draft: KudosDraft): KudosFieldErrors;
export function validateField(field: KudosFieldName, draft: KudosDraft): string | undefined;
export function isAcceptedImage(file: File): boolean;         // BR-005, type + byte cap
export function filterProfiles(profiles: ProfileOption[], query: string): ProfileOption[]; // S5
export function applyMarkdown(kind: MarkdownKind, text: string, start: number, end: number):
  { value: string; selectionStart: number; selectionEnd: number };                          // ALG-001
export type MarkdownKind = 'bold' | 'italic' | 'strike' | 'numberedList' | 'link' | 'quote';
```

Semantics that are not negotiable:

- `canSubmit` = `recipientId` non-null **and** trimmed `title` non-empty **and** trimmed
  `message` non-empty **and** `hashtagIds.length >= 1`, **and** if `isAnonymous` then trimmed
  `nickname` non-empty. (BR-006 makes nickname required when the box is checked, and
  `edge-cases.md` row 8 asserts submitting anonymous-without-nickname must not go through.)
- `validateField` returns `REQUIRED_FIELD_ERROR` for an empty required field — this is what the
  blur handler calls (C1).
- `filterProfiles` trims the query (ID-10), matches case-insensitively on `displayName` as a
  substring, and returns `[]` for an empty query.
- `applyMarkdown` wraps the selection; with an empty selection it inserts the marker pair at the
  caret. Mapping per ALG-001: `**x**`, `*x*`, `~~x~~`, `1. x`, `[x](url)`, `> x`.

## Related Code Files

**Create (owned exclusively):** `lib/kudos/send/types.ts`, `lib/kudos/send/validation.ts`, `lib/kudos/send/validation.test.ts`
**Read for context:** `lib/kudos/star-tiers.ts` + `star-tiers.test.ts` (module/test style), `lib/kudos/filters.ts`
**Do not touch:** anything else. Especially not `components/**` (phase-06) or `lib/kudos/send/queries.ts` / `submit-kudos.ts` (phases 04/05).

## Implementation Steps

1. Write `types.ts` exactly as above. No `senderId` anywhere in a client-facing type — that is the point (FR-014).
2. Write `validation.ts`: constants first, then the pure predicates. Keep it under 200 lines; if the markdown transforms push it over, split them into `lib/kudos/send/markdown.ts` (still this phase's file).
3. Write `validation.test.ts` covering: the 100/1000 caps, hashtag 1–5 bounds, nickname-required-iff-anonymous both ways, each rejected MIME type (`.pdf`/`.mp4`/`.txt`), the byte cap, query trimming (`'  Trang  '` finds `Lê Kiều Trang`), and all six markdown transforms with and without a selection.
4. `npx tsc --noEmit` and run the unit tests.

## Todo List

- [x] `types.ts` matches the contract above verbatim
- [x] `canSubmit` covers the nickname-when-anonymous case
- [x] `validateField` returns the exact string `Không được để trống`
- [x] `filterProfiles` trims and matches case-insensitively
- [x] All 6 markdown transforms implemented per ALG-001
- [x] Unit tests green; typecheck clean; every file <200 lines
- [x] No React / Supabase / Next import in either module

## Success Criteria

- `npx tsc --noEmit` clean and the new unit tests pass (SC-003, SC-004, SC-008 in unit form).
- `canSubmit` is false for every single-field-missing permutation and true only when all are present — asserted as a table test (DEC-001).
- Importing `lib/kudos/send/types.ts` from a client component compiles (no server-only imports leaked).
- Grep proves the string `Không được để trống` exists in exactly one place in `lib/` (DRY).

## Risk Assessment

| Risk | L×I | Countermeasure |
|------|-----|----------------|
| Track A defines its own local prop/validation types → two divergent contracts | **High** × High | This phase lands first and phase-06 is told to import, never redeclare; phase-08 typechecks the seam |
| `senderId` creeps into `SubmitKudosInput` "for convenience" | Med × **High** | Contract omits it by design; FR-014 and phase-01's RLS reject it anyway |
| Validation duplicated in the component and the action, then drifts | Med × High | Both import these functions; the grep success criterion catches a second copy of the error string |
| The file exceeds 200 lines | Med × Low | Pre-authorised split into `markdown.ts` |

## Security Considerations

- No `senderId` on the client boundary — identity is a server concern only (permissions.md §2).
- Client validation here is UX only; phase-05 re-runs `validateDraft` and `isAcceptedImage`
  server-side. Never treat a passing client check as authorisation.
- Message is stored as plain markdown text; no HTML is generated, so there is no sanitisation
  surface (clarifications decision 5). Do not add a renderer.

## Next Steps

Announce completion to phases 04, 05 and 06 immediately — all three are blocked on this module's
existence, and phase-06 is the long pole.
</content>
