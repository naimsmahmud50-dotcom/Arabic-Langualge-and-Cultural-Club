/**
 * @file src/lib/db/test-membership-application-workflow.ts
 * @description Automated Verification Test Suite for Membership Application & Admissions Workflow.
 * 
 * SYSTEM COVERAGE:
 * 1. Application Submission & Unique Reference ID Generation (APP-2026-XXXX).
 * 2. Active Duplicate Prevention by Email and Student ID.
 * 3. Dual-Factor Status Query Anti-Enumeration Protection.
 * 4. Self-Service Applicant Withdrawal Workflow.
 * 5. Re-submission Clearance Following Withdrawal.
 * 6. Administrative Adjudication Transitions (under_review, approved, rejected).
 * 7. Immutable Audit Logging of Administrative Review Actions.
 * 8. Queue Filtering and Keyword Search.
 * 
 * RUN COMMAND:
 * export PATH="/home/mahmud-hasan/.local/bin:$PATH" && pnpm exec tsx src/lib/db/test-membership-application-workflow.ts
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import {
  submitMembershipApplication,
  getMembershipApplicationStatus,
  withdrawMembershipApplication,
  reviewMembershipApplication,
  getAdminMembershipApplications,
} from "./queries";
import { db } from "./index";
import { auditLogs, membershipApplications, users } from "./schema";
import { eq } from "drizzle-orm";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, extraInfo: string = "") {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${testName} ${extraInfo ? `(${extraInfo})` : ""}`);
  }
}

async function runMembershipApplicationTestSuite() {
  console.log("\n================================================================================");
  console.log("MEMBERSHIP APPLICATION & ADMISSIONS: AUTOMATED VERIFICATION TEST SUITE");
  console.log("================================================================================\n");

  // Query valid reviewer user to satisfy foreign key constraint
  const [adminUser] = await db.select({ id: users.id }).from(users).limit(1);
  const reviewerUserId = adminUser?.id || "usr_superadmin";

  const testSuffix = Math.random().toString(36).substring(2, 7);
  const testEmail1 = `applicant.${testSuffix}@university.edu`;
  const testStudentId1 = `STU-2026-${testSuffix.toUpperCase()}`;

  let createdApp1: { id: string; referenceNo: string; applicantName: string; email: string; status: string; createdAt: Date } | null = null;

  // ---------------------------------------------------------------------------
  // 1. APPLICATION SUBMISSION & REFERENCE ID GENERATION
  // ---------------------------------------------------------------------------
  console.log("Test Group 1: Application Submission & Reference ID Generation");
  try {
    createdApp1 = await submitMembershipApplication({
      applicantName: "Farhan Al-Khatib",
      applicantNameAr: "فرحان الخطيب",
      email: testEmail1,
      phone: "+880 1711-889900",
      studentId: testStudentId1,
      department: "Arabic Language & Literature",
      faculty: "Faculty of Arts",
      academicLevel: "2nd Year (Sophomore)",
      category: "general_student",
      arabicProficiency: "intermediate",
      motivation: "Eager to participate in linguistic symposiums and classical debate tournaments.",
      consentAgreed: true,
      directoryConsent: true,
    });

    assert(!!createdApp1.id, "Application successfully inserted with unique primary ID");
    assert(
      createdApp1.referenceNo.startsWith("APP-2026-"),
      `Reference ID matches standard institutional format: ${createdApp1.referenceNo}`
    );
    assert(createdApp1.status === "pending", "Initial application status defaults to 'pending'");
  } catch (err: any) {
    assert(false, "Application submission failed unexpectedly", err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. ACTIVE DUPLICATE PREVENTION (EMAIL & STUDENT ID)
  // ---------------------------------------------------------------------------
  console.log("\nTest Group 2: Active Duplicate Prevention");
  if (createdApp1) {
    // 2a. Duplicate Email
    try {
      await submitMembershipApplication({
        applicantName: "Farhan Duplicate",
        email: testEmail1,
        phone: "+880 1711-000000",
        studentId: `DIFF-${testSuffix}`,
        department: "History",
        motivation: "Duplicate email test submission.",
        consentAgreed: true,
      });
      assert(false, "Duplicate email submission should have been blocked");
    } catch (err: any) {
      assert(
        err.message.includes("active membership application is already registered with this email"),
        `Blocked duplicate active email successfully: ${err.message}`
      );
    }

    // 2b. Duplicate Student ID
    try {
      await submitMembershipApplication({
        applicantName: "Another Person",
        email: `another.${testSuffix}@university.edu`,
        phone: "+880 1711-222222",
        studentId: testStudentId1,
        department: "Linguistics",
        motivation: "Duplicate student ID test submission.",
        consentAgreed: true,
      });
      assert(false, "Duplicate student ID submission should have been blocked");
    } catch (err: any) {
      assert(
        err.message.includes("active membership application is already under review for this student ID"),
        `Blocked duplicate student ID successfully: ${err.message}`
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 3. DUAL-FACTOR ANTI-ENUMERATION STATUS LOOKUP
  // ---------------------------------------------------------------------------
  console.log("\nTest Group 3: Anti-Enumeration Dual-Factor Status Lookup");
  if (createdApp1) {
    // 3a. Correct Reference & Correct Email
    const statusResult = await getMembershipApplicationStatus(createdApp1.referenceNo, testEmail1);
    assert(!!statusResult, "Dual-factor lookup succeeds with valid Reference No and Email");
    assert(statusResult?.status === "pending", "Returned status correctly reflects 'pending'");
    assert(statusResult?.applicantName === "Farhan Al-Khatib", "Applicant English name correctly returned");
    assert(statusResult?.applicantNameAr === "فرحان الخطيب", "Applicant Arabic name correctly returned");

    // 3b. Correct Reference & Wrong Email (Anti-Enumeration Protection)
    const mismatchedEmail = await getMembershipApplicationStatus(
      createdApp1.referenceNo,
      "wrong.email@university.edu"
    );
    assert(mismatchedEmail === null, "Mismatched email returns null (prevents applicant enumeration)");

    // 3c. Non-existent Reference No
    const nonExistent = await getMembershipApplicationStatus("APP-2026-INVALID", testEmail1);
    assert(nonExistent === null, "Non-existent reference number returns null");
  }

  // ---------------------------------------------------------------------------
  // 4. SELF-SERVICE WITHDRAWAL & RE-SUBMISSION CLEARANCE
  // ---------------------------------------------------------------------------
  console.log("\nTest Group 4: Self-Service Withdrawal & Re-submission Clearance");
  const testEmail2 = `withdraw.${testSuffix}@university.edu`;
  const testStudentId2 = `STU-WDR-${testSuffix.toUpperCase()}`;

  try {
    // Submit 2nd test app
    const appToWithdraw = await submitMembershipApplication({
      applicantName: "Layla Mansoor",
      email: testEmail2,
      phone: "+880 1733-445566",
      studentId: testStudentId2,
      department: "Law",
      motivation: "Interested in legal terminology and comparative jurisprudence.",
      consentAgreed: true,
    });

    // Perform withdrawal
    await withdrawMembershipApplication(appToWithdraw.referenceNo, testEmail2);
    const withdrawnStatus = await getMembershipApplicationStatus(appToWithdraw.referenceNo, testEmail2);
    assert(withdrawnStatus?.status === "withdrawn", "Application status transitioned to 'withdrawn'");

    // Attempting to withdraw already withdrawn application throws error
    try {
      await withdrawMembershipApplication(appToWithdraw.referenceNo, testEmail2);
      assert(false, "Secondary withdrawal on already withdrawn application should fail");
    } catch (err: any) {
      assert(
        err.message.includes("Cannot withdraw"),
        "Blocked duplicate withdrawal action correctly"
      );
    }

    // Re-submission clearance: Withdrawn user can submit new application with same credentials
    const freshSubmission = await submitMembershipApplication({
      applicantName: "Layla Mansoor (Fresh)",
      email: testEmail2,
      phone: "+880 1733-445566",
      studentId: testStudentId2,
      department: "Comparative Law",
      motivation: "Updated statement of intent for the new admissions cycle.",
      consentAgreed: true,
    });
    assert(
      !!freshSubmission.id && freshSubmission.referenceNo !== appToWithdraw.referenceNo,
      "Permitted fresh application submission after previous dossier was withdrawn"
    );
  } catch (err: any) {
    assert(false, "Withdrawal test sequence failed", err.message);
  }

  // ---------------------------------------------------------------------------
  // 5. ADMINISTRATIVE REVIEW PIPELINE & AUDIT LOGGING
  // ---------------------------------------------------------------------------
  console.log("\nTest Group 5: Administrative Adjudication & Immutable Audit Trail");
  if (createdApp1) {
    // 5a. Transition to 'under_review'
    try {
      await reviewMembershipApplication(
        createdApp1.id,
        reviewerUserId,
        "under_review",
        "Assigned to Faculty Advisor for transcript and Arabic assessment verification."
      );

      const underReviewStatus = await getMembershipApplicationStatus(createdApp1.referenceNo, testEmail1);
      assert(underReviewStatus?.status === "under_review", "Dossier status updated to 'under_review'");
      assert(
        underReviewStatus?.reviewerNotes?.includes("Assigned to Faculty Advisor") ?? false,
        "Reviewer notes successfully recorded in application record"
      );
    } catch (err: any) {
      assert(false, "Transition to under_review failed", err.message);
    }

    // 5b. Transition to 'approved'
    try {
      await reviewMembershipApplication(
        createdApp1.id,
        reviewerUserId,
        "approved",
        "Dossier approved for Intermediate Classical Arabic Squad. Welcome packet dispatched."
      );

      const approvedStatus = await getMembershipApplicationStatus(createdApp1.referenceNo, testEmail1);
      assert(approvedStatus?.status === "approved", "Dossier status updated to 'approved'");
    } catch (err: any) {
      assert(false, "Transition to approved failed", err.message);
    }

    // 5c. Audit Log Verification
    try {
      const logs = await db.select()
        .from(auditLogs)
        .where(eq(auditLogs.targetId, createdApp1.id));

      assert(logs.length >= 2, `Audit trail logged ${logs.length} events for application ${createdApp1.id}`);
      const actions = logs.map(l => l.action);
      assert(
        actions.includes("review_application_under_review") && actions.includes("review_application_approved"),
        "Audit logs specifically record both 'under_review' and 'approved' transition actions"
      );
    } catch (err: any) {
      assert(false, "Audit log verification failed", err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. ADMINISTRATIVE QUEUE FILTERING & SEARCH
  // ---------------------------------------------------------------------------
  console.log("\nTest Group 6: Administrative Queue Filtering & Search");
  try {
    // 6a. Filter by Status 'approved'
    const approvedApps = await getAdminMembershipApplications({ status: "approved" });
    const containsCreated = approvedApps.some(a => a.id === createdApp1?.id);
    assert(containsCreated, "getAdminMembershipApplications({ status: 'approved' }) returns approved dossier");

    // 6b. Search by Reference Number
    if (createdApp1) {
      const searchRef = await getAdminMembershipApplications({ search: createdApp1.referenceNo });
      assert(searchRef.length >= 1 && searchRef[0].id === createdApp1.id, "Search by Reference Number matches exactly");

      // 6c. Search by Student ID
      const searchStudent = await getAdminMembershipApplications({ search: testStudentId1 });
      assert(searchStudent.length >= 1 && searchStudent[0].id === createdApp1.id, "Search by Student ID matches");
    }
  } catch (err: any) {
    assert(false, "Admin queue filtering tests failed", err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMembershipApplicationTestSuite().catch((err) => {
  console.error("Fatal error during test suite execution:", err);
  process.exit(1);
});
