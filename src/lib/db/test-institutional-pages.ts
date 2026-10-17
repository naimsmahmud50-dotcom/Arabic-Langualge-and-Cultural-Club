/**
 * @file src/lib/db/test-institutional-pages.ts
 * @description Automated verification test suite for editable institutional pages (/about, /history).
 * 
 * Tests:
 * 1. Verifies getPageWithSections("about") returns page and all 5 parsed sections.
 * 2. Verifies getPageWithSections("history") returns page and all 3 parsed sections.
 * 3. Verifies milestones contain verified fields and zero undefined attributes.
 * 4. Verifies non-existent slug returns null (clean empty-state triggering).
 */

import { getPageWithSections } from "./queries";

async function runTestSuite() {
  console.log("================================================================");
  console.log("Arabic Club: Institutional Pages & CMS Query Verification Suite");
  console.log("================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // Suite 1: /about Page Query
  console.log("[Suite 1] /about Page & Sections Query");
  const aboutPage = await getPageWithSections("about");
  assert(aboutPage !== null, "aboutPage is returned from database");
  assert(aboutPage?.slug === "about", "aboutPage slug matches 'about'");
  assert(aboutPage?.isPublished === true, "aboutPage is marked isPublished = true");
  assert((aboutPage?.sections.length || 0) >= 5, "aboutPage contains at least 5 sections");

  const missionSec = aboutPage?.sections.find(s => s.sectionKey === "mission");
  assert(missionSec !== undefined, "Mission section exists in aboutPage");
  assert(typeof missionSec?.contentEn.heading === "string", "Mission section has heading string");
  assert(typeof missionSec?.contentEn.quote?.text === "string", "Mission section has quote text");

  const visionSec = aboutPage?.sections.find(s => s.sectionKey === "vision");
  assert(visionSec !== undefined, "Vision section exists in aboutPage");

  const valuesSec = aboutPage?.sections.find(s => s.sectionKey === "values");
  assert(valuesSec !== undefined, "Values section exists in aboutPage");
  assert((valuesSec?.contentEn.items?.length || 0) === 5, "Values section contains 5 core institutional values");

  const constSec = aboutPage?.sections.find(s => s.sectionKey === "constitution");
  assert(constSec !== undefined, "Constitution section exists in aboutPage");
  assert(typeof constSec?.contentEn.documentUrl === "string", "Constitution section has downloadable documentUrl");

  const pillarsSec = aboutPage?.sections.find(s => s.sectionKey === "pillars");
  assert(pillarsSec !== undefined, "Pillars section exists in aboutPage");
  assert((pillarsSec?.contentEn.items?.length || 0) === 4, "Pillars section contains 4 academic pillars");

  // Suite 2: /history Page Query & Chronological Milestones
  console.log("\n[Suite 2] /history Page & Milestones Timeline Query");
  const historyPage = await getPageWithSections("history");
  assert(historyPage !== null, "historyPage is returned from database");
  assert(historyPage?.slug === "history", "historyPage slug matches 'history'");
  assert((historyPage?.sections.length || 0) >= 3, "historyPage contains at least 3 sections");

  const milestonesSec = historyPage?.sections.find(s => s.sectionKey === "milestones");
  assert(milestonesSec !== undefined, "Milestones section exists in historyPage");
  assert((milestonesSec?.contentEn.items?.length || 0) >= 5, "Milestones section has at least 5 timeline items");

  const firstMilestone = milestonesSec?.contentEn.items?.[0];
  assert(firstMilestone?.year === "2020", "First milestone year is 2020");
  assert(firstMilestone?.isVerified === true, "Milestone has verified flag");
  assert(typeof firstMilestone?.citation === "string", "Milestone contains archival citation reference");

  const archivesSec = historyPage?.sections.find(s => s.sectionKey === "archives");
  assert(archivesSec !== undefined, "Archives section exists in historyPage");
  assert(typeof archivesSec?.contentEn.documentUrl === "string", "Archives section has archival protocol documentUrl");

  // Suite 3: Empty State & Graceful Non-Existent Page
  console.log("\n[Suite 3] Missing Content & Non-Existent Slug Protection");
  const missingPage = await getPageWithSections("non_existent_page_slug");
  assert(missingPage === null, "Non-existent page cleanly returns null without crashing");

  console.log("\n================================================================");
  console.log(`RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
