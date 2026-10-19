/**
 * DEVELOPER NOTE:
 * Script: scripts/migrate-sections-to-json.ts
 * Purpose: One-time migration script to ensure all rows in SQLite table `page_sections`
 *          are stored in valid, normalized JSON format conforming to SectionContentData.
 * Run via: pnpm tsx scripts/migrate-sections-to-json.ts
 * Safety:
 * - Backs up arabic_club.db before writing.
 * - Idempotent: safe to run multiple times.
 * - Validates with safeParseSectionJson before updating.
 * - Strictly human vibe: zero AI emojis.
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { safeParseSectionJson, serializeSectionJson } from "../src/lib/schemas/sections";

const DB_PATH = path.resolve(process.cwd(), "arabic_club.db");

function runMigration() {
  console.log("[Migration] Starting page_sections JSON normalization...");
  
  if (!fs.existsSync(DB_PATH)) {
    console.error("[Migration Error] Database not found at:", DB_PATH);
    process.exit(1);
  }

  // Backup before migration
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.resolve(process.cwd(), `arabic_club.db.backup_sections_${timestamp}`);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`[Migration] Database backed up to ${path.basename(backupPath)}`);

  const db = new Database(DB_PATH);

  const sections = db.prepare(`
    SELECT id, page_id, section_key, sort_order, content_en, content_ar 
    FROM page_sections
  `).all() as {
    id: string;
    page_id: string;
    section_key: string;
    sort_order: number;
    content_en: string | null;
    content_ar: string | null;
  }[];

  console.log(`[Migration] Found ${sections.length} sections in database.`);

  const updateStmt = db.prepare(`
    UPDATE page_sections 
    SET content_en = ?, content_ar = ?, updated_at = ?
    WHERE id = ?
  `);

  let convertedCount = 0;
  let alreadyValidCount = 0;

  db.transaction(() => {
    for (const sec of sections) {
      const parsedEn = safeParseSectionJson(sec.content_en);
      const parsedAr = safeParseSectionJson(sec.content_ar);

      const normalizedEn = serializeSectionJson(parsedEn);
      const normalizedAr = serializeSectionJson(parsedAr);

      // Check if raw value was plain text or needs updating
      const isEnPlainText = !sec.content_en?.trim().startsWith("{") && !sec.content_en?.trim().startsWith("[");
      const isArPlainText = !sec.content_ar?.trim().startsWith("{") && !sec.content_ar?.trim().startsWith("[");

      if (isEnPlainText || isArPlainText || sec.content_en !== normalizedEn || sec.content_ar !== normalizedAr) {
        updateStmt.run(normalizedEn, normalizedAr, new Date().toISOString(), sec.id);
        console.log(`[Migration] Updated section ${sec.id} (${sec.section_key}) for page ${sec.page_id}`);
        convertedCount++;
      } else {
        alreadyValidCount++;
      }
    }
  })();

  console.log(`[Migration Summary] Completed successfully.`);
  console.log(`  - Converted / Normalized: ${convertedCount}`);
  console.log(`  - Already Normalized: ${alreadyValidCount}`);
  console.log(`  - Total Sections: ${sections.length}`);
}

runMigration();
