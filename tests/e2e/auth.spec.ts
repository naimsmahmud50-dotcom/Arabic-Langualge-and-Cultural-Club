/**
 * DEVELOPER NOTE:
 * File: tests/e2e/auth.spec.ts
 * Purpose: Playwright E2E test for Administrative Authentication, Session Guards & Role Access.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { test, expect } from "@playwright/test";

test.describe("Administrative Authentication & Session Control", () => {
  test("redirects unauthenticated users trying to access /admin to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("h1")).toContainText("Institutional CMS Portal");
  });

  test("shows clear error alert on invalid login credentials", async ({ page }) => {
    await page.goto("/admin/login");

    await page.fill('input[name="email"]', "unauthorized@user.com");
    await page.fill('input[name="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    // Expect alert or error message to appear
    const alert = page.locator('[role="alert"], .bg-red-50, .text-red-600, .text-red-700');
    await expect(alert.first()).toBeVisible({ timeout: 10000 });
  });

  test("successfully authenticates with valid credentials and accesses command center", async ({ page }) => {
    await page.goto("/admin/login");

    await page.fill('input[name="email"]', "admin@arabicclub.org");
    await page.fill('input[name="password"]', "AdminSecure2026!");
    await page.click('button[type="submit"]');

    // Wait for redirect to /admin dashboard
    await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15000 });
    await expect(page.locator("h1, h2, h3").first()).toContainText("Command Center");

    // Verify presence of metric overview cards
    await expect(page.locator("text=Active Members").first()).toBeVisible();
    await expect(page.locator("text=Scheduled Events").first()).toBeVisible();
  });
});
