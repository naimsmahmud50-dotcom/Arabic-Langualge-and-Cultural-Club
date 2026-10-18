# SPECIFICATION: 025 - Existing Project Audit and Implementation Plan

## 1. Executive Summary & Context
- **Institution:** Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা / كلية كابي نذرول الحكومية، دكا)
- **Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
- **Intended Super Admin:** `arabicclubkngc2025@gmail.com`
- **Objective:** Perform a rigorous, non-destructive audit of the existing Arabic Language & Cultural Club digital platform, evaluate architectural maturity across 7 key dimensions, inventory existing media assets, and lay out an actionable, prioritized roadmap for Phases 4 through 9.

---

## 2. Scope & Guardrails
- **Read-Only / Diagnostic Phase:** Zero modifications to existing business logic, authentication credentials, live database content, or working components during this audit.
- **Zero Fabrication:** Rely exclusively on verifiable filesystem evidence, running process inspectors, and database queries.
- **Strictly Zero AI Emojis:** Clean, authoritative, dignified human academic tone across all artifacts and reports.
- **Preservation Policy:** Do not move, delete, overwrite, or mutate any historical images in `'Website Master Plan_files'`.

---

## 3. Audit Dimensions
1. **Architecture & Framework Baseline:** Next.js App Router, Turbopack, React 19, TypeScript strict mode, responsive layout, and bilingual RTL support.
2. **Authentication & Authorization Design:** Scrypt password hashing, HMAC-signed session cookies, database-backed revocable sessions, and granular 9-tier RBAC permissions.
3. **Database & Storage Architecture:** SQLite embedded engine with WAL mode and foreign keys, Drizzle ORM schemas (21 tables), media upload validation envelopes, and persistent storage readiness.
4. **Public & Administrative Route Inventory:** 21 public routes and 16 administrative console routes, verifying functionality, forms, and error handlers.
5. **Media & Gallery Assets:** Inventory 25+ real image assets in repository, audit database `gallery_albums` and `media_assets` tables, and identify missing event-to-gallery linkages.
6. **Security & Data Privacy (Strix-Supabase Standards):** PII protection in member directories, upload sanitization (SVG/HTML/EXE blocking), audit logging, and open-redirect defenses.
7. **Phased Roadmap (Phases 4–9):** Detailed execution plan covering Super Admin configuration, persistent storage setup, historical photo ingestion, event-to-gallery workflows, admin refinement, and production deployment.
