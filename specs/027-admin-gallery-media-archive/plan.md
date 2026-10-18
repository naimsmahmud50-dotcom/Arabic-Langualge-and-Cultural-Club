# TECHNICAL PLAN: 027 - Complete Admin-Managed Gallery and Media Archive

## 1. Architecture & Design Principles
- Technology Stack: Next.js 15 App Router, React 19 Client/Server Components, Tailwind CSS, Lucide icons, Drizzle ORM, SQLite (`better-sqlite3`).
- Storage Model: Local durable file storage under `public/uploads/gallery/<academicYear>/<albumSlug>/<timestamp>_<random>_<filename>`, with immediate static delivery via `/uploads/gallery/...`.
- Security Guardrails: Strix-Supabase least-privilege standards; server-side MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`, `video/webm`); rejection of dangerous extensions (`.svg`, `.exe`, `.html`, scripts); session verification and `gallery:manage` authorization on all mutations.

---

## 2. Database Schema Extensions
- Extend `gallery_albums` table:
  - `dateNotes: text("date_notes")` (optional approximate date notes)
  - `isArchived: integer("is_archived", { mode: "boolean" }).default(false)` (archival lifecycle status)
- Extend `media_assets` table:
  - `altText: text("alt_text")` (accessible image description)
- Migration: Execute lightweight SQLite pragma/alter checks to add columns idempotently if missing.

---

## 3. Server Actions & API Implementation
- `src/lib/actions/content-cms.ts`:
  - Enhance `saveGalleryAlbumAction` to support `dateNotes`, `isArchived`, and status toggles.
  - Enhance `archiveGalleryAlbumAction` and `unarchiveGalleryAlbumAction`.
  - Enhance `saveMediaAssetAction` to support `altText` and updated sort ordering.
  - Implement `bulkUpdateMediaAssetsAction` (bulk publish, bulk unpublish, bulk delete).
  - Implement `reorderMediaAssetsAction` for drag/drop or numeric sequence persistence.
- `src/app/api/admin/gallery/upload/route.ts`:
  - Authenticated multipart upload endpoint accepting multiple `File` items.
  - Server-side validation via `validateMediaUpload()`.
  - Persists files to `public/uploads/gallery/...`.
  - Inserts corresponding records into `media_assets`.
  - Sets cover image automatically if the album has no cover image yet.
  - Records audit log in `audit_logs`.

---

## 4. UI Components Refinement (Admin Console & Public Views)
- `src/app/admin/gallery/AlbumFormModal.tsx`:
  - Add approximate date notes field.
  - Add publication status selector: Published, Draft, Archived.
- `src/app/admin/gallery/MediaAssetModal.tsx`:
  - Implement drag-and-drop / multi-file selection with visual previews, file size indicators, and removal before upload.
  - Implement batch upload progress and server upload trigger.
  - Implement asset metadata editor: Caption (En/Ar), Alternative Text (`alt_text`), Photographer credit, Sort order.
  - Implement multi-select checkboxes and bulk action toolbar (Select All, Bulk Publish, Bulk Unpublish, Bulk Delete).
  - Individual image replacement and cover selection.
- `src/app/admin/gallery/AdminGalleryClient.tsx`:
  - Add pagination and album status filter ("all", "published", "draft", "archived").
- `src/app/(public)/gallery/page.tsx` & `[slug]/page.tsx`:
  - Filter out archived albums from public listing.
  - Ensure alternative text is passed to `img` tags and `MediaLightbox`.

---

## 5. Verification Strategy
- Create automated test suite `src/lib/db/test-gallery-cms.ts`:
  - Test 1: Album lifecycle (create, edit, draft, publish, archive, delete).
  - Test 2: Multi-file upload simulation and local filesystem persistence.
  - Test 3: Asset metadata persistence (captions, alt text, sort order).
  - Test 4: Cover image assignment and updates.
  - Test 5: Bulk operations (bulk publish, bulk unpublish, bulk delete).
  - Test 6: Security validations (rejection of SVG, HTML, EXE, unauthenticated calls).
  - Test 7: Public visibility isolation (draft/archived albums and unapproved media inaccessible to public).
