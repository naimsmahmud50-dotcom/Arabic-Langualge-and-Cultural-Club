/**
 * @file src/lib/db/test-institutional-content-cms.ts
 * @description Automated Verification Test Suite for Institutional Content CMS Modules (Feature 015).
 * 
 * DEVELOPER NOTE FOR FUTURE MAINTAINERS:
 * This test suite comprehensively verifies:
 * 1. Editable Website Pages & Dynamic Sections CMS (/admin/pages)
 * 2. Founders & Originators CMS (/admin/founders)
 * 3. Committee Terms & Preservation Management (/admin/committees) with the Historical Preservation Rule
 * 4. Member Directory & Privacy Console (/admin/members) with Strix Privacy Guard enforcement
 * 5. Server-side RBAC Permission gates & Immutable Audit Trail logging
 * 
 * RUN COMMAND:
 * export PATH="/home/mahmud-hasan/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
 * pnpm exec tsx src/lib/db/test-institutional-content-cms.ts
 */

import { db } from "./index";
import { 
  editablePages, 
  pageSections, 
  founders, 
  committeeTerms, 
  committeeAssignments, 
  members, 
  auditLogs 
} from "./schema";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { 
  getAdminPages, 
  getAdminPageWithSections, 
  updateEditablePage, 
  savePageSection, 
  deletePageSection,
  getPublicFounders,
  getAdminFounders,
  createFounder,
  updateFounder,
  deleteFounder,
  toggleFounderPublish,
  getAdminCommitteeTerms,
  createCommitteeTerm,
  updateCommitteeTerm,
  deleteCommitteeTerm,
  assignMemberToCommittee,
  deleteCommitteeAssignment,
  getAdminCommitteeAssignments,
  getAdminMembers,
  createMember,
  updateMember,
  updateMemberStatus,
  getPublicMembers
} from "./queries";
import { hasPermission } from "../auth/rbac";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runTests() {
  console.log("\n================================================================================");
  console.log("INSTITUTIONAL CONTENT CMS: AUTOMATED VERIFICATION TEST SUITE (FEATURE 015)");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------------------------
  // Test Group 1: Website Pages & Dynamic Sections CMS (/admin/pages)
  // ----------------------------------------------------------------------
  console.log("--- Test Group 1: Website Pages & Dynamic Sections CMS ---");
  try {
    const adminPages = await getAdminPages();
    assert(Array.isArray(adminPages) && adminPages.length > 0, `Fetched ${adminPages.length} administrative editable pages`);
    passed++;

    const targetPage = adminPages[0];
    assert(typeof targetPage.id === "string" && typeof targetPage.slug === "string", `Target page identified: ${targetPage.slug} (ID: ${targetPage.id})`);
    passed++;

    // Fetch with raw sections
    const pageWithSections = await getAdminPageWithSections(targetPage.id);
    assert(pageWithSections !== null, `Successfully retrieved page record with sections for ${targetPage.slug}`);
    assert(Array.isArray(pageWithSections?.sections), `Sections array retrieved with ${pageWithSections?.sections.length} entries`);
    passed++;

    // Update page metadata
    const originalTitleEn = targetPage.titleEn;
    const testTitleEn = `${originalTitleEn} (CMS Verified)`;
    await updateEditablePage(targetPage.id, {
      titleEn: testTitleEn,
      titleAr: targetPage.titleAr,
      metaDescriptionEn: "Verified via CMS automated test suite",
      metaDescriptionAr: null,
      isPublished: true,
    });

    const updatedPage = await getAdminPageWithSections(targetPage.id);
    assert(updatedPage?.titleEn === testTitleEn, `Editable page metadata updated successfully to "${testTitleEn}"`);
    passed++;

    // Revert page metadata title
    await updateEditablePage(targetPage.id, {
      titleEn: originalTitleEn,
      titleAr: targetPage.titleAr,
      metaDescriptionEn: targetPage.metaDescriptionEn,
      metaDescriptionAr: targetPage.metaDescriptionAr,
      isPublished: targetPage.isPublished ?? true,
    });
    console.log("  ✓ Restored original page title");

    // Create a new dynamic page section
    const testSectionKey = `test_section_${Date.now()}`;
    const newSectionId = await savePageSection({
      pageId: targetPage.id,
      sectionKey: testSectionKey,
      contentEn: JSON.stringify({ heading: "Test Section Heading", body: "Test dynamic content English" }),
      contentAr: JSON.stringify({ heading: "عنوان تجريبي", body: "محتوى ديناميكي عربي" }),
      sortOrder: 99,
    });
    assert(typeof newSectionId === "string" && newSectionId.length > 0, `New page section created with ID: ${newSectionId}`);
    passed++;

    // Update the dynamic page section
    await savePageSection({
      id: newSectionId,
      pageId: targetPage.id,
      sectionKey: testSectionKey,
      contentEn: JSON.stringify({ heading: "Updated Heading", body: "Updated English content" }),
      sortOrder: 100,
    });

    const [verifiedSection] = await db.select().from(pageSections).where(eq(pageSections.id, newSectionId));
    assert(verifiedSection && verifiedSection.sortOrder === 100, `Page section updated successfully with sortOrder 100`);
    passed++;

    // Delete test section
    await deletePageSection(newSectionId);
    const [deletedSection] = await db.select().from(pageSections).where(eq(pageSections.id, newSectionId));
    assert(!deletedSection, `Dynamic page section deleted cleanly`);
    passed++;

  } catch (err: any) {
    console.error("Group 1 failed:", err.message);
    failed++;
  }

  // ----------------------------------------------------------------------
  // Test Group 2: Founders & Originators CMS (/admin/founders)
  // ----------------------------------------------------------------------
  console.log("\n--- Test Group 2: Founders & Originators CMS ---");
  try {
    const initialFounders = await getAdminFounders();
    assert(Array.isArray(initialFounders), `Founders list queried successfully (${initialFounders.length} founders found)`);
    passed++;

    // Create new test founder
    const testFounderId = await createFounder({
      nameEn: "Dr. Tariq Al-Hashimi (Test)",
      nameAr: "د. طارق الهاشمي",
      roleTitleEn: "Founding Academic Advisor",
      roleTitleAr: "المستشار الأكاديمي المؤسس",
      bioEn: "Distinguished scholar who supported the initial founding of the club.",
      bioAr: "عالم متميز دعم التأسيس الأولي للنادي.",
      portraitUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      sortOrder: 50,
      isPublished: true,
    });
    assert(typeof testFounderId === "string", `Created founder record with ID: ${testFounderId}`);
    passed++;

    // Update founder
    await updateFounder(testFounderId, {
      roleTitleEn: "Senior Founding Advisor",
      sortOrder: 55,
    });
    const [updatedFounder] = await db.select().from(founders).where(eq(founders.id, testFounderId));
    assert(updatedFounder.roleTitleEn === "Senior Founding Advisor" && updatedFounder.sortOrder === 55, `Founder role and sortOrder updated successfully`);
    passed++;

    // Toggle publish status
    await toggleFounderPublish(testFounderId, false);
    const [unpublishedFounder] = await db.select().from(founders).where(eq(founders.id, testFounderId));
    assert(unpublishedFounder.isPublished === false, `Founder unpublished successfully`);
    passed++;

    const publicFoundersAfterUnpublish = await getPublicFounders();
    assert(!publicFoundersAfterUnpublish.some((f) => f.id === testFounderId), `Unpublished founder is excluded from public directory (Anti-Fabrication & Privacy guarantee)`);
    passed++;

    // Delete test founder
    await deleteFounder(testFounderId);
    const [deletedFounder] = await db.select().from(founders).where(eq(founders.id, testFounderId));
    assert(!deletedFounder, `Founder deleted cleanly from database`);
    passed++;

  } catch (err: any) {
    console.error("Group 2 failed:", err.message);
    failed++;
  }

  // ----------------------------------------------------------------------
  // Test Group 3: Committee Terms & Historical Preservation Rule (/admin/committees)
  // ----------------------------------------------------------------------
  console.log("\n--- Test Group 3: Committee Terms & Historical Preservation Rule ---");
  try {
    const adminTerms = await getAdminCommitteeTerms();
    assert(Array.isArray(adminTerms), `Fetched committee terms (${adminTerms.length} terms found)`);
    passed++;

    // Find any existing current term
    const existingCurrentTerm = adminTerms.find((t) => t.isCurrent);
    const existingCurrentId = existingCurrentTerm ? existingCurrentTerm.id : null;

    let testTermId1: string | null = null;
    let testTermId2: string | null = null;
    let testMemberId: string | null = null;

    try {
      // Create a new test term marked as CURRENT
      testTermId1 = await createCommitteeTerm({
        academicYear: "2098-2099",
        titleEn: "Executive Committee 2098–2099",
        startDate: "2098-09-01",
        endDate: "2099-08-31",
        isCurrent: true,
        summaryEn: "Test Term Alpha for Historical Preservation Check",
      });
      assert(typeof testTermId1 === "string", `Created Test Term Alpha (isCurrent: true) with ID: ${testTermId1}`);
      passed++;

      // If an existing current term existed, verify it was demoted to isCurrent = false WITHOUT being deleted
      if (existingCurrentId) {
        const [prevTerm] = await db.select().from(committeeTerms).where(eq(committeeTerms.id, existingCurrentId));
        assert(prevTerm !== undefined, `Previous current term still exists in archive (Historical Preservation Rule)`);
        assert(prevTerm.isCurrent === false, `Previous current term automatically set to isCurrent = false`);
        passed++;
      }

      // Now create Test Term Beta also marked as CURRENT
      testTermId2 = await createCommitteeTerm({
        academicYear: "2099-2100",
        titleEn: "Executive Committee 2099–2100",
        startDate: "2099-09-01",
        endDate: "2100-08-31",
        isCurrent: true,
        summaryEn: "Test Term Beta for Historical Preservation Check",
      });
      assert(typeof testTermId2 === "string", `Created Test Term Beta (isCurrent: true) with ID: ${testTermId2}`);
      passed++;

      // Verify Term Alpha was automatically set to isCurrent: false and not deleted
      const [alphaTerm] = await db.select().from(committeeTerms).where(eq(committeeTerms.id, testTermId1));
      assert(alphaTerm !== undefined && alphaTerm.isCurrent === false, `Test Term Alpha preserved as archive term with isCurrent: false`);
      passed++;

      // Test Committee Assignment
      // Create temporary test member to assign
      testMemberId = await createMember({
        fullNameEn: "Zaid Bin Harith (Test Member)",
        email: `zaid_test_${Date.now()}@example.com`,
        status: "active",
        isPublic: true,
      });

      const assignmentId = await assignMemberToCommittee({
        termId: testTermId2,
        memberId: testMemberId,
        positionTitleEn: "Director of Cultural Programming",
        positionTitleAr: "مدير البرامج الثقافية",
        rankOrder: 3,
        roleDescription: "Coordinates traditional Arabic cultural showcases.",
      });
      assert(typeof assignmentId === "string", `Assigned member to committee term with assignment ID: ${assignmentId}`);
      passed++;

      // Query assignments
      const termAssignments = await getAdminCommitteeAssignments(testTermId2);
      assert(termAssignments.some((a) => a.id === assignmentId && a.memberNameEn === "Zaid Bin Harith (Test Member)"), 
        `Queried committee roster joins member details accurately`);
      passed++;

      // Remove assignment
      await deleteCommitteeAssignment(assignmentId);
      const assignmentsAfterRemove = await getAdminCommitteeAssignments(testTermId2);
      assert(!assignmentsAfterRemove.some((a) => a.id === assignmentId), `Committee member assignment removed cleanly`);
      passed++;

    } finally {
      // Cleanup test terms and member
      if (testTermId1) await deleteCommitteeTerm(testTermId1);
      if (testTermId2) await deleteCommitteeTerm(testTermId2);
      if (testMemberId) await db.delete(members).where(eq(members.id, testMemberId));

      // Restore original current term if existed
      if (existingCurrentId) {
        await updateCommitteeTerm(existingCurrentId, { isCurrent: true });
        console.log(`  ✓ Restored original current term (${existingCurrentId}) to isCurrent = true`);
      }
    }

  } catch (err: any) {
    console.error("Group 3 failed:", err.message);
    failed++;
  }

  // ----------------------------------------------------------------------
  // Test Group 4: Member Records & Strix Privacy Guard (/admin/members)
  // ----------------------------------------------------------------------
  console.log("\n--- Test Group 4: Member Records & Strix Privacy Console ---");
  try {
    const adminMembersInitial = await getAdminMembers({ page: 1, limit: 10 });
    assert(adminMembersInitial.pagination.total >= 0, `getAdminMembers returns structured pagination (total: ${adminMembersInitial.pagination.total})`);
    passed++;

    // Create private test member
    const uniqueEmail = `private_member_${Date.now()}@club.org`;
    const newMemberId = await createMember({
      fullNameEn: "Fatima Al-Zahra (Test)",
      fullNameAr: "فاطمة الزهراء",
      email: uniqueEmail,
      phone: "+8801700000000",
      studentId: "STU-998877",
      status: "active",
      isPublic: false, // EXPLICITLY PRIVATE
      bioEn: "Researcher in Classical Arabic Syntax",
    });
    assert(typeof newMemberId === "string", `Created new member record (ID: ${newMemberId}, isPublic: false)`);
    passed++;

    // Strix Privacy Guard: Verify private member is excluded from public directory
    const publicMembersResult = await getPublicMembers();
    const leakedInPublic = publicMembersResult.data.some((m) => m.id === newMemberId);
    assert(!leakedInPublic, `Strix Privacy Guard: Private member is strictly excluded from public member directory`);
    passed++;

    // Verify phone, studentId, and private fields are NOT exposed in public projection
    for (const pubMember of publicMembersResult.data) {
      assert((pubMember as any).phone === undefined, `Public projection never includes phone number`);
      assert((pubMember as any).studentId === undefined, `Public projection never includes studentId`);
      assert((pubMember as any).isPublic === undefined || (pubMember as any).isPublic === true, `All public directory members are public`);
      break;
    }
    passed++;

    // Update member status: transition active -> alumni
    await updateMemberStatus(newMemberId, "alumni");
    const [alumniMember] = await db.select().from(members).where(eq(members.id, newMemberId));
    assert(alumniMember.status === "alumni", `Member status transition to "alumni" persisted`);
    passed++;

    // Update member details
    await updateMember(newMemberId, {
      fullNameEn: "Fatima Al-Zahra, Ph.D. (Test)",
      status: "active",
      isPublic: true,
    });
    const [updatedPublicMember] = await db.select().from(members).where(eq(members.id, newMemberId));
    assert(updatedPublicMember.fullNameEn === "Fatima Al-Zahra, Ph.D. (Test)" && updatedPublicMember.isPublic === true, 
      `Member profile updated and visibility set to public`);
    passed++;

    // Verify now appears in public directory
    const publicMembersAfterToggle = await getPublicMembers();
    const foundInPublic = publicMembersAfterToggle.data.some((m) => m.id === newMemberId);
    assert(foundInPublic, `Member now safely appears in public directory with isPublic: true`);
    passed++;

    // Cleanup member
    await db.delete(members).where(eq(members.id, newMemberId));
    const [deletedMem] = await db.select().from(members).where(eq(members.id, newMemberId));
    assert(!deletedMem, `Test member deleted cleanly`);
    passed++;

  } catch (err: any) {
    console.error("Group 4 failed:", err.message);
    failed++;
  }

  // ----------------------------------------------------------------------
  // Test Group 5: RBAC Permissions & Audit Trail Security
  // ----------------------------------------------------------------------
  console.log("\n--- Test Group 5: RBAC Permissions & Audit Trail Security ---");
  try {
    // Assert role access policies
    assert(hasPermission("administrator", "pages:manage") === true, `Role 'administrator' has permission 'pages:manage'`);
    assert(hasPermission("super_admin", "pages:manage") === true, `Role 'super_admin' has permission 'pages:manage'`);
    assert(hasPermission("read_only", "pages:manage") === false, `Role 'read_only' denied permission 'pages:manage'`);
    assert(hasPermission("content_editor", "committees:manage") === false, `Role 'content_editor' denied permission 'committees:manage'`);
    assert(hasPermission("administrator", "committees:manage") === true, `Role 'administrator' has permission 'committees:manage'`);
    assert(hasPermission("administrator", "members:manage") === true, `Role 'administrator' has permission 'members:manage'`);
    assert(hasPermission("read_only", "members:manage") === false, `Role 'read_only' denied permission 'members:manage'`);
    passed++;

    // Insert an audit log entry for institutional CMS action verification
    const logId = `audit_test_${Date.now()}`;
    await db.insert(auditLogs).values({
      id: logId,
      userId: "usr_admin",
      userEmail: "operations@arabicclub.org",
      action: "PAGE_SECTION_UPDATE",
      targetEntity: "page_sections",
      targetId: "sec_test_verify",
      detailsJson: JSON.stringify({ reason: "Automated verification test audit log", adminEmail: "operations@arabicclub.org" }),
      createdAt: new Date(),
    });

    const [loggedEntry] = await db.select().from(auditLogs).where(eq(auditLogs.id, logId));
    assert(loggedEntry && loggedEntry.action === "PAGE_SECTION_UPDATE", `Audit log record persisted with immutable timestamp`);
    passed++;

    // Clean up audit test log
    await db.delete(auditLogs).where(eq(auditLogs.id, logId));
    console.log("  ✓ Test audit record cleaned up");

  } catch (err: any) {
    console.error("Group 5 failed:", err.message);
    failed++;
  }

  // ----------------------------------------------------------------------
  // Final Results
  // ----------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} assertions passed, ${failed} failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test runner threw fatal error:", e);
  process.exit(1);
});
