---
title: "Language dropdown — MoMorph design conformance"
description: "Bring LanguageSwitcher panel, rows, flags and trigger to the hUyaaugye2 design values, RED-first."
status: completed
priority: P2
effort: 2h30m
branch: main
tags: [ui, momorph, i18n, e2e]
created: 2026-08-26
work_type: feature
spec: docs/vi/features/F005_LanguageSwitching/
feature: F005
test_policy: e2e-red-first
---

# Language dropdown — design conformance (F005)

Presentation-only revision. Behaviour (open/close SM-001, `setLocale`, `localStorage` persist)
already ships and is already green — **no Track B phase exists in this plan.**

## MoMorph refs

- Dropdown-ngôn ngữ: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
- Design values (authoritative): [design/momorph-hUyaaugye2-node-values.md](design/momorph-hUyaaugye2-node-values.md)
- Clarifications: [clarifications.md](clarifications.md)
- Spec: [spec/language-switching/technical-spec.md](spec/language-switching/technical-spec.md)
- testPolicy: `e2e-red-first`

## Phases

| # | Phase | Owner | Status | Effort | Depends on |
|---|-------|-------|--------|--------|-----------|
| 01 | [RED e2e design contract](phase-01-red-e2e-design-contract.md) | `tester` | completed | 30m | — |
| 02 | [Presentational UI](phase-02-language-dropdown-presentational-ui.md) | `momorph-ui-implementer` | completed | 1h30m | 01 (valid RED) |
| 03 | [GREEN + visual validation](phase-03-green-and-visual-validation.md) | `tester` | completed | 30m | 02 |

Strictly sequential. No two phases own the same file.

## File ownership

| Phase | Owns |
|---|---|
| 01 | `e2e/homepage-language-dropdown.spec.ts` (new) |
| 02 | `public/saa/Flag_EN.svg` (new), `components/ui/language-switcher.tsx`, `components/ui/dropdown-menu.tsx`, `app/globals.css` |
| 03 | `plans/260826-0932-language-dropdown/evidence/` only — read-only on code |

## Requirements covered

FR-020 panel chrome · FR-021 row box · FR-022 flags VN+EN · FR-023 selected row bg ·
FR-024 hover · FR-025 label type · FR-026 trigger · BR-009 · BR-010. BR-006 unchanged.

## Hard constraints

- `DropdownMenu` gains ONE new optional prop `menuClassName`. With the prop absent the rendered
  class string must be byte-identical to today's. Account menu, notification bell and
  quick-action widget are NOT edited and NOT restyled.
- `role="menu"` and `role="menuitem"` stay — existing e2e selectors depend on them.
- Flag/chevron images keep `alt=""` + `aria-hidden` so accessible names stay `VN` / `EN`
  (`e2e/homepage-dropdown-menus.spec.ts` matches on those names).
- `Locale` stays `'vi' | 'en'` (BR-006).
- `lib/i18n/locale-provider.tsx` is OUT OF SCOPE — do not open it.
- Row-to-row gap is `0px` (confirmed from `get_node` coordinates, not inferred).
- Never guess a visual value. Every one is in the node-values file.

## Verification

`npm run test:e2e` (Playwright) · `npm run lint` · `npm run build` (typecheck).
`e2e/homepage-dropdown-menus.spec.ts` must stay green throughout.

## Rollback

01 delete the new spec · 02 revert the commit (additive optional prop + new asset, clean revert)
· 03 no code change.

## Known follow-up (NOT work in this plan)

1. **localStorage safety in `locale-provider.tsx`:** reads/writes `localStorage` without
   try/catch — throws in Safari private mode / storage-disabled contexts. User explicitly
   declined widening scope here. Log it; do not fix it in this plan.

2. **e2e coverage for sibling dropdowns:** the three sibling menus (account, notification,
   quick-action) have no design-conformance e2e tests. The reviewer flagged this as a Low
   finding. They are design-stable and out-of-scope for F005, so defer the coverage to a
   later pass if needed.
