# TECHNICAL PLAN: 025 - Existing Project Audit and Implementation Plan

## 1. Technical Audit Methodology
1. **Source Code & Architecture Inspection:**
   - Review root configuration (`package.json`, `tsconfig.json`, `next.config.mjs`, `drizzle.config.ts`, `.env.example`).
   - Audit routing hierarchy across `src/app/(public)/`, `src/app/admin/`, and `src/app/api/`.
   - Inspect middleware session interception and redirect safety rules in `src/middleware.ts` / `src/proxy.ts`.
2. **Database & Schema Inspection:**
   - Audit table structures in `src/lib/db/schema.ts` and verify relational constraints.
   - Inspect database state directly in `./arabic_club.db` using `better-sqlite3`.
   - Review query functions in `src/lib/db/queries.ts` and mutation actions in `src/lib/actions/`.
3. **Authentication & Authorization Inspection:**
   - Audit Scrypt hashing parameters (`N=16384, r=8, p=1, keylen=64`) in `src/lib/auth/password.ts`.
   - Audit token signing and verification logic in `src/lib/auth/token.ts`.
   - Audit role-permission matrix (`ROLE_PERMISSIONS`) in `src/lib/auth/rbac.ts`.
4. **Media Storage & File Validation:**
   - Inspect upload envelopes and extension allowlists in `src/lib/utils/media-storage.ts`.
   - Map physical assets in `'Website Master Plan_files'` and verify image dimensions/formats with `file` utility.
5. **Workflow Gap Identification:**
   - Analyze event lifecycle (`events` table) to gallery curation (`gallery_albums` and `media_assets` tables).
   - Trace Super Admin management and privilege assignment.
6. **Roadmap Architecture (Phases 4–9):**
   - Synthesize findings into actionable, ordered execution phases with specific deliverables and verification gates.
