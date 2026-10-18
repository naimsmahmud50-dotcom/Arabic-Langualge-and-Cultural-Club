# TECHNICAL PLAN: 029 - Safe Historical Photo Import and Media Migration

**Institution:** Kabi Nazrul Government College, Dhaka  
**Society:** Arabic Language & Cultural Club (اللسان والثقافة)  
**Feature Directory:** `specs/029-historical-photo-import-media-migration`  

---

## 1. Architecture Overview

Phase 7 builds a comprehensive, safety-guarded administrator workflow for ingesting historical photograph archives, batch importing large photo dossiers, and cataloging legacy repository media.

```
+-----------------------------------------------------------------------------------------+
|                               ADMINISTRATOR BROWSER UI                                  |
|  - AlbumFormModal: Historical metadata (title, approximate date notes, location)         |
|  - BulkImportModal: Multi-file drag/drop, pre-commit staging review, duplicate alerts     |
|  - MediaAssetModal: Ordering, captions (En/Ar), alt text, cover designation             |
+-----------------------------------------------------------------------------------------+
                                             |
                                  Multipart POST / Server Action
                                             v
+-----------------------------------------------------------------------------------------+
|                          IMPORT CONTROLLER & PIPELINE GATEWAY                           |
|  - RBAC Guard: Requires 'gallery:manage' or 'media:manage' administrative session       |
|  - Duplicate Detector: Matches filename, file size, and SHA-256 hash against DB records  |
|  - Strix-Supabase Security Gate: Binary magic byte inspection & script payload scan    |
|  - Storage Engine: getStorageProvider() (Supabase bucket or durable volume)             |
|  - Compensating Cleanup: Rollback on database insertion error                            |
+-----------------------------------------------------------------------------------------+
                                             |
                                   Persists & Verifies
                                             v
+-----------------------------------------------------------------------------------------+
|                                DATABASE & AUDIT LEDGER                                  |
|  - gallery_albums: Holds historical context (dateNotes, academicYear, coverImageUrl)   |
|  - media_assets: Holds ordered photo records, captions, altText, and isPublished state   |
|  - audit_logs: Records immutable audit entry for all batch import & migration actions   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Component & Interface Specifications

### 2.1 Bulk Import Staging Modal (`src/app/admin/gallery/BulkImportModal.tsx`)
- Multi-file selector with drag-and-drop zone.
- Client-side staged files state:
  ```ts
  interface StagedImportFile {
    id: string;
    file: File;
    previewUrl: string;
    filename: string;
    sizeBytes: number;
    captionEn: string;
    captionAr: string;
    altText: string;
    isDuplicate: boolean;
    duplicateReason?: string;
    status: "idle" | "uploading" | "success" | "error";
    errorMessage?: string;
    progress: number;
  }
  ```
- Pre-commit review table:
  - Thumbnail preview (64x64)
  - Filename and size
  - Editable caption / alt-text
  - Duplicate warning indicator badge
  - Remove button
- Action controls:
  - Album selector (or active album)
  - Import as Draft toggle (default: true for safety)
  - Set first photo as album cover toggle
  - "Start Batch Import" button with progress indicator
  - "Retry Failed" button for partial errors

### 2.2 Batch Import API Handler (`src/app/api/admin/gallery/import/route.ts`)
- Accepts `multipart/form-data`:
  - `albumId`: target album ID
  - `isDraft`: boolean string ("true" | "false")
  - `setCoverIfEmpty`: boolean string
  - `files`: File[]
  - `metadata`: JSON string with per-file caption, altText, credit
- Processing pipeline:
  1. Verify admin session and permissions (`gallery:manage` or `media:manage`).
  2. Verify target album exists.
  3. Query existing album assets to detect duplicates (by filename and size).
  4. For each file:
     - Binary magic bytes verification via `validateMediaUpload(buffer)`.
     - Generate safe path via `generateSafeStoragePath`.
     - Upload via `getStorageProvider().uploadFile`.
     - Insert `mediaAssets` row.
     - Catch DB errors with `storageProvider.deleteFile` (compensating rollback).
  5. If album cover is null and `setCoverIfEmpty` is true, assign first successful photo.
  6. Record audit log: `GALLERY_BATCH_IMPORT`.
  7. Return JSON response:
     ```ts
     {
       success: boolean;
       totalFiles: number;
       succeeded: number;
       failed: number;
       duplicatesDetected: number;
       results: Array<{
         filename: string;
         status: "success" | "failed" | "duplicate_warning";
         assetId?: string;
         fileUrl?: string;
         error?: string;
       }>
     }
     ```

### 2.3 Media Inventory & Migration Manifest Engine (`src/lib/utils/inventory-media.ts`)
- Script and callable function to inventory all media files on disk:
  - Scans `public/`, `Website Master Plan_files/`, and any configured asset directories.
  - Computes SHA-256 hash, file size, MIME type, and relative path.
  - Cross-references existing database `media_assets` and `gallery_albums`.
  - Generates `docs/MEDIA_MIGRATION_MANIFEST.md` formatted cleanly with zero AI emojis.
  - Manifest includes:
    - Inventory Summary Table
    - Matched / Already Migrated Files
    - Unmigrated Discovered Files
    - Proposed Target Album & Academic Year
    - Conflict Analysis & Duplicate Alerts
    - Formal Administrator Confirmation Sign-off section.

---

## 3. Data Integrity & Safety Guardrails
1. **Never Silently Overwrite**: Duplicate filenames trigger warnings in the review step and are assigned safe unique collision-resistant names upon import.
2. **Explicit Admin Confirmation**: Bulk operations and media migrations require explicit user confirmation.
3. **Draft Separation**: Historical imports default to Draft status so administrators can inspect and review metadata prior to public exposure.
4. **No Fact Fabrication**: Missing dates or unknown locations remain null or noted explicitly as approximate in `dateNotes`.
5. **Compensating Rollback**: Failed database writes purge the uploaded physical storage object immediately.

---

## 4. Verification & Testing Strategy
1. Automated Verification Suite (`src/lib/db/test-historical-import.ts`):
   - Ingests a small representative batch of images.
   - Tests duplicate detection algorithms with simulated duplicate file uploads.
   - Tests metadata fidelity: captions (En/Ar), alt-text, credit, sort ordering.
   - Tests cover image designation.
   - Tests draft vs published isolation (draft hidden from public, published visible).
   - Tests inventory scanner and migration manifest creation.
2. Production Build and Typecheck:
   - `pnpm typecheck` must pass with 0 errors.
   - `pnpm build` must compile cleanly with exit code 0.
