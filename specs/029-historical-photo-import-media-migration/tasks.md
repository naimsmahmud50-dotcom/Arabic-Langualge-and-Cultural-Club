# TASKS: 029 - Safe Historical Photo Import and Media Migration

## Phase 1: Repository Media Inventory & Migration Manifest Engine
- [x] T001 [US3] Create `src/lib/utils/inventory-media.ts` scanner to catalog all existing media files with SHA-256 hashes, sizes, and MIME types without altering files
- [x] T002 [US3] Generate comprehensive migration manifest at `docs/MEDIA_MIGRATION_MANIFEST.md` with source references, proposed albums, and conflict analysis

## Phase 2: Batch Import Backend Controller & Duplicate Detection
- [x] T003 [US2] Implement authenticated batch import endpoint in `src/app/api/admin/gallery/import/route.ts` with duplicate detection, metadata binding, and compensating rollback
- [x] T004 [US2] Enhance `src/lib/db/queries.ts` with helper queries to detect duplicate assets by filename and size in an album (`findDuplicateMediaInAlbum`)

## Phase 3: Administrative Bulk Import Wizard UI & Staging Workflow
- [x] T005 [US1] [US2] Create `src/app/admin/gallery/BulkImportModal.tsx` supporting multi-file selection, local previews, pre-commit review table, duplicate warnings, and draft/publish controls
- [x] T006 [US1] [US2] Integrate `BulkImportModal` into `src/app/admin/gallery/AdminGalleryClient.tsx` with dedicated "Batch Import Photos" action

## Phase 4: Automated Verification Test Suite
- [x] T007 [US4] Create automated test suite in `src/lib/db/test-historical-import.ts` testing representative import, duplicate detection, draft/publish separation, ordering, and cover selection
- [x] T008 [US4] Add `test:import` script to `package.json` and execute all test suites (`test:import`, `test:storage`, `test:gallery`, `test:admin`, `test`)
- [x] T009 [US4] Execute TypeScript typecheck (`pnpm typecheck`) and Next.js production build (`pnpm build`)
- [x] T010 [US4] Deliver comprehensive final report in Bengali with strictly zero AI emojis
