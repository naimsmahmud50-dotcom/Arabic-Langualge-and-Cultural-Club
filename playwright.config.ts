/**
 * DEVELOPER NOTE:
 * File: playwright.config.ts
 * Purpose: Playwright End-to-End browser test suite configuration.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Target: http://localhost:3005 (Arabic Club daemon)
 * Port Invariant: Port 3000 must NEVER be targeted.
 * Strictly human vibe; zero AI emojis.
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Sequential to prevent database write conflicts
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3005",
    trace: "on-first-retry",
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
  ],
});
