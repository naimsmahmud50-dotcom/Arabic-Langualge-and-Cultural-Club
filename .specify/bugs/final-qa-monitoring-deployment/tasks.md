# Tasks: Final QA, Monitoring & Safe Deployment (Phase 8)

- **Feature**: Final QA, Monitoring and Safe Deployment
- **Directory**: `.specify/bugs/final-qa-monitoring-deployment/`
- **Specification**: `./assessment.md`

## Phase 1: Setup & Test Configuration
- [x] T001 Configure Vitest test runner with path aliases and environment in `vitest.config.ts`
- [x] T002 Configure Playwright test suite for headless browser testing in `playwright.config.ts`

## Phase 2: Unit Testing Suite (Vitest)
- [x] T003 [P] Implement unit tests for section Zod schemas in `tests/unit/schemas.test.ts`
- [x] T004 [P] Implement unit tests for parseSectionJson and safeParseSectionJson backward-compatibility in `tests/unit/parseSectionJson.test.ts`
- [x] T005 [P] Implement unit tests for site settings actions and queries in `tests/unit/settings.test.ts`

## Phase 3: End-to-End Testing Suite (Playwright)
- [x] T006 Implement Playwright E2E test for admin authentication and session management in `tests/e2e/auth.spec.ts`
- [x] T007 Implement Playwright E2E test for tabbed settings management in `tests/e2e/settings.spec.ts`
- [x] T008 Implement Playwright E2E test for structured page section editing in `tests/e2e/page-sections.spec.ts`
- [x] T009 Implement Playwright E2E test for media upload pipeline in `tests/e2e/media-upload.spec.ts`
- [x] T010 Implement Playwright E2E test for event creation and publication lifecycle in `tests/e2e/events.spec.ts`

## Phase 4: CI/CD Script & Automated Pipeline
- [x] T011 Add unified `check` script running typecheck, test, and build in `package.json`

## Phase 5: Production Systemd Service & Health Probing
- [x] T012 Harden systemd service configuration with `Restart=always`, `EnvironmentFile`, and logging in `systemd/arabic-club.service`
- [x] T013 Update active user service `~/.config/systemd/user/arabic-club.service`
- [x] T014 Configure logrotate rules for daemon log files in `systemd/arabic-club.logrotate`
- [x] T015 Verify database connection and probe response in `/src/app/api/health/route.ts`

## Phase 6: Error Monitoring & Logging
- [x] T016 Implement structured rotating error logger with sensitive data redaction in `src/lib/logger.ts`
- [x] T017 Connect runtime error logging in global error boundaries `src/app/(public)/error.tsx`

## Phase 7: Safe Deployment Automation with Rollback
- [x] T018 Create zero-downtime deployment script with pre-build backup, migration, daemon restart, health probe, and automatic rollback in `scripts/deploy.sh`

## Phase 8: Production Ingress & Reverse Proxy
- [x] T019 Create production Nginx reverse proxy configuration with TLS and security headers in `nginx/arabic-club.conf`
- [x] T020 Document reverse proxy, TLS certificates, and Cloudflare CDN integration in `docs/NGINX_AND_CLOUDFLARE_GUIDE.md`

## Phase 9: Bilingual Documentation (English & Bangla)
- [x] T021 Author comprehensive operator guide in English and Bangla in `docs/ADMIN_GUIDE.md`
- [x] T022 Update root `README.md` with system overview, commands, operations, and Bengali quickstart summary

## Phase 10: Master Verification & Final Audit
- [x] T023 Implement master multi-phase audit verification script in `scripts/verify-final-full-audit.ts`
- [x] T024 Execute complete test verification suite across all 8 phases and record results in `.specify/bugs/final-qa-monitoring-deployment/test.md`
- [x] T025 Author final bug fix report in `.specify/bugs/final-qa-monitoring-deployment/fix.md`
