# TASKS: 030 - Event-to-Gallery Workflow & Comprehensive Website Integration

**Institution:** Kabi Nazrul Government College, Dhaka  
**Society:** Arabic Language & Cultural Club  
**Status:** Completed  

---

## Phase 1: Database & Business Logic Foundation
- [x] **Task 1.1: Database Query Extensions (`src/lib/db/queries.ts`)**
  - Implement `getPublicGalleryAlbumByEventId(eventId: string)` with media asset count and previews.
  - Implement `getAlbumByRelatedEventId(eventId: string)` for admin album resolution.
  - Enhance `getAdminEvents` and `getAdminEventById` to select associated `albumId`, `albumSlug`, `albumTitleEn`, `albumIsPublished`.
- [x] **Task 1.2: Server Action & Query Duplicate Prevention (`src/lib/actions/content-cms.ts` & `src/lib/db/queries.ts`)**
  - In `createGalleryAlbum` and `updateGalleryAlbum`, enforce unique `relatedEventId` constraint to prevent duplicate albums per event.
  - In `saveGalleryAlbumAction`, enforce duplicate prevention check with actionable administrator feedback.
  - Ensure comprehensive `revalidatePath` calls for `/events`, `/events/[slug]`, `/gallery`, `/gallery/[slug]`, `/admin/events`, `/admin/gallery`.

## Phase 2: Administrative Control Plane Integration
- [x] **Task 2.1: Admin Events Dashboard (`src/app/admin/events/AdminEventsClient.tsx`)**
  - Render "Photo Archive" column and status indicators in the events table.
  - Add "Manage Photos" deep-link to `/admin/gallery?albumId=...` for events with linked albums.
  - Add "Create Album" action button for unlinked events routing with pre-filled event parameters.
- [x] **Task 2.2: Admin Gallery Prefill (`src/app/admin/gallery/AdminGalleryClient.tsx` & `AlbumFormModal.tsx`)**
  - Support `defaultValues` in `AlbumFormModal.tsx`.
  - Handle `createForEvent` URL parameters in `AdminGalleryClient.tsx` to pre-fill event title, date, venue, and `relatedEventId`.
  - Support direct opening of photo manager via `albumId` query parameter.

## Phase 3: Public Website Experience & Privacy Audit
- [x] **Task 3.1: Public Event Dossier (`src/app/(public)/events/[slug]/page.tsx`)**
  - Query `getPublicGalleryAlbumByEventId(event.id)`.
  - Render an "Event Photographic Retrospective / Photo Gallery" card with photo count, thumbnail preview grid, and deep-link to `/gallery/[slug]`.
  - Ensure draft/archived albums remain completely hidden from public visitors (Strix privacy isolation).
- [x] **Task 3.2: Privacy Fortification & Branding Consistency**
  - Audit `src/app/(public)/policies/page.tsx` and ensure super admin email `arabicclubkngc2025@gmail.com` is guarded from public scraping by redirecting to `/contact`.
  - Guard fallback email in `src/components/home/VerifiedContactSection.tsx`.
  - Confirm all pages use official naming: "Kabi Nazrul Government College, Dhaka" and "কবি নজরুল সরকারি কলেজ, ঢাকা".

## Phase 4: Automated Verification & Handover
- [x] **Task 4.1: Automated Integration Test Harness (`src/lib/db/test-event-gallery-integration.ts`)**
  - Test event creation, album association, duplicate album prevention, draft isolation, and bidirectional links.
  - Registered `"test:integration": "tsx src/lib/db/test-event-gallery-integration.ts"` in `package.json`.
  - Verification: 28/28 tests passed with 0 failures.
- [x] **Task 4.2: Execution, Typecheck, and Build**
  - Ran `pnpm test:integration` (28/28 passed).
  - Ran `pnpm test:import` (20/20 passed), `pnpm test:storage` (35/35 passed), `pnpm test:gallery` (35/35 passed), `pnpm test:admin` (22/22 passed), `pnpm test` (100% passed).
  - Ran `pnpm typecheck` (0 errors).
  - Ran `pnpm build` (Compiled successfully, all 23 static pages generated).
- [x] **Task 4.3: Final Bengali Report**
  - Deliver comprehensive report in Bengali with strictly zero AI emojis.
