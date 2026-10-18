/**
 * DEVELOPER NOTE:
 * @file src/app/api/media/[...path]/route.ts
 * @route /api/media/[...path]
 * @description Secure Media Delivery Controller with Public/Private Access Control (Phase 6).
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * SECURITY & PRIVACY ENFORCEMENT:
 * 1. Public Assets: If the media asset and its containing album are published and non-archived,
 *    delivers with aggressive public edge caching: `Cache-Control: public, max-age=31536000, immutable`.
 * 2. Private & Draft Assets: If an asset is unreleased, draft, or archived:
 *    - Allows access if valid signed URL token is present (?token=...&exp=...).
 *    - Allows access if active administrative session has "gallery:manage" or "media:manage" permissions.
 *    - Rejects unauthenticated or unauthorized requests with HTTP 403 Forbidden.
 * 3. Range Requests & Performance: Supports HTTP 206 Partial Content for efficient video/media streaming.
 * 4. Zero AI emojis; pure institutional architecture.
 */

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { mediaAssets, galleryAlbums } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";
import { getStorageProvider, verifyLocalSignedToken } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
    }

    const cleanKey = pathSegments.join("/").replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    const storageProvider = getStorageProvider();

    // 1. Check for Cryptographic Signed Token Access (?token=...&exp=...)
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const exp = url.searchParams.get("exp");

    let isAuthorized = false;
    let isSignedUrlAccess = false;

    if (token && exp) {
      if (verifyLocalSignedToken(cleanKey, token, exp)) {
        isAuthorized = true;
        isSignedUrlAccess = true;
      }
    }

    // 2. Query Database for Publication State
    // Storage keys match either /uploads/${cleanKey} or exact cleanKey
    const targetUrlVariants = [
      `/uploads/${cleanKey}`,
      `/${cleanKey}`,
      cleanKey,
      path.basename(cleanKey),
    ];

    const matchingAssets = await db
      .select({
        assetId: mediaAssets.id,
        isAssetPublished: mediaAssets.isPublished,
        fileUrl: mediaAssets.fileUrl,
        mediaType: mediaAssets.mediaType,
        albumId: mediaAssets.albumId,
        albumPublished: galleryAlbums.isPublished,
        albumArchived: galleryAlbums.isArchived,
      })
      .from(mediaAssets)
      .leftJoin(galleryAlbums, eq(mediaAssets.albumId, galleryAlbums.id))
      .where(
        or(
          eq(mediaAssets.fileUrl, `/uploads/${cleanKey}`),
          eq(mediaAssets.fileUrl, cleanKey)
        )
      )
      .limit(1);

    const assetRecord = matchingAssets[0];

    // If file is not in database (e.g. system asset, logo, avatar), check public existence
    const isPublicRecord = assetRecord
      ? Boolean(assetRecord.isAssetPublished && assetRecord.albumPublished && !assetRecord.albumArchived)
      : false;

    // 3. Evaluate Authorization
    if (!isAuthorized && !isPublicRecord) {
      // Check for Active Administrative Session
      const session = await getSession();
      if (session && (hasPermission(session.role, "gallery:manage") || hasPermission(session.role, "media:manage"))) {
        isAuthorized = true;
      } else {
        return NextResponse.json(
          { error: "Access Denied: This media asset is unpublished, draft, or restricted." },
          { status: 403 }
        );
      }
    }

    // 4. Retrieve File Buffer from Storage Provider
    const buffer = await storageProvider.getFileBuffer(cleanKey);
    if (!buffer) {
      return NextResponse.json(
        { error: "Media file not found in persistent storage." },
        { status: 404 }
      );
    }

    // 5. Determine Content-Type from Extension
    const ext = path.extname(cleanKey).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
    };
    const contentType = mimeMap[ext] || "application/octet-stream";

    // 6. Handle Range Requests (for video and high-res media)
    const totalBytes = buffer.length;
    const rangeHeader = request.headers.get("range");

    const cacheHeader = isPublicRecord && !isSignedUrlAccess
      ? "public, max-age=31536000, immutable"
      : "private, no-cache, no-store, must-revalidate";

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalBytes - 1;

      if (start >= totalBytes || end >= totalBytes) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${totalBytes}` },
        });
      }

      const chunk = buffer.subarray(start, end + 1);
      return new NextResponse(chunk as unknown as BodyInit, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${totalBytes}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunk.length.toString(),
          "Content-Type": contentType,
          "Cache-Control": cacheHeader,
        },
      });
    }

    // 7. Full Response
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": totalBytes.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": cacheHeader,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal media delivery error.", details: err.message },
      { status: 500 }
    );
  }
}
