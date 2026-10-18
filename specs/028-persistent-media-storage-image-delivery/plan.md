# ARCHITECTURE & IMPLEMENTATION PLAN: 028 - Persistent Media Storage and Image Delivery

**Institution:** Kabi Nazrul Government College, Dhaka  
**Society:** Arabic Language & Cultural Club (اللسان والثقافة)  
**Phase:** 6 — Persistent Media Storage and Image Delivery  
**Status:** In Progress  

---

## 1. Technical Architecture & Component Design

```
+---------------------------------------------------------------------------------+
|                               CLIENT BROWSER                                    |
|   - Admin Batch Uploader / Public Lightbox / Album Cards                        |
+------------------------------------+--------------------------------------------+
                                     |
                  Multipart Upload / Media Request
                                     |
                                     v
+---------------------------------------------------------------------------------+
|                       NEXT.JS APPLICATION SERVER (PORT 3005)                    |
|                                                                                 |
|  1. /api/admin/gallery/upload                                                   |
|     - Session & RBAC Auth Check                                                 |
|     - Binary Magic Bytes Content Inspection (inspectFileSignature)              |
|     - Embedded Script / Anti-Malware Buffer Scan                                |
|     - Generate Canonical Storage Key (gallery/{year}/{slug}/{hash}_{clean})     |
|                                                                                 |
|  2. Unified Storage Provider Engine (src/lib/storage/index.ts)                  |
|     +-------------------------+-------------------------+                       |
|     | Cloud Provider          | Durable Local Volume    |                       |
|     | (Supabase Storage API)  | (Persistent Disk Mount) |                       |
|     +-------------------------+-------------------------+                       |
|     - Atomic Put / Delete / SignedURL generation                                |
|                                                                                 |
|  3. Transaction Coordinator & Orphan Prevention                                 |
|     - Ingests to Storage -> Inserts to Database                                 |
|     - Compensating rollback deletes storage object on DB failure                |
|                                                                                 |
|  4. Secure Media Delivery Controller (/api/media/[...path])                     |
|     - Checks is_published & album is_published                                  |
|     - Public: Cache-Control: public, max-age=31536000, immutable                 |
|     - Private: Verifies Admin Session or Cryptographic Signed Token             |
+------------------------------------+--------------------------------------------+
                                     |
                     Durable Persistence & Metadata
                                     |
                                     v
+------------------------------------+--------------------------------------------+
|                             DATABASE & STORAGE                                  |
|  - SQLite (arabic_club.db) / Supabase Postgres                                  |
|  - Storage: Supabase Storage Bucket 'arabic-club-media' or Durable Local Mount  |
+---------------------------------------------------------------------------------+
```

---

## 2. Modules to Implement & Enhance

### Module A: Storage Provider Abstraction (`src/lib/storage/index.ts`)
- Interface `StorageProvider`:
  - `uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<{ publicUrl: string; storageKey: string }>`
  - `deleteFile(key: string): Promise<boolean>`
  - `getPublicUrl(key: string): string`
  - `getSignedUrl(key: string, expiresInSeconds: number): Promise<string>`
  - `fileExists(key: string): Promise<boolean>`
- Implementations:
  - `SupabaseStorageProvider`: Direct REST implementation using standard `fetch` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Zero heavy cloud SDK bloat.
  - `DurableVolumeStorageProvider`: Writes to `public/uploads` or configured `STORAGE_DIR` with persistent atomic file operations and directory hierarchy management.

### Module B: Binary Magic Bytes & Content Inspection (`src/lib/utils/media-storage.ts`)
- Add `inspectFileSignature(buffer: Buffer): { detectedMime: string; isValid: boolean; error?: string }`:
  - Validates exact byte headers for JPEG, PNG, WebP, AVIF, MP4, WebM.
  - Rejects disguised executables, text scripts, and corrupted streams.
  - Scans buffer for ASCII/UTF-8 script injection payloads (`<?php`, `<script`, `<svg`, `<!ENTITY`).

### Module C: Secure Media Delivery & Private Access Controller (`src/app/api/media/[...path]/route.ts`)
- Route: `/api/media/[...path]`
- Path maps to canonical storage key.
- Queries `media_assets` and `gallery_albums` to verify publication state.
- If asset is public: serves with optimal cache headers and range request support.
- If asset is private/draft:
  - Verifies admin session (`gallery:manage` / `media:manage`).
  - Or verifies cryptographic HMAC token (`?token=...&exp=...`).
  - Otherwise returns 403 Forbidden / 404 Not Found.

### Module D: Upload Route Hardening with Compensating Cleanup (`src/app/api/admin/gallery/upload/route.ts`)
- Integrate `StorageProvider` and `inspectFileSignature`.
- Wrap storage upload and database insertion in a compensating transaction block:
  - If database insert fails, immediately invoke `storageProvider.deleteFile(storageKey)`.
  - Maintain upload concurrency limits and return structured success/failure metrics.

### Module E: Shared Media Safety in Deletion Actions (`src/lib/actions/content-cms.ts`)
- When deleting a `media_asset`:
  - Query database to check if any other `media_assets` or `gallery_albums` reference the same `fileUrl`.
  - If referenced elsewhere, delete only the database association and preserve the physical storage object.
  - If unreferenced, delete the physical object via `storageProvider.deleteFile()`.

### Module F: Comprehensive Backup, Disaster Recovery & Operation Guide (`docs/STORAGE_ARCHITECTURE_AND_BACKUP_GUIDE.md`)
- Complete operational handbook detailing backup commands, restore workflows, Supabase Storage setup, S3 setup, zero-secret environment variables, and consistency verification procedures.

### Module G: Automated Verification Test Suite (`src/lib/db/test-persistent-storage.ts`)
- Tests magic byte validation, content inspection, public vs private access control, compensating cleanup, shared asset preservation, and redeployment durability.
