# TECHNICAL PLAN: 030 - Event-to-Gallery Workflow & Comprehensive Website Integration

**Institution:** Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)  
**Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)  
**Feature Directory:** `specs/030-event-to-gallery-website-integration`  

---

## 1. Architectural Architecture & Workflow

```
+---------------------------------------------------------------------------------------------------+
|                                  ADMINISTRATIVE CONTROL PLANE                                     |
|                                                                                                   |
|  /admin/events                                       /admin/gallery                               |
|  - View events table with Album Badge               - AlbumFormModal with relatedEventId selector |
|  - "Create Photo Album" for unlinked events         - Auto-prefill from ?createForEvent params    |
|  - "Manage Photos" for linked events                - BulkImportModal for batch uploads           |
+---------------------------------------------------------------------------------------------------+
                               |                                        |
                 Create / Update Event Action              Upsert Album Action with Duplicate Check
                               |                                        |
                               v                                        v
+---------------------------------------------------------------------------------------------------+
|                                  DATABASE & RELATIONSHIP LEDGER                                   |
|                                                                                                   |
|  events (id, slug, title_en, start_time, ...)                                                      |
|    ^                                                                                              |
|    | related_event_id (One-to-One unique association logic)                                       |
|    |                                                                                              |
|  gallery_albums (id, slug, related_event_id, is_published, ...)                                   |
|    |                                                                                              |
|    +-- media_assets (album_id, file_url, caption_en, is_published, ...)                           |
+---------------------------------------------------------------------------------------------------+
                               |                                        |
                Public Query: getPublicEventBySlug        Public Query: getPublicGalleryAlbumBySlug
                + getPublicGalleryAlbumByEventId                        |
                               v                                        v
+---------------------------------------------------------------------------------------------------+
|                                  PUBLIC INTEGRATED EXPERIENCES                                    |
|                                                                                                   |
|  /events/[slug]                                      /gallery/[slug]                              |
|  - Verified Event Logistics & Syllabus               - Archival Showcase & Lightbox Grid          |
|  - Photographic Retrospective Section                - "Official Event Association" Banner        |
|    (Deep-link to /gallery/[albumSlug])                 (Deep-link to /events/[eventSlug])         |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Technical Modifications

### 2.1 Database Queries (`src/lib/db/queries.ts`)
1. **`getPublicGalleryAlbumByEventId(eventId: string)`**:
   - Fetches published, non-archived album where `relatedEventId === eventId`.
   - Joins media asset count and previews.
2. **`getAlbumByRelatedEventId(eventId: string)`**:
   - Administrative lookup query to find any album associated with an event.
3. **`getAdminEvents(params)`**:
   - Enhances event list query with a left join to `galleryAlbums` to select `albumId` and `albumSlug`.

### 2.2 Server Actions (`src/lib/actions/content-cms.ts`)
1. **`upsertGalleryAlbumAction`**:
   - Enforce duplicate album prevention:
     ```ts
     if (parsed.data.relatedEventId) {
       const [existing] = await db.select({ id: galleryAlbums.id, slug: galleryAlbums.slug })
         .from(galleryAlbums)
         .where(eq(galleryAlbums.relatedEventId, parsed.data.relatedEventId))
         .limit(1);
       if (existing && existing.id !== albumId) {
         return {
           success: false,
           error: `An album is already associated with this event (/gallery/${existing.slug}). Duplicate albums for the same event are prohibited.`
         };
       }
     }
     ```
   - Revalidate public and admin event and gallery paths on mutation.

### 2.3 Administrative UI (`src/app/admin/events/AdminEventsClient.tsx`)
1. In table header, add or align "Photo Album" column/indicator.
2. For each event row:
   - If associated album exists: Render a badge `"Photo Album Linked"` and a button `"Manage Photos"` linking to `/admin/gallery?albumId=${evt.albumId}`.
   - If no album exists: Render `"Create Photo Album"` button routing to `/admin/gallery?createForEvent=${evt.id}&eventTitle=...`.

### 2.4 Administrative Gallery (`src/app/admin/gallery/AdminGalleryClient.tsx` & `AlbumFormModal.tsx`)
1. In `AdminGalleryClient.tsx`, inspect URL search parameters for `createForEvent`, `eventTitle`, `eventDate`, `venue`.
2. When present, trigger `handleOpenCreate()` with pre-populated form values.

### 2.5 Public Event Dossier (`src/app/(public)/events/[slug]/page.tsx`)
1. Server Component queries `getPublicGalleryAlbumByEventId(event.id)`.
2. If published album exists:
   - Render a dedicated "Official Photographic Retrospective / Photo Gallery" section.
   - Display album cover image, asset count, and a direct button "Browse Photographic Archive" linking to `/gallery/${album.slug}`.

### 2.6 Public Website Audit & Privacy Fortification
1. Audit `src/app/(public)/policies/page.tsx`:
   - Replace raw display of super admin email with the official correspondence desk link (`/contact`).
2. Verify all navigation links, metadata, and OpenGraph configurations.

---

## 3. Automated Verification Strategy
Implement `src/lib/db/test-event-gallery-integration.ts` to test:
1. Future event creation (with draft and published statuses).
2. Creating an album linked to the event (`relatedEventId`).
3. Attempting to create a duplicate album for the same event and verifying rejection.
4. Testing `getPublicGalleryAlbumByEventId` with draft vs published albums.
5. Verifying bidirectional link properties between event and album.
6. Execution of `pnpm typecheck`, `pnpm test`, and `pnpm build`.
