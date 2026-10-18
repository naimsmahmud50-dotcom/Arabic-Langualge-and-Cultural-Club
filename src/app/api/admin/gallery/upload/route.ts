/**
 * DEVELOPER NOTE:
 * @file src/app/api/admin/gallery/upload/route.ts
 * @route /api/admin/gallery/upload
 * @description Authenticated Batch Media Upload Handler with Storage Provider & Compensating Cleanup (Phase 6).
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * ARCHITECTURE & DEFENSE IN DEPTH:
 * - Protected by session verification and least-privilege RBAC ("gallery:manage" or "media:manage").
 * - Multi-file multipart/form-data ingestion with live binary buffer validation (magic bytes).
 * - Enforces Strix-Supabase Security: Whitelisted MIME types (JPEG, PNG, WebP, AVIF, MP4, WebM).
 * - Anti-Malware / Anti-XSS: Rejects executable binaries, scripts, SVGs, and HTML payloads.
 * - Unified Storage Engine: Uploads via getStorageProvider() supporting Supabase Storage and durable mounted volumes.
 * - Atomic Reliability & Compensating Cleanup: If database insertion fails, the uploaded storage object is deleted.
 * - Audit Trail: Records immutable audit entry in `audit_logs` table.
 * - Strictly zero AI emojis.
 */

import { NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { galleryAlbums, mediaAssets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { validateMediaUpload, generateSafeStoragePath } from "@/lib/utils/media-storage";
import { recordAuditLog } from "@/lib/auth/audit";
import { getStorageProvider } from "@/lib/storage";

export async function POST(request: Request) {
  // 1. Authenticate Session
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Active administrative session required." },
      { status: 401 }
    );
  }

  // 2. Authorize Permissions
  const canManage = hasPermission(session.role, "gallery:manage") || hasPermission(session.role, "media:manage");
  if (!canManage) {
    return NextResponse.json(
      { error: "Forbidden: You lack 'gallery:manage' or 'media:manage' permissions." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const albumId = (formData.get("albumId") as string || "").trim();

    if (!albumId) {
      return NextResponse.json(
        { error: "Validation Error: albumId parameter is required." },
        { status: 400 }
      );
    }

    // 3. Verify Target Album Exists
    const album = await db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.id, albumId))
      .get();

    if (!album) {
      return NextResponse.json(
        { error: `Target gallery album with ID '${albumId}' was not found.` },
        { status: 404 }
      );
    }

    // 4. Extract Files
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No media files were provided in the upload request." },
        { status: 400 }
      );
    }

    const defaultCaption = (formData.get("defaultCaption") as string || "").trim();
    const defaultCredit = (formData.get("defaultCredit") as string || album.photographerCredit || "").trim();

    // Determine current sort order in album
    const existingAssets = await db
      .select({ sortOrder: mediaAssets.sortOrder })
      .from(mediaAssets)
      .where(eq(mediaAssets.albumId, albumId))
      .orderBy(desc(mediaAssets.sortOrder))
      .limit(1);

    let nextSortOrder = (existingAssets[0]?.sortOrder ?? 0) + 1;

    const storageProvider = getStorageProvider();
    const uploadedAssets = [];
    const errors = [];
    let assignedCoverUrl: string | null = album.coverImageUrl;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Read buffer into memory
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Binary Magic Bytes & MIME Security Validation
      const validation = validateMediaUpload({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        buffer,
      });

      if (!validation.isValid) {
        errors.push({
          filename: file.name,
          error: validation.errorMessage || "Validation failed for this file.",
        });
        continue;
      }

      // Safe relative storage path (e.g. gallery/2026-2027/symposium/1234_abc_photo.jpg)
      const relativeStoragePath = generateSafeStoragePath(
        album.slug,
        album.academicYear,
        validation.sanitizedFilename || file.name
      );

      // Upload via Storage Provider
      let uploadResult;
      try {
        uploadResult = await storageProvider.uploadFile(
          relativeStoragePath,
          buffer,
          validation.detectedMime || file.type || "application/octet-stream"
        );
      } catch (uploadErr: any) {
        errors.push({
          filename: file.name,
          error: `Storage upload failed: ${uploadErr.message}`,
        });
        continue;
      }

      const fileUrl = uploadResult.publicUrl;
      const assetId = `med_${crypto.randomBytes(12).toString("hex")}`;
      const now = new Date();

      // Clean default title / alt text from filename if caption not provided
      const rawName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const cleanAltText = defaultCaption || `${album.titleEn} - ${rawName.replace(/[-_]/g, " ")}`;

      // Insert mediaAsset record with Compensating Cleanup on failure
      try {
        await db.insert(mediaAssets).values({
          id: assetId,
          albumId: album.id,
          fileUrl,
          thumbnailUrl: fileUrl,
          mediaType: validation.mediaType,
          captionEn: defaultCaption || null,
          captionAr: null,
          altText: cleanAltText,
          credit: defaultCredit || null,
          sortOrder: nextSortOrder++,
          isPublished: true,
          createdAt: now,
        });

        // If album lacks a cover image, automatically set this first uploaded photo
        if (!assignedCoverUrl) {
          assignedCoverUrl = fileUrl;
          await db
            .update(galleryAlbums)
            .set({ coverImageUrl: fileUrl, updatedAt: now })
            .where(eq(galleryAlbums.id, album.id));
        }

        uploadedAssets.push({
          id: assetId,
          filename: file.name,
          url: fileUrl,
          mediaType: validation.mediaType,
        });
      } catch (dbErr: any) {
        // Compensating Cleanup: purge uploaded object from storage to prevent orphans
        console.error(`Database insertion failed for asset '${assetId}', executing compensating storage cleanup:`, dbErr);
        await storageProvider.deleteFile(relativeStoragePath).catch((cleanupErr) => {
          console.error("Compensating cleanup warning:", cleanupErr);
        });

        errors.push({
          filename: file.name,
          error: `Database persistence failed: ${dbErr.message}`,
        });
      }
    }

    // Record Immutable Audit Log
    if (uploadedAssets.length > 0) {
      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "MEDIA_BATCH_UPLOAD",
        targetEntity: "gallery_albums",
        targetId: album.id,
        details: {
          albumId: album.id,
          albumSlug: album.slug,
          count: uploadedAssets.length,
          storageProvider: storageProvider.name,
          uploadedIds: uploadedAssets.map((u) => u.id),
          adminEmail: session.email,
        },
      });
    }

    return NextResponse.json({
      success: uploadedAssets.length > 0,
      summary: {
        total: files.length,
        succeeded: uploadedAssets.length,
        failed: errors.length,
      },
      uploadedAssets,
      errors,
      storageProvider: storageProvider.name,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error processing media batch upload.", details: err.message },
      { status: 500 }
    );
  }
}
