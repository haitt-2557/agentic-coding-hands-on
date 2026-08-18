# Implementer Report — Phase 3, Track B (Logic Layer)

**Status:** DONE_WITH_CONCERNS (see Concerns — two scoped content decisions, not defects)

## Files Touched

- `lib/countdown.ts` (+61) — ALG-001, pure, RED-first
- `lib/countdown.test.ts` (+100) — 10 tests, ID-12/40/41/42/43/56/57/60
- `lib/awards.ts` (+74) — FR-013/014, BR-005, RED-first
- `lib/awards.test.ts` (+54) — 6 tests, ID-47..52/62
- `lib/session/session-provider.tsx` (+81) — `useSession()`, mock, SSR-safe
- `lib/i18n/locale-provider.tsx` (+79) — `useI18n()`, SSR-safe
- `lib/i18n/dictionaries/vi.ts` (+40) — canonical key set
- `lib/i18n/dictionaries/en.ts` (+34) — `Record<DictionaryKey,string>`, compile-checked
- `.env.example` (+14) — all three `NEXT_PUBLIC_*` vars, commented
- `plans/260818-0936-homepage-saa/phase-03-track-b-logic-layer.md` — Todo List checked off

No file outside `lib/**` / `.env.example` was touched. `next.config.ts` left untouched (no asset request from Track A yet).

## Checks

- Typecheck: clean for all owned files. `npx tsc --noEmit` shows exactly one pre-existing error, `e2e/homepage.spec.ts(60,25): Property 'getByContentEditable' does not exist on type 'Page'` — that file is Phase 1/4 (tester) territory, not touched by me.
- Lint (`npm run lint`): zero errors/warnings in `lib/**` (verified both via the full project run and `npx eslint lib/` standalone). The project-wide run reports ~731 pre-existing errors, all in `.claude/**` tooling scripts unrelated to this task.
- Unit tests (`npm run test:unit`): **16 passed, 0 failed.**
  - `countdown.test.ts`: 10/10 — pad-to-2, month-boundary days/hours/minutes split, expiry at/after target, not-expired one ms before, invalid on undefined/empty/garbage, never-throws.
  - `awards.test.ts`: 6/6 — six entries, exact slug order, unique slugs, non-empty fields, `awardHref` with/without slug.
  - Both were RED before their implementation existed (`Cannot find module` — confirmed before writing `countdown.ts`/`awards.ts`).

## Acceptance Criteria (phase-03 Success Criteria)

- [x] `npm run test:unit` exits 0 with real assertions; RED-before-GREEN confirmed for both.
- [x] Countdown: ID-12, ID-39 (interval cadence is the caller's concern — `computeCountdown` itself needs no timer; verified via the month-boundary/tick-equivalent test), ID-40, ID-41, ID-42, ID-43, ID-56, ID-57, ID-60.
- [x] Awards data + navigation logic: ID-47, ID-48, ID-49, ID-50, ID-52, ID-62 (all via `awardHref` + exact slug list; component wiring is Track A's job).
- [x] i18n: ID-25, ID-26, ID-58 (`setLocale` persists to `localStorage`; `Locale` type admits only `'vi'|'en'`, so a third option cannot compile in).
- [x] Session/role gating source: ID-0, ID-1, ID-5, ID-6, ID-11, ID-28, ID-29, ID-36, ID-37, ID-38 (all downstream of `useSession()`'s `role`/`unreadCount`; rendering the actual gated UI is Track A's job).
- [x] Not built: ID-14 (stale, per clarifications — correctly not reproduced; event info uses the frame's values).
- [x] No console error/hydration warning attributable to `lib/**`: both providers render the SSR default (`guest`/`vi`) and reconcile from `localStorage` only inside `useEffect`, never during render.
- [x] Zero new runtime dependencies (package.json untouched, not owned by this phase anyway).

## Concerns (read before Phase 4/5)

1. **Award descriptions/titles were read from the design frame image, not MCP.** I have no MoMorph MCP tools in this session, so I opened `plans/260818-0936-homepage-saa/design/homepage-saa-full.png` directly (already downloaded during the clarification gate) and transcribed the six award titles/descriptions from it. Titles are unambiguous. **Descriptions have a real content gap in the source design itself**: Best Manager, Signature 2025 - Creator, and MVP all show the *identical* placeholder description text ("Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm") in the frame — this is reproduced verbatim per "frame wins on copy," not invented, but it means three of six cards read the same on the homepage today. Recommend flagging to the design owner alongside the four design defects already logged in `clarifications.md`.
2. **`image` path convention chosen, not confirmed with Track A**: `AWARDS[i].image` is `/images/awards/<slug>.png`, matching Next's `public/images/awards/...` convention. I do not own `public/**` and cannot fetch the real MoMorph thumbnails. Track A should either match this path or the two of us reconcile at Phase 4 wiring — flagging now rather than guessing wrong and silently breaking `<Image>` at integration.
3. **i18n dictionary scope is UI chrome, not full-page prose.** `lib/i18n/dictionaries/{vi,en}.ts` covers header/nav, hero/countdown labels, CTAs, section headings/captions, footer, notification panel, account menu, and the quick-action widget — all short, exactly-known strings. It deliberately does **not** include the long-form Root Further body paragraphs or the Kudos promo body paragraph. Those are static prose in Track A-owned components (`components/home/root-further-content.tsx`, `components/home/kudos-section.tsx` per the file-ownership table) and transcribing multi-paragraph copy from a downsampled screenshot carries real risk of subtle wording/diacritic errors I can't cross-check against any structured spec text (no such rows exist in the fetched spec/test-case data). If full bilingual coverage of that prose is required, whoever has MCP access to the authoritative text should add it to the dictionary — the `t(key: string): string` contract is unchanged and additive, so this doesn't block Track A's wiring today.
4. **`.env.example` is currently un-trackable by git — needs a `.gitignore` owner fix.** The repo's `.gitignore` (owned by Phase 1/4, not me) has a blanket `.env*` pattern that also matches `.env.example` (`git check-ignore -v .env.example` confirms it). The file exists on disk with the required content, but `git status` does not list it as untracked — it's silently excluded. `.env.example` is a template with placeholder values only (no secrets) and must ship with the branch; it needs `!.env.example` (or equivalent) added to `.gitignore` by whoever owns that file. I have not touched `.gitignore` myself since it's outside this phase's file ownership.
5. **`react-hooks/set-state-in-effect` (a strict react-hooks/react-compiler lint rule, v7.1.1) flags both providers' hydration-reconcile `useEffect`.** This is the exact SSR-default → client-reconcile pattern the phase mandates to avoid a hydration mismatch; the "fix" the rule implies (a lazy `useState` initializer) would read `localStorage` during the hydration render itself and reintroduce the mismatch it's meant to prevent. I added a scoped `eslint-disable-next-line` with a comment explaining why, in both `session-provider.tsx` and `locale-provider.tsx`. `npm run lint` is clean.

## Unresolved Questions

None blocking. Items 1–3 above are handoff notes for Phase 4/5, not gaps that stop Track A's wiring — `useSession()`, `useI18n()`, `AWARDS`, and `computeCountdown()` all export exactly the frozen signatures and are ready to consume now.
