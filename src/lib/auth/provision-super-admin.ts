/**
 * DEVELOPER NOTE:
 * @file src/lib/auth/provision-super-admin.ts
 * @description Secure Provisioning Engine for Official Super Administrator Account.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Club: Arabic Language & Cultural Club
 * - Target Super Admin: arabicclubkngc2025@gmail.com
 * 
 * ARCHITECTURE & DEFENSE IN DEPTH:
 * - Server-controlled provisioning: Creates or verifies the institutional Super Administrator.
 * - Idempotent: Can be run multiple times safely without duplicate entries or data destruction.
 * - Password Security: Hashes passwords using Scrypt (N=16384, r=8, p=1, keylen=64).
 * - Activation Workflow: Generates a high-entropy activation / password-reset token in `password_reset_tokens`.
 * - Preservation Policy: Preserves existing accounts (e.g. admin@arabicclub.org) to prevent lockouts.
 * - Audit Trail: Records immutable audit entry in `audit_logs`.
 * - Zero AI Emojis: Maintains clean, dignified academic logging format.
 */

import crypto from "crypto";
import { db } from "../db";
import { users, passwordResetTokens } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, validatePasswordStrength } from "./password";
import { recordAuditLog } from "./audit";

export interface ProvisionOptions {
  email?: string;
  fullName?: string;
  initialPassword?: string;
  forceResetToken?: boolean;
}

export interface ProvisionResult {
  success: boolean;
  isNewUser: boolean;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  activationToken?: string;
  activationUrl?: string;
  temporaryPassword?: string;
  message: string;
}

const DEFAULT_SUPER_ADMIN_EMAIL = "arabicclubkngc2025@gmail.com";
const DEFAULT_SUPER_ADMIN_NAME = "Lead Super Administrator (Kabi Nazrul Government College)";

/**
 * Generates a high-entropy secure temporary password matching institutional complexity rules.
 */
function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
  let pwd = "Kngc"; // Institutional prefix
  const randomBytes = crypto.randomBytes(16);
  for (let i = 0; i < 16; i++) {
    pwd += chars[randomBytes[i] % chars.length];
  }
  pwd += "2026!"; // Suffix guaranteeing special character and digits
  return pwd;
}

/**
 * Provisions or verifies the official Super Administrator account.
 */
export async function provisionSuperAdmin(options: ProvisionOptions = {}): Promise<ProvisionResult> {
  const email = (options.email || process.env.INITIAL_ADMIN_EMAIL || DEFAULT_SUPER_ADMIN_EMAIL).toLowerCase().trim();
  const fullName = (options.fullName || DEFAULT_SUPER_ADMIN_NAME).trim();
  const now = new Date();

  console.log(`[Super Admin Provisioning] Checking user account for: ${email}`);

  // 1. Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existingUser) {
    console.log(`[Super Admin Provisioning] Account already exists (ID: ${existingUser.id}, Role: ${existingUser.role}, Active: ${existingUser.isActive})`);

    // Ensure user has super_admin role and isActive = true
    let needsUpdate = false;
    const updates: Partial<typeof users.$inferInsert> = { updatedAt: now };

    if (existingUser.role !== "super_admin") {
      updates.role = "super_admin";
      needsUpdate = true;
    }
    if (!existingUser.isActive) {
      updates.isActive = true;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await db.update(users).set(updates).where(eq(users.id, existingUser.id));
      console.log(`[Super Admin Provisioning] Updated existing user ${email} to role 'super_admin' and active status.`);
    }

    // Generate fresh activation/reset token if requested or if forced
    let activationToken: string | undefined;
    let activationUrl: string | undefined;

    if (options.forceResetToken) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

      const tokenId = `tok_${crypto.randomBytes(12).toString("hex")}`;
      await db.insert(passwordResetTokens).values({
        id: tokenId,
        userId: existingUser.id,
        tokenHash,
        expiresAt,
        createdAt: now,
      });

      activationToken = rawToken;
      activationUrl = `/admin/reset-password?token=${rawToken}`;
      console.log(`[Super Admin Provisioning] Generated new password reset token for existing account.`);
    }

    // Record audit log
    await recordAuditLog({
      userId: existingUser.id,
      userEmail: email,
      action: "SUPER_ADMIN_VERIFIED",
      targetEntity: "users",
      targetId: existingUser.id,
      details: {
        email,
        role: "super_admin",
        roleUpdated: needsUpdate,
      },
      ipAddress: "127.0.0.1",
    });

    return {
      success: true,
      isNewUser: false,
      userId: existingUser.id,
      email: existingUser.email,
      fullName: existingUser.fullName,
      role: "super_admin",
      activationToken,
      activationUrl,
      message: `Super Admin account '${email}' is confirmed active with role 'super_admin'.`,
    };
  }

  // 2. Provision new Super Admin account
  console.log(`[Super Admin Provisioning] Account '${email}' does not exist. Creating new institutional record...`);

  const initialPassword = options.initialPassword || process.env.INITIAL_ADMIN_PASSWORD || generateSecurePassword();

  const strengthCheck = validatePasswordStrength(initialPassword);
  if (!strengthCheck.isValid) {
    throw new Error(`Initial password does not satisfy security complexity: ${strengthCheck.errors.join(", ")}`);
  }

  const newUserId = `usr_kngc_superadmin`;
  const passwordHash = hashPassword(initialPassword);

  await db.insert(users).values({
    id: newUserId,
    email,
    passwordHash,
    fullName,
    role: "super_admin",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // 3. Generate activation token in passwordResetTokens
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours for initial setup

  const tokenId = `tok_${crypto.randomBytes(12).toString("hex")}`;
  await db.insert(passwordResetTokens).values({
    id: tokenId,
    userId: newUserId,
    tokenHash,
    expiresAt,
    createdAt: now,
  });

  // 4. Record immutable audit log
  await recordAuditLog({
    userId: newUserId,
    userEmail: email,
    action: "SUPER_ADMIN_PROVISIONED",
    targetEntity: "users",
    targetId: newUserId,
    details: {
      email,
      role: "super_admin",
      fullName,
      provisionType: "system_cli",
    },
    ipAddress: "127.0.0.1",
  });

  console.log(`[Super Admin Provisioning] Successfully provisioned Super Admin '${email}' (ID: ${newUserId}).`);

  return {
    success: true,
    isNewUser: true,
    userId: newUserId,
    email,
    fullName,
    role: "super_admin",
    temporaryPassword: initialPassword,
    activationToken: rawToken,
    activationUrl: `/admin/reset-password?token=${rawToken}`,
    message: `Super Admin account '${email}' successfully created with role 'super_admin'.`,
  };
}

// Direct CLI Execution handler
if (process.argv[1]?.endsWith("provision-super-admin.ts") || process.argv[1]?.endsWith("provision-super-admin.js")) {
  provisionSuperAdmin({ forceResetToken: true })
    .then((result) => {
      console.log("\n==================================================================");
      console.log("SUPER ADMINISTRATOR PROVISIONING REPORT");
      console.log("==================================================================");
      console.log(`Status:              ${result.success ? "SUCCESS" : "FAILED"}`);
      console.log(`Action:              ${result.isNewUser ? "Account Created" : "Account Verified"}`);
      console.log(`User ID:             ${result.userId}`);
      console.log(`Email Address:       ${result.email}`);
      console.log(`Assigned Role:       ${result.role}`);
      console.log(`Full Name:           ${result.fullName}`);
      if (result.temporaryPassword) {
        console.log(`Initial Password:    ${result.temporaryPassword}`);
      }
      if (result.activationUrl) {
        console.log(`Activation Link:     ${result.activationUrl}`);
      }
      console.log("==================================================================\n");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Super Admin Provisioning Error]:", err);
      process.exit(1);
    });
}
