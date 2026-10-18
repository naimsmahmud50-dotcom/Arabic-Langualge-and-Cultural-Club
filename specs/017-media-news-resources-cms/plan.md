# PLAN-017: Implementation Architecture for Remaining CMS Modules

## 1. Architectural Strategy
We extend the administrative CMS to support all remaining institutional content modules:
1. **Gallery & Media Assets**: `/admin/gallery`
2. **News & Announcements**: `/admin/news`
3. **Arabic Learning Resources**: `/admin/resources`
4. **Achievements & Publications**: `/admin/publications`

Each module follows the established architectural pattern:
- **Server Component (`page.tsx`)**: Authenticates session, validates RBAC, fetches data from SQLite, renders `AdminHeader` and client console.
- **Client Console (`Admin*Client.tsx`)**: Interactive tables, live search, multi-criteria filters, status badges, empty states, and modal controllers.
- **Form Modals (`*Modal.tsx`)**: Client validation, accessible form inputs, bilingual support, server action dispatching, loading spinners.
- **Server Actions Layer (`src/lib/actions/content-cms.ts`)**: Zod parsing, RBAC permission assertions, safe mutations, immutable audit logs (`recordAuditLog`), path revalidation (`revalidatePath`).

---

## 2. Media Upload & Security Architecture
- Utilizes existing `src/lib/utils/media-storage.ts` to enforce:
  - Whitelist: JPEG, PNG, WebP, AVIF (images); MP4, WebM (video).
  - Strict blocklist of dangerous/executable extensions (.exe, .sh, .php, .svg, .js, etc.).
  - Size quotas: 15MB images, 100MB videos.
  - Path sanitization to prevent path traversal attacks.

---

## 3. Database Layer Additions (`src/lib/db/queries.ts`)
Add administrative queries supporting search, filter, and pagination (returning both draft and published items):
- `getAdminGalleryAlbums(params)`
- `getAdminAnnouncements(params)`
- `getAdminLearningResources(params)`
- `getAdminPublications(params)`
- `getAdminAchievements(params)`

---

## 4. Verification & Testing Strategy
- Automated test script `src/lib/db/test-media-news-resources-cms.ts`:
  1. News & announcements CRUD, pinning, and draft isolation.
  2. Learning resources CRUD, category & level validation, and download counter.
  3. Publications & achievements CRUD with verification status.
  4. Gallery albums and media assets CRUD, cover photo selection, and cascade deletion.
  5. File upload security verification (allowing valid images, rejecting executables and SVGs).
  6. RBAC permission gates and audit logging verification.
- Cumulative regression testing across all 13 test suites.
- Production build verification via `next build`.
