/**
 * DEVELOPER NOTE:
 * Test Suite: src/lib/db/test-branding-verification.ts
 * Dedicated verification test suite for Phase 2: Official College Branding Update
 * (Kabi Nazrul Government College, Dhaka / كلية كابي نذرول الحكومية / কবি নজরুল সরকারি কলেজ).
 * Strictly human vibe; zero AI emojis.
 *
 * Usage:
 * export PATH="/home/mahmud-hasan/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
 * pnpm exec tsx src/lib/db/test-branding-verification.ts
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

async function verifyBranding() {
  console.log("================================================================================");
  console.log("PHASE 2: OFFICIAL COLLEGE BRANDING VERIFICATION TEST (024)");
  console.log("Institution: Kabi Nazrul Government College, Dhaka");
  console.log("Arabic: كلية كابي نذرول الحكومية، دكا");
  console.log("Bangla: কবি নজরুল সরকারি কলেজ, ঢাকা");
  console.log("Email: arabicclubkngc2025@gmail.com");
  console.log("================================================================================\n");

  // Track 1: Database site_settings verification
  console.log("TRACK 1: SQLite Database site_settings Records");
  const db = new Database("./arabic_club.db");
  const settings = db.prepare("SELECT key, value_en, value_ar FROM site_settings").all() as { key: string; value_en: string; value_ar: string }[];
  
  const clubNameSetting = settings.find((s) => s.key === "club_name");
  assert(Boolean(clubNameSetting), "club_name setting exists in database");
  assert(
    clubNameSetting?.value_en.includes("Kabi Nazrul Government College, Dhaka") ?? false,
    "club_name setting contains 'Kabi Nazrul Government College, Dhaka'"
  );
  assert(
    clubNameSetting?.value_ar.includes("كلية كابي نذرول الحكومية") ?? false,
    "club_name setting contains 'كلية كابي نذرول الحكومية'"
  );

  const contactEmailSetting = settings.find((s) => s.key === "contact_email");
  assert(Boolean(contactEmailSetting), "contact_email setting exists in database");
  assert(
    contactEmailSetting?.value_en === "arabicclubkngc2025@gmail.com",
    "contact_email matches intended admin email: arabicclubkngc2025@gmail.com"
  );

  const hqSetting = settings.find((s) => s.key === "headquarters_address");
  assert(Boolean(hqSetting), "headquarters_address setting exists in database");
  assert(
    hqSetting?.value_en.includes("Kabi Nazrul Government College, Laxmibazar, Dhaka-1100") ?? false,
    "headquarters_address contains Laxmibazar, Dhaka-1100 campus coordinates"
  );
  console.log("");

  // Track 2: Translation Dictionaries verification
  console.log("TRACK 2: Bilingual Dictionaries Verification");
  const enDict = fs.readFileSync(path.resolve("src/lib/i18n/dictionaries/en.ts"), "utf-8");
  const arDict = fs.readFileSync(path.resolve("src/lib/i18n/dictionaries/ar.ts"), "utf-8");
  const bnDict = fs.readFileSync(path.resolve("src/lib/i18n/dictionaries/bn.ts"), "utf-8");

  assert(enDict.includes("Kabi Nazrul Govt. College, Dhaka"), "English dictionary contains 'Kabi Nazrul Govt. College, Dhaka'");
  assert(arDict.includes("كلية كابي نذرول الحكومية"), "Arabic dictionary contains 'كلية كابي نذرول الحكومية'");
  assert(bnDict.includes("কবি নজরুল সরকারি কলেজ, ঢাকা"), "Bangla dictionary contains 'কবি নজরুল সরকারি কলেজ, ঢাকা'");
  console.log("");

  // Track 3: Layout Components Branding
  console.log("TRACK 3: Layout & Masthead Components");
  const header = fs.readFileSync(path.resolve("src/components/layout/Header.tsx"), "utf-8");
  const footer = fs.readFileSync(path.resolve("src/components/layout/Footer.tsx"), "utf-8");
  const mobileNav = fs.readFileSync(path.resolve("src/components/layout/MobileNav.tsx"), "utf-8");

  assert(header.includes("Kabi Nazrul Government College, Dhaka"), "Header masthead renders English college affiliation");
  assert(header.includes("كلية كابي نذرول الحكومية"), "Header masthead renders Arabic college affiliation");
  assert(footer.includes("Kabi Nazrul Government College, Dhaka"), "Footer identity column renders college name");
  assert(mobileNav.includes("Kabi Nazrul Govt. College"), "MobileNav drawer renders college affiliation");
  console.log("");

  // Track 4: Environment & Config
  console.log("TRACK 4: Environment Template & Server Config");
  const envExample = fs.readFileSync(path.resolve(".env.example"), "utf-8");
  assert(envExample.includes("INITIAL_ADMIN_EMAIL=arabicclubkngc2025@gmail.com"), ".env.example configures INITIAL_ADMIN_EMAIL=arabicclubkngc2025@gmail.com");
  assert(envExample.includes("arabicclubkngc2025@gmail.com"), ".env.example configures email sender");
  console.log("");

  // Track 5: Live Server HTTP Response Verification
  console.log("TRACK 5: Live Production Server Verification (http://localhost:3000)");
  const res = await fetch("http://localhost:3000/");
  assert(res.status === 200, "Live homepage responds with HTTP 200 OK");
  const html = await res.text();

  assert(html.includes("Kabi Nazrul Government College, Dhaka"), "Live homepage HTML includes English college name");
  assert(html.includes("Arabic Language & Cultural Club"), "Live homepage HTML includes club name");
  assert(html.includes("KNGC Arabic Club"), "Live homepage metadata includes KNGC keywords");
  console.log("");

  console.log("================================================================================");
  console.log("OFFICIAL COLLEGE BRANDING VERIFICATION PASSED WITH 100% SUCCESS.");
  console.log("================================================================================");
}

verifyBranding().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
