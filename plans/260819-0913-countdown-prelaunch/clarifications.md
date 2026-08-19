# Clarifications — Countdown / Prelaunch page

**Screen:** Countdown - Prelaunch page
**MoMorph:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
**fileKey:** `9ypp4enmFmdK3YAFJLIu6C` · **screenId:** `8PJQswPZmU` · **figma node:** `2268:35127`
**Source data:** 5 spec items (`spec_status: done`), 17 test cases, 1 media node, frame 1512×1077
**testPolicy:** `e2e-red-first`
**Prior context:** builds on `plans/260818-0936-homepage-saa/` (same file, screen `i87tDx10uM`). Its
`clarifications.md` remains authoritative for everything it settled — those decisions are inherited,
not re-asked.

---

## Session 2026-08-19

- Q: Spec item 1 (Days) says *"Khi chưa về 0: toàn bộ điều hướng đến các trang khác bị khóa. Khi về 0: mở khóa."* How far does that lock reach? → A: **Gate the whole app.** New route `/prelaunch` holds the countdown. While the countdown is above zero every other route (`/`, `/awards`, `/kudos`, `/profile`, `/admin`) redirects there; at zero the app unlocks and `/prelaunch` itself redirects to `/`. This is the spec note taken literally and it makes the lock a real, assertable behaviour rather than dead design intent.
- Q: How is that gate enforced? → A: **Middleware + client unlock.** `middleware.ts` performs the redirect server-side so there is no flash of gated content and the gate is real rather than cosmetic; separately the prelaunch page calls `router.replace('/')` on the tick that crosses zero, so a viewer already watching the countdown is moved without needing to reload. Both halves are required: middleware alone strands the watching user at `00 00 00` until they refresh, which is precisely the moment this page exists for.
- Q: The Days spec carries *"TODO: thiết kế API endpoint để lấy target datetime"*. Which source drives the countdown? → A: **Reuse `NEXT_PUBLIC_EVENT_START_AT`.** One target instant for the whole app, so the homepage countdown and the prelaunch countdown can never disagree, and `lib/countdown.ts` already degrades a missing or unparseable value to the zero state (BR-003). The spec's API endpoint is logged as a design-owner gap below rather than invented here.
- Q: The digits are Figma font **"Digital Numbers"** (seven-segment LED, 73.728px). It is not on Google Fonts and the repo carries no such file. How is the LED look reproduced? → A: **Self-host the font file, supplied by the user.** Loaded via `next/font/local`. This is the only option that matches the frame exactly. **Blocking for the digit glyphs only** — see Unresolved Questions.
- Q: What should the *gate* do when `NEXT_PUBLIC_EVENT_START_AT` is missing or unparseable? The countdown already degrades to `00:00:00` (BR-003), but the gate is a separate decision — it governs whether the whole site is reachable at all. (Raised by the spec author, not in the original gate questions.) → A: **Fail open — no lock.** A broken env var leaves every route reachable and the gate simply does not engage. Consistent with the BR-003 precedent, and it makes a config typo degrade to *"the gate silently didn't work"* rather than *"the entire site is unreachable behind a dead countdown"*. The failure mode of fail-closed is strictly worse than the thing it protects against.
- Q: The spec says values update *"mỗi giây"* but the design shows no SECONDS unit. What tick interval? → A: **1 second.** Literal to the spec, and it matters beyond the digits: the minute value rolls exactly on its boundary, and the navigation unlock at T-0 fires within a second instead of up to 59s late. A 60s interval (what the homepage `CountdownTimer` uses) would make a live prelaunch gate visibly stale at the one moment it is being watched.

- Q: The days unit has two digit boxes and the spec fixes the range at "2-digit zero-padded (00–99)", but `computeCountdown` reports the true remaining days, which is unbounded — the shipped `.env.example` target is **122 days out**, and `CountdownUnit` was destructuring the first two characters, so `"122"` rendered as `"12"`. Silently wrong by 110 days, and unreachable by the E2E suite because every clock instant in it sits under 24 hours from the target. How should days above 99 render? → A: **Cap at 99.** Spec-compliant — the design owner wrote the range as 00–99 and drew exactly two boxes — and it is the minimal change: layout untouched, E2E regexes unchanged. Implemented as a pure `capDisplayDays()` in `lib/prelaunch/display.ts`, applied in `usePrelaunchCountdown` so the "exactly two digits" contract is enforced at its source rather than assumed. Separately, `CountdownUnit` now maps one box per character instead of destructuring two, so if that guarantee is ever broken again the extra digit appears as a visible third box rather than vanishing. Flagged to the design owner below: a prelaunch page deployed more than 99 days ahead will plateau at 99.

## Orchestrator Assumptions (stated, not asked)

Resolvable from the design data or from the inherited homepage decisions; recorded so the
implementation agents do not re-derive them.

- **New components, shared logic.** `lib/countdown.ts` is reused as-is — it is already a pure,
  clock-injected function with unit tests. The prelaunch UI gets its own components rather than
  bending `components/home/countdown-timer.tsx`, which is left untouched: that component is
  left-aligned, carries a "Coming soon" line the prelaunch frame does not have, and uses different
  box geometry. Forcing one component to serve both would mean variant props earning nothing (YAGNI).
- **Tick cadence divergence is intentional.** The homepage countdown keeps its 60s interval; only the
  prelaunch page ticks at 1s. Both read the same target instant, so they cannot disagree on value —
  only on how promptly they refresh.
- **No SECONDS unit.** The frame and all 5 spec rows show DAYS / HOURS / MINUTES only. The
  "cập nhật mỗi giây" wording governs the tick rate, not an additional displayed unit.
- **i18n.** Labels `DAYS` / `HOURS` / `MINUTES` already exist as `countdown.*` keys in both
  dictionaries and are reused. The title needs one new key pair —
  `prelaunch.title`: `"Sự kiện sẽ bắt đầu sau"` (vi) / `"Event starts in"` (en), the EN string taken
  from the spec row for item 0.2.
- **Hours/minutes range clamping.** TC `f98adad8` and `724e6e17` demand that out-of-range values
  (`-1`, `25`, `60`) render `00`. `computeCountdown` derives hours and minutes by modulo from a
  positive remaining interval, so those values are unreachable by construction and the expired branch
  already returns `00`. The E2E asserts the reachable boundaries (`00`, `09`, `23`, `59`) and the
  expired zero-state; the unreachable ones are covered by unit tests on `computeCountdown`.
- **Access-control test cases are not access control.** The four `ACCESSING` test cases are all
  marked *"Access control unspecified"*. The inherited decision stands: `lib/session/session-provider.tsx`
  is a client-side mock and never a security boundary. `/prelaunch` is public to every role — the
  prelaunch gate is a launch-timing gate, not an authorization gate.
- **Background asset** comes from the single MoMorph media node `2268:35129` (`MM_MEDIA_BG Image`,
  1512×1077, `roleHint: background`). No stock or placeholder imagery is substituted.

## Extracted design values (authoritative — do not re-derive or estimate)

Frame `2268:35127`, 1512×1077.

| Element | Node | Values |
|---|---|---|
| Background image | `2268:35129` | 1512×1077, `cover`, `no-repeat`, full viewport |
| Overlay | `2268:35130` | `linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0) 63.41%)` |
| Countdown block | `2268:35136` | flex column, `align-items: center`, `gap: 24px`, height 264px, block starts y=314 |
| Title | `2268:35137` | "Sự kiện sẽ bắt đầu sau" · Montserrat 700 · 36px/48px · white · centered |
| Time row | `2268:35138` | flex row, `gap: 60px`, 644px × 192px, horizontally centred (x 434→1077) |
| One unit | `2268:35139` | flex column, `align-items: flex-start`, `gap: 21px`, 175px × 192px |
| Digit pair | `2268:35140` | flex row, `gap: 21px`, 175px × 123px |
| Digit box | `I2268:35141;186:2616` | 76.8×122.88 · radius 12px · border 0.75px solid `#FFEA9E` · `background: linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%)` · `opacity: 0.5` · `backdrop-filter: blur(24.96px)` |
| Digit glyph | `I2268:35141;186:2617` | "Digital Numbers" 400 · 73.728px · white · 59×95 |
| Unit label | `2268:35143` | Montserrat 700 · 36px/48px · white · uppercase · left-aligned within its unit |

## Design defects to report back to the design owner

1. **Item 1 (Days) carries the navigation-lock rule for the entire screen.** A rule that gates every
   route in the application is recorded in the `transitionNote` of a single digit block. It belongs at
   screen level; anyone reading items 2 or 3 alone would never know the lock exists.
2. **`databaseNote` on item 1 is an open TODO** — *"thiết kế API endpoint để lấy target datetime"*.
   Shipped against the existing env var instead; the endpoint still needs designing if the target
   instant is ever to change without a redeploy.
3. **"Cập nhật mỗi giây" contradicts the displayed units.** The frame shows no SECONDS block, so a
   1s tick is invisible except at minute boundaries. Read as a tick-rate requirement; worth
   confirming no seconds unit was dropped from the design.
4. **Hours/minutes range test cases assert unreachable inputs** (`-1`, `25`, `60`). A countdown derives
   these by modulo and cannot produce them. The test cases read as written against a manual-entry
   field rather than a computed countdown.
5. **The frame gives no responsive behaviour.** Only a 1512-wide desktop frame exists; the digit boxes
   at 76.8px × 6 plus gaps overflow a 375px viewport by a wide margin. Mobile scaling is being derived
   rather than specified — see Unresolved Questions.

## Unresolved Questions

1. **The "Digital Numbers" font file has not been supplied yet.** Everything else proceeds; the digit
   glyphs render in the fallback stack until the file lands under `public/fonts/`. Needed: the
   `.ttf`/`.woff2` plus confirmation the licence permits web embedding. If it turns out not to be
   redistributable, the fallback decision on record is inline SVG seven-segment digits.
2. **Responsive behaviour below 1512px is derived, not specified.** Proceeding with proportional
   scaling of the digit boxes and gaps down to a 375px floor, keeping the three units on one row.
   Flagged to the design owner rather than papered over.
