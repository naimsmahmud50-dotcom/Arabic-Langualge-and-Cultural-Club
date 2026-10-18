/**
 * DEVELOPER NOTE:
 * File: src/lib/db/test-event-gallery-integration.ts
 * Module: Automated Integration Test Suite
 * Phase 8 Enhancement (030-event-to-gallery-website-integration):
 * - Verifies future event creation, draft vs. published state isolation.
 * - Verifies event-to-gallery album association via `relatedEventId`.
 * - Verifies strict duplicate album prevention when an event already has an album.
 * - Verifies public bidirectional linkages: Event page -> Album and Album page -> Event.
 * - Verifies draft album isolation in public queries.
 * - Verifies admin event queries enrichment with album metadata.
 * Strictly human vibe; zero AI emojis.
 */

import { db } from "./index";
import { events, galleryAlbums, mediaAssets } from "./schema";
import { eq } from "drizzle-orm";
import { 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getPublicEventBySlug, 
  getAdminEvents, 
  getAdminEventById,
  createGalleryAlbum, 
  updateGalleryAlbum, 
  deleteGalleryAlbum, 
  getPublicGalleryAlbumBySlug,
  getPublicGalleryAlbumByEventId,
  getAlbumByRelatedEventId,
  createMediaAsset
} from "./queries";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`[FAIL] ${testName}${detail ? ` - Detail: ${detail}` : ""}`);
  }
}

async function runIntegrationSuite() {
  console.log("================================================================================");
  console.log("PHASE 8: EVENT-TO-GALLERY WORKFLOW & INTEGRATION VERIFICATION TEST");
  console.log("Institution: Kabi Nazrul Government College, Dhaka");
  console.log("Society: Arabic Language & Cultural Club");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testEventSlug = `test-symposium-${timestamp}`;
  const testAlbumSlug = `test-album-symposium-${timestamp}`;

  let createdEventId: string | null = null;
  let createdAlbumId: string | null = null;

  try {
    // -------------------------------------------------------------------------
    // TEST SECTION 1: Event Lifecycle & Draft Isolation
    // -------------------------------------------------------------------------
    console.log("--- 1. Event Creation & Draft Isolation ---");

    const futureDate = new Date(Date.now() + 86400000 * 7); // 7 days in future
    createdEventId = await createEvent({
      slug: testEventSlug,
      titleEn: "National Arabic Linguistics Symposium 2026",
      titleAr: "الندوة الوطنية لعلم اللغويات العربية ٢٠٢٦",
      summaryEn: "Academic symposium examining classical Arabic phonology and grammar.",
      category: "symposia",
      startTime: futureDate,
      venue: "Central Auditorium, Kabi Nazrul Government College",
      status: "confirmed",
      isRegistrationOpen: true,
      isPublished: false, // Created as Draft
    });

    assert(Boolean(createdEventId), "Event record created successfully in database");

    // Verify draft event is isolated from public query
    const publicDraftEvent = await getPublicEventBySlug(testEventSlug);
    assert(publicDraftEvent === null, "Draft event is isolated from public queries (returns null)");

    // Publish event
    await updateEvent(createdEventId, { isPublished: true });
    const publicPublishedEvent = await getPublicEventBySlug(testEventSlug);
    assert(publicPublishedEvent !== null, "Published event is retrievable via getPublicEventBySlug");
    assert(publicPublishedEvent?.titleEn === "National Arabic Linguistics Symposium 2026", "Published event metadata matches authoritative record");

    // -------------------------------------------------------------------------
    // TEST SECTION 2: Event-to-Gallery Association & Draft Isolation
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Event-to-Gallery Association & Draft Isolation ---");

    // Initially, no album should be linked to the event
    const initialLinkedAlbum = await getAlbumByRelatedEventId(createdEventId);
    assert(initialLinkedAlbum === null, "No album initially linked to newly created event");

    const initialPublicAlbum = await getPublicGalleryAlbumByEventId(createdEventId);
    assert(initialPublicAlbum === null, "Public album query returns null when no album is linked");

    // Create an album linked to this event as Draft (isPublished: false)
    createdAlbumId = await createGalleryAlbum({
      slug: testAlbumSlug,
      titleEn: "Symposium Proceedings Photographic Archive",
      titleAr: "الأرشيف الصوري لوقائع الندوة",
      descriptionEn: "Curated high-resolution photographs preserving academic sessions.",
      academicYear: "2026–2027",
      category: "symposia",
      relatedEventId: createdEventId,
      location: "Central Auditorium, Kabi Nazrul Government College",
      isPublished: false, // Draft
      isArchived: false,
    });

    assert(Boolean(createdAlbumId), "Gallery album linked to event created successfully");

    // Admin query resolves the linked draft album
    const adminLinkedAlbum = await getAlbumByRelatedEventId(createdEventId);
    assert(adminLinkedAlbum !== null, "Admin lookup getAlbumByRelatedEventId finds linked album");
    assert(adminLinkedAlbum?.id === createdAlbumId, "Linked album ID matches created album");

    // Public query MUST NOT expose draft album
    const publicDraftLinkedAlbum = await getPublicGalleryAlbumByEventId(createdEventId);
    assert(publicDraftLinkedAlbum === null, "Public query getPublicGalleryAlbumByEventId isolates draft album (returns null)");

    // Add a representative photograph to the album
    await createMediaAsset({
      albumId: createdAlbumId,
      fileUrl: "/uploads/gallery/test_photo.jpg",
      mediaType: "image",
      captionEn: "Keynote presentation by department chair",
      sortOrder: 1,
      isPublished: true,
    });

    // Publish the album
    await updateGalleryAlbum(createdAlbumId, { isPublished: true });

    // Public query now returns the published album with media assets
    const publicPublishedLinkedAlbum = await getPublicGalleryAlbumByEventId(createdEventId);
    assert(publicPublishedLinkedAlbum !== null, "Public query returns album after publication");
    assert(publicPublishedLinkedAlbum?.id === createdAlbumId, "Public album ID matches created album");
    assert(publicPublishedLinkedAlbum?.mediaCount === 1, "Public album mediaCount accurately reflects contained photographs");
    assert(publicPublishedLinkedAlbum?.photoCount === 1, "Public album photoCount accurately calculated");

    // -------------------------------------------------------------------------
    // TEST SECTION 3: Duplicate Album Prevention
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Duplicate Album Prevention ---");

    // Attempt to create a second album for the same event
    let duplicateErrorThrown = false;
    let duplicateErrorMessage = "";
    try {
      await createGalleryAlbum({
        slug: `duplicate-${timestamp}`,
        titleEn: "Duplicate Album for Same Event",
        academicYear: "2026–2027",
        category: "symposia",
        relatedEventId: createdEventId,
        isPublished: true,
      });
    } catch (e: any) {
      duplicateErrorThrown = true;
      duplicateErrorMessage = e.message;
    }

    assert(
      duplicateErrorThrown,
      "Duplicate album creation for the same event is rejected with an exception"
    );
    assert(
      duplicateErrorMessage.includes("Duplicate album prevented"),
      "Duplicate rejection error clearly communicates prevention constraint"
    );

    // Updating the existing album with the SAME relatedEventId is permitted
    let updateSameAlbumSuccess = false;
    try {
      await updateGalleryAlbum(createdAlbumId, {
        titleEn: "Symposium Proceedings Photographic Archive (Updated)",
        relatedEventId: createdEventId,
      });
      updateSameAlbumSuccess = true;
    } catch (e) {
      updateSameAlbumSuccess = false;
    }

    assert(
      updateSameAlbumSuccess === true,
      "Updating the existing album retaining its relatedEventId succeeds without false duplicate trigger"
    );

    // -------------------------------------------------------------------------
    // TEST SECTION 4: Admin Events Query Enrichment
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Admin Events Query Enrichment ---");

    const adminEventsList = await getAdminEvents({ search: testEventSlug });
    const matchingAdminEvent = adminEventsList.data.find(e => e.id === createdEventId);

    assert(Boolean(matchingAdminEvent), "getAdminEvents retrieves the created event");
    assert(matchingAdminEvent?.albumId === createdAlbumId, "getAdminEvents enriches event with correct albumId");
    assert(matchingAdminEvent?.albumSlug === testAlbumSlug, "getAdminEvents enriches event with correct albumSlug");
    assert(matchingAdminEvent?.albumIsPublished === true, "getAdminEvents enriches event with correct albumIsPublished");

    const adminEventById = await getAdminEventById(createdEventId);
    assert(adminEventById !== null, "getAdminEventById retrieves event details");
    assert(adminEventById?.albumId === createdAlbumId, "getAdminEventById enriches event with albumId");

    // -------------------------------------------------------------------------
    // TEST SECTION 5: Bidirectional Public Navigation Linkages
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Bidirectional Public Navigation Linkages ---");

    // Album -> Event direction
    const albumDossier = await getPublicGalleryAlbumBySlug(testAlbumSlug);
    assert(albumDossier !== null, "Album dossier retrievable by slug");
    assert(albumDossier?.relatedEventSlug === testEventSlug, "Album dossier exposes relatedEventSlug pointing to event");
    assert(albumDossier?.relatedEventTitle === "National Arabic Linguistics Symposium 2026", "Album dossier exposes relatedEventTitle");

    // Event -> Album direction
    const eventAlbumLink = await getPublicGalleryAlbumByEventId(createdEventId);
    assert(eventAlbumLink !== null, "Event page query resolves linked album");
    assert(eventAlbumLink?.slug === testAlbumSlug, "Event page resolves correct album slug for deep-link");

    console.log("\n[VERIFIED] Bidirectional linkage confirmed: /events/" + testEventSlug + " <---> /gallery/" + testAlbumSlug);

  } catch (err: any) {
    console.error("[FATAL ERROR] Unexpected exception during integration suite:", err);
    failedCount++;
  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP & TEARDOWN
    // -------------------------------------------------------------------------
    console.log("\n--- Teardown & Clean-up ---");
    if (createdAlbumId) {
      await db.delete(mediaAssets).where(eq(mediaAssets.albumId, createdAlbumId));
      await deleteGalleryAlbum(createdAlbumId);
      console.log("[PASS] Test album and media records cleaned up");
    }
    if (createdEventId) {
      await deleteEvent(createdEventId);
      console.log("[PASS] Test event record cleaned up");
    }
  }

  console.log("\n================================================================================");
  console.log(`TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runIntegrationSuite();
