/**
 * DEVELOPER NOTE:
 * Script: scripts/test-page-section-json.ts
 * Purpose: Automated test verification for Phase 2 CMS Page Section JSON architecture.
 * Run via: pnpm tsx scripts/test-page-section-json.ts
 * Tests:
 * 1. Unit tests for safeParseSectionJson with valid JSON, malformed JSON, and plain text.
 * 2. Unit tests for serializeSectionJson formatting and compactness.
 * 3. Database integration: verifies getPageWithSections("about") and getPageWithSections("history").
 * 4. Mutation test: verifies updating an About page section persists and reflects on public queries.
 * 5. Rollback verification to ensure test data is cleaned up.
 * Strictly human vibe: zero AI emojis.
 */

import { safeParseSectionJson, serializeSectionJson, type SectionContentData } from "../src/lib/schemas/sections";
import { getPageWithSections, savePageSection } from "../src/lib/db/queries";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("PHASE 2 AUTOMATED TEST: Page Section JSON CMS Verification");
  console.log("==================================================================");

  // 1. safeParseSectionJson tests
  console.log("\n--- Suite 1: safeParseSectionJson Unit Tests ---");
  
  const emptyRes = safeParseSectionJson(null);
  assert(emptyRes.heading === "" && emptyRes.body === "", "Null input returns safe empty object");

  const plainTextRes = safeParseSectionJson("This is an unformatted plain text narrative.");
  assert(
    plainTextRes.body === "This is an unformatted plain text narrative." && plainTextRes.heading === "",
    "Plain text is safely wrapped into body without throwing"
  );

  const jsonSample = JSON.stringify({
    heading: "Academic Mission",
    subtitle: "Excellence in Arabic",
    badge: "Core Charter",
    body: "Empowering scholars.",
    quote: { text: "Knowledge is light", attribution: "Founding Scholar" },
  });
  const jsonRes = safeParseSectionJson(jsonSample);
  assert(jsonRes.heading === "Academic Mission", "Parses structured heading");
  assert(jsonRes.subheading === "Excellence in Arabic", "Normalizes subtitle alias to subheading");
  assert(jsonRes.badge === "Core Charter", "Parses badge");
  assert(jsonRes.quote?.text === "Knowledge is light", "Parses nested quotation");

  // 2. serializeSectionJson tests
  console.log("\n--- Suite 2: serializeSectionJson Unit Tests ---");
  const dataToSerialize: SectionContentData = {
    heading: "Values Title",
    subheading: "Guiding Light",
    subtitle: "Guiding Light",
    badge: "Philosophy",
    body: "Integrity and eloquence.",
    items: [
      {
        id: "item_1",
        title: "Classical Nahw",
        description: "Grammar mastery",
        iconName: "BookOpen",
      },
    ],
    stats: [],
    imageUrl: "",
    imageCaption: "",
    documentUrl: "",
    documentTitle: "",
    documentSize: "",
    buttonText: "",
    buttonLink: "",
    publicationStatus: "published",
  };

  const serializedStr = serializeSectionJson(dataToSerialize);
  const reParsed = JSON.parse(serializedStr);
  assert(reParsed.heading === "Values Title", "Serialized JSON contains heading");
  assert(reParsed.items?.length === 1, "Serialized JSON contains nested items");
  assert(reParsed.items[0].title === "Classical Nahw", "Item title preserved");
  assert(!reParsed.documentUrl, "Empty documentUrl is omitted from output payload");

  // 3. Database integration: Querying public page sections
  console.log("\n--- Suite 3: Database Query Integration ---");
  const aboutPage = await getPageWithSections("about");
  assert(aboutPage !== null, "getPageWithSections('about') returns published page");
  assert((aboutPage?.sections.length || 0) >= 5, "About page contains at least 5 sections");

  const missionSec = aboutPage?.sections.find((s) => s.sectionKey === "mission");
  assert(missionSec !== undefined, "Found 'mission' section on /about");
  assert(missionSec?.contentEn.heading === "Institutional Mission", "Mission heading parsed correctly from DB");
  assert(missionSec?.contentAr.heading === "رسالتنا المؤسسية", "Mission Arabic heading parsed with RTL text");

  const valuesSec = aboutPage?.sections.find((s) => s.sectionKey === "values");
  assert(valuesSec !== undefined, "Found 'values' section on /about");
  assert((valuesSec?.contentEn.items?.length || 0) === 5, "Values section contains 5 repeatable card items");
  assert(valuesSec?.contentEn.items?.[0].iconName === "BookOpen", "Values first item has verified icon");

  const historyPage = await getPageWithSections("history");
  assert(historyPage !== null, "getPageWithSections('history') returns published page");
  const milestonesSec = historyPage?.sections.find((s) => s.sectionKey === "milestones");
  assert(milestonesSec !== undefined, "Found 'milestones' section on /history");
  assert((milestonesSec?.contentEn.items?.length || 0) >= 5, "Milestones section contains timeline items");

  // 4. Mutation & Live Reflection Test (with automatic cleanup)
  console.log("\n--- Suite 4: Mutation & Live Reflection Test ---");
  if (missionSec) {
    const originalEn = serializeSectionJson(missionSec.contentEn);
    const originalAr = serializeSectionJson(missionSec.contentAr);

    const testUpdatedEn = serializeSectionJson({
      ...missionSec.contentEn,
      heading: "Updated Test Mission Title",
      badge: "Verified Test Badge",
      body: "Updated institutional body text for testing.",
    });

    // Update section in database
    await savePageSection({
      id: missionSec.id,
      pageId: missionSec.pageId,
      sectionKey: missionSec.sectionKey,
      contentEn: testUpdatedEn,
      contentAr: originalAr,
      sortOrder: missionSec.sortOrder,
    });

    // Query fresh page data
    const freshAbout = await getPageWithSections("about");
    const freshMission = freshAbout?.sections.find((s) => s.sectionKey === "mission");

    assert(
      freshMission?.contentEn.heading === "Updated Test Mission Title",
      "Public query returns newly updated heading immediately without falling back to defaults"
    );
    assert(
      freshMission?.contentEn.badge === "Verified Test Badge",
      "Public query returns newly updated badge immediately"
    );
    assert(
      freshMission?.contentEn.body === "Updated institutional body text for testing.",
      "Public query returns newly updated body immediately"
    );

    // Rollback to original to leave database in clean state
    await savePageSection({
      id: missionSec.id,
      pageId: missionSec.pageId,
      sectionKey: missionSec.sectionKey,
      contentEn: originalEn,
      contentAr: originalAr,
      sortOrder: missionSec.sortOrder,
    });

    const rolledBackAbout = await getPageWithSections("about");
    const rolledBackMission = rolledBackAbout?.sections.find((s) => s.sectionKey === "mission");
    assert(
      rolledBackMission?.contentEn.heading === "Institutional Mission",
      "Successfully rolled back mission heading to original"
    );
  }

  // Summary
  console.log("\n==================================================================");
  console.log(`TEST SUMMARY: ${passCount} passed, ${failCount} failed.`);
  console.log("==================================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
