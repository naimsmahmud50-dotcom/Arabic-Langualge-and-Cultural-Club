# SECURITY & PRIVACY SPECIFICATION
## Arabic Language & Cultural Club Platform

This document details the security architecture, data protection controls, and privacy governance implemented across the platform.

---

### 1. Security Architecture & Threat Model

The platform is engineered using a defense-in-depth model across four distinct layers:

```text
Layer 1: Network Edge & HTTP Headers (Next.js config & Edge Middleware)
Layer 2: Application Entrypoint (Zod Schema Validation & Sliding-Window Rate Limiting)
Layer 3: Business Logic & Access Control (Least-Privilege RBAC Assertions & Scrypt Auth)
Layer 4: Data Persistence & Cryptography (Parameterized Drizzle ORM, SQLite WAL, SHA-256 Backups)
```

---

### 2. Authentication & Session Security

#### Password Hashing & Verification
- **Algorithm:** Native `crypto.scryptSync` (Node.js cryptographic standard).
- **Parameters:** CPU/Memory cost `N = 16384`, block size `r = 8`, parallelization `p = 1`, key length = 64 bytes.
- **Salt:** Cryptographically secure random 16-byte salt generated per password (`crypto.randomBytes(16)`).
- **Timing Defense:** Verification employs `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
- **Complexity Policy:** Enforces minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 numeric digit, and 1 special symbol.

#### Session Token Integrity
- **Token Format:** Base64-encoded payload containing `userId`, `sessionId`, `issuedAt`, and an HMAC-SHA256 signature generated with the server-side `AUTH_SECRET`.
- **Cookie Flags:**
  - `httpOnly: true` (prevents client-side JavaScript access via XSS).
  - `secure: true` in production (enforces HTTPS transmission).
  - `sameSite: "lax"` (mitigates Cross-Site Request Forgery).
  - `maxAge: 604800` (7-day lifespan).
- **Session Revocation:** Every token maps to an active record in the database `sessions` table. Operators can terminate sessions server-side immediately upon logout or password reset.

#### Brute-Force & Denial-of-Service Defense
- **Algorithm:** Memory-resident sliding-window rate limiter tracking client IP addresses.
- **Rules:**
  - Administrative login (`/admin/login`): Maximum 5 failed attempts per 10 minutes. Exceeding triggers a locked state.
  - Event registrations: Maximum 5 registrations per 10 minutes per IP.
  - Membership applications: Maximum 5 submissions per 15 minutes per IP.
  - Contact inquiries: Maximum 3 submissions per 15 minutes per IP.

---

### 3. Role-Based Access Control (RBAC)

The system defines 5 hierarchical, least-privilege roles:
1. `super_admin`: Full governance across all platform subsystems, users, and audit logs.
2. `admin`: General administration and content management (restricted from modifying other super admins).
3. `editor`: Content authoring across news, learning resources, publications, and gallery albums.
4. `membership_manager`: Admissions review, member records management, and inquiry correspondence.
5. `event_manager`: Event authoring, scheduling, attendee roster verification, and check-in.

#### Enforcement Points
- **Edge Middleware (`src/middleware.ts`):** Intercepts requests targeting `/admin/*` and `/api/admin/*`. Unauthenticated requests redirect to `/admin/login?from=...`. Unauthorized API requests immediately receive JSON 401 or 403 responses.
- **Server Action Guards:** Every administrative server action calls `assertPermission(session.user.role, requiredPermission)` prior to executing database mutations.

---

### 4. Input Sanitization & Attack Prevention

#### SQL Injection Immunity
- **Engine:** Drizzle ORM.
- **Standard:** All database interactions are strictly constructed using parameterized prepared queries (`eq`, `and`, `or`, `inArray`). Zero raw string interpolation (`${input}`) is permitted in SQL queries.

#### Cross-Site Scripting (XSS) Prevention
- React automatically escapes all string expressions rendered in JSX.
- Rich-text fields are typed and rendered through controlled paragraph/heading components.
- All outbound external links enforce `rel="noopener noreferrer"`.

#### Open Redirect Mitigation
- Internal redirects are validated via `validateRedirectUrl(target)`.
- Rejects external protocols (`http://`, `https://`, `ftp://`), protocol-relative URLs (`//evil.com`), backslash bypasses (`/\evil.com`), and non-printable control characters. Defaults to `/admin` if validation fails.

#### Media Upload & File Storage Security
- **MIME Whitelist:** Strictly permits `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`, `video/webm`, and `application/pdf`.
- **Extension Enforcement:** File extensions must match the validated MIME type. Dangerous extensions (`.exe`, `.sh`, `.php`, `.svg`, `.html`, `.js`, `.py`) are rejected unconditionally.
- **Size Limits:** Enforces hard caps of 15MB for images/PDFs and 100MB for video media.
- **Path Traversal Immunity:** Filenames are sanitized with `sanitizeFilename()`, stripping directory traversal tokens (`../`, `..\`) and control characters. Files are stored using cryptographic UUID prefixes.

---

### 5. Privacy & Data Protection Standards

#### Personally Identifiable Information (PII) Protection
- **Member Directory:** The public endpoint `/members` strictly queries approved public members. Sensitive fields (`email`, `phone`, `student_id`, `joined_date`) are excluded from public database projections.
- **Event Registrations:** Attendee rosters are accessible exclusively to authenticated administrators with `events:manage` permissions. Public event pages show aggregated seat counts without exposing attendee names.
- **Anti-Enumeration Lookup:** Membership application status tracking requires both the Reference ID (`APP-2026-XXXX`) and the candidate's registered email address. This prevents unauthorized third parties from probing application statuses.

#### Photo Publication Consent & Takedown Protocol
- Every public photo in `/gallery` requires documented consent from depicted individuals.
- In accordance with our Governance Charter (`/policies#photo-consent`), members may request immediate photo removal by contacting `privacy@arabicclub.edu`. Administrative actions for image removal are completed within 48 hours.

---

### 6. Production Security Headers

The platform injects the following security headers via `next.config.mjs`:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https: blob:; frame-ancestors 'none';
```

---

### 7. Immutable Audit Trail

- Every security-sensitive action (login success/failure, role alteration, status transition, password reset, database snapshot) is appended to the `audit_logs` table.
- Log entries record: `actor_id`, `action`, `entity_type`, `entity_id`, `payload` (sanitized JSON), `ip_address`, `user_agent`, and `created_at`.
- Passwords, session tokens, and raw credentials are scrubbed prior to audit persistence.
- The `audit_logs` table is strictly append-only; administrative interfaces offer zero delete or edit operations on audit records.
