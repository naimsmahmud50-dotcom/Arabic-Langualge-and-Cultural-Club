/**
 * DEVELOPER NOTE:
 * File: vitest.config.ts
 * Purpose: Vitest unit testing configuration for the Arabic Language & Cultural Club platform.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Strictly human vibe; zero AI emojis.
 */

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
