# TASKS: 010 - Public Content Modules (News, Learning Resources, Achievements & Publications)

- [x] Task 1: Enhance `src/lib/db/schema.ts` for `announcements` with optional fields (`coverImageUrl`, `summaryEn`, `summaryAr`, `authorName`) and apply database migration.
- [x] Task 2: Implement query and administrative mutation functions in `src/lib/db/queries.ts` for News, Learning Resources, and Publications/Achievements.
- [x] Task 3: Seed comprehensive and authentic data fixtures in `src/lib/db/seed.ts` (including draft records for isolation verification).
- [x] Task 4: Upgrade `/news` (`src/app/(public)/news/page.tsx`) with search, category filtering, pagination, cover image rendering, and empty states.
- [x] Task 5: Implement `/news/[slug]` (`src/app/(public)/news/[slug]/page.tsx`) with complete bilingual editorial brief, author attribution, back navigation, and dynamic SEO metadata.
- [x] Task 6: Upgrade `/resources` (`src/app/(public)/resources/page.tsx`) with category filters, skill-level pills, search, download buttons, and authentic Arabic typography.
- [x] Task 7: Upgrade `/publications` (`src/app/(public)/publications/page.tsx`) with official magazine/bulletin downloads and Roll of Honor verified achievements.
- [x] Task 8: Implement automated verification test suite `src/lib/db/test-public-content-modules.ts` covering visibility isolation, search, filtering, slug retrieval, and admin CRUD.
- [x] Task 9: Execute automated tests and resolve any bugs or errors.
- [x] Task 10: Run Next.js production build (`pnpm exec next build`) to ensure 0 errors across all routes.
- [x] Task 11: Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`.
