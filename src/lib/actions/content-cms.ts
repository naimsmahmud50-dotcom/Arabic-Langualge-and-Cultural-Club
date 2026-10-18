/**
 * @file src/lib/actions/content-cms.ts
 * @description Secure Server Actions for Content Management Modules (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages News & Announcements (/admin/news), Arabic Learning Resources (/admin/resources),
 *   Achievements & Publications (/admin/publications), and Gallery Albums & Media Assets (/admin/gallery).
 * - Enforces least-privilege server-side RBAC:
 *   - "news:manage" for announcements
 *   - "resources:manage" for learning modules
 *   - "publications:manage" and "achievements:manage" for publications & honors
 *   - "gallery:manage" and "media:manage" for photo albums and media assets
 * - Employs Strix-Supabase media upload security validation (validateMediaUpload).
 * - Records all mutations to immutable audit_logs via recordAuditLog.
 * - Revalidates relevant public routes immediately on mutation.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/auth/audit";
import { 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  createPublication,
  updatePublication,
  deletePublication,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  createGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset
} from "@/lib/db/queries";
import { 
  validateMediaUpload, 
  generateSafeStoragePath 
} from "@/lib/utils/media-storage";

// Helper: Slugify string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

// ============================================================================
// 1. NEWS & ANNOUNCEMENTS ACTIONS (/admin/news)
// ============================================================================

const AnnouncementSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional(),
  titleEn: z.string().min(3, "English title is required").max(180),
  titleAr: z.string().max(200).optional().nullable(),
  summaryEn: z.string().max(400).optional().nullable(),
  summaryAr: z.string().max(400).optional().nullable(),
  contentEn: z.string().min(10, "English content is required"),
  contentAr: z.string().optional().nullable(),
  category: z.string().min(2, "Category is required").max(50).default("notice"),
  coverImageUrl: z.string().url("Valid image URL required").optional().nullable().or(z.literal("")),
  authorName: z.string().max(100).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  isPinned: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export async function saveAnnouncementAction(input: z.infer<typeof AnnouncementSchema>) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "news:manage")) {
    return { success: false, error: "Forbidden: You lack 'news:manage' permissions." };
  }

  const parsed = AnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const finalSlug = parsed.data.slug && parsed.data.slug.trim() 
      ? slugify(parsed.data.slug) 
      : `${slugify(parsed.data.titleEn)}-${Date.now().toString().slice(-4)}`;

    const isPublished = parsed.data.status === "published";
    let announcementId = parsed.data.id;

    if (announcementId) {
      await updateAnnouncement(announcementId, {
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        summaryEn: parsed.data.summaryEn || null,
        summaryAr: parsed.data.summaryAr || null,
        contentEn: parsed.data.contentEn,
        contentAr: parsed.data.contentAr || null,
        category: parsed.data.category,
        coverImageUrl: parsed.data.coverImageUrl || null,
        authorName: parsed.data.authorName || null,
        status: parsed.data.status,
        isPinned: parsed.data.isPinned,
        isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "ANNOUNCEMENT_UPDATE",
        targetEntity: "announcements",
        targetId: announcementId,
        details: { titleEn: parsed.data.titleEn, status: parsed.data.status, adminEmail: session.email },
      });
    } else {
      announcementId = await createAnnouncement({
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        summaryEn: parsed.data.summaryEn || null,
        summaryAr: parsed.data.summaryAr || null,
        contentEn: parsed.data.contentEn,
        contentAr: parsed.data.contentAr || null,
        category: parsed.data.category,
        coverImageUrl: parsed.data.coverImageUrl || null,
        authorName: parsed.data.authorName || null,
        status: parsed.data.status,
        isPinned: parsed.data.isPinned,
        isPublished,
        publishedAt: new Date(),
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "ANNOUNCEMENT_CREATE",
        targetEntity: "announcements",
        targetId: announcementId,
        details: { titleEn: parsed.data.titleEn, category: parsed.data.category, adminEmail: session.email },
      });
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath(`/news/${finalSlug}`);
    revalidatePath("/");

    return { success: true, id: announcementId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save announcement." };
  }
}

export async function toggleAnnouncementPinAction(id: string, isPinned: boolean) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "news:manage")) {
    return { success: false, error: "Forbidden: You lack 'news:manage' permissions." };
  }

  try {
    await updateAnnouncement(id, { isPinned });

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ANNOUNCEMENT_PIN_TOGGLE",
      targetEntity: "announcements",
      targetId: id,
      details: { isPinned, adminEmail: session.email },
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to toggle pin state." };
  }
}

export async function deleteAnnouncementAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "news:manage")) {
    return { success: false, error: "Forbidden: You lack 'news:manage' permissions." };
  }

  try {
    await deleteAnnouncement(id);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ANNOUNCEMENT_DELETE",
      targetEntity: "announcements",
      targetId: id,
      details: { announcementId: id, adminEmail: session.email },
    });

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete announcement." };
  }
}

// ============================================================================
// 2. ARABIC LEARNING RESOURCES ACTIONS (/admin/resources)
// ============================================================================

const LearningResourceSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional(),
  titleEn: z.string().min(3, "English title is required").max(180),
  titleAr: z.string().max(200).optional().nullable(),
  category: z.enum(["grammar", "morphology", "rhetoric", "vocabulary", "literature", "reading", "general"]).default("grammar"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  fileUrl: z.string().url("Valid file URL required").optional().nullable().or(z.literal("")),
  contentEn: z.string().max(5000).optional().nullable(),
  contentAr: z.string().max(5000).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export async function saveLearningResourceAction(input: z.infer<typeof LearningResourceSchema>) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "resources:manage")) {
    return { success: false, error: "Forbidden: You lack 'resources:manage' permissions." };
  }

  const parsed = LearningResourceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const finalSlug = parsed.data.slug && parsed.data.slug.trim()
      ? slugify(parsed.data.slug)
      : `${slugify(parsed.data.titleEn)}-${Date.now().toString().slice(-4)}`;

    let resourceId = parsed.data.id;

    if (resourceId) {
      await updateLearningResource(resourceId, {
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        category: parsed.data.category,
        skillLevel: parsed.data.skillLevel,
        fileUrl: parsed.data.fileUrl || null,
        contentEn: parsed.data.contentEn || null,
        contentAr: parsed.data.contentAr || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "LEARNING_RESOURCE_UPDATE",
        targetEntity: "learning_resources",
        targetId: resourceId,
        details: { titleEn: parsed.data.titleEn, isPublished: parsed.data.isPublished, adminEmail: session.email },
      });
    } else {
      resourceId = await createLearningResource({
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        category: parsed.data.category,
        skillLevel: parsed.data.skillLevel,
        fileUrl: parsed.data.fileUrl || null,
        contentEn: parsed.data.contentEn || null,
        contentAr: parsed.data.contentAr || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "LEARNING_RESOURCE_CREATE",
        targetEntity: "learning_resources",
        targetId: resourceId,
        details: { titleEn: parsed.data.titleEn, category: parsed.data.category, adminEmail: session.email },
      });
    }

    revalidatePath("/admin/resources");
    revalidatePath("/resources");
    revalidatePath("/");

    return { success: true, id: resourceId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save learning resource." };
  }
}

export async function deleteLearningResourceAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "resources:manage")) {
    return { success: false, error: "Forbidden: You lack 'resources:manage' permissions." };
  }

  try {
    await deleteLearningResource(id);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "LEARNING_RESOURCE_DELETE",
      targetEntity: "learning_resources",
      targetId: id,
      details: { resourceId: id, adminEmail: session.email },
    });

    revalidatePath("/admin/resources");
    revalidatePath("/resources");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete learning resource." };
  }
}

// ============================================================================
// 3. PUBLICATIONS ACTIONS (/admin/publications)
// ============================================================================

const PublicationSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional(),
  titleEn: z.string().min(3, "English title is required").max(180),
  titleAr: z.string().max(200).optional().nullable(),
  publicationType: z.enum(["magazine", "newsletter", "journal", "report"]).default("magazine"),
  issueNo: z.string().max(40).optional().nullable(),
  publicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD").optional().nullable().or(z.literal("")),
  coverImageUrl: z.string().url("Valid image URL required").optional().nullable().or(z.literal("")),
  fileUrl: z.string().url("Valid PDF or document URL required"),
  descriptionEn: z.string().max(1000).optional().nullable(),
  descriptionAr: z.string().max(1000).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export async function savePublicationAction(input: z.infer<typeof PublicationSchema>) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "publications:manage")) {
    return { success: false, error: "Forbidden: You lack 'publications:manage' permissions." };
  }

  const parsed = PublicationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const finalSlug = parsed.data.slug && parsed.data.slug.trim()
      ? slugify(parsed.data.slug)
      : `${slugify(parsed.data.titleEn)}-${Date.now().toString().slice(-4)}`;

    let pubId = parsed.data.id;

    if (pubId) {
      await updatePublication(pubId, {
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        publicationType: parsed.data.publicationType,
        issueNo: parsed.data.issueNo || null,
        publicationDate: parsed.data.publicationDate || null,
        coverImageUrl: parsed.data.coverImageUrl || null,
        fileUrl: parsed.data.fileUrl,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "PUBLICATION_UPDATE",
        targetEntity: "publications",
        targetId: pubId,
        details: { titleEn: parsed.data.titleEn, isPublished: parsed.data.isPublished, adminEmail: session.email },
      });
    } else {
      pubId = await createPublication({
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        publicationType: parsed.data.publicationType,
        issueNo: parsed.data.issueNo || null,
        publicationDate: parsed.data.publicationDate || null,
        coverImageUrl: parsed.data.coverImageUrl || null,
        fileUrl: parsed.data.fileUrl,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "PUBLICATION_CREATE",
        targetEntity: "publications",
        targetId: pubId,
        details: { titleEn: parsed.data.titleEn, publicationType: parsed.data.publicationType, adminEmail: session.email },
      });
    }

    revalidatePath("/admin/publications");
    revalidatePath("/publications");
    revalidatePath("/");

    return { success: true, id: pubId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save publication." };
  }
}

export async function deletePublicationAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "publications:manage")) {
    return { success: false, error: "Forbidden: You lack 'publications:manage' permissions." };
  }

  try {
    await deletePublication(id);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "PUBLICATION_DELETE",
      targetEntity: "publications",
      targetId: id,
      details: { publicationId: id, adminEmail: session.email },
    });

    revalidatePath("/admin/publications");
    revalidatePath("/publications");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete publication." };
  }
}

// ============================================================================
// 4. ACHIEVEMENTS ACTIONS (/admin/publications)
// ============================================================================

const AchievementSchema = z.object({
  id: z.string().optional(),
  titleEn: z.string().min(3, "English title is required").max(180),
  titleAr: z.string().max(200).optional().nullable(),
  descriptionEn: z.string().max(1000).optional().nullable(),
  descriptionAr: z.string().max(1000).optional().nullable(),
  category: z.string().min(2, "Category is required").max(50).default("competition"),
  dateAchieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD").optional().nullable().or(z.literal("")),
  certificateUrl: z.string().url("Valid certificate or trophy image URL required").optional().nullable().or(z.literal("")),
  isPublished: z.boolean().default(true),
});

export async function saveAchievementAction(input: z.infer<typeof AchievementSchema>) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "achievements:manage")) {
    return { success: false, error: "Forbidden: You lack 'achievements:manage' permissions." };
  }

  const parsed = AchievementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    let achId = parsed.data.id;

    if (achId) {
      await updateAchievement(achId, {
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        category: parsed.data.category,
        dateAchieved: parsed.data.dateAchieved || null,
        certificateUrl: parsed.data.certificateUrl || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "ACHIEVEMENT_UPDATE",
        targetEntity: "achievements",
        targetId: achId,
        details: { titleEn: parsed.data.titleEn, isPublished: parsed.data.isPublished, adminEmail: session.email },
      });
    } else {
      achId = await createAchievement({
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        category: parsed.data.category,
        dateAchieved: parsed.data.dateAchieved || null,
        certificateUrl: parsed.data.certificateUrl || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "ACHIEVEMENT_CREATE",
        targetEntity: "achievements",
        targetId: achId,
        details: { titleEn: parsed.data.titleEn, category: parsed.data.category, adminEmail: session.email },
      });
    }

    revalidatePath("/admin/publications");
    revalidatePath("/publications");
    revalidatePath("/");

    return { success: true, id: achId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save achievement." };
  }
}

export async function deleteAchievementAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "achievements:manage")) {
    return { success: false, error: "Forbidden: You lack 'achievements:manage' permissions." };
  }

  try {
    await deleteAchievement(id);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ACHIEVEMENT_DELETE",
      targetEntity: "achievements",
      targetId: id,
      details: { achievementId: id, adminEmail: session.email },
    });

    revalidatePath("/admin/publications");
    revalidatePath("/publications");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete achievement." };
  }
}

// ============================================================================
// 5. GALLERY ALBUMS ACTIONS (/admin/gallery)
// ============================================================================

const GalleryAlbumSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional(),
  titleEn: z.string().min(3, "English album title is required").max(180),
  titleAr: z.string().max(200).optional().nullable(),
  descriptionEn: z.string().max(1000).optional().nullable(),
  descriptionAr: z.string().max(1000).optional().nullable(),
  coverImageUrl: z.string().url("Valid cover image URL required").optional().nullable().or(z.literal("")),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD").optional().nullable().or(z.literal("")),
  academicYear: z.string().min(4, "Academic year required (e.g. 2024–2025)").max(30),
  category: z.string().min(2, "Category is required").max(50).default("cultural"),
  relatedEventId: z.string().optional().nullable().or(z.literal("")),
  photographerCredit: z.string().max(120).optional().nullable(),
  location: z.string().max(150).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export async function saveGalleryAlbumAction(input: z.infer<typeof GalleryAlbumSchema>) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "gallery:manage")) {
    return { success: false, error: "Forbidden: You lack 'gallery:manage' permissions." };
  }

  const parsed = GalleryAlbumSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    const finalSlug = parsed.data.slug && parsed.data.slug.trim()
      ? slugify(parsed.data.slug)
      : `${slugify(parsed.data.titleEn)}-${Date.now().toString().slice(-4)}`;

    let albumId = parsed.data.id;

    if (albumId) {
      await updateGalleryAlbum(albumId, {
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        coverImageUrl: parsed.data.coverImageUrl || null,
        eventDate: parsed.data.eventDate || null,
        academicYear: parsed.data.academicYear,
        category: parsed.data.category,
        relatedEventId: parsed.data.relatedEventId || null,
        photographerCredit: parsed.data.photographerCredit || null,
        location: parsed.data.location || null,
        isFeatured: parsed.data.isFeatured,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "GALLERY_ALBUM_UPDATE",
        targetEntity: "gallery_albums",
        targetId: albumId,
        details: { titleEn: parsed.data.titleEn, isPublished: parsed.data.isPublished, adminEmail: session.email },
      });
    } else {
      albumId = await createGalleryAlbum({
        slug: finalSlug,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        coverImageUrl: parsed.data.coverImageUrl || null,
        eventDate: parsed.data.eventDate || null,
        academicYear: parsed.data.academicYear,
        category: parsed.data.category,
        relatedEventId: parsed.data.relatedEventId || null,
        photographerCredit: parsed.data.photographerCredit || null,
        location: parsed.data.location || null,
        isFeatured: parsed.data.isFeatured,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "GALLERY_ALBUM_CREATE",
        targetEntity: "gallery_albums",
        targetId: albumId,
        details: { titleEn: parsed.data.titleEn, category: parsed.data.category, adminEmail: session.email },
      });
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${finalSlug}`);
    revalidatePath("/");

    return { success: true, id: albumId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save gallery album." };
  }
}

export async function deleteGalleryAlbumAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "gallery:manage")) {
    return { success: false, error: "Forbidden: You lack 'gallery:manage' permissions." };
  }

  try {
    await deleteGalleryAlbum(id);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "GALLERY_ALBUM_DELETE",
      targetEntity: "gallery_albums",
      targetId: id,
      details: { albumId: id, adminEmail: session.email },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete gallery album." };
  }
}

// ============================================================================
// 6. MEDIA ASSETS & PHOTO UPLOAD ACTIONS (/admin/gallery)
// ============================================================================

const MediaAssetSchema = z.object({
  id: z.string().optional(),
  albumId: z.string().min(1, "Album association is required"),
  fileUrl: z.string().url("Valid media URL required"),
  thumbnailUrl: z.string().url("Valid thumbnail URL required").optional().nullable().or(z.literal("")),
  mediaType: z.enum(["image", "video"]).default("image"),
  videoUrl: z.string().url("Valid video link required").optional().nullable().or(z.literal("")),
  captionEn: z.string().max(300).optional().nullable(),
  captionAr: z.string().max(300).optional().nullable(),
  credit: z.string().max(100).optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export async function saveMediaAssetAction(input: z.infer<typeof MediaAssetSchema>) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "gallery:manage") && !hasPermission(session.role, "media:manage")) {
    return { success: false, error: "Forbidden: You lack 'gallery:manage' permissions." };
  }

  const parsed = MediaAssetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    let assetId = parsed.data.id;

    if (assetId) {
      await updateMediaAsset(assetId, {
        albumId: parsed.data.albumId,
        fileUrl: parsed.data.fileUrl,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        mediaType: parsed.data.mediaType,
        videoUrl: parsed.data.videoUrl || null,
        captionEn: parsed.data.captionEn || null,
        captionAr: parsed.data.captionAr || null,
        credit: parsed.data.credit || null,
        width: parsed.data.width || null,
        height: parsed.data.height || null,
        sortOrder: parsed.data.sortOrder,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "MEDIA_ASSET_UPDATE",
        targetEntity: "media_assets",
        targetId: assetId,
        details: { albumId: parsed.data.albumId, captionEn: parsed.data.captionEn, adminEmail: session.email },
      });
    } else {
      assetId = await createMediaAsset({
        albumId: parsed.data.albumId,
        fileUrl: parsed.data.fileUrl,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        mediaType: parsed.data.mediaType,
        videoUrl: parsed.data.videoUrl || null,
        captionEn: parsed.data.captionEn || null,
        captionAr: parsed.data.captionAr || null,
        credit: parsed.data.credit || null,
        width: parsed.data.width || null,
        height: parsed.data.height || null,
        sortOrder: parsed.data.sortOrder,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "MEDIA_ASSET_CREATE",
        targetEntity: "media_assets",
        targetId: assetId,
        details: { albumId: parsed.data.albumId, mediaType: parsed.data.mediaType, adminEmail: session.email },
      });
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true, id: assetId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save media asset." };
  }
}

export async function deleteMediaAssetAction(id: string, albumId?: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "gallery:manage") && !hasPermission(session.role, "media:manage")) {
    return { success: false, error: "Forbidden: You lack 'gallery:manage' permissions." };
  }

  try {
    await deleteMediaAsset(id);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "MEDIA_ASSET_DELETE",
      targetEntity: "media_assets",
      targetId: id,
      details: { assetId: id, albumId, adminEmail: session.email },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete media asset." };
  }
}

export async function setAlbumCoverAction(albumId: string, coverImageUrl: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "gallery:manage")) {
    return { success: false, error: "Forbidden: You lack 'gallery:manage' permissions." };
  }

  try {
    await updateGalleryAlbum(albumId, { coverImageUrl });

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ALBUM_COVER_UPDATE",
      targetEntity: "gallery_albums",
      targetId: albumId,
      details: { albumId, coverImageUrl, adminEmail: session.email },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update album cover." };
  }
}

/**
 * Validates a media upload against institutional security standards.
 * Verifies filename, MIME type, size limit, rejects dangerous extensions,
 * and generates a sanitized storage key.
 */
export async function validateMediaUploadAction(input: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  albumSlug?: string;
  academicYear?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "gallery:manage") && !hasPermission(session.role, "media:manage")) {
    return { success: false, error: "Forbidden: You lack 'gallery:manage' permissions." };
  }

  const validation = validateMediaUpload({
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
  });

  if (!validation.isValid) {
    return { success: false, error: validation.errorMessage || "Media file validation failed." };
  }

  const safePath = generateSafeStoragePath(
    input.albumSlug || "general",
    input.academicYear || "2026-2027",
    validation.sanitizedFilename || input.filename
  );

  return {
    success: true,
    storageKey: safePath,
    mediaType: validation.mediaType,
    sanitizedFilename: validation.sanitizedFilename,
  };
}
