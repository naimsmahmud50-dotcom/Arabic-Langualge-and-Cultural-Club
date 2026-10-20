/**
 * DEVELOPER NOTE:
 * File: tests/e2e/media-upload.spec.ts
 * Purpose: Playwright E2E test for Media Upload Pipeline, Storage Protection & Auth Guard.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { test, expect } from "@playwright/test";

test.describe("Media Upload Pipeline & Permanent Storage Protection", () => {
  test("rejects unauthenticated POST requests to /api/upload", async ({ request }) => {
    const response = await request.post("/api/upload", {
      multipart: {
        file: {
          name: "test-unauthorized.jpg",
          mimeType: "image/jpeg",
          buffer: Buffer.from("fake-image-bytes"),
        },
      },
    });

    expect([401, 403, 307]).toContain(response.status());
  });

  test("authenticated admin can access media gallery and inspect photo albums", async ({ page }) => {
    // Authenticate
    const adminEmail = process.env.ADMIN_EMAIL || process.env.INITIAL_ADMIN_EMAIL || "arabicclubkngc2025@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD || "TestAuthPhrase#2026!";

    await page.goto("/admin/login");
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin(\/)?$/, { timeout: 15000 });

    // Navigate to gallery
    await page.goto("/admin/gallery");
    await expect(page.locator("h1")).toContainText("Photo Albums & Media Archive");

    // Check for Create Album button
    const createBtn = page.locator("button:has-text('New Album'), button:has-text('Create Album')");
    await expect(createBtn.first()).toBeVisible();
  });
});
