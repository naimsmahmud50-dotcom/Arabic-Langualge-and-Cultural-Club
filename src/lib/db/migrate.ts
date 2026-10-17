import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export async function runMigrations() {
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "arabic_club.db");
  console.log(`Running database migrations on ${dbPath}...`);
  
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // Create migrations tracking table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER
    );
  `);

  const migrationsDir = path.join(process.cwd(), "src/lib/db/migrations");
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found at ${migrationsDir}`);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    // Check if migration already applied
    const existing = sqlite.prepare("SELECT id FROM _drizzle_migrations WHERE hash = ?").get(file);
    if (!existing) {
      console.log(`Applying migration: ${file}...`);
      sqlite.transaction(() => {
        // Execute statements separated by semicolons or clean statements
        sqlite.exec(sql);
        sqlite.prepare("INSERT INTO _drizzle_migrations (hash, created_at) VALUES (?, ?)").run(file, Date.now());
      })();
      console.log(`Applied ${file} successfully.`);
    } else {
      console.log(`Migration ${file} already applied, skipping.`);
    }
  }

  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
  console.log(`\nVerified database structure. Total tables: ${tables.length}`);
  tables.forEach(t => console.log(` - ${t.name}`));
  sqlite.close();
}

runMigrations().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
