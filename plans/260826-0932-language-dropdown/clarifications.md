# Clarifications — Language dropdown (MoMorph `hUyaaugye2`)

## MoMorph refs

- Dropdown-ngôn ngữ: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
- Design values (authoritative, from `get_node`): `design/momorph-hUyaaugye2-node-values.md`
- Specs CSV: `design/momorph-hUyaaugye2-specs.csv`
- Test cases: **none** — `download_test_cases` returned `status: empty` (0 rows)
- testPolicy: `e2e-red-first`

## Session 2026-08-26

### Resolved with the user

- Q: The EN row needs the Union Flag (node `GB-NIR - Northern Ireland`, 20×15). MoMorph reports 0 media nodes (the flag is a vector GROUP, not an exported asset) and `get_figma_image` returned HTTP 500. How should the asset be sourced? → A: **Hand-author `public/saa/Flag_EN.svg`** as a 20×15 Union Flag matching `Flag_VN.svg`'s viewBox and palette. Deterministic geometry, no external dependency, sits beside the existing asset.
- Q: The design panel (`#00070C`, radius `8px`, padding `6px`, ~122px) differs from the shared `DropdownMenu` primitive, which also serves the account menu, notification bell and quick-action widget. Where should the design values land? → A: **Language switcher only** — add an optional `menuClassName` prop to `DropdownMenu` and pass the design values from `LanguageSwitcher`. The other three dropdowns are NOT restyled; this task has no design reference for them.
- Q: The frame specs only the open list and says nothing about the collapsed trigger. What happens to the trigger? → A: **Restyle it to match the rows and add the EN flag** — keep the chevron, bring flag+label to the 20×15 flag / Montserrat 700 16px pairing, and show the Union Flag when the locale is EN (today the EN trigger has no flag at all).

### Resolved from design data (no user input needed)

- Q: A.1 measures 108×56 with radius `2px` while A.2 measures 110×56 with radius `0px` — which is the row? → A: **110×56, radius `2px`.** Both instances share `componentSetId: 186:1695`; the deltas are Figma component-variant artifacts of one row type, not two designs.
- Q: A.1 is `justify-content: flex-start` and A.2 is `justify-content: center`. Which applies? → A: **Centred.** In both rows the 52–53px content box sits ~28px from each edge of the 110px row, so both render optically centred regardless of the recorded value.
- Q: Which test policy applies? → A: **`e2e-red-first`.** The specs describe state transitions ("Click: mở/đóng menu", "Chọn 'EN'/'VN': cập nhật giá trị hiển thị và đóng menu"), which is the auto-select trigger, and the project ships a real runner (`@playwright/test`, `npm run test:e2e`). No downgrade, no scaffolding needed.

### Assumptions (flagged — design data does not specify)

- **Hover background.** The specs require "hover hiển thị highlight" but no Figma variant carries the hover fill. Using the existing `--secondary-button-bg` token — `rgba(255,234,158,0.1)`, exactly half the selected row's `0.2` — so hover reads as a lighter step of the same highlight. Revisit if the design later publishes a hover variant.
- **Selected background token.** `rgba(255,234,158,0.2)` is not yet in `app/globals.css`; it is added as a new token rather than hard-coded inline, matching how every other design colour in this project is handled.

## Out of scope

- Locale set stays exactly `vi` | `en` (BR-006 — no third locale until requested).
- No change to `lib/i18n/locale-provider.tsx` persistence, SSR default, or hydration reconcile.
- No restyle of `account-menu.tsx`, `notification-bell.tsx`, or `quick-action-widget.tsx`.
