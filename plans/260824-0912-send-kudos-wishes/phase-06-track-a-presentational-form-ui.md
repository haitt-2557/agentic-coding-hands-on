---
track: A
test_policy: e2e-red-first
owner_agent: momorph-ui-implementer
mode: screen
status: pending
effort: 4h
depends_on: [03]
---

# Phase 06 — Track A: presentational form UI

**Goal:** build the `Gửi lời chúc Kudos` form as static presentational components, faithful to the frame and satisfying every locator rule in [dom-contract.md](dom-contract.md) D1–D16.

## MoMorph refs
- Gửi lời chúc Kudos: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/JsTvi8KVQA (node `1612:5056`) · behaviour source (26 specs, 57 TCs): https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 · hashtags: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/p9zO-c4a4x
- Clarifications: plans/260824-0912-send-kudos-wishes/clarifications.md · testPolicy: e2e-red-first · RED: `npm run test:e2e -- --project=send-kudos`, exit 1, 23 tests (`evidence/red-evidence.json`)

**Read first:** dom-contract.md (D1–D16 non-negotiable; **D10 and D11 break the obvious implementation**), clarifications.md, technical-spec.md FR-002…FR-012 / BR-002…BR-008 / SM-001 / DEC-001. Use Figma design content as mock data source. Do NOT invent data.

## Integration contract (frozen in phase-03 — import, never redeclare)
`components/kudos/send/kudos-send-form.tsx` exports `KudosSendForm(props: KudosSendFormProps)` from `lib/kudos/send/types.ts`: `{ profiles: ProfileOption[]; hashtags: HashtagOption[]; onSubmit: (input: SubmitKudosInput) => Promise<SubmitKudosResult> }`. It owns all form state plus DEC-001, calls `onSubmit`, and renders a returned `{ ok:false, error }` inline. It does **not** navigate, touch Supabase, or write `sessionStorage` — phase-08 owns that.

## File ownership (exclusive)
`components/kudos/send/**` — form shell, `recipient-field`, `title-field`, `message-editor`, `message-toolbar`, `hashtag-picker`, `image-attachments`, `anonymous-toggle`, `form-footer` (one file each, all <200 lines) — plus `lib/i18n/dictionaries/vi.ts` **and** `en.ts` (same owner: `en.ts` is key-typed off `vi.ts`, so adding a key to one alone fails typecheck). New copy goes under a `sendKudos.*` namespace, including the success-toast key phase-08 consumes.

## Out of scope
`app/kudos/send/page.tsx`, the two entry-point components and the `/kudos` toast mount (phase-08) · auth gate, queries, server action, migrations, seed (phases 01–05) · `e2e/**` and `playwright.config.ts` (phase-07, tester-owned — **never edit a test to make your markup pass**) · mention autocomplete, "Tiêu chuẩn cộng đồng" destination, markdown renderer, board rewiring.

## Done when
Typecheck, `npm run lint` and `npx next build` all clean (port 3200 runs a production build); every D-rule met; SC-003…SC-007 satisfiable by markup. You do **not** own browser evidence or the GREEN run — phase-09 does. Report `DONE` with the component list and any D-rule unsatisfiable without contradicting the frame.
</content>
