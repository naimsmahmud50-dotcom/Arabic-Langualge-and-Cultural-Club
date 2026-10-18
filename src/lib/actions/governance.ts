/**
 * @file src/lib/actions/governance.ts
 * @description Secure Server Actions for System Governance, Users, Settings & Backups.
 * 
 * ARCHITECTURE & ROLE:
 * - Implements least-privilege server-side authorization checks for all administrative mutations.
 * - Enforces anti-self-lockout and anti-privilege-escalation boundaries.
 * - Validates institutional email, social media URLs, and SEO canonical links.
 * - Protects secrets from public exposure.
 * - Records cryptographically traceable events into the immutable `audit_logs` ledger.
 * - Meets Requirements REQ-ADM-11, REQ-ADM-12, REQ-ADM-13, and REQ-ADM-14.
 */

"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/session";
import { assertPermission } from "../auth/rbac";
import { recordAuditLog } from "../auth/audit";
import { validatePasswordStrength, hashPassword, verifyPassword } from "../auth/password";
import {
  updateSiteSettings,
  updateUserRole,
  updateUserStatus,
  getUserById,
  updateUserPassword,
  SiteSettingEntry,
} from "../db/queries";
import { createDatabaseBackup } from "../utils/db-backup";
import { Role, ActionResponse } from "../auth/types";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Validates a URL ensuring it is a well-formed http/https URI.
 */
function isValidUrl(val: string): boolean {
  if (!val || val.trim() === "") return true;
  try {
    const url = new URL(val.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates an email address.
 */
function isValidEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Persists institutional identity, contact coordinates, social media, and SEO configuration.
 */
export async function saveSiteSettingsAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized: Active administrative session required." };
  }

  try {
    assertPermission(session.role, "settings:manage");

    const getField = (name: string): string => (formData.get(name) as string || "").trim();

    const contactEmail = getField("contact_email");
    if (contactEmail && !isValidEmail(contactEmail)) {
      return { success: false, message: "Invalid email format for official contact email." };
    }

    // Social and canonical URL validation
    const urlsToValidate = [
      { name: "Facebook Link", value: getField("social_facebook") },
      { name: "YouTube Link", value: getField("social_youtube") },
      { name: "Twitter / X Link", value: getField("social_twitter") },
      { name: "Instagram Link", value: getField("social_instagram") },
      { name: "LinkedIn Link", value: getField("social_linkedin") },
      { name: "Canonical URL", value: getField("canonical_url") },
      { name: "OpenGraph Image URL", value: getField("og_image_url") },
    ];

    for (const item of urlsToValidate) {
      if (item.value && !isValidUrl(item.value)) {
        return { success: false, message: `Invalid URL format for ${item.name}: Must begin with http:// or https://` };
      }
    }

    const entries: SiteSettingEntry[] = [
      // General Identity
      { key: "club_name", valueEn: getField("club_name_en"), valueAr: getField("club_name_ar"), category: "general" },
      { key: "club_tagline", valueEn: getField("club_tagline_en"), valueAr: getField("club_tagline_ar"), category: "general" },
      { key: "club_motto", valueEn: getField("club_motto_en"), valueAr: getField("club_motto_ar"), category: "general" },
      // Contact Coordinates
      { key: "contact_email", valueEn: contactEmail, valueAr: contactEmail, category: "contact" },
      { key: "contact_phone", valueEn: getField("contact_phone"), valueAr: getField("contact_phone"), category: "contact" },
      { key: "headquarters_address", valueEn: getField("headquarters_address_en"), valueAr: getField("headquarters_address_ar"), category: "contact" },
      { key: "office_hours", valueEn: getField("office_hours_en"), valueAr: getField("office_hours_ar"), category: "contact" },
      // Social Media
      { key: "social_facebook", valueEn: getField("social_facebook"), valueAr: getField("social_facebook"), category: "social" },
      { key: "social_youtube", valueEn: getField("social_youtube"), valueAr: getField("social_youtube"), category: "social" },
      { key: "social_twitter", valueEn: getField("social_twitter"), valueAr: getField("social_twitter"), category: "social" },
      { key: "social_instagram", valueEn: getField("social_instagram"), valueAr: getField("social_instagram"), category: "social" },
      { key: "social_linkedin", valueEn: getField("social_linkedin"), valueAr: getField("social_linkedin"), category: "social" },
      // SEO & Meta
      { key: "meta_description", valueEn: getField("meta_description_en"), valueAr: getField("meta_description_ar"), category: "seo" },
      { key: "meta_keywords", valueEn: getField("meta_keywords"), valueAr: getField("meta_keywords"), category: "seo" },
      { key: "canonical_url", valueEn: getField("canonical_url"), valueAr: getField("canonical_url"), category: "seo" },
      { key: "og_image_url", valueEn: getField("og_image_url"), valueAr: getField("og_image_url"), category: "seo" },
      // Theme and Localization Defaults
      { key: "theme_default", valueEn: getField("theme_default") || "system", valueAr: getField("theme_default") || "system", category: "theme" },
      { key: "language_default", valueEn: getField("language_default") || "en", valueAr: getField("language_default") || "en", category: "locale" },
    ];

    await updateSiteSettings(entries);

    // Record Immutable Audit Log
    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "SITE_SETTINGS_UPDATE",
      targetEntity: "site_settings",
      targetId: "global_configuration",
      details: {
        updatedKeys: entries.map((e) => e.key),
        timestamp: new Date().toISOString(),
      },
    });

    // Revalidate affected routes
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Institutional configuration, contact details, and SEO parameters saved successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update institutional site settings.",
    };
  }
}

/**
 * Toggles an administrative user's active status with strict anti-self-lockout rules.
 */
export async function updateUserStatusAction(
  targetUserId: string,
  isActive: boolean
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized: Active session required." };
  }

  try {
    assertPermission(session.role, "users:manage");

    // Anti-self-lockout protection
    if (session.id === targetUserId) {
      return {
        success: false,
        message: "Security Violation: Administrators cannot suspend their own active account.",
      };
    }

    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      return { success: false, message: "Target user record not found." };
    }

    // If suspending a Super Admin, verify at least one other active Super Admin exists
    if (targetUser.role === "super_admin" && !isActive) {
      const activeSuperAdmins = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.role, "super_admin"), eq(users.isActive, true)));

      if (activeSuperAdmins.length <= 1) {
        return {
          success: false,
          message: "Governance Safeguard: Cannot suspend the only remaining active Super Administrator.",
        };
      }
    }

    await updateUserStatus(targetUserId, isActive);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "USER_STATUS_UPDATE",
      targetEntity: "users",
      targetId: targetUserId,
      details: {
        targetEmail: targetUser.email,
        newStatus: isActive ? "active" : "suspended",
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User account for ${targetUser.fullName} ${isActive ? "activated" : "suspended"} successfully.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update user account status.",
    };
  }
}

/**
 * Modifies an administrative user's assigned role with anti-privilege-escalation enforcement.
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: Role
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized: Active session required." };
  }

  try {
    assertPermission(session.role, "users:manage");

    // Only existing super_admin can assign super_admin
    if (newRole === "super_admin" && session.role !== "super_admin") {
      return {
        success: false,
        message: "Privilege Escalation Blocked: Only Super Administrators can grant the Super Admin role.",
      };
    }

    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      return { success: false, message: "Target user record not found." };
    }

    // Anti-self-demotion if sole super_admin
    if (session.id === targetUserId && targetUser.role === "super_admin" && newRole !== "super_admin") {
      const activeSuperAdmins = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.role, "super_admin"), eq(users.isActive, true)));

      if (activeSuperAdmins.length <= 1) {
        return {
          success: false,
          message: "Governance Safeguard: Cannot demote yourself while you are the sole active Super Administrator.",
        };
      }
    }

    await updateUserRole(targetUserId, newRole);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "USER_ROLE_UPDATE",
      targetEntity: "users",
      targetId: targetUserId,
      details: {
        targetEmail: targetUser.email,
        previousRole: targetUser.role,
        assignedRole: newRole,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `Assigned role for ${targetUser.fullName} updated to ${newRole}.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update user role.",
    };
  }
}

/**
 * Self-service and administrative password update with Scrypt hashing and complexity verification.
 */
export async function changeUserPasswordAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized: Active session required." };
  }

  try {
    const targetUserId = (formData.get("userId") as string || session.id).trim();
    const currentPassword = (formData.get("currentPassword") as string || "").trim();
    const newPassword = (formData.get("newPassword") as string || "").trim();
    const confirmPassword = (formData.get("confirmPassword") as string || "").trim();

    const isSelf = session.id === targetUserId;

    // If changing someone else's password, must possess users:manage
    if (!isSelf) {
      assertPermission(session.role, "users:manage");
    }

    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      return { success: false, message: "Target user account not found." };
    }

    // Verify current password if self-updating
    if (isSelf) {
      if (!currentPassword) {
        return { success: false, message: "Current password is required to verify your identity." };
      }
      const isCurrentValid = verifyPassword(currentPassword, targetUser.passwordHash);
      if (!isCurrentValid) {
        return { success: false, message: "Verification Failed: Current password is incorrect." };
      }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: "Password Mismatch: New password and confirmation do not match." };
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return { success: false, message: validation.errors[0] || "Password does not meet institutional complexity standards." };
    }

    const newHash = hashPassword(newPassword);
    await updateUserPassword(targetUserId, newHash);

    // Record audit trail (never logs password content)
    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "USER_PASSWORD_CHANGE",
      targetEntity: "users",
      targetId: targetUserId,
      details: {
        isSelfUpdate: isSelf,
        targetEmail: targetUser.email,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: isSelf
        ? "Your password has been securely updated."
        : `Password for ${targetUser.fullName} has been updated.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update password.",
    };
  }
}

/**
 * Generates an authoritative database snapshot with cryptographic SHA256 integrity verification.
 */
export async function generateDatabaseBackupAction(): Promise<ActionResponse & { backup?: any }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized: Active session required." };
  }

  try {
    assertPermission(session.role, "settings:manage");

    const backupResult = await createDatabaseBackup();

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "DATABASE_BACKUP_GENERATED",
      targetEntity: "database",
      targetId: backupResult.filename,
      details: {
        filename: backupResult.filename,
        sizeBytes: backupResult.sizeBytes,
        checksumSha256: backupResult.checksumSha256,
        tableCounts: backupResult.tableCounts,
      },
    });

    revalidatePath("/admin/settings");

    return {
      success: true,
      message: `Verified snapshot ${backupResult.filename} generated (${(backupResult.sizeBytes / 1024).toFixed(1)} KB) with SHA-256 integrity hash.`,
      backup: backupResult,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to generate database backup.",
    };
  }
}
