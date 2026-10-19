/**
 * DEVELOPER NOTE:
 * File: tests/e2e/settings.spec.ts
 * Purpose: Playwright E2E test for Tabbed Institutional Settings Management.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { test, expect } from "@playwright/test";

test.describe("Site Settings & Institutional CMS", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Super Admin
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "admin@arabicclub.org");
    await page.fill('input[name="password"]', "AdminSecure2026!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15000 });
  });

  test("navigates across all settings tabs and verifies inputs remain mounted", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.locator("h1")).toContainText("Institutional Settings & SEO");

    // Check General tab (Brand & Identity)
    await expect(page.locator('input[name="club_name_en"]')).toBeVisible();

    // Switch to Navigation Menu tab
    await page.click("button:has-text('Navigation Menu')");
    await expect(page.locator("text=Public Navigation Menu Manager").first()).toBeVisible();

    // Switch to Hero & Homepage tab
    await page.click("button:has-text('Hero & Homepage')");
    await expect(page.locator('input[name="hero_badge_en"]')).toBeVisible();

    // Switch to Contact Coordinates tab
    await page.click("button:has-text('Contact Coordinates')");
    await expect(page.locator('input[name="contact_email"]')).toBeVisible();

    // Switch to Social Media tab
    await page.click("button:has-text('Social Media')");
    await expect(page.locator('input[name="social_facebook"]')).toBeVisible();

    // Switch to Footer & Legal tab
    await page.click("button:has-text('Footer & Legal')");
    await expect(page.locator('textarea[name="footer_about_text_en"]')).toBeVisible();

    // Switch to Search & Metadata tab
    await page.click("button:has-text('Search & Metadata')");
    await expect(page.locator('input[name="canonical_url"]')).toBeVisible();

    // Switch back to Brand & Identity and save
    await page.click("button:has-text('Brand & Identity')");
    await page.click("button[type='submit']:has-text('Save Settings')");

    // Expect confirmation feedback
    const feedback = page.locator('[role="status"]');
    await expect(feedback).toBeVisible({ timeout: 10000 });
    await expect(feedback).toContainText("Settings Updated");
  });
});
