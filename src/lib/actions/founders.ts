/**
 * @file src/lib/actions/founders.ts
 * @description Secure Server Actions for Founders & Originators CMS (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages permanent founder profiles, scholar patrons, and origin narratives.
 * - Strict anti-fabrication: validates historical attributes and prevents accidental deletion.
 * - Enforces role-based access control with "committees:manage".
 * - Logs all modifications to immutable audit_logs via recordAuditLog.
 * - Revalidates public /founders page immediately upon changes.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/auth/audit";
import { createFounder, updateFounder, deleteFounder, toggleFounderPublish } from "@/lib/db/queries";

const FounderSchema = z.object({
  id: z.string().optional(),
  nameEn: z.string().min(2, "English name must be at least 2 characters").max(100),
  nameAr: z.string().max(120).optional().nullable(),
  portraitUrl: z.string().refine((val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val), "Valid portrait URL or path required").optional().nullable().or(z.literal("")),
  roleTitleEn: z.string().min(2, "English role title is required").max(100),
  roleTitleAr: z.string().max(120).optional().nullable(),
  bioEn: z.string().max(2000).optional().nullable(),
  bioAr: z.string().max(2000).optional().nullable(),
  foundingYear: z.number().int().min(1900).max(2100).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function saveFounderAction(input: {
  id?: string;
  nameEn: string;
  nameAr?: string | null;
  portraitUrl?: string | null;
  roleTitleEn: string;
  roleTitleAr?: string | null;
  bioEn?: string | null;
  bioAr?: string | null;
  foundingYear?: number | null;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "committees:manage")) {
    return { success: false, error: "Forbidden: You lack 'committees:manage' permissions." };
  }

  const parsed = FounderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    let founderId = parsed.data.id;

    if (founderId) {
      await updateFounder(founderId, {
        nameEn: parsed.data.nameEn,
        nameAr: parsed.data.nameAr,
        portraitUrl: parsed.data.portraitUrl || null,
        roleTitleEn: parsed.data.roleTitleEn,
        roleTitleAr: parsed.data.roleTitleAr,
        bioEn: parsed.data.bioEn,
        bioAr: parsed.data.bioAr,
        foundingYear: parsed.data.foundingYear,
        sortOrder: parsed.data.sortOrder,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "FOUNDER_PROFILE_UPDATE",
        targetEntity: "founders",
        targetId: founderId,
        details: { nameEn: parsed.data.nameEn, adminEmail: session.email },
      });
    } else {
      founderId = await createFounder({
        nameEn: parsed.data.nameEn,
        nameAr: parsed.data.nameAr,
        portraitUrl: parsed.data.portraitUrl || null,
        roleTitleEn: parsed.data.roleTitleEn,
        roleTitleAr: parsed.data.roleTitleAr,
        bioEn: parsed.data.bioEn,
        bioAr: parsed.data.bioAr,
        foundingYear: parsed.data.foundingYear,
        sortOrder: parsed.data.sortOrder,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "FOUNDER_PROFILE_CREATE",
        targetEntity: "founders",
        targetId: founderId,
        details: { nameEn: parsed.data.nameEn, adminEmail: session.email },
      });
    }

    revalidatePath("/admin/founders");
    revalidatePath("/founders");
    revalidatePath("/admin");

    return { success: true, founderId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save founder profile." };
  }
}

export async function deleteFounderAction(founderId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "committees:manage")) {
    return { success: false, error: "Forbidden: You lack 'committees:manage' permissions." };
  }

  try {
    await deleteFounder(founderId);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "FOUNDER_PROFILE_DELETE",
      targetEntity: "founders",
      targetId: founderId,
      details: { founderId, adminEmail: session.email },
    });

    revalidatePath("/admin/founders");
    revalidatePath("/founders");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete founder." };
  }
}

export async function toggleFounderPublishAction(founderId: string, isPublished: boolean) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "committees:manage")) {
    return { success: false, error: "Forbidden: You lack 'committees:manage' permissions." };
  }

  try {
    await toggleFounderPublish(founderId, isPublished);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: isPublished ? "FOUNDER_PUBLISH" : "FOUNDER_UNPUBLISH",
      targetEntity: "founders",
      targetId: founderId,
      details: { founderId, isPublished, adminEmail: session.email },
    });

    revalidatePath("/admin/founders");
    revalidatePath("/founders");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to toggle founder publication." };
  }
}
