/**
 * DEVELOPER NOTE:
 * File: scripts/docker-migrate.mjs
 * Purpose: Automated Database Migration and Initial Provisioning Runner for Docker & Coolify Deployments.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly zero AI emojis.
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "arabic_club.db");
console.log("==================================================================");
console.log(`[Docker Migration] Initializing SQLite database at: ${dbPath}`);
console.log("==================================================================");

// Ensure parent directory exists
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`[Docker Migration] Created database directory: ${dbDir}`);
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("synchronous = NORMAL");

// 1. Create migration tracker table if it does not exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS _drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL UNIQUE,
    created_at INTEGER
  );
`);

// 2. Execute SQL migrations in deterministic order
const migrationsDir = path.join(process.cwd(), "src/lib/db/migrations");
if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    const existing = sqlite.prepare("SELECT id FROM _drizzle_migrations WHERE hash = ?").get(file);
    if (!existing) {
      console.log(`[Docker Migration] Applying migration: ${file}...`);
      sqlite.transaction(() => {
        // Remove drizzle custom statement delimiters if present
        const sanitizedSql = sql.replace(/--> statement-breakpoint/g, ";");
        sqlite.exec(sanitizedSql);
        sqlite.prepare("INSERT INTO _drizzle_migrations (hash, created_at) VALUES (?, ?)").run(file, Date.now());
      })();
      console.log(`[Docker Migration] Applied ${file} successfully.`);
    } else {
      console.log(`[Docker Migration] Migration ${file} is already up to date.`);
    }
  }
} else {
  console.warn(`[Docker Migration] Notice: Migrations directory not found at ${migrationsDir}`);
}

// 3. Verify total tables
const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
console.log(`[Docker Migration] Verified database tables: ${tables.length} tables present.`);

// 4. Ensure Super Administrator accounts exist
const userCount = sqlite.prepare("SELECT count(*) as count FROM users").get();
const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "Admin@ArabicClub2026!";
const passwordHash = bcrypt.hashSync(initialPassword, 12);
const now = Date.now();

if (userCount.count === 0) {
  console.log("[Docker Migration] Fresh database detected. Provisioning official administrative accounts...");

  const adminEmails = [
    {
      id: "usr_kngc_superadmin",
      email: (process.env.INITIAL_ADMIN_EMAIL || "arabicclubkngc2025@gmail.com").toLowerCase().trim(),
      name: "Lead Super Administrator (Kabi Nazrul Government College)",
      role: "super_admin",
    },
    {
      id: "usr_admin_portal",
      email: "admin@arabicclub.org",
      name: "Club System Administrator",
      role: "super_admin",
    },
  ];

  const insertUser = sqlite.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `);

  for (const adm of adminEmails) {
    insertUser.run(adm.id, adm.email, passwordHash, adm.name, adm.role, now, now);
    console.log(`[Docker Migration] Provisioned ${adm.role}: ${adm.email}`);
  }
  console.log(`[Docker Migration] Initial password configured: ${initialPassword}`);
} else {
  console.log(`[Docker Migration] Users already exist (${userCount.count} accounts). Skipping admin provisioning.`);
}

// 5. Ensure Core Site Settings exist
const settingsCount = sqlite.prepare("SELECT count(*) as count FROM site_settings").get();
if (settingsCount.count === 0) {
  console.log("[Docker Migration] Initializing core institutional site settings...");
  const insertSetting = sqlite.prepare(`
    INSERT INTO site_settings (id, key, value_en, value_ar, category, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const initialSettings = [
    ["set_club_name", "club_name", "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka", "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية، دكا", "general"],
    ["set_tagline", "club_tagline", "Preserving Heritage, Advancing Eloquence, Cultivating Leadership", "صون التراث، وترقية البيان، وبناء القيادات", "general"],
    ["set_contact_email", "contact_email", "arabicclubkngc2025@gmail.com", "arabicclubkngc2025@gmail.com", "general"],
    ["set_contact_phone", "contact_phone", "+880 1712-345678", "+880 1712-345678", "general"],
    ["set_headquarters", "headquarters_address", "Department of Arabic & Islamic Studies, Kabi Nazrul Government College, Laxmibazar, Dhaka-1100", "قسم اللغة العربية والدراسات الإسلامية، كلية كابي نذرول الحكومية، لکشمي بازار، دكا-1100", "general"],
  ];

  for (const s of initialSettings) {
    insertSetting.run(s[0], s[1], s[2], s[3], s[4], now);
  }
  console.log("[Docker Migration] Core institutional site settings established.");
}

sqlite.close();
console.log("==================================================================");
console.log("[Docker Migration] SQLite database migration and initialization complete.");
console.log("==================================================================");
