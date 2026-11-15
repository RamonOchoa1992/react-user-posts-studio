import { defineConfig } from "vitest/config";

// Vite 8 resolves the `@/*` alias straight from tsconfig, and its built-in Oxc
// transform compiles TSX with the automatic JSX runtime: no plugins required.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Integration tests drive real user-event typing; the 5 s default proved tight on a CPU-saturated
    // machine (e.g. a concurrent production build), which is exactly what shared CI runners look like.
    testTimeout: 15_000,
    restoreMocks: true,
    unstubGlobals: true,
    css: false,
  },
});
