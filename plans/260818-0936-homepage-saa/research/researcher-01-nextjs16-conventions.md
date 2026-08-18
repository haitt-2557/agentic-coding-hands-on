# Next.js 16.3.1 App Router conventions vs Next 15 — bundled-docs research

Source: `node_modules/next/dist/docs/` (authoritative, per AGENTS.md). All citations are file path + heading. No web fallback was needed — every question is answered in bundled docs.

Stack confirmed: next 16.3.1, react/react-dom 19.2.8, tailwindcss ^4 + @tailwindcss/postcss, no `/src` dir, path alias `@/* -> ./*` (tsconfig.json).

---

## 1. Client vs server components

- `"use client"` is unchanged as the directive, placed at top of file before imports. Confirms Next 15 behavior. — `01-app/03-api-reference/01-directives/use-client.md` "Usage"
- Default is unchanged: layouts/pages are Server Components by default. — `01-app/01-getting-started/05-server-and-client-components.md` intro
- New directive not in Next 15: `"use cache"` — marks a route/component/function cacheable, requires `cacheComponents: true` in `next.config.ts`, function must be async. Sibling directives `"use cache: private"` and `"use cache: remote"` also exist. `"use cache"` went from experimental (v15.0.0) to enabled-with-Cache-Components (v16.0.0). — `01-app/03-api-reference/01-directives/use-cache.md` "Usage" + "Version History". Not used by default; project's `next.config.ts` has no `cacheComponents` flag, so `"use cache"` is inert here unless added.
- Live countdown (setInterval + useState): no Next-specific pattern exists in bundled docs — this is plain React state/effects, unaffected by Next 16. Docs confirm: use `"use client"` at top of the component file, `useState` for the tick value, standard React `useEffect` lifecycle for the interval. Verbatim from docs: "Use Client Components when you need: State and event handlers... Lifecycle logic. E.g. useEffect." — `01-app/01-getting-started/05-server-and-client-components.md` "When to use Server and Client Components?". Confidence: INFERRED for the specific countdown case (not literally in docs), EXTRACTED for the general client-component rule.

## 2. Environment variables

- `NEXT_PUBLIC_` is still the client-exposure prefix, unchanged from Next 15/9.4.0. — `01-app/02-guides/environment-variables.md` "Bundling Environment Variables for the Browser"
- Reading in client components: unchanged — `process.env.NEXT_PUBLIC_X` static references get inlined at build time; dynamic lookups (`process.env[varName]`) are NOT inlined. — same file, "Bundling..." section, "Note that dynamic lookups will _not_ be inlined"
- Build-time vs runtime caveat: `NEXT_PUBLIC_` vars are frozen at `next build` time — same Docker image promoted across environments will carry stale values. For genuine runtime env reads, must call `await connection()` (from `next/server`) before reading `process.env` in a Server Component to opt into dynamic rendering — this is the mechanism, not new to 16 but explicitly documented. — same file, "Runtime Environment Variables"
- No new Next 16-specific env-var behavior found beyond the `serverRuntimeConfig`/`publicRuntimeConfig` REMOVAL (see §8).

## 3. next/image

- Required props: `src`, `alt`. `width`/`height` required unless static import or `fill`. — `01-app/03-api-reference/02-components/image.md` "Props" table
- Static imports still work — `import profile from './profile.png'` then `<Image src={profile} />`; width/height/blurDataURL auto-inferred. — same file, `#src`, and `01-app/01-getting-started/12-images.md` "Local images"
- Serving locally-downloaded SVG/PNG from `public/`: reference by root-relative path, e.g. `<Image src="/profile.png" ... />`, no import needed for files in `public/`. — `01-app/01-getting-started/12-images.md` "Local images". **SVG caveat**: Next does NOT optimize SVGs by default; `unoptimized` is applied automatically when `src` ends in `.svg`. To actually let next/image optimize/serve an SVG through the loader (not needed for most cases — the auto-unoptimized path already works), `dangerouslyAllowSVG: true` config is needed in `next.config.js`, plus recommended `contentDispositionType: 'attachment'` and a CSP. — `01-app/03-api-reference/02-components/image.md` "`dangerouslyAllowSVG`"
- **BREAKING vs 15, project-relevant**: `images.qualities` config is now REQUIRED-in-spirit starting v16 — default changed from "allow all" to `[75]` only; a `quality` prop not in the array is coerced to nearest allowed value. If the design needs non-75 qualities, must configure `images.qualities` in `next.config.ts`. — `image.md` "`qualities`" + "Version History" `v16.0.0`
- **Deprecation**: `priority` prop is deprecated since v16 in favor of `preload`. — `image.md` "`priority`". **Finding**: the project's own `app/page.tsx` (scaffold) still uses `priority` on its `<Image>` — this is stale Next-15-era code left by `create-next-app` and should be swapped to `preload` when touched.
- No next.config needed just to reference local `public/` assets by path (works out of the box). Config is only needed if: using query strings on local image URLs (`images.localPatterns[].search`, new required restriction in v16 — see §8), restricting local paths (`localPatterns`), or serving SVGs through the optimizer (`dangerouslyAllowSVG`).

## 4. next/link

- Current API props (App Router): `href` (required), `replace`, `scroll`, `prefetch`, `onNavigate`, `transitionTypes` (new in v16.2.0). — `01-app/03-api-reference/02-components/link.md` "Reference" table + "Version history"
- `legacyBehavior` / child-`<a>`-tag requirement: gone since v13.0.0 (pre-existing Next-15-era change, still true in 16 — no child `<a>` needed, codemod available for old code). — same file, "Version history" `v13.0.0`. (Not literally named "legacyBehavior" in this doc, but the child-`<a>` requirement it enabled is confirmed removed.)
- Hash anchors (`/awards#top-talent`): `<Link>` renders straight to `<a href="/awards#top-talent">`; Next scrolls to the `id` on navigation automatically ("Next.js will scroll to the Page if it is not visible in the viewport upon navigation" — applies to hash targets too via native `scrollIntoView()`). — `link.md` "Scrolling to an `id`" + "Scroll offset with sticky headers"
- `scroll` prop current behavior: defaults to `true`; default behavior is to **maintain scroll position** (browser back/forward-like), NOT force-scroll-to-top on every navigation — only scrolls to top of the target Page if that page is not already visible in viewport. Setting `scroll={false}` disables even that top-scroll. Unchanged from 15, but be aware: Next 16 no longer overrides a global `scroll-behavior: smooth` CSS setting during SPA transitions by default (see §8) — this interacts with hash-anchor smooth scrolling. — `link.md` "`scroll`" section

## 5. Metadata API

- `app/layout.tsx` shape unchanged: `export const metadata: Metadata = { title, description, ... }` from a Server Component file (layout or page). `generateMetadata` for dynamic cases. — `01-app/01-getting-started/14-metadata-and-og-images.md` "Static metadata"
- **Moved out of `metadata`**: `viewport` (and `themeColor`, `colorScheme`, `width`, `initialScale`, etc.) live in a SEPARATE `export const viewport: Viewport = {...}` (or `generateViewport`) — this split happened in Next 14.0.0, so it predates this project's "15→16" delta but is worth flagging since it's easy to still write `themeColor` inside `metadata` from stale training data. Cannot export both `viewport` object and `generateViewport` from the same segment. — `01-app/03-api-reference/04-functions/generate-viewport.md` "The `viewport` object" + "Good to know"
- Default `<meta charset>` and `<meta viewport>` tags are auto-added even with no metadata export. — `14-metadata-and-og-images.md` "Default fields"
- Root layout should NOT manually add `<title>`/`<meta>` tags — use the Metadata API instead. — `01-app/03-api-reference/03-file-conventions/layout.md` "Root Layout" bullet list

## 6. Fonts

- Import path unchanged: `next/font/google` and `next/font/local`. — `01-app/01-getting-started/13-fonts.md` intro + "Google fonts" + "Local fonts"
- Usage pattern unchanged from 15: call as function, get `.className` (or `.variable` for CSS-var mode, as project already does), apply to `<html>`/root element in `app/layout.tsx`. Project's current layout.tsx already does this correctly with `Geist`/`Geist_Mono` + CSS variables. — same file, "Google fonts" example
- No breaking changes to `next/font` surfaced in the v16 upgrade guide.

## 7. Root layout requirements

- `app/layout.js` (or `.tsx`) **must** define `<html>` and `<body>` tags — unchanged hard requirement. — `01-app/03-api-reference/03-file-conventions/layout.md` "Root Layout"
- Should NOT hand-add `<head>` metadata tags; use Metadata API instead (see §5). — same file
- Client-side context provider (session/i18n) placement: create a **separate** `"use client"` file exporting a Provider component that wraps `children`, import that Provider into the (still server) root layout and wrap `{children}` with it — do NOT convert the whole layout to a client component. Recommendation: render providers "as deep as possible in the tree" — wrap only `{children}`, not the entire `<html>` document, so Next.js can still optimize the static parts of Server Components. — `01-app/01-getting-started/05-server-and-client-components.md` "Context providers" (full example: `ThemeProvider` client component imported into server `RootLayout`)
- New in 16: `LayoutProps<'/route'>` helper type for strongly-typed layout props (generated at `next dev`/`build`/`next typegen`, globally available, no import needed). Project's own `app/layout.tsx` already uses `LayoutProps<"/">`. — `01-app/03-api-reference/03-file-conventions/layout.md` "Layout Props Helper"

## 8. Deprecation / breaking notices relevant to a from-scratch marketing/landing page build

From `01-app/02-guides/upgrading/version-16.md` (full breaking-change list), the ones that bite a plain landing-page build:

- **Turbopack is now default** for both `next dev` and `next build` — no `--turbopack` flag needed; a custom webpack config in `next.config.ts` will make `next build` FAIL unless `--webpack` is passed. This project's `next.config.ts` has no webpack config, so unaffected, but do not add one casually. — "Turbopack by default"
- **Async Request APIs fully enforced**: `cookies()`, `headers()`, `draftMode()`, `params` (in layout/page/route/default/opengraph-image/twitter-image/icon/apple-icon), and `searchParams` (page) — synchronous access is REMOVED (was a deprecated compat shim in 15). Must `await params` etc. Project's `app/page.tsx`/`layout.tsx` don't yet use dynamic params, but any new page route MUST await these. — "Async Request APIs (Breaking change)"
- **`next/legacy/image` deprecated** — irrelevant here since project already uses `next/image`.
- **`images.domains` deprecated**, use `remotePatterns` — irrelevant unless remote images added.
- **`next/image` `priority` prop deprecated → use `preload`** (see §3). Project's scaffold `page.tsx` still uses `priority` — flag for cleanup.
- **`images.qualities` default narrowed to `[75]`** — if design calls for other quality values, must configure explicitly (see §3).
- **Local image query strings now blocked by default**: `<Image src="/assets/photo?v=1">` requires `images.localPatterns[].search` config, else 400. Relevant if any downloaded local asset URL carries a cache-busting query string.
- **`minimumCacheTTL` default changed 60s → 4h** — informational, affects how fast a swapped-in local/public image shows updated content in production.
- **`middleware` → `proxy` rename**: filename and exported function both renamed; `edge` runtime not supported in `proxy`. Only relevant if the build adds middleware/proxy later.
- **`next lint` removed** — must use ESLint CLI directly (project's `package.json` already does: `"lint": "eslint"`). Confirmed already compliant.
- **`serverRuntimeConfig`/`publicRuntimeConfig` REMOVED** — must use env vars (`NEXT_PUBLIC_` prefix or server-only `process.env`) instead. Relevant if the plan reaches for `next/config` from old training data — that API is gone.
- **Scroll-behavior override removed**: Next no longer force-resets `scroll-behavior: smooth` during SPA nav by default. If the design wants smooth hash-anchor scrolling app-wide (e.g. `/awards#top-talent`), must add `data-scroll-behavior="smooth"` to the `<html>` tag in root layout to restore old override behavior, OR just rely on native CSS `scroll-behavior: smooth` unmanaged (works passively now too). — "Scroll Behavior Override"
- **Parallel routes `default.js` now mandatory** wherever parallel route slots (`@slot`) are used — build fails without it. Not relevant unless the landing page adds parallel-route slots (e.g. modals).
- **AMP support fully removed** — irrelevant, not used.
- **ESLint Flat Config is now default** for `@next/eslint-plugin-next` — project uses `eslint ^9` + `eslint-config-next 16.3.1`, should already be flat-config-based; verify `eslint.config.mjs`/`.js` exists rather than legacy `.eslintrc`.

## 9. Tailwind v4 setup — CSS-first, confirmed wired in this project

- Tailwind v4 in Next.js App Router is **CSS-first**: no `tailwind.config.ts`/`.js` required. Theme lives inline in the global CSS file via `@theme` (or `@theme inline`), driven by `@import "tailwindcss"` at the top. `tailwind.config.js` + `@tailwind base/components/utilities` directives are the OLD v3 pattern (separate guide, only for "broader browser support"). — `01-app/01-getting-started/11-css.md` "Tailwind CSS" (v4 install steps: install `tailwindcss @tailwindcss/postcss`, add plugin to `postcss.config.mjs`, `@import 'tailwindcss'` in globals.css) vs `01-app/02-guides/tailwind-v3-css.md` (explicitly the v3-only path with `tailwind.config.js` + `@tailwind` directives)
- **Confirmed already wired correctly in this project**:
  - `postcss.config.mjs` → `{ plugins: { "@tailwindcss/postcss": {} } }` — matches doc's exact recommended config.
  - `app/globals.css` → starts with `@import "tailwindcss";`, then defines CSS custom properties (`--background`, `--foreground`) in `:root`, then an `@theme inline { --color-background: var(--background); --color-foreground: var(--foreground); --font-sans: var(--font-geist-sans); --font-mono: var(--font-geist-mono); }` block. This is exactly the v4 CSS-first theme-mapping pattern (mapping raw CSS vars into Tailwind's theme namespace via `@theme inline`).
  - No `tailwind.config.ts` file exists in the project — consistent with v4 CSS-first (nothing missing).
- **How to add custom colors/fonts in THIS project** (concrete, matches existing pattern — no new file needed):
  1. Colors: add a new CSS custom property under `:root` (and a dark-mode override in the existing `@media (prefers-color-scheme: dark)` block if needed), then map it inside the existing `@theme inline { ... }` block as `--color-<name>: var(--<name>);`. This makes `bg-<name>`, `text-<name>`, etc. available as Tailwind utilities.
  2. Fonts: same mechanism already in use — `next/font/google` (or `/local`) generates a CSS variable (e.g. `--font-geist-sans` via the font's `variable` option in `app/layout.tsx`), which is then mapped in `@theme inline` as `--font-sans: var(--font-geist-sans)`. To add a new custom font, load it with `next/font`, assign it a `variable`, apply that variable's className to `<html>` (as already done), and add a corresponding `--font-<name>: var(--font-<name>)` line to `@theme inline`, then use it via `font-<name>` utility class.
  - This is the DRY, KISS-aligned path: no parallel Tailwind config file, no duplicate font-loading mechanism — extend the two files (`globals.css`, `layout.tsx`) that already carry this responsibility.

---

## Unresolved / not covered in bundled docs

- No Next-specific guidance exists for the literal "setInterval + useState live countdown" pattern — it's plain React, confirmed by omission (searched `01-app/02-guides/interactive-apps.md`, no match). Treat as standard React `useEffect` cleanup pattern; no framework-specific caveat found.
- Did not check `03-architecture/` docs in depth (only listed) — none of the 9 questions required them; skipping was intentional to stay scoped.
- Did not verify current `eslint.config.mjs` contents in this project against the v16 flat-config requirement — flagged as a to-verify item in §8, not confirmed either way.
