# SPEC-017: Remaining Content Management Modules (Media, News, Resources, Publications & Achievements CMS)

## 1. Executive Summary & Context
This specification defines the administrative content-management systems for the Arabic Language & Cultural Club platform:
1. **News & Announcements CMS (`/admin/news`)**: Authoring, editing, categories, priority pinning, and publication state transitions.
2. **Arabic Learning Resources CMS (`/admin/resources`)**: Educational modules (grammar, morphology, rhetoric, literature), proficiency tiers (beginner, intermediate, advanced), downloadable materials, and download tracking.
3. **Achievements & Publications CMS (`/admin/publications`)**: Dual-tab console managing official press publications (magazines, journals, reports) and competitive academic distinctions/trophies.
4. **Photo Gallery & Media Asset CMS (`/admin/gallery`)**: Curating event-linked photo albums, batch media asset management, captions (EN/AR), photographer credits, cover image selection, and secure upload verification.

All modules adhere to the **Zero Fabricated Content** rule, **Strix Media Security Guidelines**, **RBAC Protection**, and **Human-Crafted UI Standards** (strictly zero AI emojis; authentic academic typography and Lucide SVG icons).

---

## 2. User Stories

### Story 1: Editorial Management of Official News & Bulletins (Priority: P1)
**As a** Content Editor or Secretary,  
**I want to** draft, edit, pin, and publish institutional bulletins, event recaps, and urgent announcements with bilingual text blocks and cover images,  
**So that** club members and the public stay informed with verified information.

### Story 2: Educational Resource Curation & Learning Progression (Priority: P1)
**As an** Academic Coordinator or Content Editor,  
**I want to** upload learning materials categorized by linguistic discipline (Grammar, Morphology, Rhetoric, Vocabulary) and proficiency tier (Beginner, Intermediate, Advanced),  
**So that** Arabic language learners have access to structured, verified study guides and download counters accurately reflect student engagement.

### Story 3: Archival Publications & Roll of Honor Maintenance (Priority: P1)
**As an** Executive Administrator or Media Secretary,  
**I want to** curate official periodicals (e.g. Al-Bayan magazine) and register verified tournament championships and academic awards with supporting certificate links,  
**So that** the club's intellectual legacy and institutional accolades are preserved and displayed truthfully.

### Story 4: Photographic Archive & Media Asset Management (Priority: P1)
**As a** Media & Archive Secretary,  
**I want to** create curated albums linked to academic years and club events, upload photography and archival video assets, provide bilingual captions and credits, and assign album covers,  
**So that** club history is captured visually while preventing insecure uploads or unauthorized exposure of unreleased photography.

---

## 3. Acceptance Criteria (Given / When / Then)

### Scenario A: Media Asset Security & Upload Validation
- **Given** an administrator uploading a media asset to an album,
- **When** the file is submitted,
- **Then** the server must validate:
  1. Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.mp4`, `.webm`.
  2. Prohibited extensions: `.exe`, `.sh`, `.php`, `.svg`, `.html`, `.js`, etc. (rejected immediately).
  3. Size limits: Maximum 15MB for photographs, 100MB for archival videos.
  4. Safe non-enumerable storage paths via `generateSafeStoragePath`.
  5. Strip path traversal attempts (`../`, `..\\`, null bytes).

### Scenario B: Public Synchronization & Draft Isolation
- **Given** an announcement, learning resource, album, publication, or achievement saved in `draft` or `isPublished: false` status,
- **When** public visitors access `/news`, `/resources`, `/publications`, or `/gallery`,
- **Then** the draft item must be completely excluded from public listings and direct slug resolution,
- **When** the administrator toggles the item to `published`,
- **Then** the public route is immediately revalidated via Next.js `revalidatePath`.

### Scenario C: Role-Based Access Control (RBAC) & Audit Trail
- **Given** an authenticated user session,
- **When** an operation is invoked on `/admin/news`, `/admin/resources`, `/admin/publications`, or `/admin/gallery`,
- **Then** the server checks the corresponding permission (`news:manage`, `resources:manage`, `publications:manage`, `gallery:manage`, `media:manage`),
- **And** writes an immutable entry to `audit_logs` capturing the actor, target ID, action type, and operational metadata.

---

## 4. UI/UX Standards
- Strictly zero AI emojis. Authentic SVG icons via `lucide-react`.
- Human-crafted typography using established design tokens (`var(--brand-primary)`, `var(--brand-accent)`, `var(--bg-surface)`).
- Reusable admin UI building blocks (`Card`, `Badge`, `Button`, `Table`, `EmptyState`, `AdminHeader`, `AdminConfirmModal`).
- Developer header comments and architecture notes at the top of every new and updated file.
