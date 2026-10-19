/**
 * @file src/lib/actions/pages.ts
 * @description Secure Server Actions for Website Pages & Dynamic Sections CMS (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages CMS editable pages (e.g. /about, /history, /policies) and their dynamic sections.
 * - Enforces role-based access control with "pages:manage".
 * - Logs all modifications to immutable audit_logs via recordAuditLog.
 * - Automatically revalidates public page routes upon updates so visitors see fresh content immediately.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/auth/audit";
import { updateEditablePage, savePageSection, deletePageSection } from "@/lib/db/queries";

const PageMetadataSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  slug: z.string().min(1, "Page slug is required"),
  titleEn: z.string().min(2, "English title must be at least 2 characters").max(120),
  titleAr: z.string().max(160).optional().nullable(),
  metaDescriptionEn: z.string().max(300).optional().nullable(),
  metaDescriptionAr: z.string().max(400).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export async function savePageMetadataAction(formData: {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  metaDescriptionEn?: string | null;
  metaDescriptionAr?: string | null;
  isPublished?: boolean;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "pages:manage")) {
    return { success: false, error: "Forbidden: You lack 'pages:manage' permissions." };
  }

  const parsed = PageMetadataSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateEditablePage(parsed.data.id, {
      titleEn: parsed.data.titleEn,
      titleAr: parsed.data.titleAr,
      metaDescriptionEn: parsed.data.metaDescriptionEn,
      metaDescriptionAr: parsed.data.metaDescriptionAr,
      isPublished: parsed.data.isPublished,
    });

    // Immutable audit trail
    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "PAGE_METADATA_UPDATE",
      targetEntity: "editable_pages",
      targetId: parsed.data.slug,
      details: {
        titleEn: parsed.data.titleEn,
        isPublished: parsed.data.isPublished,
        adminEmail: session.email,
      },
    });

    // Revalidate admin and public routes
    revalidatePath("/admin/pages");
    revalidatePath(`/${parsed.data.slug === "home" ? "" : parsed.data.slug}`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update page metadata." };
  }
}

const PageSectionSchema = z.object({
  id: z.string().optional(),
  pageId: z.string().min(1, "Page ID is required"),
  pageSlug: z.string().min(1, "Page slug is required"),
  sectionKey: z.string().min(2, "Section key is required").max(60),
  contentEn: z.string().optional().nullable(),
  contentAr: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export async function savePageSectionAction(input: {
  id?: string;
  pageId: string;
  pageSlug: string;
  sectionKey: string;
  contentEn?: string | null;
  contentAr?: string | null;
  sortOrder?: number;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "pages:manage")) {
    return { success: false, error: "Forbidden: You lack 'pages:manage' permissions." };
  }

  const parsed = PageSectionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const sectionId = await savePageSection({
      id: parsed.data.id,
      pageId: parsed.data.pageId,
      sectionKey: parsed.data.sectionKey,
      contentEn: parsed.data.contentEn,
      contentAr: parsed.data.contentAr,
      sortOrder: parsed.data.sortOrder,
    });

    // Immutable audit trail
    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: parsed.data.id ? "PAGE_SECTION_UPDATE" : "PAGE_SECTION_CREATE",
      targetEntity: "page_sections",
      targetId: sectionId,
      details: {
        pageSlug: parsed.data.pageSlug,
        sectionKey: parsed.data.sectionKey,
        sortOrder: parsed.data.sortOrder,
        adminEmail: session.email,
      },
    });

    // Revalidate admin and public routes
    revalidatePath("/admin/pages");
    revalidatePath(`/${parsed.data.pageSlug === "home" ? "" : parsed.data.pageSlug}`);

    return { success: true, sectionId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save page section." };
  }
}

export async function deletePageSectionAction(sectionId: string, pageSlug: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "pages:manage")) {
    return { success: false, error: "Forbidden: You lack 'pages:manage' permissions." };
  }

  try {
    await deletePageSection(sectionId);

    // Audit
    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "PAGE_SECTION_DELETE",
      targetEntity: "page_sections",
      targetId: sectionId,
      details: { sectionId, pageSlug, adminEmail: session.email },
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${pageSlug === "home" ? "" : pageSlug}`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete section." };
  }
}
