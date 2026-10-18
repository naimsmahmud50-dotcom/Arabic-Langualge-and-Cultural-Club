# SPECIFICATION: 029 - Safe Historical Photo Import and Media Migration

**Institution:** Kabi Nazrul Government College, Dhaka  
**Society:** Arabic Language & Cultural Club (اللسان والثقافة)  
**Phase:** 7 — Safe Historical Photo Import and Media Migration  
**Status:** In Progress  

---

## 1. Executive Summary & Problem Definition

The Arabic Language & Cultural Club possesses historical photographs, event documentation, symposium archives, calligraphy exhibits, and founding memorabilia. To systematically ingest and archive these collections without data corruption, loss, or duplicate accumulation:
1. Administrators must be equipped with an intuitive, safe workflow to create historical albums with verifiable metadata (event name, known or approximate date notes, location, and description).
2. The upload workflow must support multi-photo selection, client-side preview, interactive reordering, custom captions/alt-text, cover image designation, and draft vs. published state control.
3. For large collections, a bulk import wizard must offer duplicate detection (via hash, filename, and size), per-file validation, progress tracking, retry mechanisms, and a pre-commit review step.
4. Existing repository media must be inventoried without modification, producing a comprehensive migration manifest with source references, proposed album mappings, and explicit admin confirmation gates.
5. Strict scholarly ethics: dates, locations, or identities of individuals must never be fabricated; unconfirmed historical facts are preserved as approximate date notes or pending curation.

---

## 2. User Stories & Acceptance Criteria

### User Story 1 (P1): Historical Album Curation & Multi-Photo Workflow
**As an** Archival Administrator,  
**I want** to create a historical album and upload multiple photographs with reordering and metadata editing,  
**So that** historical events are faithfully documented and presented in the club archive.

- **Acceptance Criteria 1.1:** Admin can open `/admin/gallery` and initiate a historical album specifying title (En/Ar), event name, event date (or approximate date notes), academic year, category, location, and description.
- **Acceptance Criteria 1.2:** Admin can select multiple images from disk, view immediate previews, and reorder photos prior to or after upload.
- **Acceptance Criteria 1.3:** Captions (En/Ar), accessibility alt-text, and credit are editable per photo.
- **Acceptance Criteria 1.4:** Any photo can be set as the album cover image.
- **Acceptance Criteria 1.5:** Album can be saved as Draft (`isPublished: false`) or Published (`isPublished: true`).
- **Acceptance Criteria 1.6:** Published albums appear immediately on `/gallery` and `/gallery/[slug]`; Draft albums remain isolated (HTTP 404 to anonymous users).

### User Story 2 (P1): Bulk Import Wizard with Duplicate Detection & Pre-Commit Review
**As an** Archival Administrator,  
**I want** a batch import wizard for large photograph archives with duplicate detection and a pre-commit review step,  
**So that** large historical archives can be ingested efficiently without creating duplicate files or corrupted entries.

- **Acceptance Criteria 2.1:** Upload wizard checks for existing duplicates in the target album by filename, file size, or hash, alerting the administrator with clear warning badges.
- **Acceptance Criteria 2.2:** Pre-commit review step displays all selected photographs, detected dimensions, file sizes, proposed captions, and validation status before physical upload.
- **Acceptance Criteria 2.3:** Real-time upload progress with per-file status (pending, uploading, success, failure) and retry options for failed files.
- **Acceptance Criteria 2.4:** Partial failures are handled safely: successful files are committed, failed files remain in the retry queue with actionable error messages.
- **Acceptance Criteria 2.5:** Option to import as Drafts so administrators can inspect and refine metadata before public release.

### User Story 3 (P2): Repository Media Inventory & Migration Manifest Engine
**As a** System Auditor and Data Steward,  
**I want** an automated inventory of existing repository media files and a migration manifest,  
**So that** legacy media references can be inspected, reconciled, and migrated with explicit administrator authorization.

- **Acceptance Criteria 3.1:** Automated scanner traverses repository media directories without modifying, publishing, or deleting any files.
- **Acceptance Criteria 3.2:** Generates a structured migration manifest (`docs/MEDIA_MIGRATION_MANIFEST.md`) detailing source paths, detected MIME types, file sizes, proposed album destinations, and conflict status.
- **Acceptance Criteria 3.3:** Bulk migration execution requires explicit administrator confirmation and never silently overwrites existing records or physical files.
- **Acceptance Criteria 3.4:** Non-destructive operation: source files and existing database rows remain intact if migration is canceled or encounters conflicts.

### User Story 4 (P1): Automated Verification & Test Harness
**As a** Quality Assurance Engineer,  
**I want** an end-to-end automated verification suite for historical photo imports,  
**So that** image integrity, database relationships, duplicate detection, captions, ordering, and cover selection are proven with fresh test evidence.

- **Acceptance Criteria 4.1:** Automated test suite (`src/lib/db/test-historical-import.ts`) tests small representative batch imports.
- **Acceptance Criteria 4.2:** Verifies duplicate detection logic, draft vs. published isolation, cover selection, and reordering.
- **Acceptance Criteria 4.3:** Verifies migration manifest generation and non-destructive inventorying.
- **Acceptance Criteria 4.4:** All tests pass with zero failures and zero AI emojis.

---

## 3. Strict Institutional Constraints
- Zero AI emojis across all user interfaces, alerts, console outputs, and documentation.
- Maintain human academic scholarship tone matching Kabi Nazrul Government College, Dhaka.
- Never invent historical dates, names, or event descriptions.
