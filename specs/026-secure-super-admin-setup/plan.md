# TECHNICAL PLAN: 026 - Secure Super Admin Authentication and Authorization

## 1. Architecture & Design Principles
- Technology Stack: Next.js 15 App Router, TypeScript, SQLite (`better-sqlite3`), Drizzle ORM, Web Crypto API.
- Password Hashing: Node.js `crypto.scryptSync` with salt length 16, N=16384, r=8, p=1, keylen=64.
- Session Tokens: HMAC-SHA256 signature using `AUTH_SECRET` over `${sessionId}.${base64Payload}`.
- RBAC Architecture: Centralized in `src/lib/auth/rbac.ts`, evaluated at edge middleware and in server actions via `assertPermission()`.

---

## 2. Implementation Steps

### Step 1: Secure Super Admin Provisioning Utility
- File: `src/lib/auth/provision-super-admin.ts`
- Functions:
  - `provisionSuperAdmin(options)`: Checks if `arabicclubkngc2025@gmail.com` exists. If absent, creates record with role `super_admin`, active status, Scrypt password hash, and generates one-time reset/activation token.
  - CLI execution block: Allows running via `pnpm exec tsx src/lib/auth/provision-super-admin.ts`.
  - Audit logging: Logs `SUPER_ADMIN_PROVISIONED` to SQLite `audit_logs` table.

### Step 2: Package Script & Environment Alignment
- Add helper script in `package.json`: `"admin:provision": "tsx src/lib/auth/provision-super-admin.ts"`.
- Verify `.env.example` contains `INITIAL_ADMIN_EMAIL=arabicclubkngc2025@gmail.com`.

### Step 3: Server-Side Authorization Hardening Verification
- Verify that `src/lib/actions/governance.ts`, `src/lib/actions/content-cms.ts`, `src/lib/actions/events.ts`, and API routes strictly check permissions.

### Step 4: Automated Verification Test Suite
- File: `src/lib/db/test-super-admin-auth.ts`
- Tests:
  - Account state in SQLite
  - Account preservation of legacy demo users
  - Middleware unauthenticated visitor interception
  - Middleware & server action RBAC enforcement for low-privilege roles
  - Super Admin session access & permission assertion
  - Cookie signature tampering rejection
  - Rate limiting verification
  - Audit log recording verification

### Step 5: Onboarding Documentation
- File: `docs/SUPER_ADMIN_SETUP_GUIDE.md`
- Provide complete instructions on initial activation, password setup, session policies, MFA roadmap, and emergency recovery.
