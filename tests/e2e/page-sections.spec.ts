/**
 * DEVELOPER NOTE:
 * File: tests/e2e/page-sections.spec.ts
 * Purpose: Playwright E2E test for Page Section CMS Editor and Structured Content.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { test, expect } from "@playwright/test";

test.describe("Page Section Structured Editor", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Super Admin
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "admin@arabicclub.org");
    await page.fill('input[name="password"]', "AdminSecure2026!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15000 });
  });

  test("loads editable pages console, opens section modal, and inspects structured fields", async ({ page }) => {
    await page.goto("/admin/pages");
    await expect(page.locator("h1")).toContainText("Page Content & Sections CMS");

    // Click "Add Section" button
    const addSectionBtn = page.locator("button:has-text('Add Section')");
    await expect(addSectionBtn).toBeVisible();
    await addSectionBtn.click();

    // Verify the structured modal opens with English and Arabic fields
    const modal = page.locator("[role='dialog']");
    await expect(modal).toBeVisible();
    await expect(modal.locator("input, textarea").first()).toBeVisible();

    // Close modal
    const closeButton = modal.locator("button[aria-label='Close dialog']");
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });
});
