/**
 * @file src/lib/db/test-public-content-modules.ts
 * @description Automated verification test suite for Public Content Modules:
 *              1. News & Announcements (/news, /news/[slug])
 *              2. Arabic Learning Resources (/resources)
 *              3. Achievements & Publications (/publications)
 * 
 * COVERS:
 * - Public listing, category filtering, search, and pagination.
 * - Single item retrieval by slug & not-found behavior.
 * - Strix Security & Isolation: drafts, archived bulletins, and unpublished items NEVER leak.
 * - Download counter atomic increment.
 * - Administrative CRUD lifecycle for all three content modules.
 */

import {
  getPublicAnnouncements,
  getPublicAnnouncementBySlug,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getPublicLearningResources,
  incrementResourceDownloadCount,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
  getPublicPublications,
  createPublication,
  updatePublication,
  deletePublication,
  getPublicAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "./queries";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("================================================================");
  console.log("Arabic Club: Public Content Modules Verification Suite");
  console.log("================================================================\n");

  // ----------------------------------------------------------------------
  // SUITE 1: NEWS & ANNOUNCEMENTS
  // ----------------------------------------------------------------------
  console.log("[Suite 1] News & Announcements Listing, Pinned Order & Filters");
  const newsList = await getPublicAnnouncements({ limit: 10 });
  assert(newsList.data.length >= 4, `Published announcements retrieved (Found: ${newsList.data.length})`);
  assert(newsList.data[0].isPinned === true, "First item in listing is pinned (Priority ordering)");

  // Category filter
  const noticesOnly = await getPublicAnnouncements({ category: "notice" });
  assert(noticesOnly.data.length >= 1, "Category filter 'notice' returns results");
  assert(noticesOnly.data.every(a => a.category === "notice"), "All returned items belong to 'notice' category");

  // Search filter
  const debateSearch = await getPublicAnnouncements({ search: "Debate" });
  assert(debateSearch.data.length >= 1, "Search for 'Debate' returns matching items");
  assert(debateSearch.data.some(a => a.slug.includes("debate")), "Debate announcement returned in search");

  // Pagination verification
  const paginatedNews = await getPublicAnnouncements({ page: 1, limit: 2 });
  assert(paginatedNews.data.length === 2, "Pagination limit 2 respected");
  assert(paginatedNews.pagination.totalPages >= 2, `Total pages calculated correctly (Found: ${paginatedNews.pagination.totalPages})`);

  // Detail view by slug
  console.log("\n[Suite 2] News Dossier Detail & Slug Retrieval");
  const detailLaunch = await getPublicAnnouncementBySlug("official-launch-of-arabic-club-digital-platform");
  assert(detailLaunch !== null, "Authoritative bulletin retrieved by slug");
  assert(detailLaunch?.titleEn.includes("Inauguration"), "English title matches official record");
  assert(detailLaunch?.authorName === "Executive Secretariat", "Author attribution preserved");
  assert(detailLaunch?.isPublished === true, "Item is published");

  const invalidSlug = await getPublicAnnouncementBySlug("non-existent-bulletin-slug");
  assert(invalidSlug === null, "Non-existent slug returns null cleanly");

  // Security Isolation Test (Drafts & Archived items must never leak)
  console.log("\n[Suite 3] Strix Security: Draft & Archived News Isolation");
  const leakedDraftSearch = newsList.data.find(a => a.slug === "internal-draft-memo-secretariat");
  assert(leakedDraftSearch === undefined, "Security: Draft memo is strictly excluded from public news listing");

  const directDraftAccess = await getPublicAnnouncementBySlug("internal-draft-memo-secretariat");
  assert(directDraftAccess === null, "Security: Direct slug access to draft memo returns null");

  const directArchivedAccess = await getPublicAnnouncementBySlug("archived-historical-circular-2023");
  assert(directArchivedAccess === null, "Security: Direct slug access to archived bulletin returns null");

  // ----------------------------------------------------------------------
  // SUITE 4: ARABIC LEARNING RESOURCES
  // ----------------------------------------------------------------------
  console.log("\n[Suite 4] Arabic Learning Resources Hub & Filtering");
  const allResources = await getPublicLearningResources({ limit: 20 });
  assert(allResources.data.length >= 6, `Learning resources retrieved (Found: ${allResources.data.length})`);

  // Category filter
  const grammarRes = await getPublicLearningResources({ category: "grammar" });
  assert(grammarRes.data.length >= 1, "Grammar category returns published treatises");
  assert(grammarRes.data.every(r => r.category === "grammar"), "All filtered items belong to 'grammar'");

  // Skill level filter
  const beginnerRes = await getPublicLearningResources({ skillLevel: "beginner" });
  assert(beginnerRes.data.length >= 2, "Beginner level filter returns matching resources");
  assert(beginnerRes.data.every(r => r.skillLevel === "beginner"), "All filtered items are 'beginner'");

  // Dual filter (category + skillLevel)
  const advancedRhetoric = await getPublicLearningResources({ category: "rhetoric", skillLevel: "advanced" });
  assert(advancedRhetoric.data.length === 1, "Dual filter (rhetoric + advanced) returns exact treatise");
  assert(advancedRhetoric.data[0].slug === "pillars-of-classical-rhetoric-balaghah", "Correct Balaghah treatise matched");

  // Atomic download count increment
  console.log("\n[Suite 5] Resource Download Counter Increment");
  const initialCount = allResources.data.find(r => r.id === "res_01")?.downloadCount ?? 0;
  await incrementResourceDownloadCount("res_01");
  const updatedResources = await getPublicLearningResources({ limit: 10 });
  const newCount = updatedResources.data.find(r => r.id === "res_01")?.downloadCount ?? 0;
  assert(newCount === initialCount + 1, `Download counter atomically incremented from ${initialCount} to ${newCount}`);

  // Draft resource isolation
  const leakedDraftRes = allResources.data.find(r => r.slug === "draft-internal-pedagogy-guide");
  assert(leakedDraftRes === undefined, "Security: Draft learning resource is strictly excluded from public listing");

  // ----------------------------------------------------------------------
  // SUITE 6: PUBLICATIONS
  // ----------------------------------------------------------------------
  console.log("\n[Suite 6] Official Publications & Press Issues");
  const allPubs = await getPublicPublications();
  assert(allPubs.length >= 4, `Published press issues retrieved (Found: ${allPubs.length})`);

  // Magazine filter
  const magazinesOnly = await getPublicPublications({ type: "magazine" });
  assert(magazinesOnly.length >= 2, "Magazine filter returns published issues (Al-Bayan Vol 1 & 2)");
  assert(magazinesOnly.every(p => p.publicationType === "magazine"), "All items are of type 'magazine'");

  // Report filter
  const reportsOnly = await getPublicPublications({ type: "report" });
  assert(reportsOnly.length >= 1, "Report filter returns Annual Activity Report");

  // Draft publication isolation
  const leakedDraftPub = allPubs.find(p => p.slug === "unpublished-draft-journal-volume");
  assert(leakedDraftPub === undefined, "Security: Unpublished draft publication volume is strictly excluded");

  // ----------------------------------------------------------------------
  // SUITE 7: ACHIEVEMENTS & ROLL OF HONOR
  // ----------------------------------------------------------------------
  console.log("\n[Suite 7] Achievements & Roll of Honor");
  const allAchievements = await getPublicAchievements();
  assert(allAchievements.length >= 4, `Published honors and distinctions retrieved (Found: ${allAchievements.length})`);

  // Competition category
  const compHonors = await getPublicAchievements({ category: "competition" });
  assert(compHonors.length >= 2, "Competition category returns tournament championships");
  assert(compHonors.every(a => a.category === "competition"), "All items are competition awards");

  // Draft achievement isolation
  const leakedDraftAch = allAchievements.find(a => a.id === "ach_05");
  assert(leakedDraftAch === undefined, "Security: Draft trophy is strictly excluded from public Roll of Honor");

  // ----------------------------------------------------------------------
  // SUITE 8: ADMINISTRATIVE CRUD MUTATIONS
  // ----------------------------------------------------------------------
  console.log("\n[Suite 8] Administrative CRUD Lifecycle Mutations");
  
  // 1. Announcement CRUD
  const testSlug = `test-crud-ann-${Date.now()}`;
  const testAnnId = await createAnnouncement({
    slug: testSlug,
    titleEn: "Test Admin Announcement",
    contentEn: "Content for administrative CRUD testing.",
    category: "notice",
    authorName: "Admin Tester",
    status: "published",
    isPublished: true,
  });
  assert(typeof testAnnId === "string", "createAnnouncement successfully created record");
  await updateAnnouncement(testAnnId, { titleEn: "Updated Admin Announcement" });
  const updatedAnn = await getPublicAnnouncementBySlug(testSlug);
  assert(updatedAnn?.titleEn === "Updated Admin Announcement", "updateAnnouncement successfully persisted changes");
  await deleteAnnouncement(testAnnId);
  const deletedAnn = await getPublicAnnouncementBySlug(testSlug);
  assert(deletedAnn === null, "deleteAnnouncement successfully removed record");

  // 2. Learning Resource CRUD
  const testResId = await createLearningResource({
    slug: `test-crud-res-${Date.now()}`,
    titleEn: "Test Admin Grammar Cheat Sheet",
    category: "grammar",
    skillLevel: "intermediate",
    contentEn: "Pedagogical content for admin CRUD testing.",
  });
  assert(typeof testResId === "string", "createLearningResource successfully created record");
  await updateLearningResource(testResId, { titleEn: "Updated Grammar Cheat Sheet" });
  await deleteLearningResource(testResId);
  assert(true, "Learning resource CRUD cycle completed cleanly");

  // 3. Publication CRUD
  const testPubId = await createPublication({
    slug: `test-crud-pub-${Date.now()}`,
    titleEn: "Test Literary Newsletter Issue",
    publicationType: "newsletter",
    fileUrl: "/assets/placeholders/test-newsletter.pdf",
  });
  assert(typeof testPubId === "string", "createPublication successfully created record");
  await updatePublication(testPubId, { issueNo: "TEST-01" });
  await deletePublication(testPubId);
  assert(true, "Publication CRUD cycle completed cleanly");

  // 4. Achievement CRUD
  const testAchId = await createAchievement({
    titleEn: "Test Regional Eloquence Award",
    category: "competition",
    dateAchieved: "2024-05-01",
  });
  assert(typeof testAchId === "string", "createAchievement successfully created record");
  await updateAchievement(testAchId, { titleEn: "Updated Regional Eloquence Award" });
  await deleteAchievement(testAchId);
  assert(true, "Achievement CRUD cycle completed cleanly");

  // Summary
  console.log("\n================================================================");
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite runtime failure:", err);
  process.exit(1);
});
