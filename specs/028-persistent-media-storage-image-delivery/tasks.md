# TASKS: 028 - Persistent Media Storage and Image Delivery

## Phase 1: Binary Content Inspection & Magic Byte Engine
- [x] T001 Implement `inspectFileSignature(buffer: Buffer)` in `src/lib/utils/media-storage.ts` for JPEG, PNG, WebP, AVIF, MP4, and WebM with embedded script rejection
- [x] T002 Enhance `validateMediaUpload` to incorporate binary buffer inspection alongside MIME and extension checks

## Phase 2: Storage Provider Abstraction & Adapters
- [x] T003 Create unified storage engine in `src/lib/storage/index.ts` with `StorageProvider` interface
- [x] T004 Implement `SupabaseStorageProvider` supporting direct REST uploads, public URLs, and signed URL generation
- [x] T005 Implement `DurableVolumeStorageProvider` supporting atomic local file persistence and directory management
- [x] T006 Expose factory function `getStorageProvider()` reading environment configuration dynamically

## Phase 3: Secure Delivery Controller & Private Access Control
- [x] T007 Create secure media delivery endpoint in `src/app/api/media/[...path]/route.ts` with range requests and caching headers
- [x] T008 Implement publication access checks (public access for published assets, 403/404 for private/draft assets)
- [x] T009 Implement administrative session bypass and cryptographic signed URL token validation for private preview

## Phase 4: Upload Pipeline Hardening & Orphan Prevention
- [x] T010 Update `src/app/api/admin/gallery/upload/route.ts` with `getStorageProvider()`, magic byte verification, and compensating cleanup on DB failure
- [x] T011 Update `src/lib/actions/content-cms.ts` deletion actions (`deleteMediaAssetAction`, `bulkUpdateMediaAssetsAction`) with shared media reference checks to preserve multi-referenced files

## Phase 5: Backup, Recovery Documentation & Test Verification
- [x] T012 Author comprehensive operational and disaster recovery guide in `docs/STORAGE_ARCHITECTURE_AND_BACKUP_GUIDE.md`
- [x] T013 Author automated verification test suite in `src/lib/db/test-persistent-storage.ts`
- [x] T014 Add `test:storage` script to `package.json` and execute all test suites (`test:storage`, `test:gallery`, `test:admin`, `test`)
- [x] T015 Run TypeScript typecheck (`pnpm typecheck`) and Next.js production build (`pnpm build`)
- [x] T016 Deliver comprehensive final report in Bengali with strictly zero AI emojis
