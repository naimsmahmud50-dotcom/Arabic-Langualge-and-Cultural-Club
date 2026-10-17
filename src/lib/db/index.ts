import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Resolve database path
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "arabic_club.db");

// Ensure directory exists
const dbDir = path.dirname(path.resolve(/*turbopackIgnore: true*/ dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
export * from "./schema";
