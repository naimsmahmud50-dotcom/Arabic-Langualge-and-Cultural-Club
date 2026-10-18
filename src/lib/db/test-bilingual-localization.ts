/**
 * @file src/lib/db/test-bilingual-localization.ts
 * @description Automated Verification Test Suite for the Bilingual Experience, RTL Layout Engine & Localization.
 * 
 * DEVELOPER USAGE NOTE:
 * - Executes automated tests verifying:
 *   1. Supported locales & Directionality ('en' -> 'ltr', 'ar' -> 'rtl', 'bn' -> 'ltr')
 *   2. Complete dictionary parity (asserts 100% key parity between English and Arabic)
 *   3. Dynamic bilingual content resolution with honest fallback cascade
 *   4. BiDi isolation engine for technical reference codes, phone numbers, and emails
 *   5. Localized date and number formatting
 *   6. Layout mirroring rules and anti-fabrication invariants
 * - Run via: pnpm exec tsx src/lib/db/test-bilingual-localization.ts
 */

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocaleDirection, isValidLocale } from "../i18n/config";
import { getDictionary, en, ar, bn } from "../i18n/dictionaries";
import { resolveBilingual, formatDateLocalized, formatNumberLocalized, containsArabic } from "../i18n/format";
import { isolateLtrText, hasArabicGlyphs, toArabicNumerals, BIDI_LRI, BIDI_PDI } from "../i18n/bidi";
import { TranslationDictionary } from "../i18n/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`  PASS: ${message}`);
}

async function runBilingualTests() {
  console.log("================================================================================");
  console.log("Starting Automated Verification: Bilingual Experience & RTL Engine (019)");
  console.log("================================================================================");

  // -------------------------------------------------------------------------
  // TEST SUITE 1: Supported Locales & Directionality
  // -------------------------------------------------------------------------
  console.log("\nTEST SUITE 1: Supported Locales & Directionality");
  assert(SUPPORTED_LOCALES.includes("en"), "Supported locales includes 'en'");
  assert(SUPPORTED_LOCALES.includes("ar"), "Supported locales includes 'ar'");
  assert(SUPPORTED_LOCALES.includes("bn"), "Supported locales includes 'bn'");
  assert(DEFAULT_LOCALE === "en", "Default locale is 'en'");
  assert(getLocaleDirection("ar") === "rtl", "Arabic locale resolves to 'rtl' direction");
  assert(getLocaleDirection("en") === "ltr", "English locale resolves to 'ltr' direction");
  assert(getLocaleDirection("bn") === "ltr", "Bengali locale resolves to 'ltr' direction");
  assert(isValidLocale("ar") === true, "Validates 'ar' as legitimate locale");
  assert(isValidLocale("fr") === false, "Rejects unconfigured locale 'fr'");

  // -------------------------------------------------------------------------
  // TEST SUITE 2: Dictionary Parity & Translation Completeness
  // -------------------------------------------------------------------------
  console.log("\nTEST SUITE 2: Dictionary Parity & Translation Completeness");
  const enDict = getDictionary("en");
  const arDict = getDictionary("ar");
  const bnDict = getDictionary("bn");

  // Check section parity between English and Arabic
  const sections = Object.keys(enDict) as Array<keyof TranslationDictionary>;
  assert(sections.length >= 12, `All 12+ dictionary sections declared (Found: ${sections.length})`);

  for (const section of sections) {
    const enKeys = Object.keys(enDict[section]);
    const arKeys = Object.keys(arDict[section]);
    
    assert(
      enKeys.length === arKeys.length,
      `Section '${section}' key count matches perfectly (EN: ${enKeys.length}, AR: ${arKeys.length})`
    );

    for (const key of enKeys) {
      const enVal = (enDict[section] as Record<string, string>)[key];
      const arVal = (arDict[section] as Record<string, string>)[key];
      
      assert(
        typeof arVal === "string" && arVal.trim().length > 0,
        `Section '${section}.${key}' has non-empty Arabic translation`
      );
      assert(
        typeof enVal === "string" && enVal.trim().length > 0,
        `Section '${section}.${key}' has non-empty English translation`
      );
    }
  }

  // Check navigation parity for Bengali as well
  const navKeys = Object.keys(enDict.nav);
  for (const key of navKeys) {
    const bnVal = (bnDict.nav as Record<string, string>)[key];
    assert(
      typeof bnVal === "string" && bnVal.trim().length > 0,
      `Bengali navigation includes '${key}': "${bnVal}"`
    );
  }

  // Fallback check
  const fallbackDict = getDictionary("unknown_lang");
  assert(fallbackDict.nav.about === "About", "getDictionary gracefully falls back to English on unknown locale");

  // -------------------------------------------------------------------------
  // TEST SUITE 3: Dynamic Bilingual Content Resolution & Honest Fallbacks
  // -------------------------------------------------------------------------
  console.log("\nTEST SUITE 3: Dynamic Bilingual Content Resolution & Honest Fallbacks");
  const enTitle = "International Arabic Language Day Colloquium";
  const arTitle = "ملتقى اليوم العالمي للغة العربية";

  // When Arabic is selected and Arabic title exists
  assert(
    resolveBilingual(enTitle, arTitle, "ar") === arTitle,
    "resolveBilingual returns Arabic text when locale is 'ar'"
  );

  // When English is selected
  assert(
    resolveBilingual(enTitle, arTitle, "en") === enTitle,
    "resolveBilingual returns English text when locale is 'en'"
  );

  // Honest Fallback: When Arabic title is missing/null/empty
  assert(
    resolveBilingual(enTitle, null, "ar") === enTitle,
    "Honest Fallback: returns English when Arabic value is null"
  );
  assert(
    resolveBilingual(enTitle, "", "ar") === enTitle,
    "Honest Fallback: returns English when Arabic value is empty string"
  );
  assert(
    resolveBilingual(enTitle, "   ", "ar") === enTitle,
    "Honest Fallback: returns English when Arabic value is whitespace only"
  );

  // -------------------------------------------------------------------------
  // TEST SUITE 4: BiDi Text Formatting & Isolation Engine
  // -------------------------------------------------------------------------
  console.log("\nTEST SUITE 4: BiDi Text Formatting & Isolation Engine");
  const refCode = "REG-2026-1042";
  const isolatedRef = isolateLtrText(refCode);

  assert(
    isolatedRef.startsWith(BIDI_LRI) && isolatedRef.endsWith(BIDI_PDI),
    "isolateLtrText successfully encapsulates text with Left-to-Right Isolate tokens"
  );
  assert(
    isolatedRef.includes(refCode),
    "isolateLtrText preserves exact reference code unchanged"
  );

  // Glyph detection
  assert(hasArabicGlyphs("مرحبا بكم") === true, "hasArabicGlyphs detects standard Arabic text");
  assert(hasArabicGlyphs("ض") === true, "hasArabicGlyphs detects single Arabic character");
  assert(hasArabicGlyphs("Arabic Language Club") === false, "hasArabicGlyphs correctly returns false for pure English");
  assert(containsArabic("ملتقى اليوم العالمي") === true, "containsArabic detects Arabic phrases");

  // Numeral conversion
  const arabicNum = toArabicNumerals(2026);
  assert(arabicNum === "٢٠٢٦", `toArabicNumerals converts 2026 to Arabic-Indic digits: ${arabicNum}`);

  // -------------------------------------------------------------------------
  // TEST SUITE 5: Localized Formatting (Dates & Numbers)
  // -------------------------------------------------------------------------
  console.log("\nTEST SUITE 5: Localized Formatting (Dates & Numbers)");
  const testDate = new Date("2026-10-18T10:00:00Z");
  
  const formattedEnDate = formatDateLocalized(testDate, "en");
  assert(formattedEnDate.includes("2026"), `English date includes year 2026: "${formattedEnDate}"`);
  assert(formattedEnDate.includes("October"), `English date includes month name: "${formattedEnDate}"`);

  const formattedArDate = formatDateLocalized(testDate, "ar");
  assert(typeof formattedArDate === "string" && formattedArDate.length > 0, `Arabic date formatted: "${formattedArDate}"`);

  const formattedEnNum = formatNumberLocalized(1250, "en");
  assert(formattedEnNum === "1,250", `English number formatted with grouping: ${formattedEnNum}`);

  // -------------------------------------------------------------------------
  // TEST SUITE 6: Layout Mirroring & Invariants
  // -------------------------------------------------------------------------
  console.log("\nTEST SUITE 6: Layout Mirroring & Invariants");
  assert(
    getLocaleDirection("ar") === "rtl",
    "RTL direction asserted for layout engine"
  );
  assert(
    en.admin.dashboard !== ar.admin.dashboard,
    "Administrative dictionary strings distinct between EN and AR"
  );
  assert(
    ar.admin.dashboard === "نظرة عامة على الإدارة",
    "Verified authentic Arabic admin dashboard translation"
  );

  console.log("\n================================================================================");
  console.log("All 6 Test Suites PASSED (100% SUCCESS)!");
  console.log("================================================================================\n");
}

runBilingualTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
