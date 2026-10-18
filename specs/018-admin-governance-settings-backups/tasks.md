# TASKS: 018 - Admin Governance, Settings, Audit Logs & Backups

## Phase 1: Database Queries & Data Access Layer
- [x] T001 Implement `getAdminSiteSettings()`, `updateSiteSettings(settingsArray)` in `src/lib/db/queries.ts`
- [x] T002 Implement paginated and filtered `getAdminAuditLogs(params)` in `src/lib/db/queries.ts`
- [x] T003 Implement `updateUserRole(id, role)` and `updateUserStatus(id, isActive)` in `src/lib/db/queries.ts`

## Phase 2: Secure Server Actions & Operational API Layer
- [x] T004 Create `src/lib/actions/governance.ts` with:
  - `saveSiteSettingsAction`: persists identity, contact, social, SEO, and defaults
  - `updateUserStatusAction`: suspends/activates operator account with anti-self-lockout
  - `updateUserRoleAction`: modifies role with anti-escalation enforcement
  - `changeUserPasswordAction`: validates current password, verifies complexity, hashes with Scrypt
  - `generateDatabaseBackupAction`: creates verified backup snapshot with SHA256 integrity check
- [x] T005 Implement `src/app/api/admin/backup/route.ts` and `src/app/api/admin/audit-logs/export/route.ts` for authenticated binary/JSON download streams
- [x] T006 Implement backup integrity engine `src/lib/utils/db-backup.ts`

## Phase 3: Administrative UI Consoles
- [x] T007 Implement comprehensive Settings Console (`/admin/settings`):
  - `src/app/admin/settings/SettingsManagerClient.tsx`
  - Upgrade `src/app/admin/settings/page.tsx`
- [x] T008 Enhance User & Role Governance Console (`/admin/users`):
  - Upgrade `src/app/admin/users/UsersManagerClient.tsx` with role modal and status toggling
  - Upgrade `src/app/admin/users/page.tsx`
- [x] T009 Implement Filterable Audit Logs Console (`/admin/audit-logs`):
  - `src/app/admin/audit-logs/AuditLogsClient.tsx`
  - Upgrade `src/app/admin/audit-logs/page.tsx`
- [x] T010 Create Disaster Recovery Runbook (`docs/BACKUP_AND_DISASTER_RECOVERY.md`)

## Phase 4: Verification, Regression & Handover
- [x] T011 Build automated verification test suite `src/lib/db/test-admin-governance-settings.ts`
- [x] T012 Run test suite and fix any discovered defects
- [x] T013 Run cumulative regression testing across all test suites
- [x] T014 Run `next build` verifying 0 build errors
- [x] T015 Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
