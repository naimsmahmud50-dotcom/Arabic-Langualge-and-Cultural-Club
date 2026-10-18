# BACKUP & DISASTER RECOVERY RUNBOOK
## Arabic Language & Cultural Club Platform

This runbook defines backup procedures, integrity verification, and recovery steps to protect institutional data against accidental loss, server corruption, or security incidents.

---

### 1. Backup Architecture & Data Assets

The platform consists of three core data assets requiring regular backup:

| Asset | Storage Location | Backup Mechanism | Recommended Frequency |
| :--- | :--- | :--- | :--- |
| **Relational Database** | `./arabic_club.db` | SQLite Online Binary Backup (`.backup`) | Hourly / Daily |
| **Audit Logs & Snapshots** | `./backups/*.json` | Cryptographic JSON Snapshot Engine | Daily |
| **Uploaded Media Assets** | `./public/uploads/` (or Object Bucket) | Tar Archive / Rclone Sync | Daily |

---

### 2. Built-in Cryptographic Snapshot Engine

The platform includes a built-in snapshot utility (`src/lib/utils/db-backup.ts`) accessible to Super Administrators:

#### Features
- **Scope:** Exports records across all 22 relational tables.
- **Credential Scrubbing:** Automatically scrubs password hashes from the `users` table (`[REDACTED_PASSWORD_HASH]`) to prevent credential leakage in backup artifacts.
- **Integrity Verification:** Computes a SHA-256 cryptographic hash across the serialized JSON data.
- **Storage:** Persisted locally to `./backups/backup-YYYY-MM-DD-HHMMSS.json`.

#### Executing Snapshot via UI or CLI
- **Via Admin UI:** Navigate to `/admin/settings` -> Select **"Backups & Recovery"** tab -> Click **"Create Database Backup"**.
- **Via CLI:**
  ```bash
  pnpm exec tsx -e "import { generateDatabaseBackup } from './src/lib/utils/db-backup'; generateDatabaseBackup().then(console.log);"
  ```

---

### 3. Automated Production Backup Script (Cron)

For production Linux servers, use SQLite's native online backup API (`.backup`), which creates a transactionally consistent copy of `./arabic_club.db` without locking read or write operations:

#### Backup Script: `/var/www/arabicclub/scripts/backup-production.sh`
```bash
#!/bin/bash
set -euo pipefail

# Configuration
APP_DIR="/var/www/arabicclub"
BACKUP_DIR="/var/backups/arabicclub"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="${APP_DIR}/arabic_club.db"
TARGET_DB="${BACKUP_DIR}/db_backup_${DATE}.sqlite"
TARGET_TAR="${BACKUP_DIR}/media_backup_${DATE}.tar.gz"

mkdir -p "${BACKUP_DIR}"

# 1. Transactionally safe binary database backup via sqlite3 CLI
sqlite3 "${DB_PATH}" ".backup '${TARGET_DB}'"

# 2. Compress database backup
gzip -9 "${TARGET_DB}"

# 3. Archive uploaded media files
if [ -d "${APP_DIR}/public/uploads" ]; then
    tar -czf "${TARGET_TAR}" -C "${APP_DIR}/public" uploads
fi

# 4. Generate SHA-256 checksums
cd "${BACKUP_DIR}"
sha256sum "db_backup_${DATE}.sqlite.gz" > "db_backup_${DATE}.sqlite.gz.sha256"

# 5. Retention policy: Remove backups older than 30 days
find "${BACKUP_DIR}" -type f -name "*backup_*.gz*" -mtime +30 -delete

echo "[$(date -Iseconds)] Backup completed: db_backup_${DATE}.sqlite.gz"
```

#### Crontab Configuration
Schedule automatic daily backups at 02:00 UTC:
```bash
# Edit crontab as root or appuser
crontab -e

# Append daily backup schedule:
0 2 * * * /bin/bash /var/www/arabicclub/scripts/backup-production.sh >> /var/log/arabicclub_backup.log 2>&1
```

---

### 4. Step-by-Step Restoration Runbook

#### Scenario A: Restoring from Binary SQLite Backup (`.sqlite.gz`)
1. Stop the application server:
   ```bash
   sudo pm2 stop arabic-club
   ```
2. Move the damaged database aside:
   ```bash
   mv /var/www/arabicclub/arabic_club.db /var/www/arabicclub/arabic_club.db.corrupt.$(date +%s)
   ```
3. Verify integrity of the backup file:
   ```bash
   cd /var/backups/arabicclub
   sha256sum -c db_backup_20261018_020000.sqlite.gz.sha256
   ```
4. Decompress and restore:
   ```bash
   gunzip -c db_backup_20261018_020000.sqlite.gz > /var/www/arabicclub/arabic_club.db
   chown appuser:appuser /var/www/arabicclub/arabic_club.db
   chmod 644 /var/www/arabicclub/arabic_club.db
   ```
5. Verify database integrity via SQLite CLI:
   ```bash
   sqlite3 /var/www/arabicclub/arabic_club.db "PRAGMA integrity_check;"
   # Expected output: ok
   ```
6. Start the application:
   ```bash
   sudo pm2 start arabic-club
   ```
7. Verify health:
   ```bash
   curl http://localhost:3000/api/health
   # Expected status: "ok"
   ```

#### Scenario B: Restoring Media Assets
```bash
tar -xzf /var/backups/arabicclub/media_backup_20261018_020000.tar.gz -C /var/www/arabicclub/public/
chown -R appuser:appuser /var/www/arabicclub/public/uploads
```

---

### 5. Disaster Recovery Verification Checklist

Conduct a restoration drill quarterly:
1. Restore backup to a staging or local environment.
2. Verify table row counts match expected historical volumes:
   ```bash
   pnpm exec tsx -e "import { db } from './src/lib/db'; import { members, events } from './src/lib/db/schema'; console.log('Members:', db.select().from(members).all().length); console.log('Events:', db.select().from(events).all().length);"
   ```
3. Confirm that administrative login succeeds with existing credentials.
4. Verify that public pages (`/about`, `/leadership`, `/gallery`, `/events`) render without missing content.
5. Record drill results in `audit_logs`.
