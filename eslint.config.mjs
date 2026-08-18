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
  ]),
]);

export default eslintConfig;
