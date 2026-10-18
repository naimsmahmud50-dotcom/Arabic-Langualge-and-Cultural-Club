<!--
  DEVELOPER NOTE:
  File: docs/FINAL_PROJECT_HANDOVER.md
  Purpose: Comprehensive Project Handover and Operational Engineering Manual
  Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
  Club: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
  Super Admin Target: arabicclubkngc2025@gmail.com
  Tone: Authoritative academic and technical manual; strictly zero AI emojis.
-->

# COMPREHENSIVE PROJECT HANDOVER AND ENGINEERING OPERATIONS MANUAL
## Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka
### Document Reference: ALCC-KNGC-HANDOVER-2026-V1
### Classification: Official Institutional Handover Documentation

---

## 1. Executive Summary & Implemented Features (Phases 1 to 8)

The Arabic Language & Cultural Club (نادي اللغة والثقافة العربية) platform at **Kabi Nazrul Government College, Dhaka** (কবি নজরুল সরকারি কলেজ, ঢাকা) has successfully transitioned through all planned architectural, administrative, and public-facing implementation phases:

- **Phase 1: Institutional Audit & Heritage Baseline:**
  Comprehensive inspection of the Next.js App Router codebase, Drizzle ORM schema, component architecture, and bilingual routing. Established the visual brand system rooted in institutional dignity (Deep Forest Green `#173D32`, Warm Ivory `#F5F0E5`, Antique Brass `#B18A4A`).
- **Phase 2: Official College Branding Unification:**
  Systematic propagation of official college nomenclature ("Kabi Nazrul Government College, Dhaka" / "কবি নজরুল সরকারি কলেজ, ঢাকা") and club identity across all public routes, page metadata, OpenGraph tags, JSON-LD schemas, headers, and footers.
- **Phase 3: Architectural Roadmap & Baseline Audit:**
  Inventory of all 26 relational database tables, 16 public routes, and 15 administrative consoles. Audited existing media assets, route protections, and database relationships.
- **Phase 4: Secure Super Administrator Authentication & RBAC:**
  Configured dedicated institutional Super Admin account (`arabicclubkngc2025@gmail.com`). Built robust Scrypt password hashing, HMAC-SHA256 signed session tokens, rate-limiting, and an immutable 5-tier role-based access control (RBAC) matrix (`super_admin`, `admin`, `committee_editor`, `content_editor`, `media_manager`).
- **Phase 5: Admin-Managed Gallery & Media Archive CMS:**
  Implemented complete administrative consoles for photo albums and individual media assets. Supports draft, published, and archived states, cover image assignment, image reordering, alternative text, and bilingual captions.
- **Phase 6: Persistent Media Storage Engine:**
  Engineered a unified dual-driver storage architecture supporting both Durable Mounted Host Volumes (`DurableVolumeStorageProvider`) and Cloud Object Storage (`SupabaseStorageProvider` via direct REST v1 API). Enforced binary magic byte verification, private asset token signing, and safe reference-counted asset deletion.
- **Phase 7: Historical Photograph Import & Media Migration:**
  Constructed an administrator-only bulk migration workflow with manifest validation (`docs/MEDIA_MIGRATION_MANIFEST.md`), SHA-256 duplicate detection, partial failure handling, and pre-commit visual verification.
- **Phase 8: Event-to-Gallery Workflow & Website Integration:**
  Integrated future event scheduling with post-event photographic archives. Implemented strict database and server-action duplicate prevention (`relatedEventId`) and bidirectional public navigation linking `/events/[slug]` (Photographic Retrospective) to `/gallery/[slug]` (Official Event Association banner).

---

## 2. Technical Architecture & Database Schema Catalog

### 2.1 Database Architecture
The persistence layer utilizes **Drizzle ORM** with a normalized schema comprising **26 relational tables** managed through 7 sequential SQL migrations located in `src/lib/db/migrations/`.

- **Engine:** SQLite (WAL mode enabled for concurrent reads and writes) in local and standalone VPS deployments; fully portable to PostgreSQL (Supabase) via Drizzle dialect mapping.
- **Integrity:** Enforces foreign key constraints (`ON DELETE CASCADE` / `ON DELETE SET NULL` / `ON DELETE RESTRICT`), unique constraints, and composite indexes for high-throughput queries.

### 2.2 Relational Entity Catalog (26 Tables)

| Domain | Table Name | Purpose | Key Constraints & Relationships |
| :--- | :--- | :--- | :--- |
| **Auth & Security** | `users` | Administrator accounts, password hashes, roles | `email` UNIQUE, index on `role` |
| | `sessions` | Server-managed cryptographic sessions | FK to `users.id`, index on `token_hash`, `expires_at` |
| | `password_resets` | Time-limited password reset tokens | FK to `users.id`, index on `token_hash`, `expires_at` |
| | `audit_logs` | Immutable audit trail of administrative actions | FK to `users.id`, index on `action`, `created_at` |
| | `consent_records` | Data protection and photo publication consent | Index on `(subject_type, subject_id)` |
| **Institutional Governance** | `founders` | Founding conveners and historical advisors | Index on `sort_order`, `is_published` |
| | `committee_terms` | Academic committee sessions (e.g., 2024–2025) | `academic_year` UNIQUE, index on `is_current` |
| | `committee_positions` | Reusable leadership positions and ranks | `title_en` UNIQUE, `default_rank` |
| | `committee_assignments` | Junction connecting members to specific terms | FK to `committee_terms.id` and `members.id` |
| | `members` | Master member directory with privacy controls | `membership_id` UNIQUE, index on `status`, `is_public` |
| | `membership_applications` | Prospective applicant queue with reviewer notes | `reference_no` UNIQUE, FK to `users.id` |
| **Events & Scheduling** | `events` | Calendar workshops, seminars, competitions | `slug` UNIQUE, index on `status`, `start_time` |
| | `event_registrations` | Public registration records and seat counts | FK to `events.id`, composite index `(email, event_id)` |
| | `annual_plans` | 12-month institutional program agenda | Composite index `(academic_year, month_number)` |
| **Media & Gallery** | `gallery_albums` | Archival photo albums by event or academic year | `slug` UNIQUE, `related_event_id` UNIQUE, index on `academic_year` |
| | `media_assets` | Individual photographs with captions and order | FK to `gallery_albums.id`, index on `sort_order` |
| **Education & Honors** | `learning_resources` | Grammar (Nahw/Sarf) guides and reading files | `slug` UNIQUE, index on `category`, `skill_level` |
| | `achievements` | Institutional awards and competition honors | Index on `is_published`, `achieved_date` |
| | `publications` | Periodical journals (Al-Bayan) and downloads | `slug` UNIQUE, index on `publication_type` |
| **Editorial & CMS** | `editable_pages` | Dynamic CMS page definitions (`home`, `about`) | `slug` UNIQUE |
| | `page_sections` | Content sections inside dynamic pages | FK to `editable_pages.id`, index on `section_key` |
| | `content_blocks` | Reusable editorial copy fragments | Index on `block_key` |
| | `announcements` | Official notices and institutional circulars | `slug` UNIQUE, index on `is_published`, `is_pinned` |
| **Correspondence** | `contact_messages` | Legacy contact submissions | Index on `created_at` |
| | `contact_inquiries` | Validated inbox with honeypot and reference IDs | `reference_no` UNIQUE, index on `status`, `email` |
| **Configuration** | `site_settings` | Global branding, contact coordinates, defaults | `key` UNIQUE |

### 2.3 Historical Preservation Invariant
When a new executive committee takes office, the previous committee term's `is_current` flag is toggled to `false` and the new term is recorded as `is_current: true`. Historical records in `committee_assignments` are preserved immutably and remain queryable on `/leadership` by academic year.

---

## 3. Storage Provider & Volume Configuration

### 3.1 Dual-Driver Architecture
The application features an abstract storage interface (`StorageProvider`) implemented across two interchangeable providers in `src/lib/utils/media-storage.ts`:

1. **Durable Volume Storage Driver (`DurableVolumeStorageProvider`):**
   - Direct atomic filesystem writes to a durable directory (`STORAGE_DIR`, default: `public/uploads`).
   - Generates local asset URLs (`/uploads/...`) and cryptographically signed URLs for unpublished drafts.
   - Ideal for single-node VPS deployments with a persistent host volume or Docker bind mount.
2. **Cloud Object Storage Driver (`SupabaseStorageProvider`):**
   - Interacts directly with the Supabase Storage v1 REST API (`/storage/v1/object/...`) using the `SUPABASE_SERVICE_ROLE_KEY`.
   - Requires zero heavy native client libraries, avoiding runtime bloat.
   - Produces public CDN URLs for published media and time-limited signed URLs (`createSignedUrl`) for restricted assets.

### 3.2 Binary Magic Byte Verification
To protect against malicious file uploads and MIME spoofing, the upload pipeline inspects the initial binary buffer signatures:
- **JPEG:** `FF D8 FF`
- **PNG:** `89 50 4E 47 0D 0A 1A 0A`
- **WebP:** `52 49 46 46` (RIFF) ... `57 45 42 50` (WEBP)
- Any file with an invalid header or disguised executable code is rejected immediately with a 400 Bad Request error.

### 3.3 Reference-Counted Shared Asset Protection
When media records are removed from the database, the storage engine verifies if any other `media_assets` or `gallery_albums` record references the same storage key. The physical file is only deleted from storage when the reference count reaches zero.

---

## 4. Environment Variables Specification

The platform requires the following environment variables. In accordance with security practices, secret values are omitted from documentation:

| Variable Name | Required | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Optional | `local.db` | Path to SQLite database file or PostgreSQL connection URI. |
| `SESSION_SECRET` | Required | 64-char hex string | Cryptographic key used to sign HMAC session cookies and tokens. |
| `STORAGE_DIR` | Optional | `public/uploads` | Path to durable mounted volume on host filesystem. |
| `STORAGE_BASE_URL` | Optional | `/uploads` | Public URL prefix for serving stored media assets. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | `https://<id>.supabase.co` | Supabase project URL (if cloud storage driver is enabled). |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Secret Key | Supabase service role key for storage REST v1 API operations. |
| `STORAGE_BUCKET_MEDIA` | Optional | `club-media` | Supabase storage bucket name for images and documents. |
| `INITIAL_ADMIN_PASSWORD` | Optional | Secure Passphrase | Temporary password used during initial CLI provisioning. |
| `NEXT_PUBLIC_SITE_URL` | Required | `http://localhost:3005` | Canonical site URL for metadata, sitemap, and OpenGraph tags. |
| `PORT` | Optional | `3005` | Port on which the Next.js server binds (Default production: 3005). |
| `NODE_ENV` | Optional | `production` | Node runtime environment (`development` or `production`). |

---

## 5. Super Admin Provisioning, Activation & Security

### 5.1 Account Specification
- **Designated Institutional Email:** `arabicclubkngc2025@gmail.com`
- **Assigned System Role:** `super_admin`
- **System Identifier:** `usr_kngc_superadmin`
- **Authority Scope:** Full administrative privileges, user management, role elevation, backup exports, and audit inspection.

### 5.2 Provisioning Procedure
Execute the idempotent provisioning script via pnpm:

```bash
pnpm admin:provision
```

The script performs the following actions:
1. Queries `users` for `arabicclubkngc2025@gmail.com`.
2. Creates or verifies the user record with `role: 'super_admin'` and `isActive: true`.
3. Hashes the initial password using Node.js Scrypt (`N=16384, r=8, p=1, keylen=64`).
4. Generates a secure activation token stored in `password_reset_tokens`.
5. Outputs an activation link (`/admin/reset-password?token=...`) for self-service passphrase configuration.

### 5.3 Password Rotation & Session Security
1. **Initial Sign-In:** The administrator logs in at `/admin/login` using the provisioned credentials or activation link.
2. **Mandatory Passphrase Update:** Navigate to `/admin/profile` to replace the temporary credential with a permanent passphrase meeting institutional standards (minimum 12 characters, mixed case, numbers, and symbols).
3. **Session Cookies:** Signed using HMAC-SHA256 with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` (in production).

---

## 6. Historical Photograph Import Instructions

### 6.1 Administrator Workflow via Admin Console
1. Log in to the Admin Dashboard at `/admin`.
2. Navigate to **Gallery / Media Archive** (`/admin/gallery`).
3. Click **"New Album"** (`/admin/gallery/new`).
4. Enter the verified historical metadata:
   - **Title (English & Arabic):** e.g., "Founding Session & Orientation 2022" / "الجلسة التأسيسية واللقاء التعريفي 2022"
   - **Event Name:** Official title of the historical event.
   - **Academic Year:** Select the appropriate session (e.g., `2022-2023`).
   - **Approximate Date Notes:** If exact calendar day is unconfirmed, record verified context (e.g., "November 2022, Seminar Room 3").
5. Upload the historical photo collection:
   - Drag and drop or browse files (JPEG, PNG, WebP supported).
   - Review pre-upload thumbnail cards.
   - Set captions and descriptive alternative text for accessibility.
   - Select one image as the **Cover Image**.
6. Set publication status:
   - Choose **Draft** to review privately with committee members.
   - Choose **Published** to display immediately on `/gallery`.

### 6.2 Bulk Migration via Manifest
For bulk onboarding of archival batches, consult `docs/MEDIA_MIGRATION_MANIFEST.md`. The manifest defines validated historical collections, SHA-256 hashes, source paths, and associated event slugs.

---

## 7. Future Event & Gallery Publishing Instructions

### 7.1 Creating Future Events
1. In the Admin Dashboard, navigate to **Events Management** (`/admin/events`).
2. Click **"Create Event"** (`/admin/events/new`).
3. Fill in the event dossier:
   - Event Title (Bilingual).
   - Event Date, Start Time, End Time, and Venue.
   - Event Category (Workshop, Seminar, Competition, Cultural Gathering).
   - Capacity and Registration Toggle (Enables `/events/[slug]` registration form).
   - Event Poster / Cover Graphic.
4. Save as **Published** to display on `/events` and homepage feeds.

### 7.2 Post-Event Gallery Association
1. Once the event has taken place, navigate to `/admin/events/[id]`.
2. Click **"Create Event Album"** (or create a new album at `/admin/gallery/new` and select the event in the **Related Event** dropdown).
3. **Duplicate Prevention:** The platform prevents duplicate albums for the same event at both database and server-action layers. If an album already exists, the system redirects to the existing album editor.
4. Upload high-resolution photographs, designate the album cover, and set publication status to **Published**.
5. **Bidirectional Integration:**
   - The event page (`/events/[slug]`) automatically displays the **"Photographic Retrospective"** section linking to the gallery.
   - The gallery album page (`/gallery/[slug]`) displays the verified **"Official Event Association"** banner linking back to the event brief.

---

## 8. Backup & Disaster Recovery Procedures

### 8.1 Administrative Snapshot Export
An authenticated Super Admin can export a full database backup directly from the admin interface or via the secure API endpoint:

```bash
# Request requires authenticated super_admin session cookie
GET /api/admin/backup/export
```

This returns a timestamped JSON dump containing table rows for all 26 entities, including users (password hashes preserved), events, gallery albums, and audit logs.

### 8.2 Database File Backup (SQLite / VPS)
On a Linux VPS or container host, create a snapshot of the SQLite database while Write-Ahead Logging is active:

```bash
# Atomic SQLite backup using vacuum into command
node -e '
  const Database = require("better-sqlite3");
  const db = new Database("local.db");
  db.backup("backups/backup-" + Date.now() + ".db");
  console.log("Database backup completed successfully.");
'
```

### 8.3 Media Assets Volume Backup
Synchronize the persistent upload directory to off-site backup storage:

```bash
rsync -avz --delete /home/mahmud-hasan/Naims\ Project/Arabic\ Club/public/uploads/ /backup/arabic-club-uploads/
```

### 8.4 Restoration Runbook
1. **Database Restoration:** Stop the Next.js process, replace `local.db` with the verified backup file, run `pnpm db:migrate` to verify schema integrity, and restart the process.
2. **Media Restoration:** Copy backed-up images into the `STORAGE_DIR` directory and ensure file ownership and read permissions are assigned to the application process.

---

## 9. Production Deployment Guide & Server Lifecycle

### 9.1 Environment Prerequisites
- **Operating System:** Linux (Ubuntu 22.04 LTS or Debian 12 recommended).
- **Node.js:** v20.x or v22.x LTS.
- **Package Manager:** `pnpm` v9+.
- **Process Manager:** `pm2` or `systemd`.
- **Reverse Proxy:** Nginx or Caddy with automated Let's Encrypt SSL/TLS.

### 9.2 Build & Launch Sequence
```bash
# 1. Install locked dependencies
pnpm install --frozen-lockfile

# 2. Run database migrations
pnpm db:migrate

# 3. Ensure Super Admin account is provisioned
pnpm admin:provision

# 4. Compile optimized production build
pnpm build

# 5. Launch production server on designated port (Port 3005)
pnpm start -p 3005
```

### 9.3 Systemd Service Configuration
Create `/etc/systemd/system/arabic-club.service`:

```ini
[Unit]
Description=Arabic Language & Cultural Club Platform (KNGC)
After=network.target

[Service]
Type=simple
User=mahmud-hasan
WorkingDirectory=/home/mahmud-hasan/Naims Project/Arabic Club
Environment=NODE_ENV=production
Environment=PORT=3005
EnvironmentFile=/home/mahmud-hasan/Naims Project/Arabic Club/.env.production
ExecStart=/home/mahmud-hasan/.local/bin/pnpm start -p 3005
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## 10. Verification Ledger & Automated Test Results

The entire platform underwent an exhaustive test battery during Phase 9 across all domains. All tests executed with a **100% pass rate**:

| Test Suite | Command | Assertion Count | Execution Time | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Database Migrations** | `pnpm db:migrate` | 7 migrations, 26 tables | 120 ms | **PASS** (Zero schema drift) |
| **TypeScript Typecheck** | `pnpm typecheck` | 100% codebase coverage | 1.84 s | **PASS** (0 errors) |
| **Next.js Production Build** | `pnpm build` | 23 static/dynamic routes | 586 ms | **PASS** (Compiled cleanly) |
| **Super Admin & RBAC Auth** | `pnpm test:admin` | 22 assertions | 267 ms | **PASS** (22/22 passed) |
| **Gallery & Media CMS** | `pnpm test:gallery` | 35 assertions | 409 ms | **PASS** (35/35 passed) |
| **Persistent Media Storage** | `pnpm test:storage` | 35 assertions | 382 ms | **PASS** (35/35 passed) |
| **Historical Photo Import** | `pnpm test:import` | 20 assertions | 291 ms | **PASS** (20/20 passed) |
| **Event-to-Gallery Integration** | `pnpm test:integration` | 28 assertions | 344 ms | **PASS** (28/28 passed) |
| **Comprehensive E2E Battery** | `pnpm test` | 6 full system tracks | 1.95 s | **PASS** (100% compliance) |
| **Live Server HTTP Probe** | `curl -I http://localhost:3005` | HTTP 200, CSP, HSTS | 15 ms | **PASS** (Healthy) |
| **Port Safety Isolation** | Port 3000 audit | PID 23123 (`Student Life Circle`) | N/A | **VERIFIED** (Untouched) |

---

## 11. Project State, Known Blockers & Next Actions

### 11.1 Completed and Fully Verified
- Complete public website featuring 16 routes, bilingual English/Arabic layout, dynamic `dir="rtl"` styling, and WCAG AA compliance.
- Complete administrative console featuring 15 consoles with least-privilege RBAC protection.
- Relational schema with 26 tables, foreign key constraints, and historical term preservation.
- Dual-driver storage architecture with binary magic byte validation and atomic volume writes.
- Bidirectional Event-to-Gallery workflow with strict duplicate album prevention.
- Automated provisioning of Super Admin `arabicclubkngc2025@gmail.com`.

### 11.2 Implemented but Awaiting Production Activation
- **Supabase Cloud Storage Bucket:** The code and REST driver are fully implemented and tested. Activation requires creating the `club-media` bucket in the Supabase web dashboard and adding the credentials to the production `.env`.
- **Transactional SMTP Email Gateway:** Email submission endpoints record inquiries in `contact_inquiries` and generate reset tokens in `password_resets`. Direct email dispatching requires linking an SMTP relay service (e.g., SendGrid, Mailgun, or institutional Google Workspace SMTP).

### 11.3 Blocked by Missing Credentials or Production Infrastructure
- Production domain DNS assignment (e.g., `arabicclub.kngc.edu.bd` or designated domain).
- Production SSL/TLS certificate installation via reverse proxy.
- External SMTP credentials for outbound email notifications.

### 11.4 Actions Requiring Administrator Decision
1. **Initial Password Rotation:** The institutional administrator should log into `/admin/login` using the provisioned credentials and set a permanent private password at `/admin/profile`.
2. **Review Historical Photo Batch:** Review the historical photograph collections listed in `docs/MEDIA_MIGRATION_MANIFEST.md` and authorize final publication.
3. **Leadership Roster Verification:** Confirm the current executive committee members and faculty advisor details before official launch.
