# SPECIFICATION: 020 - Comprehensive Security & Privacy Audit, Hardening & Verification

## 1. Executive Summary & Purpose
The Arabic Language & Cultural Club application manages public institutional scholarship, member profiles, sensitive membership dossiers, event registrations, media assets, administrative users, and tamper-evident audit trails.
This specification mandates a systematic security and privacy audit of the entire codebase across 18 audit points, the implementation of defense-in-depth mitigations for all identified areas, automated test coverage for security invariants, and the publication of an honest, comprehensive audit dossier (`docs/SECURITY_AUDIT.md`).

---

## 2. 18-Point Audit Scope

1. **Authentication & Session Handling**: Scrypt password hashing with unique salt, timing-safe equality, secure session cookies (HttpOnly, SameSite=Lax, Secure in production), session revocation on logout, automatic session expiration.
2. **Server-Side Role-Based Authorization (RBAC)**: Enforce 5-role permission matrix across all server actions, server components, and API routes (`super_admin`, `administrator`, `content_editor`, `membership_manager`, `event_manager`).
3. **Direct URL & Endpoint Access**: Middleware edge guards, blocking unauthorized URL navigation and direct API requests to `/api/admin/*`.
4. **Database Access Policies & Multi-Tenant Boundaries**: SQLite/Drizzle parameterization, query boundary enforcement, prevention of unauthorized row access.
5. **Input Validation & Output Rendering**: Strict Zod schemas for every form and action, sanitization of user strings, React auto-escaping, prevention of raw HTML rendering.
6. **SQL Injection Risks**: 100% parameterization; zero string concatenation inside `sql` tagged templates or raw database queries.
7. **Cross-Site Scripting (XSS)**: Safe output rendering, SVG rejection in media uploads to prevent stored XSS, script-tag neutralization.
8. **CSRF & Open-Redirect Defense**: Next.js Server Actions with automatic Origin/Host validation, validation of redirect destinations to prevent phishing and token theft.
9. **Rate Limiting & Spam Protection**: Sliding-window rate limiters on login, contact inquiries, membership application submissions, and membership status tracking queries.
10. **File Upload Validation & Storage Permissions**: Strict MIME type whitelisting, file extension verification, 15MB/100MB size caps, directory traversal prevention (`..`, `/`, `\`), safe path sanitization.
11. **Secret Management**: Server-only environment variables (`SESSION_SECRET`, `ADMIN_PASSWORD`), zero secrets exposed to client bundles or public settings forms.
12. **PII Protection & Dual-Factor Lookup**: Member privacy flags (`isPublic`), private applicant records shielded from public enumeration, dual-factor tracking queries (`referenceNo` + `email`).
13. **Event Registration Privacy**: Attendee lists strictly restricted to event managers and administrators; zero public leakage of attendee names, emails, or phone numbers.
14. **Audit Log Integrity**: Append-only design (`audit_logs` table has zero update or delete endpoints), recording actor, action, target entity, timestamp, and IP address.
15. **Consent & Photo Publication Rules**: Explicit consent flags for member portraits and application processing; withdrawal mechanisms for applicants.
16. **Error Messages & Information Disclosure**: Safe generic client error messages; zero leakage of database error strings, stack traces, or internal server paths.
17. **Secure Production Configuration**: HTTP Security Headers (HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy).
18. **Data Integrity & Archival Preservation**: Historical committee records and term preservation; soft-delete/archival patterns rather than destructive cascades.

---

## 3. User Stories & Security Controls

### User Story 1 (P1): Production HTTP Security Headers & Clickjacking Protection
**As a** security officer or compliance auditor,  
**I want** every HTTP response to carry hardened security headers,  
**So that** browsers enforce strict transport security, prevent iframe embedding (clickjacking), stop MIME type sniffing, and restrict resource origins via Content-Security-Policy.

- **Acceptance Criteria:**
  - `next.config.mjs` configures HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy, and CSP.
  - Iframe embedding from external domains is rejected.

### User Story 2 (P1): Edge Protection for Admin API Endpoints & Open-Redirect Shielding
**As an** infrastructure engineer,  
**I want** Next.js Edge Middleware to intercept unauthenticated or unauthorized requests to `/api/admin/*`,  
**So that** malicious actors receive immediate JSON 401/403 responses before backend handlers execute, and redirect parameters cannot point to external phishing domains.

- **Acceptance Criteria:**
  - `src/middleware.ts` matcher covers `["/admin/:path*", "/api/admin/:path*"]`.
  - Unauthenticated `/api/admin/*` requests return `{ error: "Unauthorized" }` with HTTP 401.
  - Safe redirect utility `validateInternalRedirect` strictly rejects external protocols, protocol-relative `//`, and backslash injection.

### User Story 3 (P1): Anti-Enumeration Rate Limiting on Application Status Tracking
**As an** applicant with a sensitive pending membership record,  
**I want** the status lookup endpoint to be rate limited against brute-force attacks,  
**So that** adversaries cannot guess reference IDs and emails to view private application data.

- **Acceptance Criteria:**
  - `trackApplicationStatusAction` enforces sliding-window rate limiting (15 lookups per 10 minutes per IP).
  - Exceeding the threshold returns a clear security throttling message without revealing record existence.

### User Story 4 (P2): Automated Verification of 18 Security Invariants
**As a** software engineer and reviewer,  
**I want** a dedicated automated security test suite,  
**So that** every security boundary is verified through regression tests and cannot regress during future releases.

- **Acceptance Criteria:**
  - Test suite `src/lib/db/test-security-privacy-audit.ts` executes automated tests covering all 18 security checkpoints.
  - 100% passing results across all assertions.

---

## 4. Deliverables
1. `specs/020-security-privacy-audit/` (`spec.md`, `plan.md`, `tasks.md`)
2. Security Hardening Code Changes (`next.config.mjs`, `src/middleware.ts`, `src/lib/actions/membership-application.ts`, `src/lib/auth/redirect.ts`)
3. Automated Security Test Suite (`src/lib/db/test-security-privacy-audit.ts`)
4. Comprehensive Audit Report (`docs/SECURITY_AUDIT.md`)
5. Updated Requirements Checklist (`docs/REQUIREMENTS_CHECKLIST.md`)
