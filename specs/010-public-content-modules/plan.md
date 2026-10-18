# TECHNICAL PLAN: 010 - Public Content Modules (News, Learning Resources, Achievements & Publications)

## 1. Database Schema & Migration Strategy
- `announcements` table:
  - Supports `id`, `slug`, `titleEn`, `titleAr`, `summaryEn`, `summaryAr`, `contentEn`, `contentAr`, `category` (`notice`, `news`, `press`, `achievement`), `coverImageUrl`, `authorName`, `isPinned`, `isPublished`, `publishedAt`, `expiresAt`, `createdAt`, `updatedAt`.
  - Execute a clean migration script or ensure schema compatibility for any new optional columns (`coverImageUrl`, `summaryEn`, `summaryAr`, `authorName`).
- `learningResources` table:
  - Supports `category` (`grammar`, `morphology`, `rhetoric`, `vocabulary`, `literature`, `reading`, `general`), `skillLevel` (`beginner`, `intermediate`, `advanced`), `fileUrl`, `downloadCount`, `contentEn`, `contentAr`, `isPublished`.
- `publications` table:
  - Supports `publicationType` (`magazine`, `newsletter`, `journal`, `report`), `issueNo`, `publicationDate`, `coverImageUrl`, `fileUrl`, `descriptionEn`, `descriptionAr`, `isPublished`.
- `achievements` table:
  - Supports `category` (`competition`, `academic`, `institutional`), `dateAchieved`, `certificateUrl`, `descriptionEn`, `descriptionAr`, `isPublished`.

---

## 2. Query Layer Enhancements (`src/lib/db/queries.ts`)
1. **News & Announcements:**
   - `getPublicAnnouncements(params)`: Supports pagination (`page`, `limit`), `category` filter, `search` query across English/Arabic titles and content, ordered by `isPinned` DESC, `publishedAt` DESC. Strictly filters `isPublished = true`.
   - `getPublicAnnouncementBySlug(slug)`: Returns single published announcement with full content or `null`.
   - Administrative CRUD: `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`.
2. **Learning Resources:**
   - `getPublicLearningResources(params)`: Supports pagination, `category` filter, `skillLevel` filter, and search.
   - `incrementResourceDownloadCount(id)`: Safely increments `downloadCount` by 1.
   - Administrative CRUD: `createLearningResource`, `updateLearningResource`, `deleteLearningResource`.
3. **Publications & Achievements:**
   - `getPublicPublications(params)`: Filters by `publicationType`, strictly `isPublished = true`.
   - `getPublicAchievements(params)`: Filters by `category`, strictly `isPublished = true`.
   - Administrative CRUD: `createPublication`, `updatePublication`, `deletePublication`, `createAchievement`, `updateAchievement`, `deleteAchievement`.

---

## 3. Route & UI Architecture
- **News Listing (`src/app/(public)/news/page.tsx`):**
  - Search query param, category pill filters, pinned bulletin spotlight, clean responsive card grid with cover images or elegant typographic fallback frames, date, author attribution, and pagination.
- **News Detail (`src/app/(public)/news/[slug]/page.tsx`):**
  - Editorial layout with PageHeader, publication metadata (author, date, category, reading time), high-contrast bilingual text rendering, back button, and dynamic SEO `generateMetadata`.
- **Learning Resources Hub (`src/app/(public)/resources/page.tsx`):**
  - Enhanced category and skill-level filter bars, search input, pedagogical resource cards with Arabic titles in Tajawal font, file download actions, and empty states.
- **Publications & Achievements Hub (`src/app/(public)/publications/page.tsx`):**
  - Two prominent sections:
    1. Official Journals & Magazines ("Al-Bayan" series, bulletins) with issue badges, publication dates, and download buttons.
    2. Roll of Honor (Inter-university debate championship trophies, eloquence awards) with verified distinction badges and citations.

---

## 4. Seeding & Test Data (`src/lib/db/seed.ts`)
- Seed authentic news items (pinned inaugural launch, semester debate trials announcement, academic council communique).
- Seed 1 unpublished/draft announcement to verify draft exclusion.
- Seed rich learning resources across Nahw, Sarf, Balaghah, Mufradat across Beginner, Intermediate, and Advanced tiers.
- Seed official publications: Issue No. 01 and Issue No. 02 of "Al-Bayan Literary Magazine", Annual Activity Report.
- Seed verified competitive achievements: National Arabic Debate Champions 2024, Inter-University Classical Oratory 1st Place 2023.

---

## 5. Verification & Testing
- Automated test script: `src/lib/db/test-public-content-modules.ts` covering:
  - News listing, pagination, and category filtering.
  - Draft announcement isolation (drafts must never leak to public queries).
  - News detail by slug retrieval and 404 for invalid/unpublished slugs.
  - Learning resources category and skill-level filters.
  - Resource download counter increment.
  - Publications filtering by type and unpublished isolation.
  - Achievements retrieval and unpublished isolation.
  - Administrative CRUD functions.
- Run `pnpm exec next build` to guarantee 0 TypeScript/ESLint errors across all routes.
- Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`.
