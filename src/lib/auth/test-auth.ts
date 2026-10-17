/**
 * @file src/lib/auth/test-auth.ts
 * @description Comprehensive Automated Verification Suite for Authentication & RBAC.
 * 
 * VERIFIES:
 * 1. Scrypt password hashing, constant-time verification, and complexity checks.
 * 2. Brute-force rate limiting and sliding window lockout.
 * 3. Least-privilege RBAC permission matrix across all 5 institutional roles.
 * 4. Cryptographic HMAC session token signing, tampering rejection, and expiration.
 * 5. Server-side authorization assertion enforcement.
 * 
 * EXECUTION:
 * pnpm exec tsx src/lib/auth/test-auth.ts
 */

import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import { hasPermission, canAccessRoute, assertPermission, AuthorizationError } from "./rbac";
import { createSignedToken, verifySignedToken, SessionTokenPayload } from "./token";
import { checkLoginRateLimit, recordLoginAttempt } from "./rate-limit";
import { Role } from "./types";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
  }
}

async function runTests() {
  console.log("================================================================");
  console.log("Arabic Club: Authentication & RBAC Verification Suite");
  console.log("================================================================\n");

  // ----------------------------------------------------------------------
  // SUITE 1: Password Security & Scrypt Hashing
  // ----------------------------------------------------------------------
  console.log("[Suite 1] Scrypt Password Hashing & Complexity Validation");

  const rawPassword = "AdminSecure2026!";
  const hash = hashPassword(rawPassword);

  assert(hash.startsWith("scrypt$v1$"), "Password hash format uses scrypt$v1$ prefix");
  assert(verifyPassword(rawPassword, hash) === true, "Verifies authentic password correctly");
  assert(verifyPassword("WrongPassword123!", hash) === false, "Rejects incorrect password");
  assert(verifyPassword("", hash) === false, "Rejects empty password input");

  // Password complexity checks
  const strongResult = validatePasswordStrength("SecurePass2026!");
  assert(strongResult.isValid === true, "Accepts strong password meeting all criteria");

  const weakShort = validatePasswordStrength("Ab1!");
  assert(weakShort.isValid === false, "Rejects password shorter than 8 characters");

  const weakNoNum = validatePasswordStrength("NoNumberPassword!");
  assert(weakNoNum.isValid === false, "Rejects password without numbers");

  const weakNoUpper = validatePasswordStrength("nonumberpassword123!");
  assert(weakNoUpper.isValid === false, "Rejects password without uppercase characters");

  const weakNoSpecial = validatePasswordStrength("NoSpecialChar2026");
  assert(weakNoSpecial.isValid === false, "Rejects password without special symbols");

  // ----------------------------------------------------------------------
  // SUITE 2: Universal Cryptographic HMAC Session Tokens
  // ----------------------------------------------------------------------
  console.log("\n[Suite 2] Universal HMAC Session Tokens & Tampering Defense");

  const payload: SessionTokenPayload = {
    sid: "ses_test_1234567890",
    uid: "usr_superadmin",
    email: "admin@arabicclub.org",
    name: "Lead Systems Administrator",
    role: "super_admin",
    exp: Date.now() + 1000 * 60 * 60, // 1 hour future
  };

  const token = await createSignedToken(payload);
  assert(typeof token === "string" && token.split(".").length === 3, "Creates token in format sid.payload.signature");

  const verified = await verifySignedToken(token);
  assert(verified !== null && verified.sid === payload.sid, "Verifies untampered token successfully");
  assert(verified?.role === "super_admin", "Payload correctly unpacked with authentic role");

  // Tampering Attack 1: Modify payload to escalate role to super_admin
  const parts = token.split(".");
  const tamperedPayload = Buffer.from(
    JSON.stringify({ ...payload, role: "super_admin", email: "hacker@evil.com" }),
    "utf-8"
  ).toString("base64url");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  const tamperedResult = await verifySignedToken(tamperedToken);
  assert(tamperedResult === null, "Rejects token with modified payload (signature mismatch)");

  // Tampering Attack 2: Tamper with HMAC signature
  const forgedToken = `${parts[0]}.${parts[1]}.bad_signature_0000000000000000000000000000000000000000000000000000000000000000`;
  const forgedResult = await verifySignedToken(forgedToken);
  assert(forgedResult === null, "Rejects token with altered HMAC signature");

  // Tampering Attack 3: Expired token
  const expiredPayload: SessionTokenPayload = {
    ...payload,
    exp: Date.now() - 1000 * 60, // 1 minute in the past
  };
  const expiredToken = await createSignedToken(expiredPayload);
  const expiredResult = await verifySignedToken(expiredToken);
  assert(expiredResult === null, "Rejects expired session token");

  // ----------------------------------------------------------------------
  // SUITE 3: Role-Based Access Control (RBAC) & Least Privilege Matrix
  // ----------------------------------------------------------------------
  console.log("\n[Suite 3] Institutional Role-Based Access Control (RBAC) Matrix");

  // 3a. Super Admin
  assert(hasPermission("super_admin", "users:manage"), "Super Admin can manage users");
  assert(hasPermission("super_admin", "settings:manage"), "Super Admin can manage system settings");
  assert(hasPermission("super_admin", "audit:read"), "Super Admin can inspect audit logs");
  assert(hasPermission("super_admin", "pages:manage"), "Super Admin can edit CMS pages");

  // 3b. Administrator (Least Privilege check: cannot manage users or core settings)
  assert(!hasPermission("administrator", "users:manage"), "Administrator CANNOT manage user accounts (Least Privilege)");
  assert(!hasPermission("administrator", "settings:manage"), "Administrator CANNOT change root settings (Least Privilege)");
  assert(hasPermission("administrator", "members:manage"), "Administrator can manage club members");
  assert(hasPermission("administrator", "events:manage"), "Administrator can manage events");
  assert(hasPermission("administrator", "audit:read"), "Administrator can review audit trail");

  // 3c. Content Editor
  assert(hasPermission("content_editor", "pages:manage"), "Content Editor can manage pages");
  assert(hasPermission("content_editor", "news:manage"), "Content Editor can publish news");
  assert(hasPermission("content_editor", "resources:manage"), "Content Editor can curate resources");
  assert(!hasPermission("content_editor", "users:manage"), "Content Editor CANNOT manage users");
  assert(!hasPermission("content_editor", "members:manage"), "Content Editor CANNOT edit members directory");
  assert(!hasPermission("content_editor", "audit:read"), "Content Editor CANNOT inspect audit logs");

  // 3d. Membership Manager
  assert(hasPermission("membership_manager", "applications:manage"), "Membership Manager can process applications");
  assert(hasPermission("membership_manager", "members:manage"), "Membership Manager can manage members");
  assert(!hasPermission("membership_manager", "pages:manage"), "Membership Manager CANNOT edit CMS pages");
  assert(!hasPermission("membership_manager", "events:manage"), "Membership Manager CANNOT schedule events");

  // 3e. Event Manager
  assert(hasPermission("event_manager", "events:manage"), "Event Manager can manage events");
  assert(hasPermission("event_manager", "plans:manage"), "Event Manager can edit annual plan");
  assert(!hasPermission("event_manager", "applications:manage"), "Event Manager CANNOT review membership applications");
  assert(!hasPermission("event_manager", "users:manage"), "Event Manager CANNOT manage users");

  // ----------------------------------------------------------------------
  // SUITE 4: Route-Level Access Enforcement
  // ----------------------------------------------------------------------
  console.log("\n[Suite 4] Route Policy Enforcer & Edge Matcher");

  assert(canAccessRoute("super_admin", "/admin/users"), "Super Admin authorized for /admin/users");
  assert(canAccessRoute("super_admin", "/admin/settings"), "Super Admin authorized for /admin/settings");
  assert(canAccessRoute("super_admin", "/admin/audit-logs"), "Super Admin authorized for /admin/audit-logs");

  assert(!canAccessRoute("content_editor", "/admin/users"), "Content Editor blocked from /admin/users");
  assert(!canAccessRoute("content_editor", "/admin/settings"), "Content Editor blocked from /admin/settings");
  assert(!canAccessRoute("content_editor", "/admin/audit-logs"), "Content Editor blocked from /admin/audit-logs");
  assert(canAccessRoute("content_editor", "/admin/pages"), "Content Editor authorized for /admin/pages");
  assert(canAccessRoute("content_editor", "/admin/news"), "Content Editor authorized for /admin/news");

  assert(!canAccessRoute("membership_manager", "/admin/events"), "Membership Manager blocked from /admin/events");
  assert(canAccessRoute("membership_manager", "/admin/applications"), "Membership Manager authorized for /admin/applications");

  // ----------------------------------------------------------------------
  // SUITE 5: Server-Side Authorization Assertions
  // ----------------------------------------------------------------------
  console.log("\n[Suite 5] Server-Side assertPermission() Exceptions");

  let threwForbidden = false;
  try {
    assertPermission("content_editor", "users:manage");
  } catch (err) {
    if (err instanceof AuthorizationError && err.statusCode === 403) {
      threwForbidden = true;
    }
  }
  assert(threwForbidden, "assertPermission() throws AuthorizationError (403) when permission is missing");

  let allowedNoThrow = true;
  try {
    assertPermission("super_admin", "users:manage");
  } catch {
    allowedNoThrow = false;
  }
  assert(allowedNoThrow, "assertPermission() succeeds silently when permission is possessed");

  // ----------------------------------------------------------------------
  // SUITE 6: Brute-Force Rate Limiting & Lockout
  // ----------------------------------------------------------------------
  console.log("\n[Suite 6] Brute-Force Abuse Protection & Lockout");

  const testIp = `192.168.10.${Math.floor(Math.random() * 200 + 10)}`;
  const testEmail = `victim_${Date.now()}@arabicclub.org`;

  // First 5 failed attempts should be tracked but permitted
  for (let i = 1; i <= 5; i++) {
    const status = await checkLoginRateLimit(testIp, testEmail);
    assert(status.allowed === true, `Attempt ${i} allowed before lockout threshold`);
    await recordLoginAttempt(testIp, testEmail, false);
  }

  // 6th attempt should be locked out
  const lockedStatus = await checkLoginRateLimit(testIp, testEmail);
  assert(lockedStatus.allowed === false, "6th consecutive failed attempt is locked out");
  assert(lockedStatus.retryAfterSeconds > 0, `Lockout specifies retryAfterSeconds (${lockedStatus.retryAfterSeconds}s)`);

  // Unrelated IP should not be locked out
  const otherIpStatus = await checkLoginRateLimit("10.0.0.99", testEmail);
  assert(otherIpStatus.allowed === true, "Unrelated IP is not locked out");

  // ----------------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`RESULTS: ${passedCount} / ${totalCount} tests passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log("================================================================\n");

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
