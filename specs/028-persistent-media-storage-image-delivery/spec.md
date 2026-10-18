# SPECIFICATION: 028 - Persistent Media Storage and Image Delivery

**Institution:** Kabi Nazrul Government College, Dhaka  
**Society:** Arabic Language & Cultural Club (اللسان والثقافة)  
**Phase:** 6 — Persistent Media Storage and Image Delivery  
**Status:** In Progress  

---

## 1. Executive Summary & Problem Definition

The Arabic Language & Cultural Club web platform requires a reliable, persistent, and security-hardened media storage and delivery architecture. High-resolution photographs, historical documentation, calligraphy manuscripts, and video recordings must:
1. Survive application server restarts, container redeployments, and host rebuilds without data loss or broken links.
2. Undergo strict binary content inspection (magic bytes) to prevent file extension spoofing and executable injection.
3. Enforce privacy boundaries: unpublished and restricted archival assets must remain private, accessible only via authenticated administrative sessions or signed short-lived URLs.
4. Deliver published assets with optimal caching, responsive sizing, and durable URLs.
5. Provide atomic transaction semantics with compensating cleanup to prevent orphaned storage objects or broken database references.

---

## 2. User Stories & Acceptance Criteria

### User Story 1 (P1): Cloud & Persistent Storage Provider Abstraction
**As a** Systems Administrator and DevOps Engineer,  
**I want** a unified storage provider engine supporting Supabase Storage and durable mounted volume storage,  
**So that** media assets survive across server restarts and container redeployments without relying on ephemeral developer paths.

- **Acceptance Criteria 1.1:** Storage engine supports Supabase Storage API (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_BUCKET_MEDIA`) for cloud deployments.
- **Acceptance Criteria 1.2:** Fallback to durable volume storage (`STORAGE_DIR` or persistent `/public/uploads`) with atomic persistence when cloud keys are not configured.
- **Acceptance Criteria 1.3:** Database stores durable object keys (e.g. `gallery/2026-2027/album/uuid.webp`), mime type, dimensions, file size, and publication state.

### User Story 2 (P1): Content-Aware File Inspection & Secure Upload Pipeline
**As a** Security Officer (Strix-Supabase Protocol),  
**I want** the upload pipeline to inspect the actual binary magic bytes and decode image headers,  
**So that** attackers cannot upload malicious scripts, web shells, or executables disguised with fake image extensions.

- **Acceptance Criteria 2.1:** Binary magic byte verification for JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), WebP (`RIFF...WEBP`), AVIF (`ftypavif`), MP4 (`ftyp`), and WebM (`1A 45 DF A3`).
- **Acceptance Criteria 2.2:** Rejection of any file whose binary signature does not match its declared extension and MIME type.
- **Acceptance Criteria 2.3:** Deep buffer scan for embedded script markers (`<script`, `<?php`, `<svg`, `<!ENTITY`, `eval(`, etc.) within uploaded payloads.
- **Acceptance Criteria 2.4:** Filename sanitization and object key generation with zero directory traversal risk.

### User Story 3 (P2): Private Access Control & Authorized Signed URLs
**As an** Archival Curator,  
**I want** unpublished and draft media assets to be restricted from public exposure,  
**So that** unreleased event photographs and sensitive records cannot be scraped or indexed.

- **Acceptance Criteria 3.1:** Dedicated media delivery controller (`/api/media/[...path]`) checks asset publication status.
- **Acceptance Criteria 3.2:** Anonymous requests for unpublished or draft assets return HTTP 403/404.
- **Acceptance Criteria 3.3:** Authorized administrators with `gallery:manage` or `media:manage` can preview unpublished assets.
- **Acceptance Criteria 3.4:** Support for cryptographically signed, time-limited preview URLs (`?token=...&exp=...`) for restricted media sharing.
- **Acceptance Criteria 3.5:** Published assets delivered with aggressive caching headers (`Cache-Control: public, max-age=31536000, immutable`).

### User Story 4 (P2): Atomic Reliability & Orphan Prevention
**As a** Database Administrator,  
**I want** atomic failure recovery and compensating cleanup,  
**So that** failed uploads never leave orphaned files in storage or invalid rows in the database.

- **Acceptance Criteria 4.1:** If database insertion fails following a successful storage upload, compensating cleanup deletes the uploaded object immediately.
- **Acceptance Criteria 4.2:** If storage upload fails, zero database records are inserted, and an informative error is returned.
- **Acceptance Criteria 4.3:** When deleting a media asset, if the same file is shared by other records (e.g. another album or as an album cover), the underlying physical object is preserved.

### User Story 5 (P3): Backup, Restore, and Disaster Recovery Documentation
**As an** Institutional Operator,  
**I want** comprehensive documentation on database and media backups, restoration procedures, and consistency checks,  
**So that** the society's visual history can be recovered in disaster recovery scenarios.

- **Acceptance Criteria 5.1:** Documented database backup (`sqlite3 .dump` and cloud PostgreSQL commands).
- **Acceptance Criteria 5.2:** Documented media object synchronization and backup (`rsync`, `aws s3 sync`, Supabase bucket backup).
- **Acceptance Criteria 5.3:** Documented recovery verification checklists and zero-secret environment variable definitions.
