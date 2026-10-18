# TASKS: 017 - Remaining Content Management Modules

## Phase 1: Database Query Layer
- [x] T001 Implement administrative query functions in `src/lib/db/queries.ts`:
  - `getAdminAnnouncements(params)`
  - `getAdminLearningResources(params)`
  - `getAdminPublications(params)`
  - `getAdminAchievements(params)`
  - `getAdminGalleryAlbums(params)`
  - `getAdminAlbumWithAssets(id)`

## Phase 2: Secure Server Actions Layer (RBAC & Audit Logging)
- [x] T002 Create `src/lib/actions/content-cms.ts` with secure Server Actions:
  - News: `saveAnnouncementAction`, `toggleAnnouncementPinAction`, `deleteAnnouncementAction`
  - Resources: `saveLearningResourceAction`, `deleteLearningResourceAction`
  - Publications: `savePublicationAction`, `deletePublicationAction`
  - Achievements: `saveAchievementAction`, `deleteAchievementAction`
  - Gallery: `saveGalleryAlbumAction`, `deleteGalleryAlbumAction`, `saveMediaAssetAction`, `deleteMediaAssetAction`, `setAlbumCoverAction`
  - Media Upload Security: `validateAndUploadMediaAction`

## Phase 3: Administrative UI Components & Modals
- [x] T003 Implement Photo Gallery CMS (`/admin/gallery`):
  - `src/app/admin/gallery/AlbumFormModal.tsx`
  - `src/app/admin/gallery/MediaAssetModal.tsx`
  - `src/app/admin/gallery/AdminGalleryClient.tsx`
  - Upgrade `src/app/admin/gallery/page.tsx`
- [x] T004 Implement News & Announcements CMS (`/admin/news`):
  - `src/app/admin/news/AnnouncementFormModal.tsx`
  - `src/app/admin/news/AdminNewsClient.tsx`
  - Upgrade `src/app/admin/news/page.tsx`
- [x] T005 Implement Arabic Learning Resources CMS (`/admin/resources`):
  - `src/app/admin/resources/ResourceFormModal.tsx`
  - `src/app/admin/resources/AdminResourcesClient.tsx`
  - Upgrade `src/app/admin/resources/page.tsx`
- [x] T006 Implement Achievements & Publications CMS (`/admin/publications`):
  - `src/app/admin/publications/PublicationFormModal.tsx`
  - `src/app/admin/publications/AchievementFormModal.tsx`
  - `src/app/admin/publications/AdminPublicationsClient.tsx`
  - Upgrade `src/app/admin/publications/page.tsx`

## Phase 4: Automated Verification & Handover
- [x] T007 Create automated verification test suite in `src/lib/db/test-media-news-resources-cms.ts`
- [x] T008 Execute verification test suite and ensure 100% pass rate
- [x] T009 Execute full project regression tests across all 13 test suites
- [x] T010 Run `pnpm exec next build` verifying clean production build
- [x] T011 Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
