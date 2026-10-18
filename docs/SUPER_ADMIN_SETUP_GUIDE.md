<!--
  DEVELOPER NOTE:
  File: docs/SUPER_ADMIN_SETUP_GUIDE.md
  Purpose: Official Super Administrator Setup, Authentication & Operations Manual.
  Institution: Kabi Nazrul Government College, Dhaka
  Club: Arabic Language & Cultural Club
  Target Administrator: arabicclubkngc2025@gmail.com
  Tone: Authoritative academic documentation; strictly zero AI emojis.
-->

# SUPER ADMINISTRATOR OPERATIONS MANUAL & AUTHENTICATION SPECIFICATION
## Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka

---

## 1. Institutional Governance Context

The Arabic Language & Cultural Club (نادي اللغة والثقافة العربية) operates under the academic patronship of the Department of Arabic & Islamic Studies at **Kabi Nazrul Government College, Dhaka** (কবি নজরুল সরকারি কলেজ, ঢাকা).

The designated institutional Super Administrator account is:
- **Designated Institutional Email:** `arabicclubkngc2025@gmail.com`
- **Assigned System Role:** `super_admin`
- **Unique System Identifier:** `usr_kngc_superadmin`
- **Access Boundary:** Full institutional oversight, user provisioning, role assignments, site settings, database snapshot exports, and security audit inspection.

---

## 2. Account Provisioning & Activation Workflow

### Automated CLI Provisioning
The application includes an idempotent provisioning script that verifies and secures the Super Administrator account:

```bash
pnpm admin:provision
```

### Initial Activation Flow
1. **Verification Check:** The system queries the SQLite `users` table for `arabicclubkngc2025@gmail.com`.
2. **Account Creation:** If absent, a record is created with:
   - `id`: `usr_kngc_superadmin`
   - `role`: `super_admin`
   - `isActive`: `true`
   - `passwordHash`: Scrypt hash (`N=16384, r=8, p=1, keylen=64`)
3. **Activation Token Generation:** A cryptographically random 32-byte hexadecimal token is inserted into `password_reset_tokens` with a SHA-256 hash.
4. **Self-Service Password Setup:** The administrator can access the direct activation URL:
   ```text
   /admin/reset-password?token=<ACTIVATION_TOKEN>
   ```
5. **Direct Login:** Alternatively, the administrator may sign in directly at `/admin/login` using the initial password defined in `INITIAL_ADMIN_PASSWORD` (or the CLI-generated temporary credential).
6. **Mandatory Post-Login Action:** Navigate to `/admin/profile` to update the password to a permanent institutional passphrase.

---

## 3. Cryptographic Session Architecture

```
Client Browser                  Next.js Edge Proxy                SQLite Database
      |                                  |                               |
      |--- POST /admin/login ----------->|                               |
      |    (email, password)             |--- Verify Scrypt Hash ------->|
      |                                  |<-- Hash Matched (Active) -----|
      |                                  |--- Insert Session Record ---->|
      |                                  |    (ses_id, expires, role)    |
      |<-- Set-Cookie: alc_session ------|                               |
      |    (sid.payload.hmacSig)         |                               |
      |                                  |                               |
      |--- GET /admin/users ------------>|                               |
      |    Cookie: alc_session           |--- Verify HMAC-SHA256 Sig ---|
      |                                  |--- Check users:manage Perm ---|
      |<-- 200 OK (Render Admin Page) ---|                               |
```

### Session Invariants
- **Signing Mechanism:** Web Crypto API HMAC-SHA256 using `AUTH_SECRET`.
- **Token Composition:** `${sessionId}.${base64Payload}.${signature}`.
- **Revocable State:** The session token's identifier (`sid`) is cross-checked against the `sessions` table on privileged data mutations. Terminating a session revokes access immediately.
- **Cookie Security Flags:**
  - `httpOnly: true` (strictly inaccessible to client-side JavaScript, neutralizing DOM XSS session theft).
  - `sameSite: "lax"` (mitigates Cross-Site Request Forgery).
  - `secure: true` in production (enforced over TLS/HTTPS).
  - `path: "/"` with 7-day rolling expiration.
- **Anti-Tampering:** Any modification to the session payload or signature results in immediate rejection, cookie deletion, and redirection to `/admin/login`.

---

## 4. Role-Based Access Control (RBAC) Matrix

Privileges are strictly resolved server-side. The database `users.role` field dictates operational rights:

| Institutional Role | Code | Key Assigned Permissions | Route Access |
|:---|:---|:---|:---|
| **Super Administrator** | `super_admin` | `users:manage`, `settings:manage`, `audit:read`, full CMS | All `/admin/*` and `/api/admin/*` |
| **Institutional Administrator** | `administrator` | `users:read`, `audit:read`, `members:manage`, CMS | All routes except user mutation and core settings |
| **Content Editor** | `content_editor` | `news:manage`, `resources:manage`, `gallery:manage`, `publications:manage` | Content modules only |
| **Membership Officer** | `membership_manager` | `members:manage`, `applications:manage` | `/admin/members`, `/admin/applications` |
| **Events Coordinator** | `event_manager` | `events:manage`, `plans:manage` | `/admin/events` |
| **Media Secretary** | `media_manager` | `gallery:manage`, `media:manage`, `resources:manage` | `/admin/gallery`, `/admin/resources` |
| **Executive President** | `president` | `events:manage`, `plans:manage`, `news:manage`, `committees:manage` | Executive modules |
| **General Secretary** | `secretary` | `plans:manage`, `news:manage`, `applications:manage` | Secretarial modules |
| **Institutional Observer** | `read_only` | `members:read`, `dashboard:view` | View-only dashboard |

### Privilege Escalation Safeguards
- Only an active `super_admin` can grant the `super_admin` role to another user.
- A Super Admin cannot suspend or demote their own account if they are the sole remaining active Super Administrator (anti-self-lockout enforcement in `src/lib/actions/governance.ts`).

---

## 5. Brute-Force & Abuse Defenses

1. **Exponential Rate Limiting:**
   - Evaluated per IP address and target email combination in `login_attempts` table.
   - 5 failed attempts trigger a 15-minute temporary lockout.
   - Successful authentication immediately clears failed attempt counters.
2. **Timing-Safe Evaluation:**
   - Password hash verification uses constant-time byte comparisons to prevent timing attacks.
   - Password reset requests return identical generic confirmations regardless of whether the email exists.

---

## 6. Multi-Factor Authentication (MFA) Roadmap

While username/password with Scrypt and HMAC cookies provides robust baseline defense, the production roadmap specifies two-factor enforcement:

### Phase A: Time-Based One-Time Password (TOTP)
- **Standard:** RFC 6238 TOTP (Google Authenticator, Microsoft Authenticator).
- **Database Addition:** `totp_secret` (encrypted AES-256) and `totp_enabled` (boolean) on `users` table.
- **Workflow:** Upon entering valid credentials, if `totp_enabled` is true, the user is issued a temporary `MFA_PENDING` token requiring a 6-digit TOTP verification before the signed session cookie is issued.

### Phase B: WebAuthn / FIDO2 Hardware Keys
- **Standard:** W3C WebAuthn Level 2 for Passkeys and YubiKeys.
- **Workflow:** Passwordless biometric verification for administrative workstations.

---

## 7. Emergency Recovery & Continuity Procedures

### Scenario 1: Password Lost by Super Administrator
Run the provisioning utility with the password reset flag:
```bash
pnpm exec tsx -e '
import { provisionSuperAdmin } from "./src/lib/auth/provision-super-admin";
provisionSuperAdmin({ forceResetToken: true }).then(console.log);
'
```
Use the output URL (`/admin/reset-password?token=...`) to define a new password.

### Scenario 2: Secondary Super Administrator Fallback
The legacy administrative identity (`admin@arabicclub.org` / `usr_superadmin`) is preserved in the database to prevent institutional lockouts during transition.

### Scenario 3: Database Direct Verification
```bash
sqlite3 arabic_club.db "SELECT id, email, role, is_active FROM users WHERE role = 'super_admin';"
```

---

## 8. Verification & Test Commands

Run the dedicated Phase 4 Super Administrator test suite:
```bash
TEST_SERVER_URL=http://localhost:3005 pnpm test:admin
```

Run the entire institutional end-to-end regression suite:
```bash
TEST_SERVER_URL=http://localhost:3005 pnpm test
```
