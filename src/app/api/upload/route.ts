/**
 * DEVELOPER NOTE:
 * File: src/app/api/upload/route.ts
 * Route: /api/upload
 * Module: General Authenticated Media Upload API (Phase 3 Requirement)
 * Purpose: Secure, authenticated upload endpoint for CMS pages, news articles,
 *          documents, and general media.
 * Key Capabilities:
 * - Admin authentication & session enforcement (RBAC).
 * - Magic-byte binary verification and SVG script scanning (Strix security).
 * - Automatic image optimization via Sharp (WebP large + thumbnail generation).
 * - Persistent storage outside Next.js build (STORAGE_DIR / storage/uploads).
 * - Dynamic public URL generation (/api/media/...).
 * - Immutable audit log recording.
 * Strictly human vibe: zero AI emojis.
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/auth/audit";
import { 
  getStorageProvider, 
  validateUploadBuffer, 
  optimizeImageWithSharp 
} from "@/lib/storage";

export async function POST(request: Request) {
  // 1. Authenticate Session
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Active administrative session required to upload media." },
      { status: 401 }
    );
  }

  // 2. Authorize Permissions
  const canUpload = 
    hasPermission(session.role, "media:manage") ||
    hasPermission(session.role, "gallery:manage") ||
    hasPermission(session.role, "pages:manage") ||
    hasPermission(session.role, "news:manage") ||
    session.role === "administrator" ||
    session.role === "super_admin";

  if (!canUpload) {
    return NextResponse.json(
      { error: "Forbidden: You lack permissions to upload media." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const filesToProcess: File[] = [];
    if (singleFile) filesToProcess.push(singleFile);
    if (files && files.length > 0) {
      for (const f of files) {
        if (!filesToProcess.some((p) => p.name === f.name && p.size === f.size)) {
          filesToProcess.push(f);
        }
      }
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { error: "No media file provided in upload request." },
        { status: 400 }
      );
    }

    const folderCategory = (formData.get("folder") as string || "general")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "");

    const storageProvider = getStorageProvider();
    const results = [];
    const errors = [];

    for (const file of filesToProcess) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Binary magic-bytes & SVG script validation
      const validation = validateUploadBuffer({
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

      const randomId = crypto.randomUUID();
      const baseKey = `${folderCategory}/${Date.now()}_${randomId}`;

      if (validation.mediaType === "image" && validation.detectedMime !== "image/svg+xml") {
        try {
          // Sharp optimization: WebP full-size + WebP thumbnail
          const optimized = await optimizeImageWithSharp(buffer, baseKey);

          // Upload large optimized version
          const mainUpload = await storageProvider.uploadFile(
            optimized.mainKey,
            optimized.mainBuffer,
            optimized.mainMime
          );

          // Upload thumbnail version
          const thumbUpload = await storageProvider.uploadFile(
            optimized.thumbnailKey,
            optimized.thumbnailBuffer,
            optimized.thumbnailMime
          );

          results.push({
            filename: file.name,
            url: mainUpload.publicUrl,
            thumbnailUrl: thumbUpload.publicUrl,
            storageKey: mainUpload.storageKey,
            thumbnailKey: thumbUpload.storageKey,
            sizeBytes: optimized.mainBuffer.length,
            width: optimized.width,
            height: optimized.height,
            format: optimized.format,
            mimeType: optimized.mainMime,
          });
        } catch (sharpErr: any) {
          // Fallback to storing original if sharp fails
          const key = `${baseKey}${validation.detectedExt}`;
          const uploadResult = await storageProvider.uploadFile(key, buffer, validation.detectedMime);
          results.push({
            filename: file.name,
            url: uploadResult.publicUrl,
            thumbnailUrl: uploadResult.publicUrl,
            storageKey: uploadResult.storageKey,
            sizeBytes: buffer.length,
            mimeType: validation.detectedMime,
          });
        }
      } else {
        // Video or SVG: store directly with safe UUID key
        const key = `${baseKey}${validation.detectedExt}`;
        const uploadResult = await storageProvider.uploadFile(key, buffer, validation.detectedMime);
        results.push({
          filename: file.name,
          url: uploadResult.publicUrl,
          thumbnailUrl: null,
          storageKey: uploadResult.storageKey,
          sizeBytes: buffer.length,
          mimeType: validation.detectedMime,
        });
      }
    }

    // Record audit log
    if (results.length > 0) {
      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "MEDIA_UPLOAD",
        targetEntity: "storage_uploads",
        targetId: results[0].storageKey,
        details: {
          count: results.length,
          folder: folderCategory,
          provider: storageProvider.name,
          adminEmail: session.email,
        },
      });
    }

    return NextResponse.json({
      success: results.length > 0,
      files: results,
      // Convenience properties if single file
      url: results[0]?.url,
      thumbnailUrl: results[0]?.thumbnailUrl,
      storageKey: results[0]?.storageKey,
      errors: errors.length > 0 ? errors : undefined,
      storageProvider: storageProvider.name,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error processing media upload.", details: err.message },
      { status: 500 }
    );
  }
}
