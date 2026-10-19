# SQLite Database Backup and Disaster Recovery Runbook
**Institution:** Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka  
**Platform Stack:** Next.js App Router, SQLite (better-sqlite3), Drizzle ORM, Systemd  
**Security Standard:** Strict Disaster Recovery & Historical Preservation Protocol  

---

## 1. Overview & Architecture
The Arabic Language & Cultural Club platform uses SQLite (`arabic_club.db`) in WAL mode (`journal_mode = WAL`) with busy timeouts (`busy_timeout = 5000`). Database backups are generated using the native `better-sqlite3.backup()` online page-level streaming API. This approach provides:
- **Zero Reader/Writer Blocking:** The live application can continue reading and writing during backups without lock contention or downtime.
- **Physical Isolation:** Backups are stored strictly outside the codebase repository (`~/.local/share/arabic-club/backups/`) so deployments, rebuilds, and Git operations can never touch or expose archival data.
- **14-Day Rolling Retention:** The system retains the 14 most recent backup snapshots and automatically rotates out older copies.
- **Cryptographic & Relational Verification:** Each backup file is immediately verified via SQLite `PRAGMA integrity_check` and sealed with a SHA-256 checksum manifest (`.meta.json`).

---

## 2. Directory Structure
```
~/.local/share/arabic-club/backups/
├── arabic_club_backup_2026-10-19_030000.db
├── arabic_club_backup_2026-10-19_030000.db.meta.json
├── arabic_club_backup_2026-10-18_030000.db
└── ... (up to 14 copies retained)
```

---

## 3. Automated Daily Backup (Systemd Timer)
The daily backup job is orchestrated via Systemd user units:
- **Service:** `arabic-club-backup.service`
- **Timer:** `arabic-club-backup.timer` (Triggers every day at 03:00 AM)

### Installation & Activation Commands:
```bash
# 1. Copy units to systemd user configuration directory
mkdir -p ~/.config/systemd/user/
cp systemd/arabic-club-backup.service ~/.config/systemd/user/
cp systemd/arabic-club-backup.timer ~/.config/systemd/user/

# 2. Reload daemon and enable timer
systemctl --user daemon-reload
systemctl --user enable --now arabic-club-backup.timer

# 3. Check timer schedule and status
systemctl --user list-timers --all | grep arabic-club
systemctl --user status arabic-club-backup.timer
```

---

## 4. Manual / On-Demand Backup
To trigger an immediate, verified database backup:
```bash
pnpm tsx scripts/backup-sqlite.ts
```

### Expected Output:
```
[Backup] Initiating online SQLite backup...
[Backup] Source: /home/mahmud-hasan/Naims Project/Arabic Club/arabic_club.db
[Backup] Target: /home/mahmud-hasan/.local/share/arabic-club/backups/arabic_club_backup_2026-10-19_131500.db
[Backup] Progress: 100% (pages copied)
[Backup] Successfully generated arabic_club_backup_2026-10-19_131500.db (380.00 KB, SHA256: ...)
[Backup] Retained copies count in archive: 14
[Backup] Process completed successfully.
```

---

## 5. Disaster Recovery & Database Restoration
When restoring after data corruption, accidental deletion, or server migration, use the automated restore engine `scripts/restore-sqlite.ts`.

### Safety Guarantee:
Before modifying `arabic_club.db`, the restore engine automatically creates an emergency safety snapshot:
`arabic_club.db.pre_restore_YYYY-MM-DD_HHmmss.db`

### Procedure:

#### Step 1: Restore to the latest available backup
```bash
pnpm tsx scripts/restore-sqlite.ts
```

#### Step 2: (Optional) Restore to a specific backup file
```bash
pnpm tsx scripts/restore-sqlite.ts ~/.local/share/arabic-club/backups/arabic_club_backup_2026-10-19_030000.db
```

#### Step 3: Restart the web platform daemon
```bash
systemctl --user restart arabic-club.service
```

#### Step 4: Verify platform health
```bash
# Verify process status
systemctl --user status arabic-club.service

# Verify public HTTP response on port 3005
curl -I http://localhost:3005/
```

---

## 6. Verification Checklist
- [x] `PRAGMA integrity_check` returns `ok`.
- [x] All core tables populated (`users`, `site_settings`, `members`, `events`, `announcements`).
- [x] WAL/SHM locks cleanly rebuilt upon platform launch.
- [x] Public site loads without missing media references or broken links.
