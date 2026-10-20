/**
 * DEVELOPER NOTE:
 * File: scripts/admin-set-password.ts
 * Purpose: Secure CLI tool to safely provision or rotate administrator passwords.
 * Command: pnpm admin:set-password [email] [newPassword]
 * 
 * SECURITY MANDATE:
 * - Validates institutional password complexity (min 8 chars, uppercase, lowercase, digit, symbol).
 * - Hashes password using bcrypt with 12 salt rounds before database persistence.
 * - Never stores or logs plaintext passwords.
 * - Immediately invalidates all active sessions for the target administrator.
 * - Neutralizes any legacy leaked credential hashes in the database.
 * - Records an immutable security audit event in `audit_logs`.
 * - Strictly zero AI emojis.
 */

import { sqlite, db } from "../src/lib/db";
import { users, sessions, auditLogs } from "../src/lib/db/schema";
import { hashPassword, validatePasswordStrength, verifyPassword } from "../src/lib/auth/password";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function main() {
  const args = process.argv.slice(2);
  const targetEmail = (
    args[0] ||
    process.env.ADMIN_EMAIL ||
    process.env.INITIAL_ADMIN_EMAIL ||
    "arabicclubkngc2025@gmail.com"
  ).toLowerCase().trim();

  const newPassword =
    args[1] ||
    process.env.ADMIN_PASSWORD ||
    process.env.INITIAL_ADMIN_PASSWORD;

  if (!newPassword) {
    console.error("==================================================================");
    console.error("ERROR: No password provided!");
    console.error("Usage: pnpm admin:set-password <email> <new_password>");
    console.error("Or set environment variable: ADMIN_PASSWORD='...'");
    console.error("==================================================================");
    process.exit(1);
  }

  // 1. Validate password complexity
  const strength = validatePasswordStrength(newPassword);
  if (!strength.isValid) {
    console.error("==================================================================");
    console.error("SECURITY ERROR: Password does not meet institutional requirements:");
    for (const err of strength.errors) {
      console.error(`- ${err}`);
    }
    console.error("==================================================================");
    process.exit(1);
  }

  console.log("==================================================================");
  console.log(`[Admin Password Manager] Targeting account: ${targetEmail}`);
  console.log("==================================================================");

  const now = new Date();
  const passwordHash = hashPassword(newPassword);

  // 2. Query user record
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, targetEmail))
    .get();

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    await db
      .update(users)
      .set({
        passwordHash,
        isActive: true,
        role: "super_admin",
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    console.log(`[Admin Password Manager] Successfully updated password for existing administrator: ${targetEmail}`);
  } else {
    userId = `usr_${crypto.randomBytes(12).toString("hex")}`;
    await db.insert(users).values({
      id: userId,
      email: targetEmail,
      fullName: "Super Administrator (Kabi Nazrul Government College)",
      passwordHash,
      role: "super_admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`[Admin Password Manager] Successfully created new administrator: ${targetEmail} (ID: ${userId})`);
  }

  // 3. Invalidate all active sessions for this user (force re-login)
  const revokedSessions = await db
    .delete(sessions)
    .where(eq(sessions.userId, userId));
  console.log(`[Admin Password Manager] Revoked all active sessions for ${targetEmail}.`);

  // 4. Invalidate any legacy accounts still containing old leaked hashes
  const allUsers = await db.select().from(users).all();
  let neutralizedCount = 0;
  for (const u of allUsers) {
    if (u.id !== userId && u.passwordHash) {
      const isOldPasswordMatch = verifyPassword("AdminSecure2026!", u.passwordHash);
      if (isOldPasswordMatch) {
        // Replace with an unguessable randomized hash and deactivate
        const dummyHash = hashPassword(crypto.randomBytes(32).toString("hex") + "!Aa1");
        await db
          .update(users)
          .set({
            passwordHash: dummyHash,
            isActive: false,
            updatedAt: now,
          })
          .where(eq(users.id, u.id));
        await db.delete(sessions).where(eq(sessions.userId, u.id));
        neutralizedCount++;
      }
    }
  }

  if (neutralizedCount > 0) {
    console.log(`[Admin Password Manager] Neutralized ${neutralizedCount} legacy accounts with obsolete leaked password.`);
  }

  // 5. Record immutable audit log
  await db.insert(auditLogs).values({
    id: `aud_${crypto.randomBytes(12).toString("hex")}`,
    userId,
    userEmail: targetEmail,
    action: "ADMIN_PASSWORD_UPDATED_CLI",
    targetEntity: "users",
    targetId: userId,
    details: JSON.stringify({
      email: targetEmail,
      method: "CLI_SAFE_ROTATION",
      timestamp: now.toISOString(),
    }),
    ipAddress: "127.0.0.1",
    userAgent: "CLI admin:set-password",
    createdAt: now,
  });

  console.log("[Admin Password Manager] Audit trail entry recorded successfully.");
  console.log("==================================================================");
  console.log("SUCCESS: Master administrative password successfully updated!");
  console.log("You may now log in at /admin/login with your new credentials.");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("[Admin Password Manager] Fatal error:", err);
  process.exit(1);
});
