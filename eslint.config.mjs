import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const FEATURE_INTERNALS = {
  group: ["@/features/*/*"],
  message: 'Consume features through their public API: import from "@/features/<feature>".',
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Feature boundaries: a feature's internals are private to that feature.
      "no-restricted-imports": ["error", { patterns: [FEATURE_INTERNALS] }],
    },
  },
  {
    files: ["src/components/**", "src/hooks/**", "src/lib/**", "src/services/**"],
    rules: {
      // Shared layers sit below features and must never depend on them.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            FEATURE_INTERNALS,
            { group: ["@/features", "@/features/*"], message: "Shared code must not depend on features." },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
    "blob-report/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
