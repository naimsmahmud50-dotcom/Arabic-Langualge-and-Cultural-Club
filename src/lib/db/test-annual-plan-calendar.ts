/**
 * @file src/lib/db/test-annual-plan-calendar.ts
 * @description Automated verification test suite for Annual Plan & Calendar Experience.
 * 
 * COVERS:
 * 1. Multi-Year Academic Session queries (2024–2025, 2023–2024).
 * 2. 12-Month Master Program completeness and month-by-month ordering (1 to 12).
 * 3. Status handling (confirmed, planned, completed, postponed, cancelled).
 * 4. Transparent postponement and cancellation notes.
 * 5. Related event join (events.slug) & approved document link verification.
 * 6. Unverified date handling (null targetDate for tentative plans).
 * 7. Category and status filter queries.
 * 8. Empty state return for unratified academic years.
 * 9. Admin mutations: creation, update, deletion, and validation bounds.
 */

import { 
  getPublicAnnualPlans, 
  getAnnualPlanYears, 
  createAnnualPlanItem, 
  updateAnnualPlanItem, 
  deleteAnnualPlanItem 
} from "./queries";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("================================================================");
  console.log("Arabic Club: Annual Plan & Academic Calendar Test Suite");
  console.log("================================================================\n");

  // Suite 1: Academic Years & Sessions
  console.log("[Suite 1] Academic Years & Session Multi-Year Preservation");
  const years = await getAnnualPlanYears();
  assert(years.length >= 2, `Discovered at least 2 distinct academic years (Found: ${years.length})`);
  assert(years.includes("2024–2025"), "Active session 2024–2025 is present");
  assert(years.includes("2023–2024"), "Historical session 2023–2024 is preserved in archive");

  // Suite 2: 12-Month Plan Completeness & Ordering for 2024–2025
  console.log("\n[Suite 2] 12-Month Plan Completeness & Sequential Ordering");
  const plan24 = await getPublicAnnualPlans("2024–2025");
  assert(plan24.length === 12, `Returns complete 12-month curriculum for 2024–2025 (Found: ${plan24.length})`);

  let isOrdered = true;
  for (let i = 0; i < plan24.length; i++) {
    if (plan24[i].monthNumber !== i + 1) {
      isOrdered = false;
      break;
    }
  }
  assert(isOrdered, "Activities are strictly sequenced by academic monthNumber 1 through 12");

  // Suite 3: Status Handling & Transparency
  console.log("\n[Suite 3] Status Signaling: Confirmed, Planned, Completed, Postponed, Cancelled");
  const completedItems = plan24.filter(a => a.status === "completed");
  const confirmedItems = plan24.filter(a => a.status === "confirmed");
  const plannedItems = plan24.filter(a => a.status === "planned");
  const postponedItems = plan24.filter(a => a.status === "postponed");
  const cancelledItems = plan24.filter(a => a.status === "cancelled");

  assert(completedItems.length > 0, `Completed activities present (${completedItems.length} found)`);
  assert(confirmedItems.length > 0, `Confirmed activities present (${confirmedItems.length} found)`);
  assert(plannedItems.length > 0, `Planned activities present (${plannedItems.length} found)`);
  assert(postponedItems.length === 1, `Postponed activity explicitly recorded (Found: ${postponedItems.length})`);
  assert(cancelledItems.length === 1, `Cancelled activity explicitly recorded (Found: ${cancelledItems.length})`);

  // Verify postponement notice
  const postponedAct = postponedItems[0];
  assert(
    Boolean(postponedAct && postponedAct.notes && postponedAct.notes.includes("Postponed by the Inter-University Advisory Board")),
    "Postponed activity contains verified explanatory note"
  );

  // Verify cancellation notice
  const cancelledAct = cancelledItems[0];
  assert(
    Boolean(cancelledAct && cancelledAct.notes && cancelledAct.notes.includes("Cancelled due to scheduled structural renovation")),
    "Cancelled activity contains verified explanatory note"
  );

  // Suite 4: Related Event Join & Document Attachment Linkage
  console.log("\n[Suite 4] Related Event Linkage & Approved Documents");
  const linkedEventAct = plan24.find(a => a.relatedEventId === "evt_01");
  assert(Boolean(linkedEventAct), "Activity with relatedEventId 'evt_01' found in plan");
  assert(
    linkedEventAct?.relatedEventSlug === "arabic-calligraphy-masterclass-2026",
    `Left-joined related event slug is correct: '${linkedEventAct?.relatedEventSlug}'`
  );

  const docAct = plan24.find(a => a.documentUrl !== null);
  assert(Boolean(docAct), "Activity with approved document URL found");
  assert(Boolean(docAct?.documentTitle), `Document title is provided: '${docAct?.documentTitle}'`);

  // Suite 5: Logistics & Unratified Dates
  console.log("\n[Suite 5] Logistics Verification & Tentative Schedules");
  const tentativeAct = plan24.find(a => a.monthNumber === 12);
  assert(tentativeAct?.targetDate === null, "Tentative month 12 plan correctly stores targetDate as null");
  assert(tentativeAct?.location === null, "Tentative month 12 plan correctly stores location as null");

  const verifiedAct = plan24.find(a => a.monthNumber === 1);
  assert(verifiedAct?.targetDate === "2024-09-18", "Verified month 1 targetDate is '2024-09-18'");
  assert(verifiedAct?.location === "Auditorium Hall A, Central Campus", "Verified month 1 location is accurate");

  // Suite 6: Filtering by Category and Status
  console.log("\n[Suite 6] Database Query Filtering");
  const workshops = await getPublicAnnualPlans({ academicYear: "2024–2025", category: "workshop" });
  assert(workshops.length > 0 && workshops.every(w => w.category === "workshop"), `Filtered by category 'workshop' successfully (${workshops.length} found)`);

  const confirmedQuery = await getPublicAnnualPlans({ academicYear: "2024–2025", status: "confirmed" });
  assert(confirmedQuery.length > 0 && confirmedQuery.every(c => c.status === "confirmed"), `Filtered by status 'confirmed' successfully (${confirmedQuery.length} found)`);

  // Suite 7: Empty State for Unratified Years
  console.log("\n[Suite 7] Empty State Handling");
  const emptyPlan = await getPublicAnnualPlans("1999–2000");
  assert(Array.isArray(emptyPlan) && emptyPlan.length === 0, "Query for nonexistent academic year returns clean empty array []");

  // Suite 8: Administrative CRUD & Bounds Validation
  console.log("\n[Suite 8] Administrative CRUD Operations & Input Validation");
  const testId = `test_ap_${Date.now()}`;
  
  // Create
  const createdId = await createAnnualPlanItem({
    id: testId,
    academicYear: "2025–2026",
    monthNumber: 1,
    activityTitleEn: "Test Inaugural Circle",
    category: "academic",
    status: "planned",
    location: "Test Hall",
  });
  assert(createdId === testId, "createAnnualPlanItem successfully created test record");

  // Update
  const updateSuccess = await updateAnnualPlanItem(testId, {
    status: "confirmed",
    activityTitleEn: "Updated Inaugural Circle",
  });
  assert(updateSuccess === true, "updateAnnualPlanItem successfully modified test record");

  // Delete
  const deleteSuccess = await deleteAnnualPlanItem(testId);
  assert(deleteSuccess === true, "deleteAnnualPlanItem successfully removed test record");

  // Validation: reject invalid monthNumber
  let validationCaught = false;
  try {
    await createAnnualPlanItem({
      academicYear: "2025–2026",
      monthNumber: 13, // Invalid month!
      activityTitleEn: "Invalid Month Plan",
      category: "academic",
    });
  } catch {
    validationCaught = true;
  }
  assert(validationCaught, "Validation rejects invalid monthNumber outside 1-12");

  console.log("\n================================================================");
  console.log(`RESULTS: ${passed} / ${passed + failed} tests passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
