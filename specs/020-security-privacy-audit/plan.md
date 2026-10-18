# IMPLEMENTATION PLAN: 020 - Security & Privacy Audit, Hardening & Verification

## 1. Technical Architecture & Security Stack
- **Framework**: Next.js 15 (App Router, Server Actions, Edge Middleware)
- **Database & ORM**: SQLite (`arabic_club.db`) with Drizzle ORM (parameterized SQL statements)
- **Cryptography & Tokens**: Node.js `crypto` (Scrypt key derivation, HMAC-SHA256 session signatures)
- **Edge Routing**: Next.js Middleware with route matching on `/admin/:path*` and `/api/admin/:path*`
- **Validation**: Zod 3.x schema enforcement across all client-to-server action inputs
- **Security Headers**: HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy

---

## 2. File Architecture & Changes

| Component / Layer | File Path | Action | Description |
|---|---|---|---|
| **Security Headers** | `next.config.mjs` | Modify | Add security headers config (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) |
| **Edge Defense** | `src/middleware.ts` | Modify | Expand matcher to include `/api/admin/:path*` with JSON 401/403 responses |
| **Redirect Hardening**| `src/lib/auth/redirect.ts` | Create | Safe internal redirect validation helper guarding against open redirects and scheme smuggling |
| **Rate Limiting** | `src/lib/actions/membership-application.ts` | Modify | Add sliding-window rate limiting to `trackApplicationStatusAction` (15 queries / 10 min) |
| **Security Test Suite**| `src/lib/db/test-security-privacy-audit.ts` | Create | Automated verification tests covering all 18 security checkpoints |
| **Audit Dossier** | `docs/SECURITY_AUDIT.md` | Create | Comprehensive 18-point audit report with executive summary, methodology, findings, and evidence |
| **Requirements Track**| `docs/REQUIREMENTS_CHECKLIST.md` | Modify | Update security and privacy checklist items |
| **Phase Status** | `docs/PHASE_STATUS.md` | Modify | Update project milestone status |

---

## 3. Execution Phases
- **Phase 1**: Implement core code hardening (`next.config.mjs`, `src/middleware.ts`, `src/lib/auth/redirect.ts`, `src/lib/actions/membership-application.ts`).
- **Phase 2**: Build and execute comprehensive automated security test suite (`src/lib/db/test-security-privacy-audit.ts`).
- **Phase 3**: Run full cumulative regression suite across all 16 test suites.
- **Phase 4**: Run Next.js production build (`pnpm exec next build`) ensuring 0 compilation errors.
- **Phase 5**: Author `docs/SECURITY_AUDIT.md` and update `docs/REQUIREMENTS_CHECKLIST.md`.
