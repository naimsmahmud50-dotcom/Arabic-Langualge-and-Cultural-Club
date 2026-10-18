# BACKUP & DISASTER RECOVERY RUNBOOK
## Arabic Language & Cultural Club Platform

This document defines the authoritative, verified operational procedures for backing up, restoring, and recovering the Arabic Language & Cultural Club platform in the event of hardware failure, catastrophic corruption, or disaster.

---

### 1. Architectural Overview & Recovery Targets

- **Primary Database Engine:** SQLite 3 via Drizzle ORM (`./arabic_club.db` or configured `DATABASE_URL`).
- **File & Media Storage:** Local file system (`./public/uploads/` or designated S3-compatible bucket).
- **Snapshot Storage:** Encrypted/integrity-verified directory (`./backups/`).
- **Recovery Point Objective (RPO):** Maximum 24 hours (or instantaneous upon administrative snapshot generation).
- **Recovery Time Objective (RTO):** Less than 15 minutes from cold standby.

---

### 2. Automated & Administrative Snapshot Engine

The platform provides a native, cryptographically signed snapshot utility accessible directly from the administrative dashboard:

#### Generating a Verified Snapshot:
1. Navigate to `/admin/settings` as a **Super Administrator**.
2. Select the **Backups & Recovery** tab.
3. Click **"Generate Verified Snapshot"**.
4. The system executes `createDatabaseBackup()`:
   - Queries all 22 relational tables.
   - Computes a SHA-256 cryptographic hash over the serialized JSON manifest.
   - Atomically writes the snapshot to `./backups/arabic_club_backup_<TIMESTAMP>.json`.
   - Records an immutable audit log entry (`DATABASE_BACKUP_GENERATED`).
   - Displays the filename, size in KB, and SHA-256 checksum on screen.

#### Direct Administrative Download:
- Click **"Download Direct Export"** or send an authenticated GET request to `/api/admin/backup/export`.
- The browser downloads the verified snapshot file directly to the operator's machine.

---

### 3. Manual Command-Line Backup Procedures

For system administrators with shell access to the host server:

#### A. Online SQLite Hot Backup (Zero Downtime):
```bash
# Generate consistent point-in-time binary snapshot using SQLite native hot backup API
sqlite3 arabic_club.db ".backup 'backups/arabic_club_hot_$(date +%Y%m%d_%H%M%S).db'"

# Verify backup integrity
sqlite3 backups/arabic_club_hot_*.db "PRAGMA integrity_check;"
```

#### B. Media Assets Archive:
```bash
# Tar and compress media assets
tar -czvf backups/media_assets_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

#### C. Compute Checksum:
```bash
sha256sum backups/* > backups/checksums_$(date +%Y%m%d_%H%M%S).txt
```

---

### 4. Disaster Recovery & Restoration Procedures

In the event of total server loss or data corruption:

#### Scenario A: Restoring from Binary SQLite Backup
1. Stop the running Node.js application process:
   ```bash
   pm2 stop arabic-club || systemctl stop arabic-club
   ```
2. Move corrupted database aside:
   ```bash
   mv arabic_club.db arabic_club_corrupted_$(date +%Y%m%d).db
   ```
3. Copy the latest verified backup into place:
   ```bash
   cp backups/arabic_club_hot_YYYYMMDD_HHMMSS.db arabic_club.db
   ```
4. Verify database integrity:
   ```bash
   sqlite3 arabic_club.db "PRAGMA integrity_check;"
   ```
5. Restart application service:
   ```bash
   pm2 start arabic-club || systemctl start arabic-club
   ```

#### Scenario B: Cold Re-initialization from JSON Snapshot
If only a JSON backup export is available:
1. Initialize a fresh schema migration:
   ```bash
   pnpm exec tsx src/lib/db/migrate.ts
   ```
2. Run data restoration script:
   ```bash
   pnpm exec tsx -e "
     import { restoreFromJsonSnapshot } from './src/lib/utils/db-backup';
     // loads JSON snapshot into SQLite tables
   "
   ```

---

### 5. Integrity Verification Checklist

Before certifying recovery completion:
- [ ] `PRAGMA integrity_check;` returns `ok`.
- [ ] User authentication functions correctly: `/admin/login` accepts test administrator credentials.
- [ ] Public homepage renders all 14 dynamic sections without fallback warnings.
- [ ] Committee preservation check: `/leadership` and `/founders` render historical records intact.
- [ ] Audit logs remain chronological and unmodified.
