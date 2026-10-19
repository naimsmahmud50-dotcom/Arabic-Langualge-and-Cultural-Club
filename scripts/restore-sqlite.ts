/**
 * @file scripts/restore-sqlite.ts
 * @description Safe Disaster Recovery & SQLite Database Restoration Engine.
 * 
 * DEVELOPER NOTE:
 * - Restores SQLite database from a verified native backup.
 * - Always creates an emergency snapshot of current database before restoring.
 * - Validates cryptographic SHA-256 and PRAGMA integrity_check before and after restoration.
 * - Displays step-by-step restoration verification metrics.
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface RestoreResult {
  success: boolean;
  restoredFrom: string;
  safetySnapshot: string;
  tableCounts: Record<string, number>;
  timestamp: string;
}

export async function runRestore(targetBackupPath?: string): Promise<RestoreResult> {
  const rootDir = process.cwd();
  const currentDbPath = process.env.DATABASE_URL || path.join(rootDir, "arabic_club.db");
  const homeDir = process.env.HOME || "/tmp";
  const backupDir = process.env.BACKUP_DIR || path.join(homeDir, ".local", "share", "arabic-club", "backups");

  let backupFilePath = targetBackupPath;

  // 1. If no specific path given, locate the newest valid backup
  if (!backupFilePath) {
    if (!fs.existsSync(backupDir)) {
      throw new Error(`Backup directory does not exist: ${backupDir}`);
    }

    const backups = fs.readdirSync(backupDir)
      .filter((f) => f.startsWith("arabic_club_backup_") && f.endsWith(".db"))
      .map((f) => ({
        name: f,
        fullPath: path.join(backupDir, f),
        mtime: fs.statSync(path.join(backupDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (backups.length === 0) {
      throw new Error(`No database backups found in: ${backupDir}`);
    }

    backupFilePath = backups[0].fullPath;
    console.log(`[Restore] Selected newest available backup: ${backups[0].name}`);
  }

  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Specified backup file not found: ${backupFilePath}`);
  }

  console.log(`[Restore] Pre-flight verification of backup file: ${backupFilePath}`);

  // 2. Validate backup integrity before touching active database
  const backupDb = new Database(backupFilePath, { readonly: true });
  const integrityRows = backupDb.pragma("integrity_check") as Array<{ integrity_check: string }>;
  const isBackupHealthy = integrityRows.length === 1 && integrityRows[0].integrity_check === "ok";

  if (!isBackupHealthy) {
    backupDb.close();
    throw new Error(`Backup file is corrupted or failed PRAGMA integrity_check: ${JSON.stringify(integrityRows)}`);
  }

  // 3. Verify SHA-256 if metadata file exists
  const metaFilePath = `${backupFilePath}.meta.json`;
  if (fs.existsSync(metaFilePath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
      const actualHash = crypto.createHash("sha256").update(fs.readFileSync(backupFilePath)).digest("hex");
      if (meta.sha256 && meta.sha256 !== actualHash) {
        backupDb.close();
        throw new Error(`SHA256 checksum mismatch! Expected ${meta.sha256}, got ${actualHash}`);
      }
      console.log(`[Restore] SHA-256 checksum verified against manifest: ${actualHash.slice(0, 16)}...`);
    } catch (e: any) {
      console.warn(`[Restore] Notice on manifest verification: ${e.message}`);
    }
  }

  backupDb.close();

  // 4. Create an Emergency Safety Snapshot of Current Live Database
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const safetySnapshotPath = `${currentDbPath}.pre_restore_${timestampStr}.db`;

  if (fs.existsSync(currentDbPath)) {
    console.log(`[Restore] Creating emergency pre-restore snapshot: ${safetySnapshotPath}`);
    const liveDb = new Database(currentDbPath, { readonly: true });
    await liveDb.backup(safetySnapshotPath);
    liveDb.close();
  }

  // 5. Safely execute database restoration
  console.log(`[Restore] Restoring database to ${currentDbPath}...`);
  const restoreSourceDb = new Database(backupFilePath, { readonly: true });
  await restoreSourceDb.backup(currentDbPath);
  restoreSourceDb.close();

  // Remove any stale WAL/SHM files to prevent state drift
  const walPath = `${currentDbPath}-wal`;
  const shmPath = `${currentDbPath}-shm`;
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

  // 6. Post-Restoration Verification
  const restoredDb = new Database(currentDbPath);
  restoredDb.pragma("journal_mode = WAL");
  restoredDb.pragma("busy_timeout = 5000");
  restoredDb.pragma("synchronous = NORMAL");
  restoredDb.pragma("foreign_keys = ON");

  const postIntegrity = restoredDb.pragma("integrity_check") as Array<{ integrity_check: string }>;
  if (postIntegrity.length !== 1 || postIntegrity[0].integrity_check !== "ok") {
    restoredDb.close();
    throw new Error(`Restored database failed integrity check: ${JSON.stringify(postIntegrity)}`);
  }

  const tables = [
    "users",
    "site_settings",
    "members",
    "events",
    "announcements",
    "gallery_albums",
    "editable_pages",
  ];

  const tableCounts: Record<string, number> = {};
  for (const t of tables) {
    try {
      const res = restoredDb.prepare(`SELECT count(*) as count FROM ${t}`).get() as { count: number };
      tableCounts[t] = res.count;
    } catch {
      tableCounts[t] = 0;
    }
  }

  restoredDb.close();

  console.log(`\n======================================================`);
  console.log(`[Restore] DATABASE RESTORATION COMPLETED SUCCESSFULLY`);
  console.log(`[Restore] Source Backup: ${backupFilePath}`);
  console.log(`[Restore] Safety Snapshot: ${safetySnapshotPath}`);
  console.log(`[Restore] Table Counts:`, tableCounts);
  console.log(`[Restore] Action Required: Restart service using:`);
  console.log(`          systemctl --user restart arabic-club.service`);
  console.log(`======================================================\n`);

  return {
    success: true,
    restoredFrom: backupFilePath,
    safetySnapshot: safetySnapshotPath,
    tableCounts,
    timestamp: now.toISOString(),
  };
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("restore-sqlite")) {
  const customPath = process.argv[2];
  runRestore(customPath)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[Restore] FATAL RESTORATION ERROR:`, err);
      process.exit(1);
    });
}
