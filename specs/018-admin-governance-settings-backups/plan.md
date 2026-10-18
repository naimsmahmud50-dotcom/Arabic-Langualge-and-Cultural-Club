# IMPLEMENTATION PLAN: 018 - Admin Governance, Settings, Audit Logs & Backups

## Architecture Overview
```
+----------------------------------------------------------------------------------------------------+
|                                    Next.js Admin Console                                           |
|  /admin/users              /admin/settings                /admin/audit-logs     /admin/profile     |
|  (User & Role Mgmt)        (Site Identity, SEO & Backups) (Immutable Ledger)    (Security Settings)|
+----------------------------------------------------------------------------------------------------+
                                               |
                                     Server Actions & API
                                               v
+----------------------------------------------------------------------------------------------------+
|  src/lib/actions/governance.ts                                                                      |
|  - saveSiteSettingsAction                                                                          |
|  - updateUserStatusAction                                                                          |
|  - updateUserRoleAction                                                                            |
|  - changePasswordAction                                                                            |
|  - generateDatabaseBackupAction                                                                    |
|  - exportAuditLogsAction                                                                           |
|  API Routes:                                                                                       |
|  - /api/admin/backup/download (Authenticated binary sqlite stream)                                  |
|  - /api/admin/audit-logs/export (Authenticated JSON export)                                        |
+----------------------------------------------------------------------------------------------------+
                                               |
                                        Database Layer
                                               v
+----------------------------------------------------------------------------------------------------+
|  src/lib/db/queries.ts                                                                              |
|  - getAdminSiteSettings()                                                                          |
|  - updateSiteSettings(settingsArray)                                                               |
|  - getAdminAuditLogs(params) (filter, search, pagination)                                           |
|  - getAdminUsersList()                                                                             |
|  - updateUserStatus(id, isActive)                                                                  |
|  - updateUserRole(id, role)                                                                        |
+----------------------------------------------------------------------------------------------------+
```

## Detailed Execution Steps
1. **Query & Data Access Enhancements (`src/lib/db/queries.ts`)**:
   - `getAdminSiteSettings`: returns structured typed settings dictionary.
   - `updateSiteSettings`: atomic upsert for settings rows with timestamps.
   - `getAdminAuditLogs`: enhanced query with action filter, search, and pagination.
   - `updateUserStatus` & `updateUserRole`.
2. **Server Actions (`src/lib/actions/governance.ts`)**:
   - Enforce RBAC with `assertPermission`.
   - Zod validation for emails, URLs, passwords.
   - Record audit logs via `recordAuditLog`.
3. **Backup Utility & API Route**:
   - `src/lib/utils/db-backup.ts`: creates verified backup dump with table records count, file size, and SHA256 checksum.
   - `src/app/api/admin/backup/route.ts`: authenticated export endpoint.
4. **UI Components & Upgrades**:
   - `/admin/settings`: upgrade `page.tsx` with `SettingsManagerClient.tsx` connecting all form sections (General, Contact, Social, SEO, Theme/Locale defaults, Backup & Recovery).
   - `/admin/users`: upgrade `UsersManagerClient.tsx` to support role editing, status toggling, and self-lockout prevention.
   - `/admin/audit-logs`: upgrade `page.tsx` with `AuditLogsClient.tsx` featuring real-time action/entity filter, search, pagination, and JSON export.
5. **Disaster Recovery Guide**:
   - Create `docs/BACKUP_AND_DISASTER_RECOVERY.md`.
6. **Automated Verification**:
   - Build test suite `src/lib/db/test-admin-governance-settings.ts`.
   - Verify 100% test pass.
   - Run cumulative regression tests & `next build`.
