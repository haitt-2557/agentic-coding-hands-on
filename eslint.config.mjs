import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // The E2E suite builds each fixture server into its own distDir (see `NEXT_DIST_DIR` in
    // playwright.config.ts) so two concurrent `next build` runs cannot race one output
    // directory. Those artifacts are gitignored but a bare `eslint` still crawls them —
    // unignored, they contributed ~7k problems and buried every real finding.
    ".next-*/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `npm run lint` is a bare `eslint`, so it crawls the whole tree. These are not
    // application source and their own style is not this project's to enforce — left in,
    // they bury real app findings under ~1k unrelated problems and the gate stops meaning
    // anything.
    ".claude/**",
    "plans/**",
    "test-results/**",
    "playwright-report/**",
    // `supabase start` writes a generated edge-runtime bundle here on every boot. It is
    // gitignored (supabase/.gitignore) but a bare `eslint` still crawls it, and its ~180
    // problems are the only thing standing between this gate and a clean exit.
    "supabase/.temp/**",
  ]),
]);

export default eslintConfig;
