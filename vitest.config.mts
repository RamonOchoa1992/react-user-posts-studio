import { defineConfig } from "vitest/config";

// Vite 8 resolves the `@/*` alias straight from tsconfig, and its built-in Oxc
// transform compiles TSX with the automatic JSX runtime: no plugins required.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    unstubGlobals: true,
    css: false,
  },
});
