/**
 * DEVELOPER NOTE:
 * @file scripts/verify-phase3-live-security.ts
 * @description In-depth dynamic security and live HTTP verification for Phase 3 Permanent Media Storage.
 * Exercises running daemon on Port 3005 for authz, security filters, path traversal, streaming headers, and data integrity.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * Strictly zero AI emojis.
 */

import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const BASE_URL = "http://localhost:3005";
const DB_PATH = path.join(process.cwd(), "arabic_club.db");

let passed = 0;
let total = 0;

function check(condition: boolean, title: string, details?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${title}`);
  } else {
    console.error(`[FAIL] ${title}`);
    if (details) console.error(`       ${details}`);
  }
}

async function runLiveVerification() {
  console.log("==================================================================");
  console.log("ALCC Phase 3 Deep Live Verification & Security Audit");
  console.log(`Target: ${BASE_URL} (Port 3005)`);
  console.log("==================================================================");

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  check(healthRes.status === 200, "1. System daemon is active and responding on Port 3005");

  // 2. Unauthenticated Upload Protection
  // 2A. /api/upload without session
  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: new FormData(),
  });
  check(uploadRes.status === 401, "2. /api/upload blocks unauthenticated POST with 401 Unauthorized");

  // 2B. /api/admin/gallery/upload without session
  const galleryUploadRes = await fetch(`${BASE_URL}/api/admin/gallery/upload`, {
    method: "POST",
    body: new FormData(),
  });
  check(galleryUploadRes.status === 401, "3. /api/admin/gallery/upload blocks unauthenticated POST with 401 Unauthorized");

  // 3. Path Traversal & Security in Media Route
  // 3A. Relative traversal attack with ..
  const traversalRes1 = await fetch(`${BASE_URL}/api/media/../../etc/passwd`);
  check(traversalRes1.status === 403 || traversalRes1.status === 404, "4. Path traversal attempt '../' rejected with 403 or 404");

  // 3B. Encoded traversal attack
  const traversalRes2 = await fetch(`${BASE_URL}/api/media/%2e%2e%2f%2e%2e%2fetc%2fpasswd`);
  check(traversalRes2.status === 403 || traversalRes2.status === 404, "5. URL-encoded path traversal attempt '%2e%2e' rejected safely");

  // 3C. Non-existent media returns 404
  const notFoundRes = await fetch(`${BASE_URL}/api/media/non-existent-image-12345.webp`);
  check(notFoundRes.status === 404, "6. Non-existent media asset returns clean 404 Not Found");

  // 4. Live Media Serving & HTTP Caching Headers
  const knownAssetPath = "gallery/2024-2025/national-arabic-debate-championship-2024/1792381163843_n3k4rr_whatsapp-image-2026-10-13-at-19-11-15.jpeg";
  const knownThumbPath = "gallery/2024-2025/national-arabic-debate-championship-2024/1792381163843_n3k4rr_whatsapp-image-2026-10-13-at-19-11-15_thumb.webp";

  const mediaRes = await fetch(`${BASE_URL}/api/media/${knownAssetPath}`);
  check(mediaRes.status === 200, "7. Migrated asset served successfully via /api/media/ (HTTP 200)");
  check(mediaRes.headers.get("content-type") === "image/jpeg", "8. Correct Content-Type 'image/jpeg' returned");
  check(
    mediaRes.headers.get("cache-control")?.includes("immutable") === true,
    "9. Immutable caching header 'public, max-age=31536000, immutable' enforced"
  );
  check(mediaRes.headers.get("accept-ranges") === "bytes", "10. 'Accept-Ranges: bytes' enabled for streaming support");

  // 5. WebP Thumbnail Delivery & Compression Efficiency
  const thumbRes = await fetch(`${BASE_URL}/api/media/${knownThumbPath}`);
  check(thumbRes.status === 200, "11. WebP thumbnail served successfully (HTTP 200)");
  check(thumbRes.headers.get("content-type") === "image/webp", "12. Thumbnail Content-Type is 'image/webp'");

  const originalLength = parseInt(mediaRes.headers.get("content-length") || "0", 10);
  const thumbLength = parseInt(thumbRes.headers.get("content-length") || "0", 10);
  check(
    thumbLength > 0 && thumbLength < originalLength / 2,
    "13. Sharp thumbnail achieves >50% compression reduction",
    `Original: ${originalLength}B, Thumbnail: ${thumbLength}B`
  );

  // 6. Byte Range Request (HTTP 206 Partial Content)
  const rangeRes = await fetch(`${BASE_URL}/api/media/${knownAssetPath}`, {
    headers: { Range: "bytes=0-1023" },
  });
  check(rangeRes.status === 206, "14. Byte range request returns HTTP 206 Partial Content");
  const contentRange = rangeRes.headers.get("content-range");
  check(
    contentRange?.startsWith("bytes 0-1023/") === true,
    "15. Content-Range header correctly indicates byte slice range",
    `Header: ${contentRange}`
  );

  // 7. Database Integrity: Confirm zero orphaned /uploads/ references remain
  const db = new Database(DB_PATH);
  const legacyInMedia = db.prepare("SELECT count(*) as count FROM media_assets WHERE file_url LIKE '/uploads/%'").get() as { count: number };
  const legacyInAlbums = db.prepare("SELECT count(*) as count FROM gallery_albums WHERE cover_image_url LIKE '/uploads/%'").get() as { count: number };
  db.close();

  check(legacyInMedia.count === 0, "16. media_assets table has 0 legacy '/uploads/' URLs");
  check(legacyInAlbums.count === 0, "17. gallery_albums table has 0 legacy '/uploads/' URLs");

  // 8. Public Gallery Page HTML Structure
  const galleryPageRes = await fetch(`${BASE_URL}/gallery`);
  const galleryHtml = await galleryPageRes.text();
  check(galleryPageRes.status === 200, "18. Public /gallery route renders with HTTP 200 OK");
  check(galleryHtml.includes("Photo &amp; Media Archive") || galleryHtml.includes("Photo & Media Archive"), "19. Gallery header rendered");

  // 9. Album Detail Page with Migrated Item
  const albumDetailRes = await fetch(`${BASE_URL}/gallery/national-arabic-debate-championship-2024`);
  const albumDetailHtml = await albumDetailRes.text();
  check(albumDetailRes.status === 200, "20. Album detail page renders with HTTP 200 OK");
  check(
    albumDetailHtml.includes("/api/media/gallery/2024-2025/national-arabic-debate-championship-2024/"),
    "21. Migrated /api/media/... asset URL is directly rendered in album detail markup"
  );

  console.log("==================================================================");
  console.log(`Live Verification Summary: ${passed} / ${total} tests passed.`);
  console.log("==================================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runLiveVerification().catch((err) => {
  console.error("Live verification crashed:", err);
  process.exit(1);
});
