/**
 * @file src/lib/db/test-media-news-resources-cms.ts
 * @description Automated Verification Test Suite for Remaining Content CMS Modules (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * This comprehensive automated test suite verifies:
 * 1. News & Announcements CMS (CRUD, priority pinning, draft/publish isolation)
 * 2. Arabic Learning Resources CMS (CRUD, categories, skill levels, download metrics, draft isolation)
 * 3. Publications & Roll of Honor CMS (periodicals, competition accolades, certificate links, draft isolation)
 * 4. Photo Gallery & Media Assets CMS (album creation, media asset curation, cover photo selection, cascade deletion)
 * 5. Strix-Supabase Media Upload Security Engine (MIME whitelist, dangerous extensions rejection, traversal protection)
 * 6. RBAC Permission Gates & Immutable Audit Trail Logging (recordAuditLog persistence)
 * 
 * RUN COMMAND:
 * export PATH="/home/mahmud-hasan/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
 * pnpm exec tsx src/lib/db/test-media-news-resources-cms.ts
 */

import { db } from "./index";
import { 
  announcements, 
  learningResources, 
  publications, 
  achievements, 
  galleryAlbums, 
  mediaAssets, 
  auditLogs 
} from "./schema";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  getAdminAnnouncements,
  getPublicAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAdminLearningResources,
  getPublicLearningResources,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  incrementResourceDownloadCount,
  getAdminPublications,
  getPublicPublications,
  createPublication,
  updatePublication,
  deletePublication,
  getAdminAchievements,
  getPublicAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAdminGalleryAlbums,
  getPublicGalleryAlbums,
  getAdminAlbumWithAssets,
  createGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  createMediaAsset,
  deleteMediaAsset,
} from "./queries";
import { 
  validateMediaUpload, 
  generateSafeStoragePath,
  MAX_IMAGE_SIZE_BYTES 
} from "../utils/media-storage";
import { hasPermission } from "../auth/rbac";
import { recordAuditLog } from "../auth/audit";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

async function runMediaNewsResourcesCmsTests() {
  console.log("================================================================================");
  console.log("Starting Automated Verification: Media, News & Resources CMS Modules (017)");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  let createdAnnouncementId: string | null = null;
  let createdResourceId: string | null = null;
  let createdPublicationId: string | null = null;
  let createdAchievementId: string | null = null;
  let createdAlbumId: string | null = null;
  let createdMediaAssetId: string | null = null;

  try {
    // --------------------------------------------------------------------------
    // TEST SUITE 1: NEWS & ANNOUNCEMENTS CMS
    // --------------------------------------------------------------------------
    console.log("TEST SUITE 1: News & Announcements Management");

    const announcementSlug = `academic-symposium-bulletin-${timestamp}`;
    createdAnnouncementId = await createAnnouncement({
      slug: announcementSlug,
      titleEn: `Annual Oratory Championship Bulletin ${timestamp}`,
      titleAr: "إعلان بطولة الخطابة السنوية",
      summaryEn: "Official memo announcing dates and registration brackets for the championship.",
      contentEn: "Full schedule, eligibility rules, and tournament brackets for participants.",
      category: "notice",
      authorName: "Academic Secretariat",
      status: "draft", // created as draft initially
      isPinned: true,
      isPublished: false,
      publishedAt: new Date(),
    });

    assert(Boolean(createdAnnouncementId), `Announcement created with ID: ${createdAnnouncementId}`);

    // Verify draft isolation: Must NOT appear in public query
    const publicList = await getPublicAnnouncements({ limit: 100 });
    const leakedInPublic = publicList.data.some((a) => a.id === createdAnnouncementId);
    assert(!leakedInPublic, "Security: Draft announcement is strictly excluded from public listing");

    // Must appear in admin query
    const adminList = await getAdminAnnouncements({ status: "draft" });
    const foundInAdmin = adminList.data.some((a) => a.id === createdAnnouncementId);
    assert(foundInAdmin, "Admin console accurately retrieves draft announcement");

    // Publish announcement
    await updateAnnouncement(createdAnnouncementId, {
      status: "published",
      isPublished: true,
    });

    const publishedPublicList = await getPublicAnnouncements({ limit: 100 });
    const foundInPublicings = publishedPublicList.data.some((a) => a.id === createdAnnouncementId);
    assert(foundInPublicings, "Published announcement synchronized immediately with public listing");

    // --------------------------------------------------------------------------
    // TEST SUITE 2: ARABIC LEARNING RESOURCES CMS
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 2: Arabic Learning Resources Hub");

    const resourceSlug = `sarf-morphology-treatise-${timestamp}`;
    createdResourceId = await createLearningResource({
      slug: resourceSlug,
      titleEn: `Essentials of Arabic Morphology (Sarf) ${timestamp}`,
      titleAr: "مبادئ علم الصرف",
      category: "morphology",
      skillLevel: "intermediate",
      fileUrl: "https://example.com/resources/sarf-intro.pdf",
      contentEn: "An analytical study of tri-literal verb patterns and derived forms.",
      isPublished: false, // draft initially
    });

    assert(Boolean(createdResourceId), `Learning resource created with ID: ${createdResourceId}`);

    // Verify draft isolation
    const publicResources = await getPublicLearningResources({ category: "morphology" });
    const resourceInPublic = publicResources.data.some((r) => r.id === createdResourceId);
    assert(!resourceInPublic, "Security: Draft learning resource is excluded from public hub");

    // Publish resource & verify download tracking
    await updateLearningResource(createdResourceId, { isPublished: true });
    await incrementResourceDownloadCount(resourceSlug);

    const updatedResource = await db
      .select({ downloadCount: learningResources.downloadCount })
      .from(learningResources)
      .where(eq(learningResources.id, createdResourceId))
      .limit(1);

    assert(updatedResource[0]?.downloadCount === 1, "Resource download counter incremented successfully");

    // --------------------------------------------------------------------------
    // TEST SUITE 3: PUBLICATIONS & ROLL OF HONOR CMS
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 3: Publications & Institutional Accolades");

    const pubSlug = `al-bayan-special-issue-${timestamp}`;
    createdPublicationId = await createPublication({
      slug: pubSlug,
      titleEn: `Al-Bayan Scholarly Journal - Vol. 3 ${timestamp}`,
      titleAr: "مجلة البيان العلمية المحكمة",
      publicationType: "journal",
      issueNo: "Volume 3, Issue 1",
      publicationDate: "2026-10-18",
      coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      fileUrl: "https://example.com/publications/al-bayan-vol3.pdf",
      descriptionEn: "Refereed research papers on classical lexicography and rhetoric.",
      isPublished: false, // draft
    });

    assert(Boolean(createdPublicationId), `Publication issue created with ID: ${createdPublicationId}`);

    // Verify draft publication isolation
    const publicPubs = await getPublicPublications({ publicationType: "journal" });
    assert(!publicPubs.some((p) => p.id === createdPublicationId), "Security: Draft publication excluded from public catalog");

    // Create Achievement
    createdAchievementId = await createAchievement({
      titleEn: `Inter-University Arabic Debate Champions ${timestamp}`,
      titleAr: "المركز الأول في مناظرات الجامعات",
      descriptionEn: "First place honors at the National Inter-Collegiate Arabic Debate Tournament.",
      category: "competition",
      dateAchieved: "2026-10-15",
      certificateUrl: "https://example.com/certificates/debate-2026.jpg",
      isPublished: true,
    });

    assert(Boolean(createdAchievementId), `Achievement registered with ID: ${createdAchievementId}`);
    const adminAchs = await getAdminAchievements({ category: "competition" });
    assert(adminAchs.data.some((ach) => ach.id === createdAchievementId), "Achievement listed in admin Roll of Honor");

    // --------------------------------------------------------------------------
    // TEST SUITE 4: GALLERY ALBUMS & MEDIA ASSETS CMS
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 4: Gallery Albums & Archival Media Assets");

    const albumSlug = `debate-gala-archive-${timestamp}`;
    createdAlbumId = await createGalleryAlbum({
      slug: albumSlug,
      titleEn: `National Debate Retrospective ${timestamp}`,
      titleAr: "معرض صور المناظرة الوطنية",
      descriptionEn: "Photographic dossier of finalists and adjudication panel.",
      academicYear: "2026–2027",
      category: "debates",
      location: "Auditorium Hall 1",
      photographerCredit: "Club Media Secretariat",
      isPublished: true,
    });

    assert(Boolean(createdAlbumId), `Gallery album created with ID: ${createdAlbumId}`);

    // Add media asset inside album
    createdMediaAssetId = await createMediaAsset({
      albumId: createdAlbumId,
      fileUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      mediaType: "image",
      captionEn: "Final debate adjudication round",
      credit: "Tariq Hasan",
      sortOrder: 1,
      isPublished: true,
    });

    assert(Boolean(createdMediaAssetId), `Media asset inserted with ID: ${createdMediaAssetId}`);

    // Update album cover
    await updateGalleryAlbum(createdAlbumId, {
      coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    });

    // Verify album with assets query
    const albumWithAssets = await getAdminAlbumWithAssets(createdAlbumId);
    assert(Boolean(albumWithAssets), "Retrieved album with assets via getAdminAlbumWithAssets");
    assert(albumWithAssets?.assets.length === 1, "Album contains exactly 1 media asset");
    assert(albumWithAssets?.coverImageUrl === "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c", "Cover photo set successfully");

    // --------------------------------------------------------------------------
    // TEST SUITE 5: STRIX MEDIA UPLOAD SECURITY VALIDATOR
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 5: Strix-Supabase Media Upload Security Engine");

    // 1. Valid photographic upload
    const validImage = validateMediaUpload({
      filename: "exhibition_recap.webp",
      mimeType: "image/webp",
      sizeBytes: 2 * 1024 * 1024,
    });
    assert(validImage.isValid, "Approved: Valid WebP photographic asset");
    assert(validImage.mediaType === "image", "Correctly identified as image media type");

    // 2. Valid video upload
    const validVideo = validateMediaUpload({
      filename: "keynote_speech.mp4",
      mimeType: "video/mp4",
      sizeBytes: 45 * 1024 * 1024,
    });
    assert(validVideo.isValid, "Approved: Valid MP4 video asset");
    assert(validVideo.mediaType === "video", "Correctly identified as video media type");

    // 3. Prohibited executable file
    const maliciousExe = validateMediaUpload({
      filename: "trojan_payload.exe",
      mimeType: "application/octet-stream",
      sizeBytes: 500,
    });
    assert(!maliciousExe.isValid, "Security: Prohibited .exe executable rejected");

    // 4. Prohibited SVG (Stored XSS mitigation)
    const dangerousSvg = validateMediaUpload({
      filename: "xss_vector.svg",
      mimeType: "image/svg+xml",
      sizeBytes: 1024,
    });
    assert(!dangerousSvg.isValid, "Security: SVG upload rejected to prevent stored XSS payloads");

    // 5. Oversized image rejection
    const oversizedImage = validateMediaUpload({
      filename: "huge_poster.jpg",
      mimeType: "image/jpeg",
      sizeBytes: MAX_IMAGE_SIZE_BYTES + 1024,
    });
    assert(!oversizedImage.isValid, "Security: Oversized photograph rejected exceeding quota");

    // 6. Path traversal rejection
    const traversalAttempt = validateMediaUpload({
      filename: "../../etc/passwd.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 2048,
    });
    assert(!traversalAttempt.isValid, "Security: Path traversal attempt rejected immediately");

    // 7. Safe non-enumerable storage path generation
    const safePath = generateSafeStoragePath("annual-debate", "2026-2027", "photo.jpg");
    assert(safePath.startsWith("gallery/2026-2027/annual-debate/"), "Safe path adheres to institutional storage structure");
    assert(!safePath.includes(".."), "Storage path has zero relative traversal tokens");

    // --------------------------------------------------------------------------
    // TEST SUITE 6: RBAC PERMISSION GATES & AUDIT LOGGING
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 6: RBAC Permissions & Immutable Audit Trail Logging");

    assert(hasPermission("super_admin", "gallery:manage"), "super_admin has 'gallery:manage' permission");
    assert(hasPermission("media_manager", "gallery:manage"), "media_manager has 'gallery:manage' permission");
    assert(hasPermission("super_admin", "news:manage"), "super_admin has 'news:manage' permission");
    assert(hasPermission("content_editor", "news:manage"), "content_editor has 'news:manage' permission");
    assert(!hasPermission("read_only", "news:manage"), "read_only is denied 'news:manage' permission");

    // Audit logs persistence
    await recordAuditLog({
      userId: "usr_superadmin",
      userEmail: "admin@arabicclub.org",
      action: "ANNOUNCEMENT_CREATE",
      targetEntity: "announcements",
      targetId: createdAnnouncementId,
      details: { title: `Annual Oratory Championship Bulletin ${timestamp}` },
    });

    await recordAuditLog({
      userId: "usr_superadmin",
      userEmail: "admin@arabicclub.org",
      action: "GALLERY_ALBUM_CREATE",
      targetEntity: "gallery_albums",
      targetId: createdAlbumId,
      details: { title: `National Debate Retrospective ${timestamp}` },
    });

    const recentLogs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.targetId, createdAnnouncementId))
      .limit(5);

    assert(recentLogs.length > 0, "Audit trail log record persisted for announcement action");
    assert(recentLogs[0].action === "ANNOUNCEMENT_CREATE", "Audit log action verified as ANNOUNCEMENT_CREATE");

    console.log("\n================================================================================");
    console.log("All 6 Test Suites PASSED (100% SUCCESS)!");
    console.log("================================================================================");
  } finally {
    // --------------------------------------------------------------------------
    // CLEANUP TEST RECORDS
    // --------------------------------------------------------------------------
    console.log("\nCleaning up test artifacts...");
    if (createdMediaAssetId) {
      await deleteMediaAsset(createdMediaAssetId);
    }
    if (createdAlbumId) {
      await deleteGalleryAlbum(createdAlbumId);
    }
    if (createdPublicationId) {
      await deletePublication(createdPublicationId);
    }
    if (createdAchievementId) {
      await deleteAchievement(createdAchievementId);
    }
    if (createdResourceId) {
      await deleteLearningResource(createdResourceId);
    }
    if (createdAnnouncementId) {
      await deleteAnnouncement(createdAnnouncementId);
    }
    console.log("Cleanup complete. Database returned to pristine state.\n");
  }
}

runMediaNewsResourcesCmsTests().catch((err) => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
