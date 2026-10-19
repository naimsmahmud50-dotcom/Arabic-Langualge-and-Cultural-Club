/**
 * DEVELOPER NOTE:
 * File: tests/e2e/events.spec.ts
 * Purpose: Playwright E2E test for Event Scheduling, Annual Plans & Publication Lifecycle.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { test, expect } from "@playwright/test";

test.describe("Event Management & Scheduling Lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Super Admin
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "admin@arabicclub.org");
    await page.fill('input[name="password"]', "AdminSecure2026!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15000 });
  });

  test("loads events administration dashboard and opens event scheduling modal", async ({ page }) => {
    await page.goto("/admin/events");
    await expect(page.locator("h1")).toContainText("Annual Calendar & Event Operations");

    // Click "New Event" button
    const newEventBtn = page.locator("button:has-text('New Event'), button:has-text('Schedule Event')");
    await expect(newEventBtn.first()).toBeVisible();
    await newEventBtn.first().click();

    // Verify modal is open
    const modal = page.locator("[role='dialog']");
    await expect(modal).toBeVisible();
    await expect(modal.locator("input[name='titleEn'], input#titleEn, input[placeholder*='title' i]").first()).toBeVisible();

    // Close modal
    const closeBtn = modal.locator("button:has-text('Cancel'), button[aria-label='Close']");
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
    }
  });
});
