/**
 * @file src/lib/db/test-gallery-media-archive.ts
 * @description Automated Verification Test Suite for Photo & Media Gallery Archive.
 * 
 * SYSTEM COVERAGE:
 * 1. Public Album Listings with photo counts and pagination.
 * 2. Category filtering across multiple disciplines (debates, calligraphy, symposia, etc.).
 * 3. Academic year filtering (2024–2025, 2023–2024).
 * 4. Keyword search across titles, descriptions, and locations.
 * 5. Event link cross-referencing joins.
 * 6. Single album dossier retrieval with photos and video asset discrimination.
 * 7. Strix-Supabase Security Isolation (draft album and draft media protection).
 * 8. Media Storage Security Validator (MIME types, dangerous extensions, size limits, path sanitization).
 * 9. Administrative CRUD mutations for albums and media assets.
 * 
 * RUN COMMAND:
 * export PATH="/home/mahmud-hasan/.local/bin:$PATH" && pnpm exec tsx src/lib/db/test-gallery-media-archive.ts
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import {
  getPublicGalleryAlbums,
  getPublicGalleryAlbumBySlug,
  getAlbumMediaAssets,
  getPublicGalleryYears,
  createGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
} from "./queries";
import {
  validateMediaUpload,
  generateSafeStoragePath,
  isMediaAssetPubliclyVisible,
  assertZeroClientStorageLeaks,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  DANGEROUS_EXTENSIONS,
} from "../utils/media-storage";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, extraInfo: string = "") {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${testName} ${extraInfo ? `(${extraInfo})` : ""}`);
  }
}

async function runGalleryTestSuite() {
  console.log("\n================================================================================");
  console.log("PHOTO & MEDIA GALLERY ARCHIVE: AUTOMATED VERIFICATION TEST SUITE");
  console.log("================================================================================\n");

  // --------------------------------------------------------------------------
  // TEST GROUP 1: PUBLIC ALBUM LISTINGS & PAGINATION
  // --------------------------------------------------------------------------
  console.log("--- Group 1: Public Album Listings & Aggregations ---");
  const allAlbumsResult = await getPublicGalleryAlbums();
  assert(allAlbumsResult.data.length >= 5, "Retrieves all published archival albums (at least 5)");
  assert(allAlbumsResult.pagination.total >= 5, "Returns accurate pagination metadata");
  
  const sampleAlbum = allAlbumsResult.data[0];
  assert(typeof sampleAlbum.mediaCount === "number" && sampleAlbum.mediaCount > 0, "Computes subquery mediaCount accurately without N+1 query", `Got: ${sampleAlbum.mediaCount}`);
  assert(!!sampleAlbum.titleEn && !!sampleAlbum.slug, "Each album contains verified title and unique slug");

  // --------------------------------------------------------------------------
  // TEST GROUP 2: CATEGORY & YEAR FILTERING
  // --------------------------------------------------------------------------
  console.log("\n--- Group 2: Category & Academic Year Filtering ---");
  const debateAlbums = await getPublicGalleryAlbums({ category: "debates" });
  assert(debateAlbums.data.length >= 1, "Filters albums by category: debates");
  assert(debateAlbums.data.every(a => a.category === "debates"), "All returned albums match 'debates' category");

  const calligraphyAlbums = await getPublicGalleryAlbums({ category: "calligraphy" });
  assert(calligraphyAlbums.data.length >= 1, "Filters albums by category: calligraphy");
  assert(calligraphyAlbums.data.every(a => a.category === "calligraphy"), "All returned albums match 'calligraphy' category");

  const year2425Albums = await getPublicGalleryAlbums({ year: "2024–2025" });
  assert(year2425Albums.data.length >= 3, "Filters albums by academic year: 2024–2025");
  assert(year2425Albums.data.every(a => a.academicYear === "2024–2025"), "All returned albums match '2024–2025' session");

  const distinctYears = await getPublicGalleryYears();
  assert(distinctYears.includes("2024–2025") && distinctYears.includes("2023–2024"), "Retrieves distinct published academic sessions");

  // --------------------------------------------------------------------------
  // TEST GROUP 3: SEARCH KEYWORD FILTERING
  // --------------------------------------------------------------------------
  console.log("\n--- Group 3: Search Keyword Matching ---");
  const debateSearch = await getPublicGalleryAlbums({ search: "Debate" });
  assert(debateSearch.data.length >= 1, "Search for 'Debate' finds debate championship album");
  assert(debateSearch.data[0].slug === "national-arabic-debate-championship-2024", "Top search match is accurate");

  const locationSearch = await getPublicGalleryAlbums({ search: "Rare Book Conservation" });
  assert(locationSearch.data.length >= 1, "Search by location keywords matches correctly");

  const emptySearch = await getPublicGalleryAlbums({ search: "unmatched_term_xyz_404" });
  assert(emptySearch.data.length === 0, "Unmatched keyword search returns empty array gracefully");

  // --------------------------------------------------------------------------
  // TEST GROUP 4: EVENT LINK CROSS-REFERENCING JOINS
  // --------------------------------------------------------------------------
  console.log("\n--- Group 4: Event Link Joins ---");
  const debateAlbum = allAlbumsResult.data.find(a => a.slug === "national-arabic-debate-championship-2024");
  assert(!!debateAlbum, "Found debate championship album");
  assert(!!debateAlbum?.relatedEventSlug, "Debate album contains joined relatedEventSlug");
  assert(!!debateAlbum?.relatedEventTitle, "Debate album contains joined relatedEventTitle");

  // --------------------------------------------------------------------------
  // TEST GROUP 5: SINGLE ALBUM DOSSIER & MEDIA ASSETS
  // --------------------------------------------------------------------------
  console.log("\n--- Group 5: Single Album Dossier & Lightbox Media Assets ---");
  const albumDossier = await getPublicGalleryAlbumBySlug("national-arabic-debate-championship-2024");
  assert(!!albumDossier, "Fetches single album dossier by slug");
  assert(albumDossier?.photos.length === 4, "Album dossier contains exactly 4 published media assets", `Got: ${albumDossier?.photos.length}`);
  
  const videoAsset = albumDossier?.photos.find(p => p.mediaType === "video");
  assert(!!videoAsset, "Album dossier contains video asset");
  assert(Boolean(videoAsset?.videoUrl?.includes(".mp4")), "Video asset has valid video streaming/file URL");

  const imageAssets = albumDossier?.photos.filter(p => p.mediaType === "image") || [];
  assert(imageAssets.length === 3, "Album dossier contains 3 photographic image assets");
  assert(imageAssets[0].sortOrder <= imageAssets[1].sortOrder, "Media assets are returned in ascending sortOrder");

  // --------------------------------------------------------------------------
  // TEST GROUP 6: STRIX SUPABASE SECURITY & DRAFT ISOLATION
  // --------------------------------------------------------------------------
  console.log("\n--- Group 6: Strix-Supabase Security & Draft Isolation ---");
  const draftAlbum = await getPublicGalleryAlbumBySlug("internal-draft-album-unreleased");
  assert(draftAlbum === null, "SECURITY: Draft album ('isPublished = false') returns null to public queries");

  const publicSlugs = allAlbumsResult.data.map(a => a.slug);
  assert(!publicSlugs.includes("internal-draft-album-unreleased"), "SECURITY: Draft album is strictly excluded from public catalog feed");

  const nonExistent = await getPublicGalleryAlbumBySlug("completely-fake-slug-404");
  assert(nonExistent === null, "Non-existent slug returns null cleanly");

  // Check draft photo inside album
  const draftPhotos = await getAlbumMediaAssets("alb_06_draft");
  assert(draftPhotos.length === 0, "SECURITY: Draft media assets inside draft albums return 0 records from public queries");

  // Assert client storage leaks checker
  assert(assertZeroClientStorageLeaks(), "SECURITY: Storage secret leak assertion passes cleanly");

  // --------------------------------------------------------------------------
  // TEST GROUP 7: MEDIA STORAGE SECURITY VALIDATOR
  // --------------------------------------------------------------------------
  console.log("\n--- Group 7: Media Storage Security Validator ---");
  // Permitted image
  const validPhoto = validateMediaUpload({
    filename: "oration-championship.webp",
    mimeType: "image/webp",
    sizeBytes: 2 * 1024 * 1024,
  });
  assert(validPhoto.isValid === true, "Validator approves valid WebP photograph");
  assert(validPhoto.mediaType === "image", "Correctly classifies as image");

  // Permitted video
  const validVideo = validateMediaUpload({
    filename: "debate-rebuttal.mp4",
    mimeType: "video/mp4",
    sizeBytes: 45 * 1024 * 1024,
  });
  assert(validVideo.isValid === true, "Validator approves valid MP4 video under quota");
  assert(validVideo.mediaType === "video", "Correctly classifies as video");

  // Rejection: Dangerous executable extension
  const exeUpload = validateMediaUpload({
    filename: "trojan.exe",
    mimeType: "application/octet-stream",
    sizeBytes: 1024,
  });
  assert(exeUpload.isValid === false, "SECURITY: Prohibits executable file extension (.exe)");

  // Rejection: Dangerous script extension
  const phpUpload = validateMediaUpload({
    filename: "webshell.php",
    mimeType: "text/x-php",
    sizeBytes: 1024,
  });
  assert(phpUpload.isValid === false, "SECURITY: Prohibits server-side script extension (.php)");

  // Rejection: Stored XSS SVG upload
  const svgUpload = validateMediaUpload({
    filename: "exploit.svg",
    mimeType: "image/svg+xml",
    sizeBytes: 1024,
  });
  assert(svgUpload.isValid === false, "SECURITY: Prohibits SVG files to protect against Stored XSS vectors");

  // Rejection: Path traversal in filename
  const traversalUpload = validateMediaUpload({
    filename: "../../etc/passwd.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 1024,
  });
  assert(traversalUpload.isValid === false, "SECURITY: Rejects directory traversal in filename (../)");

  // Rejection: Oversized photo (> 15MB)
  const hugePhoto = validateMediaUpload({
    filename: "massive-raw.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 20 * 1024 * 1024,
  });
  assert(hugePhoto.isValid === false, "SECURITY: Rejects photograph exceeding 15MB size ceiling");

  // Path generator test
  const safeStorageKey = generateSafeStoragePath("Arabic Debate", "2024–2025", "clean-photo.webp");
  assert(safeStorageKey.startsWith("gallery/2024-2025/arabic-debate/"), "Safe storage key generates canonical structure without unsafe characters");
  assert(!safeStorageKey.includes(".."), "Storage key has zero path traversal tokens");

  // --------------------------------------------------------------------------
  // TEST GROUP 8: ADMINISTRATIVE CRUD MUTATIONS
  // --------------------------------------------------------------------------
  console.log("\n--- Group 8: Administrative CRUD Mutations ---");
  const testAlbumId = `test_alb_${Date.now()}`;
  const testSlug = `test-symposium-album-${Date.now()}`;

  // 1. Create album
  await createGalleryAlbum({
    id: testAlbumId,
    slug: testSlug,
    titleEn: "Automated QA Test Symposium",
    titleAr: "ألبوم اختبار الجودة الآلي",
    category: "symposia",
    academicYear: "2024–2025",
    eventDate: "2025-05-01",
    location: "Test Hall",
    photographerCredit: "QA Bot",
    isPublished: true,
  });

  const createdAlbum = await getPublicGalleryAlbumBySlug(testSlug);
  assert(!!createdAlbum && createdAlbum.titleEn === "Automated QA Test Symposium", "Admin: Successfully created new gallery album");

  // 2. Add media asset
  const testMediaId = `test_med_${Date.now()}`;
  await createMediaAsset({
    id: testMediaId,
    albumId: testAlbumId,
    fileUrl: "/assets/test/photo1.webp",
    mediaType: "image",
    captionEn: "QA Test Photo Caption",
    captionAr: "شرح صورة اختبار الجودة",
    credit: "QA Camera",
    sortOrder: 1,
    isPublished: true,
  });

  const albumWithMedia = await getPublicGalleryAlbumBySlug(testSlug);
  assert(albumWithMedia?.photos.length === 1, "Admin: Successfully ingested media asset into album");
  assert(albumWithMedia?.photos[0].captionEn === "QA Test Photo Caption", "Media asset caption matches input");

  // 3. Update media asset
  await updateMediaAsset(testMediaId, {
    captionEn: "Updated QA Photo Caption",
  });
  const updatedMediaList = await getAlbumMediaAssets(testAlbumId);
  assert(updatedMediaList[0].captionEn === "Updated QA Photo Caption", "Admin: Successfully updated media asset");

  // 4. Update album
  await updateGalleryAlbum(testAlbumId, {
    titleEn: "Updated QA Test Symposium",
  });
  const updatedAlbum = await getPublicGalleryAlbumBySlug(testSlug);
  assert(updatedAlbum?.titleEn === "Updated QA Test Symposium", "Admin: Successfully updated gallery album");

  // 5. Delete media asset
  await deleteMediaAsset(testMediaId);
  const mediaAfterDelete = await getAlbumMediaAssets(testAlbumId);
  assert(mediaAfterDelete.length === 0, "Admin: Successfully deleted media asset");

  // 6. Delete album
  await deleteGalleryAlbum(testAlbumId);
  const deletedAlbumCheck = await getPublicGalleryAlbumBySlug(testSlug);
  assert(deletedAlbumCheck === null, "Admin: Successfully deleted gallery album");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`TEST RUN COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runGalleryTestSuite().catch((err) => {
  console.error("Test execution encountered uncaught error:", err);
  process.exit(1);
});
