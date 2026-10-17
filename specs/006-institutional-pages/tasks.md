# TASKS: 006 - Institutional Information Pages

## Phase 1: Database Seed & Query Helpers
- [x] T001: Seed `editable_pages` and `page_sections` in `src/lib/db/seed.ts` for `'about'` and `'history'` with verified institutional content.
- [x] T002: Implement `getPageWithSections(slug: string)` and typed interfaces in `src/lib/db/queries.ts`.
- [x] T003: Write automated test in `src/lib/db/test-institutional-pages.ts` to verify data integrity and empty state fallbacks.

## Phase 2: Implement `/about` Page
- [x] T004: Enhance `src/app/(public)/about/page.tsx` to dynamically query database for `'about'`, rendering Mission, Vision, Core Values, Four Pillars, Constitution, and Cross-links.
- [x] T005: Integrate dignified empty state fallback in `/about` when content is missing or unpublished.
- [x] T006: Add SEO metadata with OpenGraph tags and canonical URLs.

## Phase 3: Implement `/history` Page
- [x] T007: Enhance `src/app/(public)/history/page.tsx` to dynamically query database for `'history'`, rendering Institutional Genesis, Chronological Timeline with verified milestone nodes, and Archival Protocol.
- [x] T008: Integrate dignified empty state fallback in `/history` when milestones are missing or unpublished.
- [x] T009: Add SEO metadata with OpenGraph tags and canonical URLs.

## Phase 4: Verification, Build & Documentation
- [x] T010: Run database tests and verify 100% pass rate.
- [x] T011: Run `pnpm next build` and verify clean compilation with 0 errors.
- [x] T012: Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`.
