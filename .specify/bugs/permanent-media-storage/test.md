# Bug Verification: Permanent and Safe Media Storage Architecture

- **Slug**: permanent-media-storage
- **Tested**: 2026-10-19T12:20:00+06:00
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary

The original symptoms (data loss on redeployment due to storing files in `public/uploads/`, missing upload authentication, missing magic-byte validation, SVG XSS risks, and absence of image optimization) are completely resolved. The storage abstraction layer (`LocalDiskStorage` outside the build tree, with extensible S3, Cloudinary, and Supabase providers) persists files reliably. Legacy uploads have been migrated to `storage/uploads/` and database paths updated to `/api/media/...`. All 24 storage unit tests, 21 live HTTP security checks, and 41 regression tests passed with zero errors.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix): Auth Enforcement | `fetch POST /api/upload` & `/api/admin/gallery/upload` without session | pass | Both endpoints strictly reject unauthenticated uploads with HTTP 401 Unauthorized. |
| Reproduction (post-fix): Deep Binary Magic Bytes | `validateUploadBuffer` with fake JPEG and PHP payloads | pass | Binary header inspection successfully identifies mismatches and rejects spoofed files. |
| Reproduction (post-fix): SVG Script Injection | `validateUploadBuffer` with `<script>` and `onload=` vectors | pass | Rejects dangerous SVGs and prevents stored XSS attacks. |
| Reproduction (post-fix): Path Traversal Defense | `GET /api/media/../../etc/passwd` & `%2e%2e` variants | pass | Dangerous traversal characters are stripped; returns HTTP 404/403. |
| Reproduction (post-fix): Byte Range Streaming | `GET /api/media/...` with `Range: bytes=0-1023` | pass | Returns HTTP 206 Partial Content with correct `Content-Range` header. |
| Storage Lifecycle & Sharp Optimization | `pnpm exec tsx scripts/test-permanent-storage.ts` | pass | 24 / 24 assertions passed: WebP compression, thumbnails (<=400px), disk persistence, delete cleanup. |
| Live Security & HTTP Integration | `pnpm exec tsx scripts/verify-phase3-live-security.ts` | pass | 21 / 21 assertions passed: live daemon on Port 3005 tested for caching, compression, and DB integrity. |
| Legacy Data Migration Integrity | `sqlite3 arabic_club.db` audit | pass | 0 orphaned `/uploads/` URLs remain in `media_assets` or `gallery_albums`. |
| Regression Suite: Phase 1 (Site Settings) | `pnpm exec tsx scripts/test-settings-preserve.ts` | pass | 16 / 16 tests passed: partial tab updates preserve untouched settings across tabs. |
| Regression Suite: Phase 2 (Page Section CMS) | `pnpm exec tsx scripts/test-page-section-json.ts` | pass | 25 / 25 tests passed: JSON CMS schemas, bilingual rendering, and public reflection verified. |
| TypeScript Type-Check | `pnpm typecheck` | pass | `tsc --noEmit` exited with code 0 (zero errors). |
| Production Compilation Build | `pnpm build` | pass | Next.js 16.4.2 Turbopack optimized build completed in 2.4s (24 / 24 static and dynamic routes). |
| Systemd Daemon Status | `systemctl --user status arabic-club.service` | pass | Daemon active and running on isolated Port 3005 (Port 3000 untouched). |

## Output Excerpts

### 1. Storage Unit & Sharp Test Suite (`scripts/test-permanent-storage.ts`)
```
==================================================
ALCC Phase 3: Permanent Media Storage Test Suite
==================================================
[PASS] 1. Default storage provider is LocalDiskStorage
[PASS] 2. Storage provider identifier is 'local'
[PASS] 3. Valid JPEG detected via magic bytes
[PASS] 4. Valid PNG detected via magic bytes
[PASS] 5. Valid WebP detected via magic bytes
[PASS] 6. Fake JPEG spoof rejected due to mismatched magic bytes
[PASS] 7. Malicious SVG with <script> rejected
[PASS] 8. Malicious SVG with onload handler rejected
[PASS] 9. Executable PHP script upload rejected
[PASS] 10. Sharp optimized format is WebP
[PASS] 11. Main storage key formatted correctly
[PASS] 12. Thumbnail storage key formatted correctly
[PASS] 13. Large image buffer is valid WebP
[PASS] 14. Large image width resized to <= 1920px
[PASS] 15. Thumbnail buffer is valid WebP
[PASS] 16. Thumbnail width resized to <= 400px
[PASS] 17. Generated public URL uses /api/media/... format
[PASS] 18. Uploaded file confirmed to exist on persistent disk
[PASS] 19. Uploaded thumbnail confirmed to exist on persistent disk
[PASS] 20. Deleted test file confirmed purged from disk
[PASS] 21. URL key extracted correctly from /api/media/ URL
[PASS] 22. Path traversal '..' stripped from media key
[PASS] 23. Legacy uploaded file exists in persistent storage/uploads
[PASS] 24. Migrated WebP thumbnail exists in persistent storage/uploads
==================================================
Results: 24 passed out of 24 assertions.
==================================================
```

### 2. Live Security & HTTP Streaming Audit (`scripts/verify-phase3-live-security.ts`)
```
==================================================================
ALCC Phase 3 Deep Live Verification & Security Audit
Target: http://localhost:3005 (Port 3005)
==================================================================
[PASS] 1. System daemon is active and responding on Port 3005
[PASS] 2. /api/upload blocks unauthenticated POST with 401 Unauthorized
[PASS] 3. /api/admin/gallery/upload blocks unauthenticated POST with 401 Unauthorized
[PASS] 4. Path traversal attempt '../' rejected with 403 or 404
[PASS] 5. URL-encoded path traversal attempt '%2e%2e' rejected safely
[PASS] 6. Non-existent media asset returns clean 404 Not Found
[PASS] 7. Migrated asset served successfully via /api/media/ (HTTP 200)
[PASS] 8. Correct Content-Type 'image/jpeg' returned
[PASS] 9. Immutable caching header 'public, max-age=31536000, immutable' enforced
[PASS] 10. 'Accept-Ranges: bytes' enabled for streaming support
[PASS] 11. WebP thumbnail served successfully (HTTP 200)
[PASS] 12. Thumbnail Content-Type is 'image/webp'
[PASS] 13. Sharp thumbnail achieves >50% compression reduction
[PASS] 14. Byte range request returns HTTP 206 Partial Content
[PASS] 15. Content-Range header correctly indicates byte slice range
[PASS] 16. media_assets table has 0 legacy '/uploads/' URLs
[PASS] 17. gallery_albums table has 0 legacy '/uploads/' URLs
[PASS] 18. Public /gallery route renders with HTTP 200 OK
[PASS] 19. Gallery header rendered
[PASS] 20. Album detail page renders with HTTP 200 OK
[PASS] 21. Migrated /api/media/... asset URL is directly rendered in album detail markup
==================================================================
Live Verification Summary: 21 / 21 tests passed.
==================================================================
```

### 3. Production Build (`pnpm build`)
```
▲ Next.js 16.4.2 (Turbopack)
- Environments: .env
✓ Running next.config.mjs took 13ms
✓ Compiled successfully in 2.4s
✓ Finished TypeScript in 944ms
✓ Collecting page data using 15 workers in 1741ms
✓ Generating static pages using 15 workers (24/24) in 665ms
✓ Finalizing page optimization in 6ms
```

## Residual Risks

- **Host Disk Quota:** As `LocalDiskStorage` stores uploads on the host server disk under `./storage/uploads`, the host machine should have sufficient available disk space. If disk usage becomes substantial in the future, transitioning to `STORAGE_PROVIDER=s3` (e.g. Cloudflare R2 or AWS S3) is fully supported with zero application code changes by providing credentials in `.env`.
- **Private Media vs Public Media:** All files uploaded through the public gallery are publicly readable under `/api/media/`. Any future confidential document storage (e.g. internal meeting minutes) should use the signed token helper (`getSignedUrl`) provided in `src/lib/storage`.

## Recommendation

Close the bug — verified end-to-end. All required tasks in Phase 3 are rigorously tested, verified across unit, integration, and live daemon levels, and no regressions exist in the codebase.
