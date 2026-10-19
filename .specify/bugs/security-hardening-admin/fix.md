# Security Hardening & Admin Protection Remediation Report (Phase 5)
**Project:** Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka  
**Scope:** Admin Dashboard, Server Actions, Authentication, Database Concurrency, Media/HTML Sanitization, and Disaster Recovery  
**Date:** October 19, 2026  

---

## 1. Summary of Changes Applied

### A. Server-Side Authentication & RBAC Guards
- **Files Modified:**
  - `src/app/admin/applications/page.tsx`: Added server-side `getSession()` and `assertPermission(session.role, "applications:manage")`. Unauthenticated or unauthorized visitors are immediately redirected to `/admin/login` or `/admin/forbidden`.
  - `src/app/admin/inquiries/page.tsx`: Added server-side `getSession()` and `assertPermission(session.role, "settings:manage")`. Unauthenticated visitors are redirected to `/admin/login`.

### B. Password Security & Backdoor Elimination
- **File Modified:** `src/lib/auth/password.ts`
  - Integrated `bcryptjs` with 12 salt rounds for all administrative password hashing.
  - Implemented constant-time verification supporting both modern bcrypt hashes (`$2a$`, `$2b$`, `$2y$`) and legacy Scrypt (`scrypt$v1$`) hashes.
  - Completely eliminated hardcoded backdoor fallback logic (`AdminSecure2026!` / `password123`).
  - Added `logoutEverywhereAction` in `src/lib/auth/actions.ts` to invalidate all active sessions across all devices for the current administrator.

### C. Server-Side Form Validation & Field-Level Errors
- **Files Modified:**
  - `src/lib/actions/events.ts`: Updated `EventSchema` and `AnnualPlanActivitySchema` to accept relative media/document paths (`/storage/...`, `/api/media/...`) and return structured field-level errors (`errors: parsed.error.flatten().fieldErrors`).
  - `src/lib/actions/content-cms.ts`: Updated `AnnouncementSchema`, `LearningResourceSchema`, `PublicationSchema`, `AchievementSchema`, `GalleryAlbumSchema`, and `MediaAssetSchema` to permit relative asset paths and return structured field-level errors.
  - `src/lib/actions/committees.ts`: Returned structured field-level error maps.
  - `src/lib/actions/founders.ts`: Allowed relative portrait paths and returned field-level error maps.
  - `src/lib/actions/members.ts`: Allowed relative photo paths and returned field-level error maps.
  - `src/lib/actions/pages.ts`: Returned structured field-level error maps.

### D. HTML & Rich Text XSS Sanitization
- **File Created:** `src/lib/utils/sanitize.ts`
  - Employs `sanitize-html` to eliminate Cross-Site Scripting (XSS).
  - Strips dangerous HTML tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`).
  - Strips dangerous attributes (`onerror`, `onload`, `onclick`, inline event handlers).
  - Enforces `rel="noopener noreferrer"` on external hyperlinks.
  - Provides `sanitizeRichHtml` for rich text and `sanitizePlainText` for clean single-line strings.

### E. SQLite Concurrency (WAL & Busy Timeout)
- **File Modified:** `src/lib/db/index.ts`
  - Configured `PRAGMA busy_timeout = 5000;` to prevent `SQLITE_BUSY` contention errors under concurrent reads/writes.
  - Configured `PRAGMA synchronous = NORMAL;` for safe, high-performance WAL transactions.
  - Exported `sqlite` instance for backup operations.

### F. Automated Daily SQLite Backup & Disaster Recovery
- **Files Created:**
  - `scripts/backup-sqlite.ts`: Online non-blocking page-level backup using `better-sqlite3.backup()`, storing archives outside workspace (`~/.local/share/arabic-club/backups/`), enforcing 14-copy rolling retention, verifying `PRAGMA integrity_check`, and generating `.meta.json` manifests.
  - `scripts/restore-sqlite.ts`: Automated disaster recovery engine with pre-restore safety snapshotting and integrity verification.
  - `systemd/arabic-club-backup.service` & `systemd/arabic-club-backup.timer`: Configured daily systemd user timer (at 03:00 AM) and enabled via systemctl.
  - `docs/BACKUP_AND_RESTORE.md`: Complete disaster recovery runbook.
