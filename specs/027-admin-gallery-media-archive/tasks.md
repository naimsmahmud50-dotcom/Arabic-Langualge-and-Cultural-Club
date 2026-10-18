# TASKS: 027 - Complete Admin-Managed Gallery and Media Archive

## Phase 1: Database Schema & Storage Infrastructure
- [x] T001 [P] Extend database schema with `dateNotes` and `isArchived` on `gallery_albums`, and `altText` on `media_assets` in `src/lib/db/schema.ts`
- [x] T002 Apply schema migrations to SQLite database in `arabic_club.db`
- [x] T003 Ensure `.gitignore` ignores `public/uploads/` while allowing folder structure in `.gitignore`
- [x] T004 Implement authenticated batch media upload endpoint in `src/app/api/admin/gallery/upload/route.ts`

## Phase 2: Server Actions & Query Engine Enhancements
- [x] T005 [P] [US1] Update album queries and actions to support `dateNotes`, `isArchived`, and status filtering in `src/lib/db/queries.ts` and `src/lib/actions/content-cms.ts`
- [x] T006 [P] [US3] Implement `bulkUpdateMediaAssetsAction` and `reorderMediaAssetsAction` in `src/lib/actions/content-cms.ts`
- [x] T007 [US3] Add `getAdminAlbumMediaAssets` query in `src/lib/db/queries.ts` to retrieve all assets including unpublished items

## Phase 3: Admin Console UI Refinement
- [x] T008 [US1] Update `src/app/admin/gallery/AlbumFormModal.tsx` to include approximate date notes and publication/archive status controls
- [x] T009 [US1] Update `src/app/admin/gallery/AdminGalleryClient.tsx` with pagination, album status filters (All/Published/Draft/Archived), and archive toggles
- [x] T010 [US2] Update `src/app/admin/gallery/MediaAssetModal.tsx` with drag-and-drop batch file selection, previews, upload progress, and validation feedback
- [x] T011 [US3] Add asset metadata editor (`captionEn`, `captionAr`, `altText`, `sortOrder`), multi-selection checkboxes, and bulk action controls in `src/app/admin/gallery/MediaAssetModal.tsx`

## Phase 4: Public Gallery Quality & Accessibility Pass
- [x] T012 [P] [US4] Update `src/app/(public)/gallery/page.tsx` to exclude archived albums from public listing
- [x] T013 [P] [US4] Verify and enhance accessible image descriptions and lightbox in `src/app/(public)/gallery/[slug]/AlbumMediaGrid.tsx` and `MediaLightbox.tsx`

## Phase 5: Verification & Automated Test Suite
- [x] T014 Author automated verification test suite in `src/lib/db/test-gallery-cms.ts`
- [x] T015 Add `test:gallery` script to `package.json` and execute test suite against live server
- [x] T016 Run TypeScript typecheck (`pnpm typecheck`) and Next.js production build (`pnpm build`)
- [x] T017 Author comprehensive Bengali summary report with strictly zero AI emojis
