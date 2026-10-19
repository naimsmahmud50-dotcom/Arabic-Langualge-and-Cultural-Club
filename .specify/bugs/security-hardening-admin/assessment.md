# Security Hardening & Admin Protection Audit Assessment (Phase 5)
**Project:** Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka  
**Scope:** Admin Dashboard, Server Actions, Authentication, Database Concurrency, Media/HTML Sanitization, and Disaster Recovery  
**Date:** October 19, 2026  

---

## 1. Executive Summary
During the comprehensive Phase 5 security audit, multiple attack surfaces and defense-in-depth gaps were identified across authentication, route guarding, input validation, database concurrency, and disaster recovery.

---

## 2. Detailed Findings

### A. Route Authentication & Session Verification
- **Vulnerability:** `src/app/admin/applications/page.tsx` and `src/app/admin/inquiries/page.tsx` lacked server-side session checks (`getSession()`), relying solely on Edge middleware.
- **Impact:** If middleware is misconfigured or bypassed in custom deployment topologies, unauthenticated visitors could access confidential student admission dossiers and institutional correspondence.
- **Remediation:** Enforce server-side `getSession()` and `assertPermission()` on both pages with explicit redirection to `/admin/login`.

### B. Password Hashing & Development Backdoors
- **Vulnerability:** In `src/lib/auth/password.ts` (lines 112–119), a development fallback allowed arbitrary logins for hashes starting with `$2b$` if the password matched `"AdminSecure2026!"` or `"password123"`.
- **Impact:** Hardcoded credentials could be abused if any account possessed a `$2b$` hash.
- **Remediation:** Remove development backdoors completely. Upgrade hashing engine to standard `bcryptjs` (salt rounds 12) while retaining constant-time scrypt verification for existing password hashes.

### C. Session Lifetime & Logout Everywhere
- **Vulnerability:** Lack of a "Logout Everywhere" server action meant compromised sessions across multiple devices could not be revoked simultaneously.
- **Remediation:** Implement `logoutEverywhereAction` invoking `destroyAllUserSessions(userId)` and invalidating current cookie tokens.

### D. Server-Side Validation & Field-Level Errors
- **Vulnerability:** Several Server Actions (`events.ts`, `committees.ts`, `founders.ts`, `members.ts`, `pages.ts`) returned generic error strings (`parsed.error.issues[0]?.message`) without returning structured field-level error maps (`errors: parsed.error.flatten().fieldErrors`).
- **Secondary Issue:** Schema validators for image/media URLs strictly enforced `z.string().url()`, which incorrectly rejected valid relative asset paths (e.g. `/storage/uploads/...`, `/api/media/...`).
- **Remediation:** Return both `error` and `errors` field maps, and update media path schemas to accept valid relative and absolute URLs.

### E. XSS & HTML Sanitization
- **Vulnerability:** CMS inputs and rich-text descriptions could theoretically contain malicious HTML (`<script>`, `onerror`, `javascript:` URIs).
- **Remediation:** Introduce `src/lib/utils/sanitize.ts` using `sanitize-html` to sanitize all incoming or rendered HTML content.

### F. SQLite Concurrency (WAL & Busy Timeout)
- **Vulnerability:** In `src/lib/db/index.ts`, `journal_mode = WAL` was enabled, but `busy_timeout` was omitted. Under concurrent read/write loads, SQLite could throw `SQLITE_BUSY` errors immediately without waiting.
- **Remediation:** Configure `PRAGMA busy_timeout = 5000;` and `PRAGMA synchronous = NORMAL;`.

### G. Automated Daily Backup & Disaster Recovery
- **Vulnerability:** Backups were previously generated as JSON snapshots inside the project `./backups/` folder.
- **Remediation:** Implement a native SQLite page-level backup script using `better-sqlite3.backup()`, storing backups outside the repository (`~/.local/share/arabic-club/backups/`), maintaining a rolling 14-day retention policy, accompanied by a verified restore script and operational runbook.
