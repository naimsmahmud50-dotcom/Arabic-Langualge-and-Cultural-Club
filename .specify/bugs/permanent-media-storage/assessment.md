# Bug Assessment: Non-Permanent and Insecure Media Uploads

- **Bug ID**: BUG-PHASE3-PERMANENT-MEDIA-STORAGE
- **Component**: Media Upload Handlers (`src/app/api/upload`, `src/app/api/admin/gallery/upload`) & Public Gallery Pages
- **Severity**: High (Data Loss on Redeployment / Next.js Production Build Invalidation & Missing Upload Security)
- **Status**: Remediated

## 1. Problem Statement
Previously, uploaded media assets were written directly into the `public/uploads/` directory inside the repository source tree.
In production Next.js environments:
1. **Redeployments / Rebuilds Wipe Uploads**: In modern containerized or Git-tracked deployments, files in `public/` that are not committed to source control are lost upon rebuild, branch checkout, or server redeploy.
2. **Next.js Production Build Caching**: In Next.js production builds (`next start`), files added to `public/` after the build step are not guaranteed to be indexed or served by the static file server without an application rebuild.
3. **Missing Authentication on General Upload Route**: The general upload endpoint (`/api/upload`) was missing session authentication checks.
4. **Lack of Deep File Validation**: Files were checked purely by declared client MIME headers rather than binary magic-byte inspection, creating risks of MIME spoofing and malicious SVG script injection (XSS).
5. **No Optimization**: Raw high-resolution files (several megabytes) were stored and served directly without generating modern WebP derivatives or thumbnails.

## 2. Root Cause Analysis
1. Direct usage of `path.join(process.cwd(), "public", "uploads")` in upload route handlers.
2. Missing storage provider abstraction layer separating physical file persistence from application delivery.
3. Missing image processing pipeline (Sharp) for responsive image variants and thumbnails.
4. Database records in `media_assets` and `gallery_albums` stored static `/uploads/...` paths tied directly to the local static public folder.

## 3. Remediation Strategy
1. **Durable Storage Abstraction (`src/lib/storage/index.ts`)**:
   - `StorageProvider` interface with `LocalDiskStorage` (default, zero cost) writing to a persistent host directory (`process.env.STORAGE_DIR || "./storage/uploads"`), outside of `.next` and `public`.
   - Optional extensible cloud drivers: S3-compatible, Cloudinary, Supabase Storage.
2. **Dedicated Delivery Route (`/api/media/[...path]`)**:
   - Streams files from persistent disk storage with HTTP caching (`max-age=31536000, immutable`), byte-range support, and path traversal sanitization.
3. **Deep Binary & Security Validation**:
   - Inspects binary magic bytes for JPEG, PNG, WebP, AVIF, MP4, WebM.
   - Rejects executable files, scripts, and SVGs containing malicious `<script>`, `onload=`, or `javascript:` directives.
   - Enforces unique UUID filenames.
4. **Sharp Image Optimization**:
   - Converts uploaded images to modern WebP (max 1920px).
   - Automatically generates responsive WebP thumbnails (max 400px).
5. **Compensating Cleanup & Admin Authentication**:
   - Both upload routes require authenticated admin sessions.
   - If database insertion fails, compensating cleanup purges the uploaded files from disk.
6. **Data Migration**:
   - Automated idempotent script (`scripts/migrate-uploads-to-storage.ts`) copying legacy uploads to durable storage, generating thumbnails, and updating DB rows to `/api/media/...`.
7. **Responsive Next.js Images**:
   - Public gallery pages (`src/app/(public)/gallery/page.tsx` and `AlbumMediaGrid.tsx`) upgraded to `next/image` with responsive `sizes` attribute.
