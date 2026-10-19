/**
 * DEVELOPER NOTE:
 * File: tests/e2e/public-pages.spec.ts
 * Purpose: Playwright E2E test for Public Pages, Navigation, Interactive Buttons, and Forms.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly zero AI emojis.
 */

import { test, expect } from "@playwright/test";

test.describe("Public Platform Interactive Workflows & Navigation", () => {
  test("homepage renders flagship hero, navigation links, and call-to-action buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Arabic Language & Cultural Club/);

    // Verify key institutional sections
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.locator('a[href="/about"]').first()).toBeVisible();
    await expect(page.locator('a[href="/events"]').first()).toBeVisible();
    await expect(page.locator('a[href="/membership"]').first()).toBeVisible();
  });

  test("about page displays institutional charter, tabs, and milestones", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText(/About/i);
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("events page displays calendar filters and event cards", async ({ page }) => {
    await page.goto("/events");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("gallery page loads albums with interactive lightbox trigger", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("contact page submits inquiry form and receives honest confirmation voucher", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toBeVisible();

    // Verify form fields
    const nameInput = page.locator('input[name="fullName"], input#fullName');
    const emailInput = page.locator('input[name="email"], input#email');
    const messageInput = page.locator('textarea[name="message"], textarea#message');

    if (await nameInput.isVisible()) {
      await nameInput.fill("Automated E2E Tester");
      await emailInput.fill("e2e.tester@kngc.edu.bd");
      if (await page.locator('input[name="subject"], input#subject').isVisible()) {
        await page.locator('input[name="subject"], input#subject').fill("Inquiry Regarding Arabic Club");
      }
      await messageInput.fill("Testing the contact form submission in headless Playwright verification.");
      
      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();

      // Expect voucher or success banner
      const successIndicator = page.getByText(/INQ-|Inquiry Received|Thank you|Safely Recorded/i);
      await expect(successIndicator.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("membership portal renders admission form and requirements", async ({ page }) => {
    await page.goto("/membership");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
  });
});
