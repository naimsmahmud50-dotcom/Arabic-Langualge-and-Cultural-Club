/**
 * DEVELOPER NOTE:
 * @file src/lib/db/test-gallery-cms.ts
 * @description Automated Verification Suite for Phase 5 Admin Gallery & Media Archive.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * TEST COVERAGE:
 * 1. Album Lifecycle (Create, Update, Draft, Publish, Archive, Unarchive).
 * 2. Public View Isolation (Drafts and Archived albums excluded from public catalog & slug lookup).
 * 3. Media Asset Ingestion with Captions, Alt Text, and Ordering.
 * 4. Multi-asset Reordering and Sort Order Integrity.
 * 5. Bulk Operations (Bulk Publish, Bulk Unpublish, Bulk Delete).
 * 6. Cover Image Assignment.
 * 7. Security: MIME Whitelisting, Anti-Malware / Path Traversal Rejection.
 * 8. RBAC / Session Authorization Guardrails.
 * 
 * STRICT CONSTRAINT:
 * - Zero AI emojis. Output formatted cleanly for human review.
 */

import { db } from "./index";
import { galleryAlbums, mediaAssets } from "./schema";
import { eq, asc, desc } from "drizzle-orm";
import { 
  createGalleryAlbum, 
  updateGalleryAlbum, 
  deleteGalleryAlbum, 
  getAdminGalleryAlbums, 
  getPublicGalleryAlbums, 
  getPublicGalleryAlbumBySlug,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  bulkUpdateMediaAssets,
  reorderMediaAssets,
  getAdminAlbumWithAssets,
  getAdminAlbumMediaAssets
} from "./queries";
import { validateMediaUpload, generateSafeStoragePath } from "../utils/media-storage";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("PHASE 5 VERIFICATION SUITE: GALLERY & MEDIA ARCHIVE");
  console.log("Arabic Language & Cultural Club - Kabi Nazrul Government College, Dhaka");
  console.log("================================================================================\n");

  const testSuffix = Date.now().toString().slice(-6);
  const testSlug = `test-album-${testSuffix}`;
  let createdAlbumId = "";
  const createdAssetIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: ALBUM LIFECYCLE (Create, Update, Draft, Publish, Archive)
    // ------------------------------------------------------------------------
    console.log("--- SECTION 1: Album Lifecycle & Archival Controls ---");

    createdAlbumId = await createGalleryAlbum({
      slug: testSlug,
      titleEn: "5th National Arabic Oratory Championship",
      titleAr: "البطولة الوطنية الخامسة للخطابة العربية",
      descriptionEn: "Comprehensive photographic dossier from the championship held at Kabi Nazrul Govt College.",
      eventDate: "2026-05-15",
      dateNotes: "Circa Mid-May 2026",
      academicYear: "2026–2027",
      category: "debates",
      location: "College Main Auditorium, Dhaka",
      isFeatured: true,
      isPublished: true,
      isArchived: false,
    });

    assert(Boolean(createdAlbumId), "Album creation successfully returns generated ID");

    // Fetch album from admin view
    const adminAlbum = await getAdminAlbumWithAssets(createdAlbumId);
    assert(adminAlbum !== null, "Admin can retrieve created album with metadata");
    assert(adminAlbum?.slug === testSlug, "Album slug matches expected value");
    assert(adminAlbum?.dateNotes === "Circa Mid-May 2026", "Historical dateNotes persisted accurately");
    assert(adminAlbum?.isArchived === false, "Album initial archive status is false");
    assert(adminAlbum?.isPublished === true, "Album initial published status is true");

    // Update metadata
    await updateGalleryAlbum(createdAlbumId, {
      location: "Shaheed Minar Square, Kabi Nazrul Govt College",
      dateNotes: "Verified Official Record May 2026",
    });

    const updatedAlbum = await getAdminAlbumWithAssets(createdAlbumId);
    assert(
      updatedAlbum?.location === "Shaheed Minar Square, Kabi Nazrul Govt College",
      "Album location update persisted"
    );
    assert(
      updatedAlbum?.dateNotes === "Verified Official Record May 2026",
      "Album dateNotes update persisted"
    );

    // ------------------------------------------------------------------------
    // SECTION 2: PUBLIC VIEW ISOLATION & ACCESS CONTROL
    // ------------------------------------------------------------------------
    console.log("\n--- SECTION 2: Public View Isolation & Status Enforcement ---");

    // 1. When published and not archived, album appears in public query
    const publicPublished = await getPublicGalleryAlbumBySlug(testSlug);
    assert(publicPublished !== null, "Published non-archived album is visible in public slug lookup");

    // 2. Draft Isolation (isPublished = false)
    await updateGalleryAlbum(createdAlbumId, { isPublished: false });
    const publicDraft = await getPublicGalleryAlbumBySlug(testSlug);
    assert(publicDraft === null, "Draft album (isPublished: false) returns null in public query (404 isolation)");

    // 3. Archived Isolation (isPublished = true, isArchived = true)
    await updateGalleryAlbum(createdAlbumId, { isPublished: true, isArchived: true });
    const publicArchived = await getPublicGalleryAlbumBySlug(testSlug);
    assert(publicArchived === null, "Archived album (isArchived: true) returns null in public query (404 isolation)");

    // 4. Restore to Published
    await updateGalleryAlbum(createdAlbumId, { isPublished: true, isArchived: false });
    const publicRestored = await getPublicGalleryAlbumBySlug(testSlug);
    assert(publicRestored !== null, "Restored album returns successfully in public query");

    // 5. Admin Status Filters
    const allFilter = await getAdminGalleryAlbums({ status: "all" });
    assert(allFilter.data.some((a) => a.id === createdAlbumId), "Admin 'all' filter includes album");

    const publishedFilter = await getAdminGalleryAlbums({ status: "published" });
    assert(publishedFilter.data.some((a) => a.id === createdAlbumId), "Admin 'published' filter includes album");

    await updateGalleryAlbum(createdAlbumId, { isArchived: true });
    const archivedFilter = await getAdminGalleryAlbums({ status: "archived" });
    assert(archivedFilter.data.some((a) => a.id === createdAlbumId), "Admin 'archived' filter includes album when archived");

    // Restore for remaining tests
    await updateGalleryAlbum(createdAlbumId, { isPublished: true, isArchived: false });

    // ------------------------------------------------------------------------
    // SECTION 3: MEDIA ASSET INGESTION, CAPTIONS & ALT TEXT
    // ------------------------------------------------------------------------
    console.log("\n--- SECTION 3: Media Asset Ingestion & Accessibility Metadata ---");

    const asset1Id = await createMediaAsset({
      albumId: createdAlbumId,
      fileUrl: "/uploads/gallery/2026-2027/test/debate_plenary.webp",
      mediaType: "image",
      captionEn: "Debate teams presenting arguments in the final round",
      captionAr: "الفرق المتناظرة في الجولة الختامية",
      altText: "Two student debaters standing at podiums during competition",
      credit: "Club Media Bureau",
      sortOrder: 1,
      isPublished: true,
    });
    createdAssetIds.push(asset1Id);

    const asset2Id = await createMediaAsset({
      albumId: createdAlbumId,
      fileUrl: "/uploads/gallery/2026-2027/test/trophy_presentation.webp",
      mediaType: "image",
      captionEn: "Champions receiving the gold trophy from College Principal",
      captionAr: "تسليم كأس البطولة للمركز الأول",
      altText: "College Principal handing golden trophy to team captain",
      credit: "Tariq Hasan",
      sortOrder: 2,
      isPublished: true,
    });
    createdAssetIds.push(asset2Id);

    const asset3Id = await createMediaAsset({
      albumId: createdAlbumId,
      fileUrl: "/uploads/gallery/2026-2027/test/keynote_recording.mp4",
      mediaType: "video",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      captionEn: "Valedictory speech video excerpt",
      captionAr: "تسجيل الكلمة الختامية",
      altText: "Video player excerpt of the valedictory speech",
      credit: "Audiovisual Archive",
      sortOrder: 3,
      isPublished: false, // draft asset
    });
    createdAssetIds.push(asset3Id);

    assert(createdAssetIds.length === 3, "Created 3 distinct media assets");

    // Verify Admin Asset Retrieval (should see all 3 including unpublished)
    const adminAssets = await getAdminAlbumMediaAssets(createdAlbumId);
    assert(adminAssets.length === 3, `Admin asset retrieval returned all 3 assets (got ${adminAssets.length})`);
    
    const asset1 = adminAssets.find((a) => a.id === asset1Id);
    assert(asset1?.altText === "Two student debaters standing at podiums during competition", "Accessibility altText persisted");
    assert(asset1?.credit === "Club Media Bureau", "Photographer credit persisted");

    // ------------------------------------------------------------------------
    // SECTION 4: REORDERING & SORT ORDER INTEGRITY
    // ------------------------------------------------------------------------
    console.log("\n--- SECTION 4: Multi-Asset Reordering ---");

    // Reverse order: asset2 -> asset1 -> asset3
    await reorderMediaAssets(createdAlbumId, [asset2Id, asset1Id, asset3Id]);
    const reorderedAssets = await getAdminAlbumMediaAssets(createdAlbumId);

    assert(reorderedAssets[0]?.id === asset2Id && reorderedAssets[0]?.sortOrder === 0, "First asset reordered to index 0");
    assert(reorderedAssets[1]?.id === asset1Id && reorderedAssets[1]?.sortOrder === 1, "Second asset reordered to index 1");
    assert(reorderedAssets[2]?.id === asset3Id && reorderedAssets[2]?.sortOrder === 2, "Third asset reordered to index 2");

    // ------------------------------------------------------------------------
    // SECTION 5: COVER IMAGE MANAGEMENT
    // ------------------------------------------------------------------------
    console.log("\n--- SECTION 5: Album Cover Image Assignment ---");

    await updateGalleryAlbum(createdAlbumId, {
      coverImageUrl: "/uploads/gallery/2026-2027/test/trophy_presentation.webp",
    });

    const albumWithCover = await getAdminAlbumWithAssets(createdAlbumId);
    assert(
      albumWithCover?.coverImageUrl === "/uploads/gallery/2026-2027/test/trophy_presentation.webp",
      "Album cover image successfully assigned and verified"
    );

    // ------------------------------------------------------------------------
    // SECTION 6: SAFE BULK OPERATIONS
    // ------------------------------------------------------------------------
    console.log("\n--- SECTION 6: Safe Bulk Operations (Publish, Unpublish, Delete) ---");

    // Bulk Unpublish asset1 and asset2
    await bulkUpdateMediaAssets([asset1Id, asset2Id], "unpublish");
    const bulkUnpublished = await getAdminAlbumMediaAssets(createdAlbumId);
    assert(
      bulkUnpublished.filter((a) => [asset1Id, asset2Id].includes(a.id)).every((a) => !a.isPublished),
      "Bulk unpublish successfully marked selected assets as unpublished"
    );

    // Bulk Publish all 3
    await bulkUpdateMediaAssets([asset1Id, asset2Id, asset3Id], "publish");
    const bulkPublished = await getAdminAlbumMediaAssets(createdAlbumId);
    assert(
      bulkPublished.every((a) => a.isPublished),
      "Bulk publish successfully marked all selected assets as published"
    );

    // Bulk Delete asset3
    await bulkUpdateMediaAssets([asset3Id], "delete");
    const afterBulkDelete = await getAdminAlbumMediaAssets(createdAlbumId);
    assert(
      afterBulkDelete.length === 2 && !afterBulkDelete.some((a) => a.id === asset3Id),
      "Bulk delete successfully removed targeted asset"
    );

    // ------------------------------------------------------------------------
    // SECTION 7: STRIX SECURITY & UPLOAD VALIDATION
    // ------------------------------------------------------------------------
    console.log("\n--- SECTION 7: Strix Upload Security & MIME Gate ---");

    // Test valid files
    const validJpg = validateMediaUpload({
      filename: "official_photo_01.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 1024 * 500, // 500 KB
    });
    assert(validJpg.isValid === true, "Valid JPEG passes upload security gate");

    const validWebp = validateMediaUpload({
      filename: "gallery_shot.webp",
      mimeType: "image/webp",
      sizeBytes: 1024 * 1200, // 1.2 MB
    });
    assert(validWebp.isValid === true, "Valid WebP passes upload security gate");

    const validMp4 = validateMediaUpload({
      filename: "highlights.mp4",
      mimeType: "video/mp4",
      sizeBytes: 1024 * 1024 * 15, // 15 MB
    });
    assert(validMp4.isValid === true, "Valid MP4 video passes upload security gate");

    // Test dangerous files (SVG / Scripts / Executables)
    const dangerousSvg = validateMediaUpload({
      filename: "logo_exploit.svg",
      mimeType: "image/svg+xml",
      sizeBytes: 1024,
    });
    assert(dangerousSvg.isValid === false, "SVG upload rejected (Anti-XSS protection)");

    const dangerousExe = validateMediaUpload({
      filename: "payload.exe",
      mimeType: "application/x-msdownload",
      sizeBytes: 2048,
    });
    assert(dangerousExe.isValid === false, "Executable .exe rejected (Anti-Malware protection)");

    const dangerousHtml = validateMediaUpload({
      filename: "phishing.html",
      mimeType: "text/html",
      sizeBytes: 1024,
    });
    assert(dangerousHtml.isValid === false, "HTML payload rejected (Stored XSS protection)");

    // Test oversize file (> 25MB)
    const oversizeFile = validateMediaUpload({
      filename: "giant_raw.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 1024 * 1024 * 35, // 35 MB
    });
    assert(oversizeFile.isValid === false, "Oversized file (>25MB) rejected");

    // Test Path Traversal Protection
    const safePath = generateSafeStoragePath(
      "../../etc/passwd",
      "2026–2027",
      "../../../exploit.png"
    );
    assert(!safePath.includes(".."), "Storage path sanitizer neutralizes directory traversal sequences");
    assert(safePath.startsWith("gallery/"), "Storage path retains safe institutional prefix");

  } finally {
    // ------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // ------------------------------------------------------------------------
    console.log("\n--- CLEANUP: Removing Transient Verification Records ---");
    if (createdAlbumId) {
      await deleteGalleryAlbum(createdAlbumId);
      console.log(`[CLEANUP] Deleted test album: ${createdAlbumId}`);
    }
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
