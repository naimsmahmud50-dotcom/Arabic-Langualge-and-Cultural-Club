/**
 * DEVELOPER NOTE:
 * @file scripts/migrate-uploads-to-storage.ts
 * @description Safe, Idempotent Media Migration Script (Phase 3).
 * Moves legacy user-uploaded files from public/uploads to durable persistent storage (storage/uploads),
 * generates missing Sharp WebP thumbnails, and updates SQLite database records from /uploads/... to /api/media/...
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * Strictly zero AI emojis.
 */

import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import sharp from "sharp";

const DB_PATH = path.join(process.cwd(), "arabic_club.db");
const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const PERSISTENT_STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), "storage", "uploads");

interface MigrationStats {
  filesFound: number;
  filesMigrated: number;
  thumbnailsGenerated: number;
  dbRecordsUpdated: number;
  errors: string[];
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function runMigration() {
  console.log("--------------------------------------------------");
  console.log("Starting Media Migration: public/uploads -> persistent storage");
  console.log(`Source: ${PUBLIC_UPLOADS_DIR}`);
  console.log(`Destination: ${PERSISTENT_STORAGE_DIR}`);
  console.log(`Database: ${DB_PATH}`);
  console.log("--------------------------------------------------");

  const stats: MigrationStats = {
    filesFound: 0,
    filesMigrated: 0,
    thumbnailsGenerated: 0,
    dbRecordsUpdated: 0,
    errors: [],
  };

  if (!fs.existsSync(PERSISTENT_STORAGE_DIR)) {
    fs.mkdirSync(PERSISTENT_STORAGE_DIR, { recursive: true });
  }

  // 1. Scan and copy files from public/uploads to storage/uploads
  if (fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    const allFiles = getAllFiles(PUBLIC_UPLOADS_DIR);
    stats.filesFound = allFiles.length;
    console.log(`Discovered ${allFiles.length} file(s) in public/uploads.`);

    for (const sourceFilePath of allFiles) {
      try {
        const relativePath = path.relative(PUBLIC_UPLOADS_DIR, sourceFilePath);
        const destFilePath = path.join(PERSISTENT_STORAGE_DIR, relativePath);
        const destDir = path.dirname(destFilePath);

        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy file if not already present or if sizes differ
        const sourceBuffer = fs.readFileSync(sourceFilePath);
        if (!fs.existsSync(destFilePath) || fs.statSync(destFilePath).size !== sourceBuffer.length) {
          fs.writeFileSync(destFilePath, sourceBuffer);
          stats.filesMigrated++;
          console.log(`[Copied] ${relativePath} -> ${destFilePath}`);
        } else {
          console.log(`[Already Exists] ${relativePath}`);
        }

        // Generate WebP thumbnail if it's an image and doesn't already have one
        const ext = path.extname(sourceFilePath).toLowerCase();
        const isImage = [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext);

        if (isImage && !relativePath.endsWith("_thumb.webp")) {
          const parsed = path.parse(destFilePath);
          const thumbPath = path.join(parsed.dir, `${parsed.name}_thumb.webp`);

          if (!fs.existsSync(thumbPath)) {
            try {
              await sharp(sourceBuffer)
                .resize(400, 400, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80, effort: 4 })
                .toFile(thumbPath);

              stats.thumbnailsGenerated++;
              console.log(`[Thumbnail Generated] ${path.relative(PERSISTENT_STORAGE_DIR, thumbPath)}`);
            } catch (thumbErr: any) {
              console.warn(`[Thumbnail Warning] Failed generating thumbnail for ${relativePath}:`, thumbErr.message);
            }
          }
        }
      } catch (err: any) {
        stats.errors.push(`Error processing ${sourceFilePath}: ${err.message}`);
        console.error(`[Error] ${sourceFilePath}:`, err.message);
      }
    }
  } else {
    console.log("No legacy public/uploads directory found. Proceeding with DB check.");
  }

  // 2. Connect to SQLite database and update legacy /uploads/... references
  if (fs.existsSync(DB_PATH)) {
    const db = new Database(DB_PATH);

    try {
      // Begin transaction
      db.exec("BEGIN TRANSACTION;");

      // Update media_assets
      const mediaRows = db.prepare("SELECT id, file_url, thumbnail_url FROM media_assets WHERE file_url LIKE '/uploads/%' OR thumbnail_url LIKE '/uploads/%'").all() as { id: string; file_url: string; thumbnail_url: string | null }[];

      for (const row of mediaRows) {
        let newFileUrl = row.file_url;
        let newThumbUrl = row.thumbnail_url;

        if (newFileUrl.startsWith("/uploads/")) {
          const cleanKey = newFileUrl.replace(/^\/uploads\//, "");
          newFileUrl = `/api/media/${cleanKey}`;
        }

        if (newThumbUrl && newThumbUrl.startsWith("/uploads/")) {
          const cleanKey = newThumbUrl.replace(/^\/uploads\//, "");
          // Check if a dedicated thumbnail exists
          const parsed = path.parse(cleanKey);
          const thumbKey = `${parsed.dir}/${parsed.name}_thumb.webp`;
          const thumbOnDisk = path.join(PERSISTENT_STORAGE_DIR, thumbKey);

          if (fs.existsSync(thumbOnDisk)) {
            newThumbUrl = `/api/media/${thumbKey}`;
          } else {
            newThumbUrl = `/api/media/${cleanKey}`;
          }
        }

        db.prepare("UPDATE media_assets SET file_url = ?, thumbnail_url = ? WHERE id = ?")
          .run(newFileUrl, newThumbUrl, row.id);

        stats.dbRecordsUpdated++;
        console.log(`[DB Updated media_assets] ${row.id} -> file_url: ${newFileUrl}, thumb: ${newThumbUrl}`);
      }

      // Update gallery_albums cover_image_url
      const albumRows = db.prepare("SELECT id, cover_image_url FROM gallery_albums WHERE cover_image_url LIKE '/uploads/%'").all() as { id: string; cover_image_url: string }[];
      for (const row of albumRows) {
        const cleanKey = row.cover_image_url.replace(/^\/uploads\//, "");
        const newCoverUrl = `/api/media/${cleanKey}`;
        db.prepare("UPDATE gallery_albums SET cover_image_url = ? WHERE id = ?").run(newCoverUrl, row.id);
        stats.dbRecordsUpdated++;
        console.log(`[DB Updated gallery_albums] ${row.id} -> cover: ${newCoverUrl}`);
      }

      db.exec("COMMIT;");
      console.log("Database transaction committed successfully.");
    } catch (dbErr: any) {
      db.exec("ROLLBACK;");
      console.error("Database transaction rolled back due to error:", dbErr);
      stats.errors.push(`Database error: ${dbErr.message}`);
    } finally {
      db.close();
    }
  }

  console.log("--------------------------------------------------");
  console.log("Migration Summary:");
  console.log(`- Files Found: ${stats.filesFound}`);
  console.log(`- Files Copied to Storage: ${stats.filesMigrated}`);
  console.log(`- WebP Thumbnails Generated: ${stats.thumbnailsGenerated}`);
  console.log(`- Database Records Updated: ${stats.dbRecordsUpdated}`);
  console.log(`- Errors: ${stats.errors.length}`);
  console.log("--------------------------------------------------");

  if (stats.errors.length > 0) {
    console.error("Errors encountered:", stats.errors);
    process.exit(1);
  } else {
    console.log("Media migration completed successfully.");
  }
}

runMigration().catch((err) => {
  console.error("Unhandled fatal error during media migration:", err);
  process.exit(1);
});
