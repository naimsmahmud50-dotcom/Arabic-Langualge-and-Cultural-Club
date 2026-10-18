# SPECIFICATION: 026 - Secure Super Admin Authentication and Authorization

## 1. Executive Summary & Context
- Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা / كلية كابي نذرول الحكومية، دكا)
- Organization: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
- Target Super Admin Email: `arabicclubkngc2025@gmail.com`
- Objective: Configure and verify the institutional Super Administrator account, harden server-side authentication and authorization guards, ensure zero-trust RBAC enforcement, protect private records, and provide an automated verification suite and onboarding manual.

---

## 2. Requirements & Acceptance Criteria

### Requirement 1: Verification and Account Provisioning
- The application must verify whether `arabicclubkngc2025@gmail.com` exists in the SQLite `users` table.
- If missing, a secure provisioning utility must insert the user with role `super_admin`, status `isActive: true`, and an Scrypt-hashed password.
- An initial activation / one-time password reset token must be generated in `password_reset_tokens` to allow self-service activation via `/admin/reset-password?token=...`.
- Existing administrator accounts (including `admin@arabicclub.org`) must be preserved to prevent system lockout.

### Requirement 2: Server-Side Authorization Enforcement
- Super Admin privileges must be determined exclusively by the database `users.role` column and server-validated session cookies.
- No client-side checks, editable profile fields, or request header claims can grant elevated rights.
- All `/admin/*` pages and `/api/admin/*` endpoints must verify session identity and enforce role permissions (`users:manage`, `settings:manage`, `audit:read`, etc.) before data mutation or extraction.

### Requirement 3: Session Security & Abuse Protection
- Sessions must be stored in the database `sessions` table and signed with HMAC-SHA256 (`sid.payload.signature`).
- Cookie flags: `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `secure` in production.
- Login attempts must be tracked in `login_attempts` with automatic exponential lockout after consecutive failures.
- Every privilege elevation, provisioning event, login, and logout must be recorded in the immutable `audit_logs` table.

### Requirement 4: Automated Verification Testing
- Automated test suite must test:
  1. Super Admin account existence and active status.
  2. Preservation of legacy admin accounts.
  3. Rejection and redirection of unauthenticated visitors on protected routes.
  4. Forbidden response (403) for non-superadmin roles on user management and system settings.
  5. Authorized access for Super Admin.
  6. Rejection of tampered session cookies.
  7. Login rate-limiting lockout verification.
  8. Audit log entry generation.

### Requirement 5: Onboarding Documentation
- Author `docs/SUPER_ADMIN_SETUP_GUIDE.md` detailing administrator activation, first login, session parameters, multi-factor authentication (MFA) roadmap, and emergency recovery procedures.

---

## 3. Non-Functional Constraints
- Strictly zero AI emojis across all code, markdown files, and git commits.
- Prominent developer notes at the top of every modified or created file.
- Strict TypeScript with zero build or lint warnings.
