/**
 * DEVELOPER NOTE:
 * File: tests/unit/settings.test.ts
 * Purpose: Vitest unit tests for site settings queries, fallback defaults, and server action guards.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { describe, it, expect } from "vitest";
import { DEFAULT_SITE_SETTINGS, DEFAULT_NAV_ITEMS } from "@/lib/types/settings";
import { fetchSiteSettingsDirect } from "@/lib/settings";
import { saveSiteSettingsAction } from "@/lib/actions/governance";

describe("Site Settings Engine & Default Safeguards", () => {
  it("provides comprehensive collegiate fallback defaults", () => {
    expect(DEFAULT_SITE_SETTINGS.club_name_en).toContain("Arabic Language & Cultural Club");
    expect(DEFAULT_SITE_SETTINGS.college_name_en).toContain("Kabi Nazrul Government College");
    expect(DEFAULT_SITE_SETTINGS.founding_year).toBe("2022");
    expect(DEFAULT_SITE_SETTINGS.contact_email).toBe("arabicclubkngc2025@gmail.com");
    expect(DEFAULT_SITE_SETTINGS.hero_title_en).toBeDefined();
    expect(DEFAULT_SITE_SETTINGS.nav_cta_link).toBe("/membership");
  });

  it("contains verified default navigation items", () => {
    expect(Array.isArray(DEFAULT_NAV_ITEMS)).toBe(true);
    expect(DEFAULT_NAV_ITEMS.length).toBeGreaterThanOrEqual(8);
    const hrefs = DEFAULT_NAV_ITEMS.map((item) => item.href);
    expect(hrefs).toContain("/about");
    expect(hrefs).toContain("/events");
    expect(hrefs).toContain("/gallery");
    expect(hrefs).toContain("/resources");
    expect(hrefs).toContain("/publications");
    expect(hrefs).toContain("/contact");
  });

  it("fetches settings directly from SQLite and fills missing fields with defaults", async () => {
    const settings = await fetchSiteSettingsDirect();
    expect(settings).toBeDefined();
    expect(settings.club_name_en.length).toBeGreaterThan(0);
    expect(settings.contact_email.length).toBeGreaterThan(0);
    expect(settings.navigation_menu.length).toBeGreaterThan(0);
  });

  it("rejects saveSiteSettingsAction when called without an active session", async () => {
    const formData = new FormData();
    formData.append("club_name_en", "Modified Title Without Auth");

    const result = await saveSiteSettingsAction(null, formData);
    expect(result.success).toBe(false);
    expect(result.message).toContain("Unauthorized");
  });
});
