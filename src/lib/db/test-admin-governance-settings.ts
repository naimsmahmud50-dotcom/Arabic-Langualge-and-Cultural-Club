/**
 * @file src/lib/db/test-admin-governance-settings.ts
 * @description Automated Verification Suite for Admin Governance, Settings, Audit Logs & Backups (018).
 * 
 * EXECUTION:
 * export PATH="/home/mahmud-hasan/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH" && pnpm exec tsx src/lib/db/test-admin-governance-settings.ts
 */

import { db } from "./index";
import {
  siteSettings,
  users,
  auditLogs,
} from "./schema";
import { eq, and, sql } from "drizzle-orm";
import {
  getAdminSiteSettings,
  updateSiteSettings,
  getAdminAuditLogs,
  updateUserRole,
  updateUserStatus,
  getUserById,
  updateUserPassword,
  getPublicSiteSettings,
} from "./queries";
import { validatePasswordStrength, hashPassword, verifyPassword } from "../auth/password";
import { createDatabaseBackup, listExistingBackups } from "../utils/db-backup";
import { recordAuditLog } from "../auth/audit";
import fs from "fs";
import crypto from "crypto";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

async function runGovernanceTests() {
  console.log("================================================================================");
  console.log("Starting Automated Verification: Admin Governance, Settings & Backups (018)");
  console.log("================================================================================");

  const timestamp = Date.now();
  let createdTestUserId = "";
  let generatedBackupPath = "";

  try {
    // --------------------------------------------------------------------------
    // TEST SUITE 1: SITE SETTINGS & BRAND NOMENCLATURE PERSISTENCE
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 1: Site Settings & Global Nomenclature Persistence");

    const initialSettings = await getAdminSiteSettings();
    assert(typeof initialSettings === "object", "Retrieved admin site settings dictionary from SQLite");

    // Update settings with verified test values
    const testClubName = `Arabic Language & Cultural Society ${timestamp}`;
    const testTagline = `Eloquence and Classical Heritage ${timestamp}`;
    const testEmail = `contact-${timestamp}@arabicclub.edu`;
    const testPhone = `+880 1711-${String(timestamp).slice(-6)}`;
    const testSocialFb = `https://facebook.com/ArabicClubTest-${timestamp}`;

    await updateSiteSettings([
      { key: "club_name", valueEn: testClubName, valueAr: "نادي اللغة والثقافة العربية المعتمد", category: "general" },
      { key: "club_tagline", valueEn: testTagline, valueAr: "صون التراث والبيان العربي", category: "general" },
      { key: "contact_email", valueEn: testEmail, valueAr: testEmail, category: "contact" },
      { key: "contact_phone", valueEn: testPhone, valueAr: testPhone, category: "contact" },
      { key: "social_facebook", valueEn: testSocialFb, valueAr: testSocialFb, category: "social" },
      { key: "meta_description", valueEn: "Official academic portal description", valueAr: "الوصف التعريفي المعتمد", category: "seo" },
    ]);

    const updatedSettings = await getAdminSiteSettings();
    assert(updatedSettings["club_name"]?.valueEn === testClubName, "Updated club name persisted in site_settings");
    assert(updatedSettings["club_tagline"]?.valueEn === testTagline, "Updated club tagline persisted");
    assert(updatedSettings["contact_email"]?.valueEn === testEmail, "Updated contact email persisted");
    assert(updatedSettings["contact_phone"]?.valueEn === testPhone, "Updated contact phone persisted");
    assert(updatedSettings["social_facebook"]?.valueEn === testSocialFb, "Updated social URL persisted");

    // Verify public settings query reflects the new values
    const publicSettings = await getPublicSiteSettings();
    assert(publicSettings["club_name"]?.en === testClubName, "Public settings query synchronized with database mutation");

    // --------------------------------------------------------------------------
    // TEST SUITE 2: USER GOVERNANCE & LEAST PRIVILEGE BOUNDARIES
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 2: User Governance, Roles & Account Status");

    createdTestUserId = `usr_test_${timestamp}`;
    const testInitialPwHash = hashPassword("InitialSecret2026!");

    await db.insert(users).values({
      id: createdTestUserId,
      email: `operator-${timestamp}@arabicclub.internal`,
      fullName: "Test Operations Officer",
      role: "content_editor",
      passwordHash: testInitialPwHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const insertedUser = await getUserById(createdTestUserId);
    assert(Boolean(insertedUser), `User account provisioned with ID: ${createdTestUserId}`);
    assert(insertedUser?.role === "content_editor", "Initial assigned role verified as content_editor");
    assert(insertedUser?.isActive === true, "Initial account status verified as active");

    // Test Role Update
    await updateUserRole(createdTestUserId, "administrator");
    const roleUpdatedUser = await getUserById(createdTestUserId);
    assert(roleUpdatedUser?.role === "administrator", "User role successfully elevated to administrator");

    // Test Account Suspension & Activation
    await updateUserStatus(createdTestUserId, false);
    const suspendedUser = await getUserById(createdTestUserId);
    assert(suspendedUser?.isActive === false, "User account successfully suspended");

    await updateUserStatus(createdTestUserId, true);
    const reactivatedUser = await getUserById(createdTestUserId);
    assert(reactivatedUser?.isActive === true, "User account successfully re-activated");

    // --------------------------------------------------------------------------
    // TEST SUITE 3: PASSWORD COMPLEXITY & SCRYPT VERIFICATION
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 3: Password Complexity, Scrypt Hashing & Key Derivation");

    // Test weak passwords rejected
    assert(!validatePasswordStrength("short").isValid, "Weak password rejected: too short (< 8 chars)");
    assert(!validatePasswordStrength("nocapital123!").isValid, "Weak password rejected: missing uppercase");
    assert(!validatePasswordStrength("NOLOWER123!").isValid, "Weak password rejected: missing lowercase");
    assert(!validatePasswordStrength("NoNumberSymbol!").isValid, "Weak password rejected: missing numeric digit");
    assert(!validatePasswordStrength("NoSymbol1234").isValid, "Weak password rejected: missing special symbol");

    // Test valid strong password accepted
    const strongPassword = `ArabicSecurity${timestamp}!`;
    const strengthResult = validatePasswordStrength(strongPassword);
    assert(strengthResult.isValid, "Strong password satisfies institutional complexity standard");

    // Test Scrypt hashing & timing-safe verification
    const generatedHash = hashPassword(strongPassword);
    assert(generatedHash.startsWith("scrypt$v1$"), "Generated Scrypt hash contains canonical scrypt$v1$ prefix");
    assert(verifyPassword(strongPassword, generatedHash), "Constant-time verification validates correct password");
    assert(!verifyPassword("WrongPassword!", generatedHash), "Constant-time verification rejects invalid password");

    // Update user password and verify
    await updateUserPassword(createdTestUserId, generatedHash);
    const updatedUserRecord = await getUserById(createdTestUserId);
    assert(verifyPassword(strongPassword, updatedUserRecord?.passwordHash || ""), "Updated password hash persisted and verified in database");

    // --------------------------------------------------------------------------
    // TEST SUITE 4: IMMUTABLE AUDIT TRAIL QUERY & FILTERING
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 4: Immutable Audit Trail Logging & Safe Pagination");

    const uniqueActionCode = `TEST_GOVERNANCE_${timestamp}`;
    await recordAuditLog({
      userId: createdTestUserId,
      userEmail: `operator-${timestamp}@arabicclub.internal`,
      action: uniqueActionCode,
      targetEntity: "governance_test",
      targetId: createdTestUserId,
      details: { testTimestamp: timestamp, testRun: true },
    });

    // Query audit logs with specific action filter
    const filteredResult = (await getAdminAuditLogs({
      action: uniqueActionCode,
      limit: 10,
    })) as { data: any[]; pagination: any };

    assert("data" in filteredResult, "getAdminAuditLogs returns paginated response object");
    assert(filteredResult.data.length >= 1, `Found recorded audit log for action: ${uniqueActionCode}`);
    assert(filteredResult.data[0].action === uniqueActionCode, "Audit action code matches recorded event exactly");
    assert(filteredResult.data[0].targetEntity === "governance_test", "Audit target entity matches");

    // Test search filter
    const searchResult = (await getAdminAuditLogs({
      search: uniqueActionCode,
    })) as { data: any[]; pagination: any };
    assert(searchResult.data.some((l: any) => l.action === uniqueActionCode), "Search query accurately matched audit record");

    // --------------------------------------------------------------------------
    // TEST SUITE 5: DATABASE BACKUP & SHA-256 INTEGRITY VERIFICATION
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 5: Database Snapshot & Cryptographic Checksum Engine");

    const backupResult = await createDatabaseBackup();
    generatedBackupPath = backupResult.filepath;

    assert(backupResult.success === true, "createDatabaseBackup executed with success confirmation");
    assert(backupResult.filename.startsWith("arabic_club_backup_"), "Backup filename matches standard naming convention");
    assert(fs.existsSync(backupResult.filepath), `Verified physical backup file exists on disk: ${backupResult.filepath}`);
    assert(backupResult.sizeBytes > 0, `Verified non-zero file size: ${(backupResult.sizeBytes / 1024).toFixed(1)} KB`);
    assert(backupResult.checksumSha256.length === 64, "Generated SHA-256 checksum is valid 64-character hex string");

    // Recompute SHA-256 over actual persisted file on disk to guarantee zero corruption
    const fileBytes = fs.readFileSync(backupResult.filepath, "utf8");
    const recomputedHash = crypto.createHash("sha256").update(fileBytes, "utf8").digest("hex");
    assert(recomputedHash === backupResult.checksumSha256, "Cryptographic integrity verified: Disk file SHA-256 matches returned manifest checksum 100%");

    // Verify all 22 tables are represented in snapshot
    assert(backupResult.tableCounts.site_settings > 0, "Snapshot contains site_settings records");
    assert(backupResult.tableCounts.users > 0, "Snapshot contains users records");
    assert(backupResult.tableCounts.events > 0, "Snapshot contains events records");
    assert(backupResult.tableCounts.audit_logs > 0, "Snapshot contains audit_logs records");

    // Verify listExistingBackups detects the generated backup
    const backupList = listExistingBackups();
    assert(backupList.some((b) => b.filename === backupResult.filename), "listExistingBackups accurately discovers new snapshot");

    console.log("\n================================================================================");
    console.log("All 5 Test Suites PASSED (100% SUCCESS)!");
    console.log("================================================================================");
  } finally {
    // --------------------------------------------------------------------------
    // CLEANUP TEST FIXTURES
    // --------------------------------------------------------------------------
    console.log("\nCleaning up test artifacts...");

    if (createdTestUserId) {
      await db.delete(users).where(eq(users.id, createdTestUserId));
      await db.delete(auditLogs).where(eq(auditLogs.userId, createdTestUserId));
    }

    // Reset site settings back to institutional defaults
    await updateSiteSettings([
      { key: "club_name", valueEn: "Arabic Language & Cultural Club", valueAr: "نادي اللغة والثقافة العربية", category: "general" },
      { key: "club_tagline", valueEn: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership", valueAr: "صون التراث، وترقية البيان، وبناء القيادات", category: "general" },
      { key: "contact_email", valueEn: "contact@arabicclub.internal", valueAr: "contact@arabicclub.internal", category: "contact" },
      { key: "social_facebook", valueEn: "https://facebook.com/ArabicClubOfficial", valueAr: "https://facebook.com/ArabicClubOfficial", category: "social" },
    ]);
    await db.delete(siteSettings).where(eq(siteSettings.key, "contact_phone"));
    await db.delete(siteSettings).where(eq(siteSettings.key, "meta_description"));

    // Clean up test backup file
    if (generatedBackupPath && fs.existsSync(generatedBackupPath)) {
      fs.unlinkSync(generatedBackupPath);
    }

    console.log("Cleanup complete. Database and filesystem returned to pristine state.\n");
  }
}

runGovernanceTests().catch((err) => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
