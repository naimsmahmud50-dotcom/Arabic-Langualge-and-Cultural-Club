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

/**
 * DEVELOPER NOTE:
 * High-concurrency SQLite Database Connection via better-sqlite3 & Drizzle ORM.
 * - PRAGMA journal_mode = WAL: Allows concurrent readers alongside single writer without blocking.
 * - PRAGMA busy_timeout = 5000: Prevents instant SQLITE_BUSY locking errors under concurrent traffic.
 * - PRAGMA synchronous = NORMAL: Safe and performant persistence in WAL mode.
 * - PRAGMA foreign_keys = ON: Enforces relational database integrity.
 */
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("foreign_keys = ON");

export { sqlite };
export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
export * from "./schema";
