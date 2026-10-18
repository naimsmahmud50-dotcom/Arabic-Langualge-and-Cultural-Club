# TASKS: 011 - Photo & Media Gallery and Archive System

- [x] **Task 1: Schema Enhancement & SQLite Migration** <!-- id: 1 -->
  - [x] Add `relatedEventId`, `photographerCredit`, and `location` columns to `galleryAlbums` in `src/lib/db/schema.ts`
  - [x] Add `mediaType` (`image` or `video`) and `videoUrl` columns to `mediaAssets` in `src/lib/db/schema.ts`
  - [x] Create `src/lib/db/migrations/0004_gallery_enhancements.sql`
  - [x] Run migration runner `pnpm exec tsx src/lib/db/migrate.ts`

- [x] **Task 2: Storage Validator & Security Utility** <!-- id: 2 -->
  - [x] Create `src/lib/utils/media-storage.ts` with strict MIME type checking, size caps, safe path generation, and credential protection
  - [x] Add JSDoc headers for new developers explaining Strix security boundaries

- [x] **Task 3: Database Queries & Administrative Operations** <!-- id: 3 -->
  - [x] Update `getPublicGalleryAlbums` in `src/lib/db/queries.ts` to support category, year, and search filtering with photo counts
  - [x] Update `getPublicGalleryAlbumBySlug` in `src/lib/db/queries.ts` with event joins and sorted media assets
  - [x] Implement `getPublicGalleryYears` and `getPublicGalleryCategories`
  - [x] Implement admin CRUD functions for albums and media assets

- [x] **Task 4: Database Seeding with Archival Media Records** <!-- id: 4 -->
  - [x] Update `src/lib/db/seed.ts` with 5 verified historic albums linked to real events
  - [x] Seed media assets with bilingual captions, photographer credits, and video assets
  - [x] Seed 1 unpublished album with media assets to test draft protection
  - [x] Execute `pnpm exec tsx src/lib/db/seed.ts`

- [x] **Task 5: Interactive Lightbox Client Component** <!-- id: 5 -->
  - [x] Build `src/app/(public)/gallery/[slug]/MediaLightbox.tsx` with keyboard accessibility (`Esc`, `ArrowLeft`, `ArrowRight`), video playback, focus trapping, and counter

- [x] **Task 6: Upgraded Gallery Overview & Detail Pages** <!-- id: 6 -->
  - [x] Upgrade `src/app/(public)/gallery/page.tsx` with category filters, academic year filter, search bar, and institutional cards
  - [x] Upgrade `src/app/(public)/gallery/[slug]/page.tsx` with event-linked banner, media grid, lightbox integration, and SEO metadata
  - [x] Include clear JSDoc headers explaining route, UX, and security for new developers

- [x] **Task 7: Automated Test Suite & Build Verification** <!-- id: 7 -->
  - [x] Create `src/lib/db/test-gallery-media-archive.ts` covering data filtering, slug lookup, draft isolation, storage validation, and admin mutations
  - [x] Run test suite until 100% pass (47/47 tests passed)
  - [x] Run `pnpm exec next build` to guarantee 0 TypeScript/ESLint errors
  - [x] Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
