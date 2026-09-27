import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams (db-path resolution,
// speed-line specs, shop categories, 404 page-name seam, the home preview's
// hardcoded featured-plan card + slot algorithm, float-safe money math,
// serializers). Browser/E2E coverage lives in tests/e2e/*.spec.ts
// (Playwright — never picked up by this config, which matches *.test.ts
// only).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
