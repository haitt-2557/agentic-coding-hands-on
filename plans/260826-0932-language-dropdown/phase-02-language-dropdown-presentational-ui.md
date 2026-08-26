---
phase: 02
title: "Track A — language dropdown presentational UI"
feature: F005
owner: momorph-ui-implementer
status: completed
effort: 1h30m
priority: P2
test_policy: e2e-red-first
depends_on: [01]
owns:
  - public/saa/Flag_EN.svg
  - components/ui/language-switcher.tsx
  - components/ui/dropdown-menu.tsx
  - app/globals.css
---

# Phase 02 — presentational UI

## Context
- Screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
- Values (authoritative, never guess): `design/momorph-hUyaaugye2-node-values.md`
- `clarifications.md` · testPolicy `e2e-red-first` · phase-01 RED evidence is read-only input

## Goal
FR-020..FR-026, BR-009, BR-010 rendered. No behaviour change.

## Out of scope
`lib/i18n/locale-provider.tsx`; `account-menu.tsx`, `notification-bell.tsx`,
`quick-action-widget.tsx`; the `Locale` union; anything under `e2e/`.

## Steps
1. `app/globals.css` — add `--language-row-selected-bg: rgba(255, 234, 158, 0.2);` to `:root`
   and `--color-language-row-selected-bg` to `@theme inline`, beside the existing tokens.
   Hover reuses the shipped `--secondary-button-bg` (`rgba(255,234,158,0.1)`).
2. `components/ui/dropdown-menu.tsx` — add optional `menuClassName?: string` to
   `DropdownMenuProps`. Substitute it for the chrome segment ONLY:
   `const menuChrome = menuClassName ?? 'mt-2 min-w-[10rem] rounded-md border border-border-accent bg-header-bg py-1 saa-glow';`
   then `className={`absolute z-50 ${menuChrome} ${align === 'right' ? 'right-0' : 'left-0'}`}`.
   With the prop absent this yields the current string byte-for-byte. `role="menu"` unchanged.
3. `public/saa/Flag_EN.svg` — hand-author 20×15 Union Flag: same `width/height/viewBox`
   (`0 0 20 15`) and `xmlns` as `Flag_VN.svg`, palette family blue `#2E42A5`, white `#F7FCFF`,
   red `#E31D1C` (VN's red reused — do not invent a new hue). No clip-path id collision.
4. `components/ui/language-switcher.tsx` —
   - `options`: give `en` the flag `/saa/Flag_EN.svg` (drop `flag: undefined`).
   - Pass `menuClassName="w-fit rounded-[8px] border border-border-accent bg-kudos-sidebar-bg p-[6px] mt-2"`
     (`--kudos-sidebar-bg` is already `#00070c` — reuse, do not add a duplicate token).
   - Row: `h-14 w-[110px] rounded-[2px] flex items-center justify-center gap-1`, label
     `text-base font-bold leading-6 tracking-[0.15px] text-white text-center`, flag in a
     `size-6` slot at `w-5 h-[15px]`. Selected → `bg-language-row-selected-bg`; hover →
     `hover:bg-secondary-button-bg`. Keep `role="menuitem"`, `aria-current`, `onClick`.
   - Rows sit flush: panel is `flex flex-col` with NO gap (0px, confirmed).
   - Trigger: same flag/label pairing, keep the chevron and its rotate-on-open.
   - Every image keeps `alt="" aria-hidden="true"` — accessible names must stay `VN`/`EN`.
5. Run `npm run build` then `npm run lint`.

## Todo
- [x] Token added, no duplicate colour token · `menuClassName` optional, default string unchanged
- [x] `Flag_EN.svg` authored 20×15, viewBox matches VN
- [x] Rows + trigger match FR-021/022/023/025/026 · `build` and `lint` clean

## Success criteria
Build + lint green; three sibling dropdowns visually unchanged; nothing outside `owns` touched.

## Risks
- **Shared-primitive regression (Low/High).** Substitution, not concatenation — diff the default
  class string against line 106 of the original `dropdown-menu.tsx` before committing.
- **Tailwind width conflict (Med/Med).** `min-w-[10rem]` would fight the 110px rows; it is gone
  on the language path because `menuClassName` replaces the chrome outright.
- **Accessible-name drift (Med/High).** A non-empty `alt` renames the menuitem and reddens
  `homepage-dropdown-menus.spec.ts`. `alt=""` is mandatory.

## Rollback
`git revert` the commit. The prop is additive and optional; the asset is new. Clean revert.
