# SPECIFICATION: 018 - Admin Governance, Settings, Audit Logs & Backups

## 1. Overview & Business Requirements
Implement the remaining administrative governance modules to complete the full platform administration capabilities:
1. **Admin User & Role Management (`/admin/users`)**:
   - Super Admin can provision new operator accounts with designated least-privilege roles.
   - Edit user roles, suspend/activate accounts with safety guards preventing self-lockout or privilege escalation.
   - Comprehensive visual RBAC matrix.
2. **Site Settings & Global SEO (`/admin/settings`)**:
   - Real database persistence into `site_settings`.
   - Brand Nomenclature (English & Arabic club names, taglines, mottos).
   - Official Contact Coordinates (email, phone, address, office hours).
   - Social Media Links (Facebook, YouTube, X, Instagram, LinkedIn) with strict URL validation.
   - Global SEO configuration (meta descriptions, keywords, canonical URLs, OG defaults).
   - Default theme (`system`, `light`, `dark`) and default locale (`en`, `ar`).
3. **Audit Trail Console (`/admin/audit-logs`)**:
   - Query immutable audit ledger with filter by action, target entity, and search.
   - Safe pagination.
   - Authenticated JSON export of audit events.
4. **Administrative Profile Management**:
   - View authenticated operator profile and session details.
   - Self-service password change verifying current password, enforcing complexity, and re-hashing with Scrypt.
5. **Database Backup & Disaster Recovery**:
   - Verified snapshot creation with cryptographic SHA256 integrity hash.
   - Live export stream/download of SQLite database and JSON dump.
   - Detailed disaster recovery runbook (`docs/BACKUP_AND_DISASTER_RECOVERY.md`).

## 2. Security Guardrails & Invariants
- **Least-Privilege Enforcement**:
  - `users:manage`: only `super_admin` can create users, change roles, or toggle active status.
  - `settings:manage`: only `super_admin` can modify site-wide settings.
  - `audit:read`: restricted to privileged roles (`super_admin`, `administrator`). Audit logs are strictly immutable: no user or role can alter or delete audit records.
- **Anti-Self-Lockout & Anti-Escalation**:
  - A user cannot suspend their own active account.
  - A user cannot demote their own role if they are the sole active Super Admin.
  - Non-super_admins cannot grant `super_admin` role.
- **Sensitive Data Isolation**:
  - Audit logs must never log raw passwords, session cookies, or HMAC keys.
- **Strict Human Vibe**:
  - Zero AI emojis in UI, alert components, or messages. Clean Lucide SVG icons.
- **Developer Documentation**:
  - Top-of-file developer architectural comments on every newly created and modified file.
