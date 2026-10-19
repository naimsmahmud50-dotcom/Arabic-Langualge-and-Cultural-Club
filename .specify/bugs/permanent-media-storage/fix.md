# Bug Fix: Permanent and Safe Media Upload Architecture

- **Bug ID**: BUG-PHASE3-PERMANENT-MEDIA-STORAGE
- **Status**: Verified & Deployed
- **Date**: 2026-10-19

## 1. Summary of Changes

### Core Storage Abstraction
- Created `src/lib/storage/index.ts` and barrel export `src/lib/storage.ts`:
  - `StorageProvider` contract (`uploadFile`, `deleteFile`, `getPublicUrl`, `getSignedUrl`, `fileExists`).
  - `LocalDiskStorage`: default zero-cost provider writing to `STORAGE_DIR` (`./storage/uploads`), outside the build tree.
  - Optional cloud drivers: `S3StorageProvider`, `CloudinaryStorageProvider`, `SupabaseStorageProvider`.
  - `validateUploadBuffer`: deep magic-byte inspection (JPEG, PNG, WebP, AVIF, MP4, WebM) + strict SVG scanner rejecting `<script>`, `onload=`, `javascript:`, and XML entity payloads + random UUID filename generator.
  - `optimizeImageWithSharp`: converts uploaded images to high-efficiency WebP full-size (max 1920px, 85 quality) and WebP thumbnail (max 400px, 80 quality).
  - `extractStorageKeyFromUrl`: extracts and sanitizes keys against path traversal (`..`).

### Upload API Route Handlers
- Created `src/app/api/upload/route.ts`:
  - Requires authenticated administrative session (`getSession()`).
  - Multi-file ingestion with binary buffer security validation.
  - Sharp WebP optimization + thumbnail generation.
  - Immutable audit logging.
- Updated `src/app/api/admin/gallery/upload/route.ts`:
  - Enforces `gallery:manage` / `media:manage` RBAC permissions.
  - Validates binary magic bytes.
  - Performs Sharp WebP optimization for images and stores separate full-size and thumbnail URLs.
  - Compensating cleanup: if database persistence fails, all uploaded files (main and thumbnail) are deleted from storage to prevent orphan files.

### Media Streaming Route
- Updated `src/app/api/media/[...path]/route.ts`:
  - Streams media files directly from persistent storage.
  - Handles legacy `/uploads/` fallback gracefully.
  - Enforces HTTP caching (`public, max-age=31536000, immutable`).
  - Implements byte range requests (`Accept-Ranges: bytes`) for smooth video playback and streaming.
  - Strict path traversal sanitization stripping dangerous relative paths.

### Public Gallery Component Optimization
- Updated `src/app/(public)/gallery/page.tsx`:
  - Replaced native `<img>` with Next.js `next/image` `<Image>` component using `fill` and responsive `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`.
- Updated `src/app/(public)/gallery/[slug]/AlbumMediaGrid.tsx`:
  - Replaced native `<img>` with Next.js `<Image>` component using `fill` and responsive `sizes`.

### Configuration & Data Migration
- Updated `.gitignore` to ignore `/storage/` so persistent uploads remain untouched across git actions.
- Updated `.env.example` and `.env` with `STORAGE_PROVIDER=local` and `STORAGE_DIR=./storage/uploads`.
- Implemented `scripts/migrate-uploads-to-storage.ts`:
  - Copied existing legacy files from `public/uploads/` to `storage/uploads/`.
  - Generated Sharp WebP thumbnails for legacy assets.
  - Migrated SQLite database rows from `/uploads/...` to `/api/media/...`.
