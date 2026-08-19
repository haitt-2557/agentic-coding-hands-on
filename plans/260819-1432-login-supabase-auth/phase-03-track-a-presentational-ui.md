---
phase: 3
title: "Track A — Presentational UI (/login)"
owner: momorph-ui-implementer
status: completed
priority: P1
effort: 4h
test_policy: e2e-red-first
depends_on: [2]
concurrent_with: [4]
mode: screen
---

# Phase 3 — Track A: Presentational UI
## MoMorph refs
- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz — fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `GzbNeVGJHz`, node `662:14387` · Clarifications: [`clarifications.md`](clarifications.md) · testPolicy: `e2e-red-first`

**Goal:** build the six presentational `/login` components plus the two new assets from MCP design data, matching the accessible-name freeze in [`plan.md`](plan.md) character for character.

**Owns:** `components/login/{login-header,login-main,login-intro,login-button,login-error-alert,login-footer}.tsx`; `lib/i18n/dictionaries/{vi,en}.ts` (adds `login.subtitle|tagline|button|error` only); `public/saa/Login_Keyvisual.png` (wave artwork, section background of `662:14395`); `public/saa/Google_Mark.svg` (node `I662:14426;186:1766`, 24×24).

**Reuses unchanged:** `components/ui/language-switcher.tsx`, `components/ui/dropdown-menu.tsx`, `/saa/Root_Further_Logo.png` (node `2939:9548`, 451×200), `/saa/Logo.png`, and the existing `footer.copyright` key — do not fork locale persistence or duplicate the copyright string.

**Contract:** exports, props and file paths are frozen in [`plan.md`](plan.md) § Integration contract; do not rename or re-shape them. `LoginButton` is controlled (`loading`, `onClick`) and must never import `@/lib/supabase/*`. `LoginMain` and `LoginIntro` each expose a `children` slot so Track B composes without editing a Track A file.

**Out of scope:** `app/**` (Track B owns the page, the client shell and the callback route), `lib/supabase/**`, `proxy.ts`, `lib/prelaunch/**`, `e2e/**`, `playwright.config.ts`, any auth or data call, route protection, the mock session.

**Test policy:** `e2e-red-first`. RED is already proven in Phase 2 — do not write, edit or run E2E tests, and do not claim GREEN. Run typecheck plus `npm run lint` on owned files and confirm asset coverage; `tester` owns all browser evidence in Phase 5.

**Design values are authoritative — never guess.** Frame 1440×1024; main `662:14393` padding `96px 144px`, column, gap 120px; intro `662:14755`; button `662:14425` 305×60, pale-yellow fill, label `LOGIN With Google`, mark to the right. Error alert is `role="alert"` directly below the button (design defect #2). Responsive below 1440px is proportional to a 375px floor (defect #6). Files under 200 lines. Use Figma design content as mock data source. Do NOT invent data.
