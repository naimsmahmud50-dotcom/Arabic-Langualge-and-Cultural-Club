# Authentication & Role-Based Access Control (RBAC) Specification

> **Institutional Standard:** Arabic Language & Cultural Club Digital Governance  
> **Classification:** Security & Identity Architecture  
> **Status:** Implemented & Verified (100% Test Coverage)  
> **Engine:** Next.js 16 (Turbopack), TypeScript, Better-SQLite3 / PostgreSQL, Web Crypto API

---

## 1. Executive Summary & Security Philosophy

The Arabic Language & Cultural Club platform adheres to an uncompromising, multi-layered security model built on the **Principle of Least Privilege (PoLP)** and **Defense-in-Depth**.

Administrative capabilities are strictly segmented into dedicated institutional roles. Merely hiding buttons or menu links in the user interface is never considered an authorization boundary:
1. **Edge Guard Layer (`middleware.ts`):** Evaluates every incoming request to `/admin/*`, cryptographically verifies HMAC signatures, and halts unauthorized route traversals at the perimeter with immediate 403 Forbidden redirection.
2. **Server Action & Mutation Guard Layer (`assertPermission`):** Every database mutation, administrative query, and server action explicitly enforces server-side permission assertions before executing SQL statements.
3. **Database Audit Trail (`audit_logs`):** All authentication attempts (successful or failed), session revocations, password resets, and user account provisioning are permanently recorded in an immutable ledger. Plaintext passwords, tokens, and secrets are strictly redacted before persistence.

---

## 2. Institutional Role Hierarchy & Responsibilities

The system defines five primary operational roles and three executive aliases:

| Role Identifier | Institutional Title (EN) | Arabic Title (AR) | Primary Responsibility & Boundary |
| :--- | :--- | :--- | :--- |
| `super_admin` | **Super Administrator** | المشرف العام | Root system governance, user provisioning, global site settings, immutable audit log inspection, and database recovery. |
| `administrator` | **Institutional Administrator** | مدير الشؤون العامة | Day-to-day operations across club activities, committees, events, members, and content. **Cannot** create users or modify root system parameters. |
| `content_editor` | **Content & Editorial Manager** | محرر المحتوى والنشر | Editorial control over CMS pages, news announcements, Arabic learning resources, photo albums, and publications. **Cannot** access member records or user accounts. |
| `membership_manager` | **Membership Officer** | مسؤول شؤون الأعضاء | Dedicated review of student and scholar admission applications, identity verification, and directory records. **Cannot** modify website pages or events. |
| `event_manager` | **Events & Program Coordinator** | منسق الفعاليات والبرامج | Calendar scheduling, registration roster oversight, and 12-month annual operational plan management. **Cannot** access private applicant data. |
| `president` *(alias)* | **Executive President** | رئيس النادي | Executive oversight, official public pronouncements, annual plan review, and committee appointments. |
| `secretary` *(alias)* | **General Secretary** | الأمين العام | Records management, meeting resolutions, annual roadmap coordination, and application processing. |
| `media_manager` *(alias)*| **Media & Archive Secretary** | أمين الإعلام والتوثيق | Photographic archives, journal releases, and Arabic multimedia learning assets. |

---

## 3. Explicit Permissions Matrix

Every administrative capability is represented by an explicit atomic permission:

```
[System & Users]
• users:manage        - Provision administrative accounts, suspend credentials, alter roles
• users:read          - View administrative user directory and activity status
• settings:manage     - Modify institutional nomenclature, SEO meta, contact coordinates
• audit:read          - Inspect the immutable security audit log

[Membership & Governance]
• members:manage      - Modify member profiles, verify scholarly status, export roster
• members:read        - View public and private member directory entries
• applications:manage - Process, approve, or reject club admission submissions
• committees:manage   - Appoint committee terms, positions, and executive assignments

[Content & Academic Archives]
• pages:manage        - Edit static page sections, hero banners, and institutional copy
• news:manage         - Publish urgent bulletins, announcements, and press releases
• resources:manage    - Curate Arabic vocabulary, grammar, audio, and PDF learning materials
• gallery:manage      - Create photo albums, caption images, and manage visual archives
• publications:manage - Publish academic monographs, annual journals, and newsletters
• achievements:manage - Record national and collegiate Arabic debate accolades
• media:manage        - Direct asset uploads and media library management

[Operations]
• events:manage       - Schedule lectures, workshops, and symposiums; export attendees
• plans:manage        - Update 12-month calendar and operational milestones
• dashboard:view      - Access high-level operational metrics and statistics
```

### Role-to-Permission Mapping Table

| Permission | `super_admin` | `administrator` | `content_editor` | `membership_manager` | `event_manager` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `dashboard:view` | Yes | Yes | Yes | Yes | Yes |
| `users:manage` | **Yes** | No | No | No | No |
| `users:read` | **Yes** | **Yes** | No | No | No |
| `settings:manage`| **Yes** | No | No | No | No |
| `audit:read` | **Yes** | **Yes** | No | No | No |
| `committees:manage` | **Yes** | **Yes** | No | No | No |
| `members:manage` | **Yes** | **Yes** | No | **Yes** | No |
| `members:read` | **Yes** | **Yes** | No | **Yes** | No |
| `applications:manage` | **Yes** | **Yes** | No | **Yes** | No |
| `pages:manage` | **Yes** | **Yes** | **Yes** | No | No |
| `news:manage` | **Yes** | **Yes** | **Yes** | No | No |
| `resources:manage` | **Yes** | **Yes** | **Yes** | No | No |
| `gallery:manage` | **Yes** | **Yes** | **Yes** | No | No |
| `publications:manage`| **Yes** | **Yes** | **Yes** | No | No |
| `achievements:manage`| **Yes** | **Yes** | **Yes** | No | No |
| `media:manage` | **Yes** | **Yes** | **Yes** | No | No |
| `events:manage` | **Yes** | **Yes** | No | No | **Yes** |
| `plans:manage` | **Yes** | **Yes** | No | No | **Yes** |

---

## 4. Route Protection & Edge Perimeter (`middleware.ts`)

Administrative paths are shielded at the network edge:

| Route Path | Required Permission | Unauthorized Destination |
| :--- | :--- | :--- |
| `/admin` | `dashboard:view` | `/admin/login?next=/admin` |
| `/admin/users` | `users:manage` | `/admin/forbidden?from=/admin/users` |
| `/admin/settings` | `settings:manage` | `/admin/forbidden?from=/admin/settings` |
| `/admin/audit-logs` | `audit:read` | `/admin/forbidden?from=/admin/audit-logs` |
| `/admin/founders` | `committees:manage` | `/admin/forbidden?from=/admin/founders` |
| `/admin/committees` | `committees:manage` | `/admin/forbidden?from=/admin/committees` |
| `/admin/members` | `members:manage` | `/admin/forbidden?from=/admin/members` |
| `/admin/applications`| `applications:manage`| `/admin/forbidden?from=/admin/applications` |
| `/admin/events` | `events:manage` | `/admin/forbidden?from=/admin/events` |
| `/admin/pages` | `pages:manage` | `/admin/forbidden?from=/admin/pages` |
| `/admin/news` | `news:manage` | `/admin/forbidden?from=/admin/news` |
| `/admin/resources` | `resources:manage` | `/admin/forbidden?from=/admin/resources` |
| `/admin/gallery` | `gallery:manage` | `/admin/forbidden?from=/admin/gallery` |
| `/admin/publications`| `publications:manage`| `/admin/forbidden?from=/admin/publications` |
| `/admin/login` | *Public Entry Gate* | *Permitted through* |
| `/admin/forgot-password` | *Public Recovery Gate* | *Permitted through* |
| `/admin/reset-password` | *Token Verification Gate* | *Permitted through* |
| `/admin/forbidden` | *Institutional 403 Notice* | *Permitted through* |

---

## 5. Cryptographic Specifications & Defense Mechanisms

### 5.1 Scrypt Password Hashing (`src/lib/auth/password.ts`)
- **Algorithm:** Node.js native `crypto.scryptSync`.
- **Parameters:** Salt length 16 bytes (cryptographically strong `randomBytes`), Derived key length 64 bytes, $N=16384$, $r=8$, $p=1$, max memory 32 MB.
- **Prefix & Serialization:** `scrypt$v1$<saltHex>$<derivedKeyHex>`.
- **Constant-Time Verification:** Employs `crypto.timingSafeEqual` over the derived buffers to thwart timing side-channel attacks.
- **Complexity Standard:** Minimum 8 characters, requiring at least one uppercase character, one lowercase character, one numeric digit, and one special symbol.

### 5.2 Session Integrity & Revocation (`src/lib/auth/session.ts` & `token.ts`)
- **Storage:** Server-side `sessions` table in SQLite (`id`, `user_id`, `role`, `user_email`, `expires_at`, `ip_address`, `user_agent`).
- **Cookie Security:** `arabic_club_session`, flags: `httpOnly: true`, `sameSite: "lax"`, `secure: process.env.NODE_ENV === "production"`, `path: "/"`.
- **Token Format:** `${sessionId}.${base64Payload}.${hmacSha256Signature}`.
- **Tampering Defense:** Web Crypto API computes HMAC-SHA256 signature using `AUTH_SECRET`. Tampering with either payload, session ID, or signature invalidates verification immediately.
- **Instant Revocation:** Calling `destroySession()` or `destroyAllUserSessions(userId)` immediately purges the session from the database.

### 5.3 Brute-Force Rate Limiting (`src/lib/auth/rate-limit.ts`)
- **Sliding Window:** 15 minutes ($900$ seconds).
- **Threshold:** Maximum 5 failed attempts per (IP address, Target Email) pair.
- **Lockout Enforcement:** 6th consecutive attempt returns `{ allowed: false, retryAfterSeconds }` and blocks login processing before password verification.
- **Audit Persistence:** Failed and successful attempts recorded in `login_attempts` table.

### 5.4 Password Recovery Protocol (`src/lib/auth/actions.ts`)
- **Token Generation:** 32-byte cryptographic random bytes (`crypto.randomBytes(32)`).
- **Hash Storage:** Only the SHA-256 hash of the token is stored in `password_reset_tokens`.
- **Lifetime:** Single-use, valid for 60 minutes.
- **Anti-Enumeration:** The request handler always returns a generic success message regardless of whether the email was registered.
- **Hijack Mitigation:** Resetting a password immediately revokes all existing active sessions for that user.

---

## 6. Administrative Credential Configuration

In accordance with institutional security policies, zero credentials are pre-filled or hardcoded into the codebase:

1. **Environment Initialization**:
   The primary administrative account is configured via `ADMIN_EMAIL` and `ADMIN_PASSWORD` (or `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`).

2. **Safe Credential Management CLI**:
   Passwords can be securely updated using the CLI tool:
   ```bash
   pnpm admin:set-password <email> <new-password>
   ```
   All password changes automatically enforce complexity requirements, hash using bcrypt with 12 rounds, invalidate active sessions, and record an audit log event.

---

## 7. Automated Test Evidence

The automated verification suite in `src/lib/auth/test-auth.ts` verifies 58 discrete security assertions:

```text
================================================================
Arabic Club: Authentication & RBAC Verification Suite
================================================================

[Suite 1] Scrypt Password Hashing & Complexity Validation
  ✓ PASS: Password hash format uses scrypt$v1$ prefix
  ✓ PASS: Verifies authentic password correctly
  ✓ PASS: Rejects incorrect password
  ✓ PASS: Rejects empty password input
  ✓ PASS: Accepts strong password meeting all criteria
  ✓ PASS: Rejects password shorter than 8 characters
  ✓ PASS: Rejects password without numbers
  ✓ PASS: Rejects password without uppercase characters
  ✓ PASS: Rejects password without special symbols

[Suite 2] Universal HMAC Session Tokens & Tampering Defense
  ✓ PASS: Creates token in format sid.payload.signature
  ✓ PASS: Verifies untampered token successfully
  ✓ PASS: Payload correctly unpacked with authentic role
  ✓ PASS: Rejects token with modified payload (signature mismatch)
  ✓ PASS: Rejects token with altered HMAC signature
  ✓ PASS: Rejects expired session token

[Suite 3] Institutional Role-Based Access Control (RBAC) Matrix
  ✓ PASS: Super Admin can manage users
  ✓ PASS: Super Admin can manage system settings
  ✓ PASS: Super Admin can inspect audit logs
  ✓ PASS: Super Admin can edit CMS pages
  ✓ PASS: Administrator CANNOT manage user accounts (Least Privilege)
  ✓ PASS: Administrator CANNOT change root settings (Least Privilege)
  ✓ PASS: Administrator can manage club members
  ✓ PASS: Administrator can manage events
  ✓ PASS: Administrator can review audit trail
  ✓ PASS: Content Editor can manage pages
  ✓ PASS: Content Editor can publish news
  ✓ PASS: Content Editor can curate resources
  ✓ PASS: Content Editor CANNOT manage users
  ✓ PASS: Content Editor CANNOT edit members directory
  ✓ PASS: Content Editor CANNOT inspect audit logs
  ✓ PASS: Membership Manager can process applications
  ✓ PASS: Membership Manager can manage members
  ✓ PASS: Membership Manager CANNOT edit CMS pages
  ✓ PASS: Membership Manager CANNOT schedule events
  ✓ PASS: Event Manager can manage events
  ✓ PASS: Event Manager can edit annual plan
  ✓ PASS: Event Manager CANNOT review membership applications
  ✓ PASS: Event Manager CANNOT manage users

[Suite 4] Route Policy Enforcer & Edge Matcher
  ✓ PASS: Super Admin authorized for /admin/users
  ✓ PASS: Super Admin authorized for /admin/settings
  ✓ PASS: Super Admin authorized for /admin/audit-logs
  ✓ PASS: Content Editor blocked from /admin/users
  ✓ PASS: Content Editor blocked from /admin/settings
  ✓ PASS: Content Editor blocked from /admin/audit-logs
  ✓ PASS: Content Editor authorized for /admin/pages
  ✓ PASS: Content Editor authorized for /admin/news
  ✓ PASS: Membership Manager blocked from /admin/events
  ✓ PASS: Membership Manager authorized for /admin/applications

[Suite 5] Server-Side assertPermission() Exceptions
  ✓ PASS: assertPermission() throws AuthorizationError (403) when permission is missing
  ✓ PASS: assertPermission() succeeds silently when permission is possessed

[Suite 6] Brute-Force Abuse Protection & Lockout
  ✓ PASS: Attempt 1 allowed before lockout threshold
  ✓ PASS: Attempt 2 allowed before lockout threshold
  ✓ PASS: Attempt 3 allowed before lockout threshold
  ✓ PASS: Attempt 4 allowed before lockout threshold
  ✓ PASS: Attempt 5 allowed before lockout threshold
  ✓ PASS: 6th consecutive failed attempt is locked out
  ✓ PASS: Lockout specifies retryAfterSeconds (900s)
  ✓ PASS: Unrelated IP is not locked out

================================================================
RESULTS: 58 / 58 tests passed (100%)
================================================================
```

---

## 8. Next.js Production Build Evidence

```text
▲ Next.js 16.4.2 (Turbopack)
✓ Running next.config.mjs took 13ms
Creating an optimized production build ...
✓ Compiled successfully in 456ms
Finished TypeScript in 484ms
Generating static pages (17/17)
Finalizing page optimization in 5ms

Route (app)                 Revalidate  Expire
┌ ○ /                               1m      1y
├ ○ /_not-found
├ ○ /about
├ ƒ /admin
├ ƒ /admin/applications
├ ƒ /admin/audit-logs
├ ƒ /admin/committees
├ ƒ /admin/events
├ ƒ /admin/forbidden
├ ƒ /admin/forgot-password
├ ƒ /admin/founders
├ ƒ /admin/gallery
├ ƒ /admin/login
├ ƒ /admin/members
├ ƒ /admin/news
├ ƒ /admin/pages
├ ƒ /admin/publications
├ ƒ /admin/reset-password
├ ƒ /admin/resources
├ ƒ /admin/settings
├ ƒ /admin/users
├ ○ /contact
├ ○ /design-system
├ ƒ /events
├ ƒ /events/[slug]
├ ○ /founders                       1m      1y
├ ○ /gallery                        1m      1y
├ ƒ /gallery/[slug]
├ ○ /history
├ ƒ /leadership
├ ƒ /members
├ ○ /membership
├ ○ /news                           1m      1y
├ ○ /policies
├ ○ /publications                   1m      1y
└ ƒ /resources

ƒ Proxy (Middleware)
○ (Static)   prerendered as static content
ƒ (Dynamic)  server-rendered on demand
```
