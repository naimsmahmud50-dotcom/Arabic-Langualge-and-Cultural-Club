/**
 * DEVELOPER NOTE:
 * File: scripts/test-settings-preserve.ts
 * Module: Automated Regression Test for Partial Tab Settings Preservation
 * Institution: Kabi Nazrul Government College, Dhaka (Arabic Language & Cultural Club)
 * Phase 1 Verification (034-fix-site-settings-wipe-bug):
 * - Tests Zod validation on email, URL, and length bounds.
 * - Simulates submitting only SEO tab fields.
 * - Verifies that General, Contact, Social, and System settings remain 100% untouched.
 * Strictly human vibe; zero AI emojis.
 */

import { siteSettingsSchema } from "../src/lib/validations/settings";
import { getAdminSiteSettings, updateSiteSettings } from "../src/lib/db/queries";
import { db } from "../src/lib/db";
import { siteSettings } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
  }
}

async function runSettingsPreservationTests() {
  console.log("================================================================");
  console.log("Site Settings Preservation & Zod Validation Test Suite");
  console.log("================================================================\n");

  // ----------------------------------------------------------------------
  // SUITE 1: Zod Schema Validation
  // ----------------------------------------------------------------------
  console.log("[Suite 1] Zod Schema Validation Rules");

  // 1a. Email validation
  const validEmailResult = siteSettingsSchema.safeParse({ contact_email: "arabicclubkngc2025@gmail.com" });
  assert(validEmailResult.success, "Accepts valid RFC email format");

  const invalidEmailResult = siteSettingsSchema.safeParse({ contact_email: "not-an-email" });
  assert(!invalidEmailResult.success, "Rejects malformed email address");

  // 1b. URL validation for social channels and canonical URLs
  const validUrlResult = siteSettingsSchema.safeParse({
    social_facebook: "https://facebook.com/ArabicClubOfficial",
    canonical_url: "http://kngc-arabic.edu.bd",
  });
  assert(validUrlResult.success, "Accepts valid http and https URLs");

  const invalidUrlResult = siteSettingsSchema.safeParse({
    social_facebook: "ftp://invalid-protocol.com",
  });
  assert(!invalidUrlResult.success, "Rejects non-http/https URL protocol");

  const javascriptUrlResult = siteSettingsSchema.safeParse({
    canonical_url: "javascript:alert(1)",
  });
  assert(!javascriptUrlResult.success, "Rejects javascript: URI injection");

  // 1c. Length limits
  const longTaglineResult = siteSettingsSchema.safeParse({
    club_tagline_en: "A".repeat(350), // max is 300
  });
  assert(!longTaglineResult.success, "Rejects tagline exceeding maximum length (300 chars)");

  // ----------------------------------------------------------------------
  // SUITE 2: Partial Tab Update Preservation in Database
  // ----------------------------------------------------------------------
  console.log("\n[Suite 2] Partial Tab Submission & Data Non-Destruction");

  // 2a. Capture current baseline state from database
  const baseline = await getAdminSiteSettings();
  const originalClubNameEn = baseline["club_name"]?.valueEn || "";
  const originalContactEmail = baseline["contact_email"]?.valueEn || "";
  const originalSocialFacebook = baseline["social_facebook"]?.valueEn || "";
  const originalOfficeHours = baseline["office_hours"]?.valueEn || "";
  const originalTheme = baseline["theme_default"]?.valueEn || "";

  assert(originalClubNameEn.length > 0, "Initial club_name exists in database baseline", originalClubNameEn);
  assert(originalContactEmail.length > 0, "Initial contact_email exists in database baseline", originalContactEmail);

  // 2b. Simulate a form submission that ONLY contains SEO tab fields
  const simulatedSubmittedFormData: Record<string, string> = {
    meta_description_en: "Preserving classical Arabic heritage and literary arts at Kabi Nazrul Government College.",
    meta_description_ar: "صون تراث اللغة العربية وآدابها في كلية كابي نذرول الحكومية بدكا.",
    canonical_url: "https://kngc-arabic.edu.bd",
    meta_keywords: "arabic, kngc, dhaka, linguistics, cultural club",
  };

  // Validate submitted fields with Zod
  const validation = siteSettingsSchema.safeParse(simulatedSubmittedFormData);
  assert(validation.success, "SEO partial input passes Zod validation");

  const validData = validation.data!;

  // Execute defensive key extraction (only keys present in simulated form)
  const entriesToUpdate = [];
  if ("meta_description_en" in simulatedSubmittedFormData || "meta_description_ar" in simulatedSubmittedFormData) {
    entriesToUpdate.push({
      key: "meta_description",
      valueEn: validData.meta_description_en ?? "",
      valueAr: validData.meta_description_ar ?? "",
      category: "seo",
    });
  }
  if ("meta_keywords" in simulatedSubmittedFormData) {
    entriesToUpdate.push({
      key: "meta_keywords",
      valueEn: validData.meta_keywords ?? "",
      valueAr: validData.meta_keywords ?? "",
      category: "seo",
    });
  }
  if ("canonical_url" in simulatedSubmittedFormData) {
    entriesToUpdate.push({
      key: "canonical_url",
      valueEn: validData.canonical_url ?? "",
      valueAr: validData.canonical_url ?? "",
      category: "seo",
    });
  }

  assert(entriesToUpdate.length === 3, "Only 3 entries queued for update from SEO tab");

  // Apply update to SQLite
  await updateSiteSettings(entriesToUpdate);

  // 2c. Re-query all settings to verify unsubmitted tabs were NOT wiped
  const afterUpdate = await getAdminSiteSettings();

  assert(
    afterUpdate["club_name"]?.valueEn === originalClubNameEn,
    "General tab (club_name) remains exactly identical after SEO-only update",
    `Expected: "${originalClubNameEn}", Found: "${afterUpdate["club_name"]?.valueEn}"`
  );

  assert(
    afterUpdate["contact_email"]?.valueEn === originalContactEmail,
    "Contact tab (contact_email) remains exactly identical after SEO-only update",
    `Expected: "${originalContactEmail}", Found: "${afterUpdate["contact_email"]?.valueEn}"`
  );

  assert(
    afterUpdate["social_facebook"]?.valueEn === originalSocialFacebook,
    "Social tab (social_facebook) remains exactly identical after SEO-only update",
    `Expected: "${originalSocialFacebook}", Found: "${afterUpdate["social_facebook"]?.valueEn}"`
  );

  assert(
    afterUpdate["office_hours"]?.valueEn === originalOfficeHours,
    "Contact tab (office_hours) remains exactly identical after SEO-only update",
    `Expected: "${originalOfficeHours}", Found: "${afterUpdate["office_hours"]?.valueEn}"`
  );

  assert(
    afterUpdate["theme_default"]?.valueEn === originalTheme,
    "System tab (theme_default) remains exactly identical after SEO-only update",
    `Expected: "${originalTheme}", Found: "${afterUpdate["theme_default"]?.valueEn}"`
  );

  // Verify that the SEO fields were indeed updated
  assert(
    afterUpdate["canonical_url"]?.valueEn === "https://kngc-arabic.edu.bd",
    "SEO canonical_url successfully updated in database",
    afterUpdate["canonical_url"]?.valueEn
  );

  // ----------------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`RESULTS: ${passedCount} / ${totalCount} tests passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log("================================================================\n");

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runSettingsPreservationTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
