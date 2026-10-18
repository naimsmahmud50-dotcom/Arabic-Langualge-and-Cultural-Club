# SPECIFICATION: 027 - Complete Admin-Managed Gallery and Media Archive

## 1. Executive Summary & Context
- Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা / كلية كابي نذرول الحكومية، دكا)
- Organization: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
- Target: Full lifecycle administration of photographic albums and archival media assets within the verified Admin Console, integrated with local persistent storage and resilient server-side authorization.
- Security Standard: Strix-Supabase least-privilege principles, server-side MIME and extension validation, immutable audit logging, and zero exposure of unpublished/draft media.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Comprehensive Album Management (Priority: P1)
As an administrative editor or club archivist,
I want to create, edit, draft, publish, unpublish, and archive photo albums,
So that the club's academic symposia, competitions, and historical galas are systematically categorized.

Acceptance Criteria:
1. Given an administrative user with `gallery:manage` permission, when they open the Album Form Modal, they can input English title (required), Arabic title, description (En/Ar), event date, approximate date notes, academic year, category, related event, photographer credit, location, and featured/publication status.
2. Given an album record, administrators can toggle its status between Published, Draft, and Archived.
3. Given a search query, year filter, category filter, or publication status filter, the album directory updates reactively.
4. When an album is saved, all changes persist immutably to the `gallery_albums` database table and trigger path revalidation.

### User Story 2: Batch Photo Upload & Local Persistent Storage (Priority: P1)
As an administrative media manager,
I want to select multiple images, preview them, and upload them in a single batch with drag-and-drop support,
So that archival event photo sets can be ingested efficiently without manual single-file entry.

Acceptance Criteria:
1. Given the Media Asset Modal, administrators can drag-and-drop or multi-select images (JPG, PNG, WebP, AVIF).
2. Given selected files, the interface displays live preview thumbnails, file names, file sizes, and validation indicators before upload.
3. Given valid files, the upload handler persists them directly to durable local storage (`public/uploads/gallery/<academicYear>/<albumSlug>/<filename>`) and inserts corresponding database records in `media_assets`.
4. Dangerous files (e.g. `.svg`, `.exe`, `.html`, scripts) are rejected server-side with informative security validation messages.
5. Upload progress, loading states, success notifications, and failure feedback are clearly rendered.

### User Story 3: Photo Metadata, Reordering, Cover Management & Bulk Actions (Priority: P2)
As a gallery administrator,
I want to edit captions, alternative text, and display order, set album covers, and execute bulk operations,
So that the photo collection maintains impeccable editorial standards.

Acceptance Criteria:
1. Administrators can edit English and Arabic captions, alternative text (`alt_text`), photographer credits, and sort order for individual media assets.
2. Any asset in an album can be designated as the album cover with a single click, updating `gallery_albums.cover_image_url`.
3. Administrators can select multiple assets and execute bulk actions: Bulk Publish, Bulk Unpublish, and Bulk Delete (with confirmation modal).
4. Deleting an asset removes its database reference while preserving shared assets; deleting an album prompts confirmation to prevent accidental loss.

### User Story 4: Accessible Public Gallery & Fullscreen Lightbox (Priority: P2)
As a student, scholar, or prospective member,
I want to browse published albums and inspect high-resolution photographs in an accessible lightbox,
So that I can experience the rich cultural milestones of the club.

Acceptance Criteria:
1. Public gallery (`/gallery`) displays only published albums (`isPublished: true` and `isArchived: false`).
2. Album detail page (`/gallery/[slug]`) renders all published photos in a responsive, lazy-loaded grid.
3. Clicking a photo opens an accessible lightbox with keyboard navigation:
   - `Escape`: Closes lightbox and restores focus.
   - `ArrowLeft` / `ArrowRight`: Traverses to previous/next media asset.
   - Screen-reader aria attributes announce current position (e.g. "Item 3 of 12").
4. Unpublished, draft, or archived albums return 404 on public routes.

---

## 3. Non-Functional Constraints
- Strictly zero AI emojis across all components, modals, and log messages.
- Prominent developer notes at the top of every modified or created file.
- Full WCAG 2.2 AA accessibility: minimum 4.5:1 contrast, visible keyboard focus rings, semantic labels.
- Local persistent storage path: `public/uploads/gallery/` with automatic directory creation.
