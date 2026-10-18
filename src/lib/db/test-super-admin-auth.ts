/**
 * DEVELOPER NOTE:
 * @file src/lib/db/test-super-admin-auth.ts
 * @description End-to-End Automated Verification Test Suite for Super Admin Authentication & RBAC.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * - Target Administrator: arabicclubkngc2025@gmail.com
 * 
 * VERIFICATION SCOPE:
 * - Track 1: Database Identity & Account Verification
 * - Track 2: Legacy Administrator Account Preservation
 * - Track 3: Unauthenticated Visitor Defenses (307 redirect on pages, 401 on APIs)
 * - Track 4: Least-Privilege & Non-Admin Role Enforcement (403 on APIs, redirect to /admin/forbidden on pages)
 * - Track 5: Authorized Super Admin Access & Feature Clearance
 * - Track 6: Cryptographic Signature Tampering Rejection
 * - Track 7: Login Rate Limiting & Account Lockout Guard
 * - Track 8: Immutable Audit Trail Logging
 * 
 * Strictly zero AI emojis; authoritative human academic reporting.
 */

import crypto from "crypto";
import { db } from "./index";
import { users, sessions, passwordResetTokens, auditLogs, loginAttempts } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import { verifyPassword, hashPassword } from "../auth/password";
import { createSignedToken, SESSION_COOKIE_NAME, getAuthSecret } from "../auth/token";
import { checkLoginRateLimit, recordLoginAttempt } from "../auth/rate-limit";
import { hasPermission } from "../auth/rbac";

const SERVER_URL = process.env.TEST_SERVER_URL || "http://localhost:3005";
const TARGET_SUPER_ADMIN_EMAIL = "arabicclubkngc2025@gmail.com";

interface TestResult {
  track: string;
  testName: string;
  passed: boolean;
  details: string;
}

const testResults: TestResult[] = [];

function recordTest(track: string, testName: string, passed: boolean, details: string) {
  testResults.push({ track, testName, passed, details });
  const statusStr = passed ? "[PASS]" : "[FAIL]";
  console.log(`${statusStr} [${track}] ${testName} - ${details}`);
}

async function runTests() {
  console.log("==================================================================");
  console.log("PHASE 4: SUPER ADMIN AUTHENTICATION & AUTHORIZATION TEST SUITE");
  console.log(`Server URL:         ${SERVER_URL}`);
  console.log(`Target Super Admin: ${TARGET_SUPER_ADMIN_EMAIL}`);
  console.log("==================================================================\n");

  const now = new Date();

  // -----------------------------------------------------------------------------
  // TRACK 1: Database Identity Verification
  // -----------------------------------------------------------------------------
  console.log("--- Track 1: Database Identity & Account State ---");
  const targetUser = await db
    .select()
    .from(users)
    .where(eq(users.email, TARGET_SUPER_ADMIN_EMAIL))
    .get();

  const userExists = Boolean(targetUser);
  recordTest(
    "Track 1",
    "Target Account Exists",
    userExists,
    userExists ? `User record located (ID: ${targetUser?.id})` : "Account missing in users table"
  );

  const isRoleSuperAdmin = targetUser?.role === "super_admin";
  recordTest(
    "Track 1",
    "Role is super_admin",
    isRoleSuperAdmin,
    `Assigned role: '${targetUser?.role}'`
  );

  const isActive = Boolean(targetUser?.isActive);
  recordTest(
    "Track 1",
    "Account Status is Active",
    isActive,
    `isActive: ${targetUser?.isActive}`
  );

  const isPasswordHashValid = typeof targetUser?.passwordHash === "string" && targetUser.passwordHash.length > 50;
  recordTest(
    "Track 1",
    "Scrypt Password Hash Stored",
    isPasswordHashValid,
    `Hash length: ${targetUser?.passwordHash?.length || 0} chars`
  );

  // -----------------------------------------------------------------------------
  // TRACK 2: Preservation of Legacy Accounts
  // -----------------------------------------------------------------------------
  console.log("\n--- Track 2: Legacy Administrator Preservation ---");
  const demoSuperAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@arabicclub.org"))
    .get();

  const demoPreserved = Boolean(demoSuperAdmin && demoSuperAdmin.role === "super_admin" && demoSuperAdmin.isActive);
  recordTest(
    "Track 2",
    "Demo Super Admin (admin@arabicclub.org) Preserved",
    demoPreserved,
    demoPreserved ? `Active role: ${demoSuperAdmin?.role}` : "Demo admin account missing or deactivated"
  );

  const allUsers = await db.select({ id: users.id, email: users.email, role: users.role }).from(users);
  const hasMultipleAccounts = allUsers.length >= 7;
  recordTest(
    "Track 2",
    "Multi-Account Roster Integrity",
    hasMultipleAccounts,
    `Total registered users in database: ${allUsers.length}`
  );

  // -----------------------------------------------------------------------------
  // TRACK 3: Unauthenticated Visitor Defenses (HTTP & Middleware)
  // -----------------------------------------------------------------------------
  console.log("\n--- Track 3: Unauthenticated Access Interception ---");
  try {
    // 3a. Admin Dashboard Root
    const resDashboard = await fetch(`${SERVER_URL}/admin`, { redirect: "manual" });
    const isRedirectDashboard = resDashboard.status === 307 || resDashboard.status === 302;
    const locationDashboard = resDashboard.headers.get("location") || "";
    const redirectsToLoginDashboard = locationDashboard.includes("/admin/login");
    recordTest(
      "Track 3",
      "Unauthenticated /admin Redirected",
      isRedirectDashboard && redirectsToLoginDashboard,
      `Status: ${resDashboard.status}, Location: ${locationDashboard}`
    );

    // 3b. Admin Users Management Page
    const resUsersPage = await fetch(`${SERVER_URL}/admin/users`, { redirect: "manual" });
    const isRedirectUsers = resUsersPage.status === 307 || resUsersPage.status === 302;
    const locationUsers = resUsersPage.headers.get("location") || "";
    recordTest(
      "Track 3",
      "Unauthenticated /admin/users Redirected",
      isRedirectUsers && locationUsers.includes("/admin/login"),
      `Status: ${resUsersPage.status}, Location: ${locationUsers}`
    );

    // 3c. Admin Settings Page
    const resSettingsPage = await fetch(`${SERVER_URL}/admin/settings`, { redirect: "manual" });
    const isRedirectSettings = resSettingsPage.status === 307 || resSettingsPage.status === 302;
    const locationSettings = resSettingsPage.headers.get("location") || "";
    recordTest(
      "Track 3",
      "Unauthenticated /admin/settings Redirected",
      isRedirectSettings && locationSettings.includes("/admin/login"),
      `Status: ${resSettingsPage.status}, Location: ${locationSettings}`
    );

    // 3d. API Route: Backup Export
    const resApiBackup = await fetch(`${SERVER_URL}/api/admin/backup/export`);
    const isApiBackup401 = resApiBackup.status === 401;
    recordTest(
      "Track 3",
      "Unauthenticated /api/admin/backup/export Returns 401",
      isApiBackup401,
      `Status: ${resApiBackup.status}`
    );

    // 3e. API Route: Audit Logs Export
    const resApiAudit = await fetch(`${SERVER_URL}/api/admin/audit-logs/export`);
    const isApiAudit401 = resApiAudit.status === 401;
    recordTest(
      "Track 3",
      "Unauthenticated /api/admin/audit-logs/export Returns 401",
      isApiAudit401,
      `Status: ${resApiAudit.status}`
    );
  } catch (err: any) {
    recordTest("Track 3", "Server Connectivity Check", false, `Network error: ${err.message}`);
  }

  // -----------------------------------------------------------------------------
  // TRACK 4: Least-Privilege & Non-Admin Role RBAC Defenses
  // -----------------------------------------------------------------------------
  console.log("\n--- Track 4: Least-Privilege & Non-Admin Role Defenses ---");
  try {
    // Generate valid session token for Content Editor (has news:manage, not users:manage)
    const editorSessionId = `ses_test_editor_${Date.now()}`;
    const editorExpiresAt = new Date(Date.now() + 3600 * 1000);
    
    // Insert session into DB
    await db.insert(sessions).values({
      id: editorSessionId,
      userId: "usr_editor",
      role: "content_editor",
      userEmail: "editor@arabicclub.org",
      fullName: "Content Editor Test Session",
      expiresAt: editorExpiresAt,
      createdAt: now,
    });

    const editorToken = await createSignedToken({
      sid: editorSessionId,
      uid: "usr_editor",
      email: "editor@arabicclub.org",
      name: "Content Editor Test Session",
      role: "content_editor",
      exp: editorExpiresAt.getTime(),
    });

    // Content Editor attempts to access /admin/users (requires users:manage)
    const resEditorUsers = await fetch(`${SERVER_URL}/admin/users`, {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${editorToken}` },
      redirect: "manual",
    });

    const isEditorBlocked = resEditorUsers.status === 307 || resEditorUsers.status === 302;
    const editorRedirectLocation = resEditorUsers.headers.get("location") || "";
    const isForbiddenRedirect = editorRedirectLocation.includes("/admin/forbidden");

    recordTest(
      "Track 4",
      "Content Editor Blocked from /admin/users",
      isEditorBlocked && isForbiddenRedirect,
      `Status: ${resEditorUsers.status}, Redirect: ${editorRedirectLocation}`
    );

    // Content Editor attempts to call /api/admin/backup/export (requires settings:manage)
    const resEditorBackup = await fetch(`${SERVER_URL}/api/admin/backup/export`, {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${editorToken}` },
    });
    const isEditorBackup403 = resEditorBackup.status === 403;
    recordTest(
      "Track 4",
      "Content Editor Blocked from /api/admin/backup/export (403)",
      isEditorBackup403,
      `Status: ${resEditorBackup.status}`
    );

    // Clean up editor test session
    await db.delete(sessions).where(eq(sessions.id, editorSessionId));
  } catch (err: any) {
    recordTest("Track 4", "Role Authorization Test Execution", false, `Error: ${err.message}`);
  }

  // -----------------------------------------------------------------------------
  // TRACK 5: Authorized Super Admin Access & Capabilities
  // -----------------------------------------------------------------------------
  console.log("\n--- Track 5: Authorized Super Admin Access ---");
  if (targetUser) {
    try {
      // Create active session in DB for target Super Admin
      const superAdminSessionId = `ses_test_superadmin_${Date.now()}`;
      const superAdminExpiresAt = new Date(Date.now() + 3600 * 1000);

      await db.insert(sessions).values({
        id: superAdminSessionId,
        userId: targetUser.id,
        role: "super_admin",
        userEmail: targetUser.email,
        fullName: targetUser.fullName,
        expiresAt: superAdminExpiresAt,
        createdAt: now,
      });

      const superAdminToken = await createSignedToken({
        sid: superAdminSessionId,
        uid: targetUser.id,
        email: targetUser.email,
        name: targetUser.fullName,
        role: "super_admin",
        exp: superAdminExpiresAt.getTime(),
      });

      // 5a. Super Admin visits /admin
      const resAdminRoot = await fetch(`${SERVER_URL}/admin`, {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${superAdminToken}` },
      });
      const isSuperAdminRoot200 = resAdminRoot.status === 200;
      recordTest(
        "Track 5",
        "Super Admin Access to /admin",
        isSuperAdminRoot200,
        `Status: ${resAdminRoot.status}`
      );

      // 5b. Super Admin visits /admin/users
      const resAdminUsers = await fetch(`${SERVER_URL}/admin/users`, {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${superAdminToken}` },
      });
      const isSuperAdminUsers200 = resAdminUsers.status === 200;
      recordTest(
        "Track 5",
        "Super Admin Access to /admin/users",
        isSuperAdminUsers200,
        `Status: ${resAdminUsers.status}`
      );

      // 5c. Super Admin visits /admin/settings
      const resAdminSettings = await fetch(`${SERVER_URL}/admin/settings`, {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${superAdminToken}` },
      });
      const isSuperAdminSettings200 = resAdminSettings.status === 200;
      recordTest(
        "Track 5",
        "Super Admin Access to /admin/settings",
        isSuperAdminSettings200,
        `Status: ${resAdminSettings.status}`
      );

      // 5d. Super Admin calls /api/admin/audit-logs/export
      const resAuditExport = await fetch(`${SERVER_URL}/api/admin/audit-logs/export`, {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${superAdminToken}` },
      });
      const isAuditExport200 = resAuditExport.status === 200;
      let auditJsonValid = false;
      if (isAuditExport200) {
        const auditData = await resAuditExport.json();
        auditJsonValid = Boolean(auditData.system && Array.isArray(auditData.records));
      }
      recordTest(
        "Track 5",
        "Super Admin Calls /api/admin/audit-logs/export",
        isAuditExport200 && auditJsonValid,
        `Status: ${resAuditExport.status}, Valid JSON Ledger: ${auditJsonValid}`
      );

      // 5e. RBAC Permissions Matrix Check
      const hasUsersManage = hasPermission("super_admin", "users:manage");
      const hasSettingsManage = hasPermission("super_admin", "settings:manage");
      const hasAuditRead = hasPermission("super_admin", "audit:read");
      const hasAllSuperAdminPerms = hasUsersManage && hasSettingsManage && hasAuditRead;
      recordTest(
        "Track 5",
        "RBAC Engine Grants Full Capabilities",
        hasAllSuperAdminPerms,
        `users:manage=${hasUsersManage}, settings:manage=${hasSettingsManage}, audit:read=${hasAuditRead}`
      );

      // Clean up test session
      await db.delete(sessions).where(eq(sessions.id, superAdminSessionId));
    } catch (err: any) {
      recordTest("Track 5", "Super Admin Session Verification", false, `Error: ${err.message}`);
    }
  }

  // -----------------------------------------------------------------------------
  // TRACK 6: Cryptographic Signature Tampering Defense
  // -----------------------------------------------------------------------------
  console.log("\n--- Track 6: Cryptographic Signature Anti-Tampering ---");
  try {
    // Construct forged token: payload claiming super_admin role, but signed with bogus key
    const forgedPayload = {
      sid: "ses_forged_fake_id",
      uid: "usr_attacker",
      email: "attacker@malicious.com",
      name: "Malicious Actor",
      role: "super_admin",
      exp: Date.now() + 3600000,
    };
    const forgedB64 = Buffer.from(JSON.stringify(forgedPayload), "utf-8").toString("base64url");
    const fakeSignature = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
    const forgedCookieValue = `ses_forged_fake_id.${forgedB64}.${fakeSignature}`;

    const resForged = await fetch(`${SERVER_URL}/admin/users`, {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${forgedCookieValue}` },
      redirect: "manual",
    });

    const isForgedBlocked = resForged.status === 307 || resForged.status === 302;
    const forgedLocation = resForged.headers.get("location") || "";
    const isRedirectToLogin = forgedLocation.includes("/admin/login");

    recordTest(
      "Track 6",
      "Tampered Signature Rejected by Middleware",
      isForgedBlocked && isRedirectToLogin,
      `Status: ${resForged.status}, Redirect: ${forgedLocation}`
    );
  } catch (err: any) {
    recordTest("Track 6", "Tampering Test Execution", false, `Error: ${err.message}`);
  }

  // -----------------------------------------------------------------------------
  // TRACK 7: Login Rate Limiting & Account Lockout
  // -----------------------------------------------------------------------------
  console.log("\n--- Track 7: Login Rate Limiting & Lockout Guard ---");
  try {
    const testIp = `192.0.2.${Math.floor(Math.random() * 200) + 10}`;
    const testEmail = `probe_${Date.now()}@test.kngc.edu`;

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await recordLoginAttempt(testIp, testEmail, false);
    }

    // 6th attempt should be blocked by rate limiter
    const rateLimitCheck = await checkLoginRateLimit(testIp, testEmail);
    const isLockoutEngaged = !rateLimitCheck.allowed && rateLimitCheck.retryAfterSeconds > 0;

    recordTest(
      "Track 7",
      "Consecutive Failed Logins Trigger Lockout",
      isLockoutEngaged,
      `Allowed: ${rateLimitCheck.allowed}, RetryAfter: ${rateLimitCheck.retryAfterSeconds}s`
    );
  } catch (err: any) {
    recordTest("Track 7", "Rate Limiting Verification", false, `Error: ${err.message}`);
  }

  // -----------------------------------------------------------------------------
  // TRACK 8: Immutable Audit Trail Integrity
  // -----------------------------------------------------------------------------
  console.log("\n--- Track 8: Audit Trail Integrity ---");
  const provisionAudit = await db
    .select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.userEmail, TARGET_SUPER_ADMIN_EMAIL),
        eq(auditLogs.action, "SUPER_ADMIN_PROVISIONED")
      )
    )
    .get();

  const auditRecorded = Boolean(provisionAudit);
  recordTest(
    "Track 8",
    "SUPER_ADMIN_PROVISIONED Audit Record Present",
    auditRecorded,
    auditRecorded ? `Audit ID: ${provisionAudit?.id}, Timestamp: ${provisionAudit?.createdAt}` : "No audit entry found"
  );

  const resetTokenRecord = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, targetUser?.id || ""))
    .get();

  const tokenPresent = Boolean(resetTokenRecord);
  recordTest(
    "Track 8",
    "Activation / Password Reset Token Generated",
    tokenPresent,
    tokenPresent ? `Token ID: ${resetTokenRecord?.id}, Expires: ${resetTokenRecord?.expiresAt}` : "No token found"
  );

  // -----------------------------------------------------------------------------
  // Summary Report
  // -----------------------------------------------------------------------------
  console.log("\n==================================================================");
  console.log("TEST SUITE SUMMARY REPORT");
  console.log("==================================================================");
  const total = testResults.length;
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Verification Checks: ${total}`);
  console.log(`Passed Checks:             ${passedCount}`);
  console.log(`Failed Checks:             ${failedCount}`);
  console.log(`Compliance Score:          ${Math.round((passedCount / total) * 100)}%`);
  console.log("==================================================================\n");

  if (failedCount > 0) {
    console.error("FAILED VERIFICATION CHECKS:");
    for (const res of testResults.filter((r) => !r.passed)) {
      console.error(` - [${res.track}] ${res.testName}: ${res.details}`);
    }
    process.exit(1);
  } else {
    console.log("ALL TESTS PASSED SUCCESSFULLY. Super Admin setup is hardened and verified.");
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
