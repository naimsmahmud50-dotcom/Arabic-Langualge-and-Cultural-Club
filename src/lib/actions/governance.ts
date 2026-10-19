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

import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { getSession } from "../auth/session";
import { assertPermission } from "../auth/rbac";
import { recordAuditLog } from "../auth/audit";
import { validatePasswordStrength, hashPassword, verifyPassword } from "../auth/password";
import {
  getAdminSiteSettings,
  updateSiteSettings,
  updateUserRole,
  updateUserStatus,
  getUserById,
  updateUserPassword,
  SiteSettingEntry,
} from "../db/queries";
import { siteSettingsSchema } from "../validations/settings";
import { createDatabaseBackup } from "../utils/db-backup";
import { Role, ActionResponse } from "../auth/types";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Persists institutional identity, contact coordinates, social media, and SEO configuration.
 * DEFENSIVE PARTIAL UPDATE (034-fix-site-settings-wipe-bug):
 * - Checks `formData.has()` for every field so missing tab inputs never overwrite existing values.
 * - Validates input using strict Zod schema before database mutation.
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

    // 1. Extract only explicitly submitted keys from FormData
    const submittedRaw: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        submittedRaw[key] = value.trim();
      }
    }

    // 2. Validate submitted fields via Zod schema
    const validationResult = siteSettingsSchema.safeParse(submittedRaw);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      return {
        success: false,
        message: firstIssue ? firstIssue.message : "Validation error in submitted settings.",
      };
    }
    const validData = validationResult.data;

    // 3. Retrieve current settings map to preserve unsubmitted paired language values
    const currentSettings = await getAdminSiteSettings();

    // 4. Build entries defensively ONLY for fields that were submitted in formData
    const entries: SiteSettingEntry[] = [];

    // General Identity & Institutional Brand
    if (formData.has("club_name_en") || formData.has("club_name_ar")) {
      entries.push({
        key: "club_name",
        valueEn: formData.has("club_name_en") ? (validData.club_name_en ?? "") : (currentSettings["club_name"]?.valueEn ?? ""),
        valueAr: formData.has("club_name_ar") ? (validData.club_name_ar ?? "") : (currentSettings["club_name"]?.valueAr ?? ""),
        category: "general",
      });
    }

    if (formData.has("club_short_name_en") || formData.has("club_short_name_ar")) {
      entries.push({
        key: "club_short_name",
        valueEn: formData.has("club_short_name_en") ? (validData.club_short_name_en ?? "") : (currentSettings["club_short_name"]?.valueEn ?? ""),
        valueAr: formData.has("club_short_name_ar") ? (validData.club_short_name_ar ?? "") : (currentSettings["club_short_name"]?.valueAr ?? ""),
        category: "general",
      });
    }

    if (formData.has("college_name_en") || formData.has("college_name_ar")) {
      entries.push({
        key: "college_name",
        valueEn: formData.has("college_name_en") ? (validData.college_name_en ?? "") : (currentSettings["college_name"]?.valueEn ?? ""),
        valueAr: formData.has("college_name_ar") ? (validData.college_name_ar ?? "") : (currentSettings["college_name"]?.valueAr ?? ""),
        category: "general",
      });
    }

    if (formData.has("club_tagline_en") || formData.has("club_tagline_ar")) {
      entries.push({
        key: "club_tagline",
        valueEn: formData.has("club_tagline_en") ? (validData.club_tagline_en ?? "") : (currentSettings["club_tagline"]?.valueEn ?? ""),
        valueAr: formData.has("club_tagline_ar") ? (validData.club_tagline_ar ?? "") : (currentSettings["club_tagline"]?.valueAr ?? ""),
        category: "general",
      });
    }

    if (formData.has("club_motto_en") || formData.has("club_motto_ar")) {
      entries.push({
        key: "club_motto",
        valueEn: formData.has("club_motto_en") ? (validData.club_motto_en ?? "") : (currentSettings["club_motto"]?.valueEn ?? ""),
        valueAr: formData.has("club_motto_ar") ? (validData.club_motto_ar ?? "") : (currentSettings["club_motto"]?.valueAr ?? ""),
        category: "general",
      });
    }

    if (formData.has("founding_year")) {
      const yrVal = validData.founding_year ?? "";
      entries.push({
        key: "founding_year",
        valueEn: yrVal,
        valueAr: yrVal,
        category: "general",
      });
    }

    if (formData.has("logo_crest_url")) {
      const crestVal = validData.logo_crest_url ?? "";
      entries.push({
        key: "logo_crest_url",
        valueEn: crestVal,
        valueAr: crestVal,
        category: "branding",
      });
    }

    if (formData.has("logo_full_url")) {
      const logoVal = validData.logo_full_url ?? "";
      entries.push({
        key: "logo_full_url",
        valueEn: logoVal,
        valueAr: logoVal,
        category: "branding",
      });
    }

    // Contact Coordinates
    if (formData.has("contact_email")) {
      const emailVal = validData.contact_email ?? "";
      entries.push({
        key: "contact_email",
        valueEn: emailVal,
        valueAr: emailVal,
        category: "contact",
      });
    }

    if (formData.has("contact_phone")) {
      const phoneVal = validData.contact_phone ?? "";
      entries.push({
        key: "contact_phone",
        valueEn: phoneVal,
        valueAr: phoneVal,
        category: "contact",
      });
    }

    if (formData.has("headquarters_address_en") || formData.has("headquarters_address_ar")) {
      entries.push({
        key: "headquarters_address",
        valueEn: formData.has("headquarters_address_en") ? (validData.headquarters_address_en ?? "") : (currentSettings["headquarters_address"]?.valueEn ?? ""),
        valueAr: formData.has("headquarters_address_ar") ? (validData.headquarters_address_ar ?? "") : (currentSettings["headquarters_address"]?.valueAr ?? ""),
        category: "contact",
      });
    }

    if (formData.has("office_hours_en") || formData.has("office_hours_ar")) {
      entries.push({
        key: "office_hours",
        valueEn: formData.has("office_hours_en") ? (validData.office_hours_en ?? "") : (currentSettings["office_hours"]?.valueEn ?? ""),
        valueAr: formData.has("office_hours_ar") ? (validData.office_hours_ar ?? "") : (currentSettings["office_hours"]?.valueAr ?? ""),
        category: "contact",
      });
    }

    // Social Media
    const socialKeys = [
      "social_facebook",
      "social_youtube",
      "social_twitter",
      "social_instagram",
      "social_linkedin",
    ] as const;

    for (const sKey of socialKeys) {
      if (formData.has(sKey)) {
        const val = validData[sKey] ?? "";
        entries.push({
          key: sKey,
          valueEn: val,
          valueAr: val,
          category: "social",
        });
      }
    }

    // SEO & Metadata
    if (formData.has("meta_description_en") || formData.has("meta_description_ar")) {
      entries.push({
        key: "meta_description",
        valueEn: formData.has("meta_description_en") ? (validData.meta_description_en ?? "") : (currentSettings["meta_description"]?.valueEn ?? ""),
        valueAr: formData.has("meta_description_ar") ? (validData.meta_description_ar ?? "") : (currentSettings["meta_description"]?.valueAr ?? ""),
        category: "seo",
      });
    }

    if (formData.has("meta_keywords")) {
      const kwVal = validData.meta_keywords ?? "";
      entries.push({
        key: "meta_keywords",
        valueEn: kwVal,
        valueAr: kwVal,
        category: "seo",
      });
    }

    if (formData.has("canonical_url")) {
      const canVal = validData.canonical_url ?? "";
      entries.push({
        key: "canonical_url",
        valueEn: canVal,
        valueAr: canVal,
        category: "seo",
      });
    }

    if (formData.has("og_image_url")) {
      const ogVal = validData.og_image_url ?? "";
      entries.push({
        key: "og_image_url",
        valueEn: ogVal,
        valueAr: ogVal,
        category: "seo",
      });
    }

    // Navigation & Header CTA
    if (formData.has("navigation_menu")) {
      const navJson = validData.navigation_menu ?? "";
      if (navJson) {
        try {
          JSON.parse(navJson);
        } catch {
          return { success: false, message: "Invalid JSON format for navigation menu." };
        }
      }
      entries.push({
        key: "navigation_menu",
        valueEn: navJson,
        valueAr: navJson,
        category: "navigation",
      });
    }

    if (formData.has("nav_cta_label_en") || formData.has("nav_cta_label_ar")) {
      entries.push({
        key: "nav_cta_label",
        valueEn: formData.has("nav_cta_label_en") ? (validData.nav_cta_label_en ?? "") : (currentSettings["nav_cta_label"]?.valueEn ?? ""),
        valueAr: formData.has("nav_cta_label_ar") ? (validData.nav_cta_label_ar ?? "") : (currentSettings["nav_cta_label"]?.valueAr ?? ""),
        category: "navigation",
      });
    }

    if (formData.has("nav_cta_link")) {
      const linkVal = validData.nav_cta_link ?? "";
      entries.push({
        key: "nav_cta_link",
        valueEn: linkVal,
        valueAr: linkVal,
        category: "navigation",
      });
    }

    // Homepage Hero Section
    if (formData.has("hero_badge_en") || formData.has("hero_badge_ar")) {
      entries.push({
        key: "hero_badge",
        valueEn: formData.has("hero_badge_en") ? (validData.hero_badge_en ?? "") : (currentSettings["hero_badge"]?.valueEn ?? ""),
        valueAr: formData.has("hero_badge_ar") ? (validData.hero_badge_ar ?? "") : (currentSettings["hero_badge"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_arabic_heading")) {
      const headingVal = validData.hero_arabic_heading ?? "";
      entries.push({
        key: "hero_arabic_heading",
        valueEn: headingVal,
        valueAr: headingVal,
        category: "hero",
      });
    }

    if (formData.has("hero_title_en") || formData.has("hero_title_ar")) {
      entries.push({
        key: "hero_title",
        valueEn: formData.has("hero_title_en") ? (validData.hero_title_en ?? "") : (currentSettings["hero_title"]?.valueEn ?? ""),
        valueAr: formData.has("hero_title_ar") ? (validData.hero_title_ar ?? "") : (currentSettings["hero_title"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_subtitle_en") || formData.has("hero_subtitle_ar")) {
      entries.push({
        key: "hero_subtitle",
        valueEn: formData.has("hero_subtitle_en") ? (validData.hero_subtitle_en ?? "") : (currentSettings["hero_subtitle"]?.valueEn ?? ""),
        valueAr: formData.has("hero_subtitle_ar") ? (validData.hero_subtitle_ar ?? "") : (currentSettings["hero_subtitle"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_bg_image_url")) {
      const bgVal = validData.hero_bg_image_url ?? "";
      entries.push({
        key: "hero_bg_image_url",
        valueEn: bgVal,
        valueAr: bgVal,
        category: "hero",
      });
    }

    if (formData.has("hero_cta_primary_label_en") || formData.has("hero_cta_primary_label_ar")) {
      entries.push({
        key: "hero_cta_primary_label",
        valueEn: formData.has("hero_cta_primary_label_en") ? (validData.hero_cta_primary_label_en ?? "") : (currentSettings["hero_cta_primary_label"]?.valueEn ?? ""),
        valueAr: formData.has("hero_cta_primary_label_ar") ? (validData.hero_cta_primary_label_ar ?? "") : (currentSettings["hero_cta_primary_label"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_cta_primary_link")) {
      const pLink = validData.hero_cta_primary_link ?? "";
      entries.push({
        key: "hero_cta_primary_link",
        valueEn: pLink,
        valueAr: pLink,
        category: "hero",
      });
    }

    if (formData.has("hero_cta_secondary_label_en") || formData.has("hero_cta_secondary_label_ar")) {
      entries.push({
        key: "hero_cta_secondary_label",
        valueEn: formData.has("hero_cta_secondary_label_en") ? (validData.hero_cta_secondary_label_en ?? "") : (currentSettings["hero_cta_secondary_label"]?.valueEn ?? ""),
        valueAr: formData.has("hero_cta_secondary_label_ar") ? (validData.hero_cta_secondary_label_ar ?? "") : (currentSettings["hero_cta_secondary_label"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_cta_secondary_link")) {
      const sLink = validData.hero_cta_secondary_link ?? "";
      entries.push({
        key: "hero_cta_secondary_link",
        valueEn: sLink,
        valueAr: sLink,
        category: "hero",
      });
    }

    if (formData.has("hero_cta_tertiary_label_en") || formData.has("hero_cta_tertiary_label_ar")) {
      entries.push({
        key: "hero_cta_tertiary_label",
        valueEn: formData.has("hero_cta_tertiary_label_en") ? (validData.hero_cta_tertiary_label_en ?? "") : (currentSettings["hero_cta_tertiary_label"]?.valueEn ?? ""),
        valueAr: formData.has("hero_cta_tertiary_label_ar") ? (validData.hero_cta_tertiary_label_ar ?? "") : (currentSettings["hero_cta_tertiary_label"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_cta_tertiary_link")) {
      const tLink = validData.hero_cta_tertiary_link ?? "";
      entries.push({
        key: "hero_cta_tertiary_link",
        valueEn: tLink,
        valueAr: tLink,
        category: "hero",
      });
    }

    if (formData.has("hero_card_title_en") || formData.has("hero_card_title_ar")) {
      entries.push({
        key: "hero_card_title",
        valueEn: formData.has("hero_card_title_en") ? (validData.hero_card_title_en ?? "") : (currentSettings["hero_card_title"]?.valueEn ?? ""),
        valueAr: formData.has("hero_card_title_ar") ? (validData.hero_card_title_ar ?? "") : (currentSettings["hero_card_title"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_card_quote_ar")) {
      const quoteVal = validData.hero_card_quote_ar ?? "";
      entries.push({
        key: "hero_card_quote",
        valueEn: quoteVal,
        valueAr: quoteVal,
        category: "hero",
      });
    }

    if (formData.has("hero_card_desc_en") || formData.has("hero_card_desc_ar")) {
      entries.push({
        key: "hero_card_desc",
        valueEn: formData.has("hero_card_desc_en") ? (validData.hero_card_desc_en ?? "") : (currentSettings["hero_card_desc"]?.valueEn ?? ""),
        valueAr: formData.has("hero_card_desc_ar") ? (validData.hero_card_desc_ar ?? "") : (currentSettings["hero_card_desc"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    if (formData.has("hero_card_badge_en") || formData.has("hero_card_badge_ar")) {
      entries.push({
        key: "hero_card_badge",
        valueEn: formData.has("hero_card_badge_en") ? (validData.hero_card_badge_en ?? "") : (currentSettings["hero_card_badge"]?.valueEn ?? ""),
        valueAr: formData.has("hero_card_badge_ar") ? (validData.hero_card_badge_ar ?? "") : (currentSettings["hero_card_badge"]?.valueAr ?? ""),
        category: "hero",
      });
    }

    // Mission & Pillars
    if (formData.has("mission_badge_en") || formData.has("mission_badge_ar")) {
      entries.push({
        key: "mission_badge",
        valueEn: formData.has("mission_badge_en") ? (validData.mission_badge_en ?? "") : (currentSettings["mission_badge"]?.valueEn ?? ""),
        valueAr: formData.has("mission_badge_ar") ? (validData.mission_badge_ar ?? "") : (currentSettings["mission_badge"]?.valueAr ?? ""),
        category: "mission",
      });
    }

    if (formData.has("mission_title_en") || formData.has("mission_title_ar")) {
      entries.push({
        key: "mission_title",
        valueEn: formData.has("mission_title_en") ? (validData.mission_title_en ?? "") : (currentSettings["mission_title"]?.valueEn ?? ""),
        valueAr: formData.has("mission_title_ar") ? (validData.mission_title_ar ?? "") : (currentSettings["mission_title"]?.valueAr ?? ""),
        category: "mission",
      });
    }

    if (formData.has("mission_subtitle_ar")) {
      const subVal = validData.mission_subtitle_ar ?? "";
      entries.push({
        key: "mission_subtitle",
        valueEn: subVal,
        valueAr: subVal,
        category: "mission",
      });
    }

    if (formData.has("mission_desc_en") || formData.has("mission_desc_ar")) {
      entries.push({
        key: "mission_desc",
        valueEn: formData.has("mission_desc_en") ? (validData.mission_desc_en ?? "") : (currentSettings["mission_desc"]?.valueEn ?? ""),
        valueAr: formData.has("mission_desc_ar") ? (validData.mission_desc_ar ?? "") : (currentSettings["mission_desc"]?.valueAr ?? ""),
        category: "mission",
      });
    }

    // Footer & Legal
    if (formData.has("footer_about_text_en") || formData.has("footer_about_text_ar")) {
      entries.push({
        key: "footer_about_text",
        valueEn: formData.has("footer_about_text_en") ? (validData.footer_about_text_en ?? "") : (currentSettings["footer_about_text"]?.valueEn ?? ""),
        valueAr: formData.has("footer_about_text_ar") ? (validData.footer_about_text_ar ?? "") : (currentSettings["footer_about_text"]?.valueAr ?? ""),
        category: "footer",
      });
    }

    if (formData.has("footer_motto_en") || formData.has("footer_motto_ar")) {
      entries.push({
        key: "footer_motto",
        valueEn: formData.has("footer_motto_en") ? (validData.footer_motto_en ?? "") : (currentSettings["footer_motto"]?.valueEn ?? ""),
        valueAr: formData.has("footer_motto_ar") ? (validData.footer_motto_ar ?? "") : (currentSettings["footer_motto"]?.valueAr ?? ""),
        category: "footer",
      });
    }

    if (formData.has("footer_copyright_en") || formData.has("footer_copyright_ar")) {
      entries.push({
        key: "footer_copyright",
        valueEn: formData.has("footer_copyright_en") ? (validData.footer_copyright_en ?? "") : (currentSettings["footer_copyright"]?.valueEn ?? ""),
        valueAr: formData.has("footer_copyright_ar") ? (validData.footer_copyright_ar ?? "") : (currentSettings["footer_copyright"]?.valueAr ?? ""),
        category: "footer",
      });
    }

    // Theme and Localization Defaults
    if (formData.has("theme_default")) {
      const themeVal = validData.theme_default || "system";
      entries.push({
        key: "theme_default",
        valueEn: themeVal,
        valueAr: themeVal,
        category: "theme",
      });
    }

    if (formData.has("language_default")) {
      const langVal = validData.language_default || "en";
      entries.push({
        key: "language_default",
        valueEn: langVal,
        valueAr: langVal,
        category: "locale",
      });
    }

    if (entries.length === 0) {
      return {
        success: true,
        message: "No configuration changes were submitted.",
      };
    }

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

    // Invalidate cached site settings tag and affected routes
    try {
      (revalidateTag as any)("site-settings", "max");
    } catch {}
    try {
      updateTag("site-settings");
    } catch {}
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/history");
    revalidatePath("/founders");
    revalidatePath("/leadership");
    revalidatePath("/events");
    revalidatePath("/gallery");
    revalidatePath("/resources");
    revalidatePath("/publications");
    revalidatePath("/news");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");

    return {
      success: true,
      message: `Settings saved successfully. (${entries.length} setting${entries.length === 1 ? "" : "s"} updated)`,
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
