/**
 * DEVELOPER NOTE:
 * @file src/lib/utils/inventory-media.ts
 * @description Non-destructive Media Inventory Scanner and Migration Manifest Generator (Phase 7).
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * CORE RESPONSIBILITIES:
 * 1. Read-Only Inventory: Scans repository filesystem for images/videos without modifying, publishing, or deleting files.
 * 2. Hash & Integrity Auditing: Computes SHA-256 checksums and file sizes to detect duplicates.
 * 3. Database Reconciliation: Correlates discovered files with database records in media_assets and gallery_albums.
 * 4. Migration Manifest Generation: Emits structured markdown report to docs/MEDIA_MIGRATION_MANIFEST.md.
 * 5. Strict Ethics: Never fabricates metadata, event dates, or participant names.
 * 6. Strictly zero AI emojis.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { db } from "../db";
import { mediaAssets, galleryAlbums } from "../db/schema";
import { inspectFileSignature } from "./media-storage";

export interface DiscoveredMediaFile {
  relativePath: string;
  absolutePath: string;
  filename: string;
  sizeBytes: number;
  sha256: string;
  detectedMime: string;
  mediaType: "image" | "video";
  lastModified: Date;
  isReferencedInDb: boolean;
  dbReferences: string[];
}

export interface MediaInventoryReport {
  timestamp: string;
  totalFilesScanned: number;
  totalDiskFilesFound: number;
  totalDbRecordsFound: number;
  discoveredFiles: DiscoveredMediaFile[];
  dbReferences: Array<{ id: string; fileUrl: string; albumId: string; title?: string }>;
  unreferencedFiles: DiscoveredMediaFile[];
  potentialDuplicates: Array<{ file1: string; file2: string; sha256: string }>;
}

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".mp4",
  ".webm",
]);

const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".gemini",
  ".specify",
  "data",
  "dist",
]);

/**
 * Recursively scans directory for media files in a strictly non-destructive manner.
 */
export function scanDirectoryForMedia(rootDir: string, currentDir: string = rootDir): DiscoveredMediaFile[] {
  const results: DiscoveredMediaFile[] = [];

  if (!fs.existsSync(currentDir)) {
    return results;
  }

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      results.push(...scanDirectoryForMedia(rootDir, fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        try {
          const stats = fs.statSync(fullPath);
          const buffer = fs.readFileSync(fullPath);
          const hash = crypto.createHash("sha256").update(buffer).digest("hex");
          const sig = inspectFileSignature(buffer);

          const isVideo = sig.detectedFormat === "mp4" || sig.detectedFormat === "webm";
          const mediaType: "image" | "video" = isVideo ? "video" : "image";

          results.push({
            relativePath: relPath,
            absolutePath: fullPath,
            filename: entry.name,
            sizeBytes: stats.size,
            sha256: hash,
            detectedMime: sig.detectedMime || "application/octet-stream",
            mediaType,
            lastModified: stats.mtime,
            isReferencedInDb: false,
            dbReferences: [],
          });
        } catch (readErr) {
          console.warn(`Non-destructive inventory: unable to read ${relPath}:`, readErr);
        }
      }
    }
  }

  return results;
}

/**
 * Builds a comprehensive media inventory report comparing disk files with database records.
 */
export async function buildMediaInventoryReport(workspaceRoot: string = process.cwd()): Promise<MediaInventoryReport> {
  const diskFiles = scanDirectoryForMedia(workspaceRoot);

  // Query database assets
  const dbAssets = await db.select().from(mediaAssets);
  const dbAlbums = await db.select().from(galleryAlbums);

  const dbReferences: Array<{ id: string; fileUrl: string; albumId: string; title?: string }> = [];

  dbAssets.forEach((a) => {
    dbReferences.push({
      id: a.id,
      fileUrl: a.fileUrl,
      albumId: a.albumId,
      title: a.captionEn || undefined,
    });
  });

  dbAlbums.forEach((alb) => {
    if (alb.coverImageUrl) {
      dbReferences.push({
        id: `cover_${alb.id}`,
        fileUrl: alb.coverImageUrl,
        albumId: alb.id,
        title: `Cover for ${alb.titleEn}`,
      });
    }
  });

  // Cross-reference disk files with database references
  for (const file of diskFiles) {
    const matchingRefs = dbReferences.filter((ref) => {
      return (
        ref.fileUrl.includes(file.filename) ||
        ref.fileUrl.endsWith(file.relativePath.replace(/\\/g, "/"))
      );
    });

    if (matchingRefs.length > 0) {
      file.isReferencedInDb = true;
      file.dbReferences = matchingRefs.map((r) => `${r.id} (${r.albumId})`);
    }
  }

  // Detect duplicates on disk by SHA-256
  const hashGroups = new Map<string, string[]>();
  diskFiles.forEach((f) => {
    const group = hashGroups.get(f.sha256) || [];
    group.push(f.relativePath);
    hashGroups.set(f.sha256, group);
  });

  const potentialDuplicates: Array<{ file1: string; file2: string; sha256: string }> = [];
  hashGroups.forEach((paths, sha) => {
    if (paths.length > 1) {
      for (let i = 0; i < paths.length - 1; i++) {
        potentialDuplicates.push({
          file1: paths[i],
          file2: paths[i + 1],
          sha256: sha,
        });
      }
    }
  });

  const unreferencedFiles = diskFiles.filter((f) => !f.isReferencedInDb);

  return {
    timestamp: new Date().toISOString(),
    totalFilesScanned: diskFiles.length,
    totalDiskFilesFound: diskFiles.length,
    totalDbRecordsFound: dbReferences.length,
    discoveredFiles: diskFiles,
    dbReferences,
    unreferencedFiles,
    potentialDuplicates,
  };
}

/**
 * Generates docs/MEDIA_MIGRATION_MANIFEST.md
 */
export async function generateMigrationManifestFile(workspaceRoot: string = process.cwd()): Promise<string> {
  const report = await buildMediaInventoryReport(workspaceRoot);
  const manifestPath = path.join(workspaceRoot, "docs", "MEDIA_MIGRATION_MANIFEST.md");

  const lines: string[] = [];
  lines.push("# MEDIA REPOSITORY INVENTORY AND MIGRATION MANIFEST");
  lines.push("**Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka**");
  lines.push(`**Generated at:** ${report.timestamp}`);
  lines.push("**Classification:** Archival Data Governance Documentation");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 1. Executive Summary");
  lines.push("");
  lines.push("This document registers all media assets discovered within the repository filesystem and reconciles them against registered database entities in `gallery_albums` and `media_assets`. In compliance with institutional archival policies:");
  lines.push("- No files were deleted, moved, published, or overwritten during this inventory.");
  lines.push("- Dates, descriptions, and identities are recorded strictly from verifiable file properties; unconfirmed facts remain unassigned.");
  lines.push("- Any automated migration requires explicit administrator sign-off prior to execution.");
  lines.push("");
  lines.push("### Inventory Metrics");
  lines.push(`- **Physical Media Files Discovered on Disk:** ${report.totalDiskFilesFound}`);
  lines.push(`- **Database Media References Registered:** ${report.totalDbRecordsFound}`);
  lines.push(`- **Unreferenced Local Media Assets:** ${report.unreferencedFiles.length}`);
  lines.push(`- **Duplicate Checksum Clones Detected:** ${report.potentialDuplicates.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 2. Discovered Physical Files on Disk");
  lines.push("");
  lines.push("| Relative Path | Size | Detected MIME | SHA-256 (First 12 chars) | DB Status |");
  lines.push("| :--- | :--- | :--- | :--- | :--- |");

  if (report.discoveredFiles.length === 0) {
    lines.push("| *(No physical media files detected in repository root)* | — | — | — | — |");
  } else {
    report.discoveredFiles.forEach((f) => {
      const shortHash = f.sha256.substring(0, 12);
      const sizeKb = (f.sizeBytes / 1024).toFixed(1) + " KB";
      const dbStatus = f.isReferencedInDb ? `Referenced (${f.dbReferences.length})` : "Unreferenced / Discovered";
      lines.push(`| \`${f.relativePath}\` | ${sizeKb} | \`${f.detectedMime}\` | \`${shortHash}...\` | ${dbStatus} |`);
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 3. Database Media References & Placeholder Catalog");
  lines.push("");
  lines.push("The following database references represent active or staged media assets in `media_assets` and `gallery_albums`:");
  lines.push("");
  lines.push("| Reference ID | Album Association | File URL / Object Key | Context |");
  lines.push("| :--- | :--- | :--- | :--- |");

  report.dbReferences.forEach((r) => {
    lines.push(`| \`${r.id}\` | \`${r.albumId}\` | \`${r.fileUrl}\` | ${r.title || "Curated Asset"} |`);
  });

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 4. Unmigrated Discovered Files & Proposed Target Albums");
  lines.push("");
  lines.push("The following files were located on disk but are not yet formally registered in any gallery album:");
  lines.push("");

  if (report.unreferencedFiles.length === 0) {
    lines.push("*(Zero unreferenced files detected; all disk assets are accounted for)*");
  } else {
    lines.push("| Discovered Source File | Proposed Target Album | Recommended Status | Notes |");
    lines.push("| :--- | :--- | :--- | :--- |");
    report.unreferencedFiles.forEach((u) => {
      lines.push(
        `| \`${u.relativePath}\` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |`
      );
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 5. Duplicate Checksum & Conflict Analysis");
  lines.push("");

  if (report.potentialDuplicates.length === 0) {
    lines.push("*(No duplicate files detected across scanned paths)*");
  } else {
    lines.push("| Primary File | Duplicate File | Checksum SHA-256 | Action |");
    lines.push("| :--- | :--- | :--- | :--- |");
    report.potentialDuplicates.forEach((d) => {
      lines.push(`| \`${d.file1}\` | \`${d.file2}\` | \`${d.sha256.substring(0, 16)}...\` | Deduplicate / Reuse Single Storage Reference |`);
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 6. Administrator Confirmation & Sign-Off Gate");
  lines.push("");
  lines.push("In adherence to institutional governance standards, executing any bulk migration from this manifest requires formal authorization.");
  lines.push("");
  lines.push("```text");
  lines.push("ADMINISTRATIVE AUTHORIZATION CHECKLIST:");
  lines.push("[ ] 1. Verified that proposed target albums align with authentic historical college events.");
  lines.push("[ ] 2. Confirmed that approximate date notes and locations are documented accurately.");
  lines.push("[ ] 3. Approved batch import as Draft records for curation prior to public release.");
  lines.push("[ ] 4. Authorized administrator signature: arabicclubkngc2025@gmail.com");
  lines.push("```");

  const markdownContent = lines.join("\n");
  fs.writeFileSync(manifestPath, markdownContent, "utf8");

  return manifestPath;
}
