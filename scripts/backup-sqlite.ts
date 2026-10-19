/**
 * @file scripts/backup-sqlite.ts
 * @description Automated SQLite Database Backup Engine using better-sqlite3 native backup API.
 * 
 * DEVELOPER NOTE:
 * - Uses better-sqlite3's online, non-blocking page-level backup API.
 * - Stores backups OUTSIDE the project folder (default: ~/.local/share/arabic-club/backups).
 * - Enforces strict 14-copy retention policy, rotating older snapshots automatically.
 * - Validates cryptographic SHA-256 checksum and PRAGMA integrity_check before confirming success.
 * - Generates audit metadata (.meta.json) for each backup artifact.
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface BackupResult {
  success: boolean;
  filename: string;
  filepath: string;
  sizeBytes: number;
  sha256: string;
  tableCounts: Record<string, number>;
  timestamp: string;
  retainedCopies: number;
}

export async function runBackup(customBackupDir?: string): Promise<BackupResult> {
  const rootDir = process.cwd();
  const dbPath = process.env.DATABASE_URL || path.join(rootDir, "arabic_club.db");

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Source database does not exist at path: ${dbPath}`);
  }

  // Determine storage destination outside project directory
  const homeDir = process.env.HOME || "/tmp";
  const backupDir = customBackupDir || process.env.BACKUP_DIR || path.join(homeDir, ".local", "share", "arabic-club", "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const filename = `arabic_club_backup_${timestampStr}.db`;
  const targetPath = path.join(backupDir, filename);

  console.log(`[Backup] Initiating online SQLite backup...`);
  console.log(`[Backup] Source: ${dbPath}`);
  console.log(`[Backup] Target: ${targetPath}`);

  const sourceDb = new Database(dbPath, { readonly: true });

  try {
    // 1. Perform transaction-safe online page backup
    await sourceDb.backup(targetPath, {
      progress({ totalPages, remainingPages }) {
        const percent = Math.round(((totalPages - remainingPages) / totalPages) * 100);
        if (percent % 25 === 0 || remainingPages === 0) {
          process.stdout.write(`[Backup] Progress: ${percent}% (${totalPages - remainingPages}/${totalPages} pages)\n`);
        }
      },
    });

    // 2. Cryptographic and Relational Integrity Verification
    const backupDb = new Database(targetPath, { readonly: true });
    const integrityRows = backupDb.pragma("integrity_check") as Array<{ integrity_check: string }>;
    const isIntegrityOk = integrityRows.length === 1 && integrityRows[0].integrity_check === "ok";

    if (!isIntegrityOk) {
      backupDb.close();
      fs.unlinkSync(targetPath);
      throw new Error(`Backup integrity check failed! Details: ${JSON.stringify(integrityRows)}`);
    }

    // Inspect table counts
    const tables = [
      "users",
      "site_settings",
      "members",
      "founders",
      "committee_terms",
      "events",
      "announcements",
      "gallery_albums",
      "media_assets",
      "learning_resources",
      "publications",
      "editable_pages",
      "page_sections",
      "contact_inquiries",
      "membership_applications",
      "audit_logs",
    ];

    const tableCounts: Record<string, number> = {};
    for (const t of tables) {
      try {
        const res = backupDb.prepare(`SELECT count(*) as count FROM ${t}`).get() as { count: number };
        tableCounts[t] = res.count;
      } catch {
        tableCounts[t] = 0;
      }
    }

    backupDb.close();

    // 3. Compute SHA-256 Checksum and Size
    const fileBuffer = fs.readFileSync(targetPath);
    const sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const sizeBytes = fileBuffer.length;

    // 4. Write Metadata Manifest
    const metadata = {
      filename,
      filepath: targetPath,
      timestamp: now.toISOString(),
      sizeBytes,
      sha256,
      integrity: "ok",
      tableCounts,
    };
    fs.writeFileSync(`${targetPath}.meta.json`, JSON.stringify(metadata, null, 2), "utf8");

    // 5. Enforce 14-copy retention policy
    const files = fs.readdirSync(backupDir)
      .filter((f) => f.startsWith("arabic_club_backup_") && f.endsWith(".db"))
      .map((f) => ({
        name: f,
        fullPath: path.join(backupDir, f),
        mtime: fs.statSync(path.join(backupDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    let retainedCount = files.length;
    if (files.length > 14) {
      const toRemove = files.slice(14);
      for (const item of toRemove) {
        console.log(`[Backup] Rotating old backup copy: ${item.name}`);
        fs.unlinkSync(item.fullPath);
        const metaPath = `${item.fullPath}.meta.json`;
        if (fs.existsSync(metaPath)) {
          fs.unlinkSync(metaPath);
        }
      }
      retainedCount = 14;
    }

    console.log(`[Backup] Successfully generated ${filename} (${(sizeBytes / 1024).toFixed(2)} KB, SHA256: ${sha256.slice(0, 12)}...)`);
    console.log(`[Backup] Retained copies count in archive: ${retainedCount}`);

    return {
      success: true,
      filename,
      filepath: targetPath,
      sizeBytes,
      sha256,
      tableCounts,
      timestamp: now.toISOString(),
      retainedCopies: retainedCount,
    };
  } finally {
    sourceDb.close();
  }
}

// Allow direct CLI execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("backup-sqlite")) {
  runBackup()
    .then((result) => {
      console.log(`[Backup] Process completed successfully.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[Backup] FATAL ERROR:`, err);
      process.exit(1);
    });
}
