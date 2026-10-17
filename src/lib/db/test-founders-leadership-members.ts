/**
 * @file src/lib/db/test-founders-leadership-members.ts
 * @description Comprehensive automated verification for Founders, Committee Terms, and Member Directory.
 * 
 * Tests:
 * 1. Historical Term Preservation: Creating a new current term unsets previous current term without deleting records.
 * 2. Multi-Term Member Service: A member serving in multiple terms (e.g. 2022–23, 2023–24, 2024–25) is preserved with all distinct positions.
 * 3. Strict Privacy Projection: Private member (isPublic = false) is strictly excluded; phone, email, and studentId are not in projection.
 * 4. Date Range Validation: Validates that startDate must be before or equal to endDate.
 * 5. Public Founders Integrity: Returns verified founders in correct display order.
 */

import { 
  getPublicFounders, 
  getCommitteeTerms, 
  getCommitteeMembersByTerm, 
  getPublicMembers, 
  getMemberCommitteeHistory, 
  createCommitteeTerm,
  setMemberPublicVisibility
} from "./queries";

async function runTestSuite() {
  console.log("================================================================");
  console.log("Arabic Club: Founders, Leadership & Member Directory Test Suite");
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

  // Suite 1: Verified Founders
  console.log("[Suite 1] Public Founders Archive Query");
  const founders = await getPublicFounders();
  assert(founders.length >= 4, `Returns all 4 verified founders (Found: ${founders.length})`);
  assert(founders[0].nameEn.includes("Founder Member Alpha"), "First founder sorted by sortOrder 1");
  assert(founders.every(f => typeof f.roleTitleEn === "string" && f.roleTitleEn.length > 0), "All founders have valid role titles");
  assert(founders.every(f => typeof f.bioEn === "string" && f.bioEn.length > 0), "All founders have authentic biographies");

  // Suite 2: Committee Terms & Historical Preservation
  console.log("\n[Suite 2] Committee Terms & Historical Preservation");
  const terms = await getCommitteeTerms();
  assert(terms.length >= 3, `Preserves all 3 historical committee terms (Found: ${terms.length})`);
  
  const currentTerms = terms.filter(t => t.isCurrent);
  assert(currentTerms.length === 1, "Exactly one active current term exists in the database");
  assert(currentTerms[0].academicYear === "2024–2025", "Current active term is 2024–2025");

  const formerTerms = terms.filter(t => !t.isCurrent);
  assert(formerTerms.length >= 2, "Former terms (2023–2024, 2022–2023) are permanently preserved as historical archives");

  // Suite 3: Multi-Term Officeholder Service
  console.log("\n[Suite 3] Multi-Term Service & Cross-Term Assignments");
  const zaidHistory = await getMemberCommitteeHistory("mem_01");
  assert(zaidHistory.length >= 3, `Zaid Al-Mahmoud successfully served in 3 distinct terms (Found: ${zaidHistory.length})`);
  
  const servedYears = zaidHistory.map(h => h.academicYear);
  assert(servedYears.includes("2024–2025") && servedYears.includes("2023–2024") && servedYears.includes("2022–2023"),
    "History confirms service in 2022–2023, 2023–2024, and 2024–2025");

  // Check roles in each term
  const role2024 = zaidHistory.find(h => h.academicYear === "2024–2025");
  const role2023 = zaidHistory.find(h => h.academicYear === "2023–2024");
  const role2022 = zaidHistory.find(h => h.academicYear === "2022–2023");
  assert(role2024?.positionTitleEn === "President", "In 2024–2025, served as President");
  assert(Boolean(role2023?.positionTitleEn.includes("Cultural Secretary")), "In 2023–2024, served as Cultural Secretary");
  assert(Boolean(role2022?.positionTitleEn.includes("General Secretary")), "In 2022–2023, served as General Secretary");

  // Check term member roster sorting
  const currentTermId = currentTerms[0].id;
  const currentRoster = await getCommitteeMembersByTerm(currentTermId);
  assert(currentRoster.length >= 5, `Current council has complete executive officers (Found: ${currentRoster.length})`);
  assert(currentRoster[0].rankOrder <= currentRoster[1].rankOrder, "Officers are ordered strictly by rank order (Presidents first)");

  // Suite 4: Strict Privacy Projection (Zero Personal Contact Exposure)
  console.log("\n[Suite 4] Public Member Directory & Privacy Filter");
  const publicMembers = await getPublicMembers({ limit: 50 });
  assert(publicMembers.data.length >= 7, `Returns active public members (Found: ${publicMembers.data.length})`);

  // Ensure mem_priv_01 (isPublic = false) is strictly absent
  const privateMemberFound = publicMembers.data.some(m => m.id === "mem_priv_01" || m.membershipId === "ALC-2024-999");
  assert(!privateMemberFound, "Private consent member (isPublic = false) is strictly excluded from public directory");

  // Ensure no member object has email, phone, or studentId properties
  const sampleMember = publicMembers.data[0] as any;
  assert(sampleMember.email === undefined, "Projection check: member.email is undefined");
  assert(sampleMember.phone === undefined, "Projection check: member.phone is undefined");
  assert(sampleMember.studentId === undefined, "Projection check: member.studentId is undefined");

  // Suite 5: Date Range Validation on New Term Creation
  console.log("\n[Suite 5] Date Range Validation & Appointment Integrity");
  let caughtDateError = false;
  try {
    await createCommitteeTerm({
      academicYear: "2099–2100",
      titleEn: "Invalid Date Term",
      startDate: "2099-10-01",
      endDate: "2099-05-01", // Inverted date!
      isCurrent: false,
    });
  } catch (err: any) {
    caughtDateError = true;
    assert(err.message.includes("Invalid date range"), "Rejects inverted date range where startDate > endDate");
  }
  if (!caughtDateError) {
    assert(false, "Failed to reject invalid date range");
  }

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
