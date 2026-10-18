# TASKS: 021 - Quality Pass, Accessibility Audit, SEO & Performance

## Phase 1: SEO Architecture & Dynamic Routing (US2)
- [x] T001 [P] [US2] Implement dynamic robots rules route in `src/app/robots.ts`
- [x] T002 [P] [US2] Implement dynamic XML sitemap indexing published content in `src/app/sitemap.ts`
- [x] T003 [P] [US2] Build Schema.org JSON-LD structured data component in `src/components/seo/JsonLd.tsx`
- [x] T004 [US2] Update root layout with metadataBase, Open Graph, Twitter, canonical, and JsonLd in `src/app/layout.tsx`
- [x] T005 [US2] Configure admin layout with strict robots noindex and nofollow in `src/app/admin/layout.tsx`

## Phase 2: Page-Specific Metadata Hardening (US2)
- [x] T006 [P] [US2] Add metadata to Events hub in `src/app/(public)/events/page.tsx`
- [x] T007 [P] [US2] Add dynamic generateMetadata to Event detail route in `src/app/(public)/events/[slug]/page.tsx`
- [x] T008 [P] [US2] Add metadata to Gallery catalog in `src/app/(public)/gallery/page.tsx`
- [x] T009 [P] [US2] Add metadata to News & Announcements in `src/app/(public)/news/page.tsx`
- [x] T010 [P] [US2] Add metadata to Publications & Roll of Honor in `src/app/(public)/publications/page.tsx`
- [x] T011 [P] [US2] Add metadata to Learning Resources in `src/app/(public)/resources/page.tsx`
- [x] T012 [P] [US2] Add metadata to Institutional Policies in `src/app/(public)/policies/page.tsx`

## Phase 3: Accessibility & Performance Optimization (US1 & US3)
- [x] T013 [P] [US1] Add accessible skip-to-content link and landmark targeting in `src/app/layout.tsx` and `src/app/(public)/layout.tsx`
- [x] T014 [P] [US1] Wrap admin workspace in semantic main landmark with id in `src/components/layout/AdminShell.tsx`
- [x] T015 [P] [US3] Add native lazy-loading and async decoding to public image elements in `src/components/home/GalleryPreviewSection.tsx`, `src/app/(public)/members/page.tsx`, `src/app/(public)/leadership/page.tsx`, and `src/app/(public)/founders/page.tsx`

## Phase 4: Live Verification, Audit Report & Handover
- [x] T016 Build automated live quality and accessibility verification test suite in `src/lib/db/test-quality-pass.ts`
- [x] T017 Build Next.js application (`next build`) and start production server on port 3000
- [x] T018 Run automated quality test suite against live server and verify 100% passing results
- [x] T019 Author comprehensive audit dossier in `docs/QUALITY_AUDIT.md`
- [x] T020 Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
