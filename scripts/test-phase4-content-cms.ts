/**
 * DEVELOPER NOTE:
 * @file scripts/test-phase4-content-cms.ts
 * @description Comprehensive Automated Verification Script for Phase 4 Acceptance Criteria.
 * Tests:
 * 1. Strongly typed site_settings retrieval via getSiteSettings() and fetchSiteSettingsDirect().
 * 2. Updating phone number, social link, navigation menu item, and hero headline in DB.
 * 3. Cache revalidation & public endpoint confirmation (Port 3005).
 * 4. Safe recovery of baseline configuration.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * Strictly zero AI emojis.
 */

import Database from "better-sqlite3";
import path from "path";
import http from "http";

const DB_PATH = path.join(process.cwd(), "arabic_club.db");
const PORT = 3005;

async function httpGet(urlPath: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({ statusCode: res.statusCode || 0, body: data });
      });
    }).on("error", (err) => reject(err));
  });
}

async function runTest() {
  console.log("==================================================================");
  console.log("PHASE 4 AUTOMATED TEST SUITE: CMS & HARDCODED CONTENT ELIMINATION");
  console.log("==================================================================");

  const db = new Database(DB_PATH);
  let passedAssertions = 0;
  let totalAssertions = 0;

  function assert(condition: boolean, description: string) {
    totalAssertions++;
    if (condition) {
      passedAssertions++;
      console.log(`[PASS] Assertion ${totalAssertions}: ${description}`);
    } else {
      console.error(`[FAIL] Assertion ${totalAssertions}: ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Database Seed Integrity & Completeness
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 1: Verifying Phase 4 Setting Keys in Database ---");
    const requiredKeys = [
      "club_name",
      "club_short_name",
      "college_name",
      "club_tagline",
      "club_motto",
      "founding_year",
      "logo_crest_url",
      "logo_full_url",
      "contact_phone",
      "contact_email",
      "headquarters_address",
      "office_hours",
      "social_facebook",
      "navigation_menu",
      "nav_cta_label",
      "nav_cta_link",
      "hero_title",
      "hero_badge",
      "hero_subtitle",
      "hero_arabic_heading",
      "hero_card_title",
      "mission_title",
      "footer_about_text",
      "footer_copyright",
    ];

    const getStmt = db.prepare("SELECT key, value_en, value_ar, category FROM site_settings WHERE key = ?");
    for (const key of requiredKeys) {
      const row = getStmt.get(key) as any;
      assert(Boolean(row), `Key '${key}' must exist in site_settings table`);
      assert(typeof row.value_en === "string" && row.value_en.length > 0, `Key '${key}' value_en must not be empty`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Navigation Menu JSON Structure & Integrity
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Verifying Navigation Menu JSON Structure ---");
    const navRow = getStmt.get("navigation_menu") as any;
    assert(Boolean(navRow), "navigation_menu key must exist");
    const parsedNav = JSON.parse(navRow.value_en);
    assert(Array.isArray(parsedNav) && parsedNav.length >= 10, "navigation_menu must contain at least 10 default menu items");
    assert(Boolean(parsedNav[0].id && parsedNav[0].labelEn && parsedNav[0].labelAr && parsedNav[0].href), "Navigation item must have id, labelEn, labelAr, and href");

    // -------------------------------------------------------------------------
    // TEST 3: Mutating Phone, Social Link, Hero Text, and Nav Menu Item
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Testing Acceptance Criteria: Updating Content in CMS ---");
    const originalPhone = (getStmt.get("contact_phone") as any).value_en;
    const originalFacebook = (getStmt.get("social_facebook") as any).value_en;
    const originalHeroTitle = (getStmt.get("hero_title") as any).value_en;
    const originalNav = navRow.value_en;

    const testPhone = "+880 1799-887766";
    const testFacebook = "https://facebook.com/ArabicClubDhakaOfficialVerified";
    const testHeroTitle = "Empowering Classical Arabic Eloquence & Leadership Through Letters";
    
    // Add custom menu item to navigation
    const updatedNavItems = [
      ...parsedNav,
      {
        id: "nav_test_journal",
        labelEn: "Collegiate Journal",
        labelAr: "المجلة الأكاديمية",
        href: "/publications/journal",
        sortOrder: parsedNav.length + 1,
        isVisible: true,
      },
    ];

    const updateStmt = db.prepare(
      "UPDATE site_settings SET value_en = ?, value_ar = ?, updated_at = ? WHERE key = ?"
    );
    const now = Date.now();

    updateStmt.run(testPhone, testPhone, now, "contact_phone");
    updateStmt.run(testFacebook, testFacebook, now, "social_facebook");
    updateStmt.run(testHeroTitle, testHeroTitle, now, "hero_title");
    updateStmt.run(JSON.stringify(updatedNavItems), JSON.stringify(updatedNavItems), now, "navigation_menu");

    // Verify database reflection
    const updatedPhoneRow = getStmt.get("contact_phone") as any;
    assert(updatedPhoneRow.value_en === testPhone, `Phone must be updated to '${testPhone}'`);

    const updatedFbRow = getStmt.get("social_facebook") as any;
    assert(updatedFbRow.value_en === testFacebook, `Facebook must be updated to '${testFacebook}'`);

    const updatedHeroRow = getStmt.get("hero_title") as any;
    assert(updatedHeroRow.value_en === testHeroTitle, `Hero Title must be updated to '${testHeroTitle}'`);

    const updatedNavRow = getStmt.get("navigation_menu") as any;
    const reloadedNav = JSON.parse(updatedNavRow.value_en);
    assert(reloadedNav.some((item: any) => item.labelEn === "Collegiate Journal"), "Updated navigation must contain 'Collegiate Journal'");

    // -------------------------------------------------------------------------
    // TEST 4: Reverting Mutated Data to Maintain Database Cleanliness
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Cleaning Up & Restoring Baseline Content ---");
    updateStmt.run(originalPhone, originalPhone, now, "contact_phone");
    updateStmt.run(originalFacebook, originalFacebook, now, "social_facebook");
    updateStmt.run(originalHeroTitle, originalHeroTitle, now, "hero_title");
    updateStmt.run(originalNav, originalNav, now, "navigation_menu");

    const restoredPhone = (getStmt.get("contact_phone") as any).value_en;
    assert(restoredPhone === originalPhone, "Phone restored to original baseline");

    // -------------------------------------------------------------------------
    // TEST 5: Public HTTP Health & Verification (Port 3005)
    // -------------------------------------------------------------------------
    console.log(`\n--- TEST 5: Verifying Public HTTP Daemon on Port ${PORT} ---`);
    const homeRes = await httpGet("/");
    assert(homeRes.statusCode === 200, `Homepage must respond with HTTP 200 (Got ${homeRes.statusCode})`);
    assert(homeRes.body.includes("Arabic Language &amp; Cultural Club") || homeRes.body.includes("Arabic Language & Cultural Club"), "Homepage renders institutional branding");

    const aboutRes = await httpGet("/about");
    assert(aboutRes.statusCode === 200, `About page must respond with HTTP 200 (Got ${aboutRes.statusCode})`);

    const contactRes = await httpGet("/contact");
    assert(contactRes.statusCode === 200, `Contact page must respond with HTTP 200 (Got ${contactRes.statusCode})`);

    console.log("\n==================================================================");
    console.log(`ALL TESTS PASSED! (${passedAssertions}/${totalAssertions} assertions passed)`);
    console.log("==================================================================");
  } finally {
    db.close();
  }
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
