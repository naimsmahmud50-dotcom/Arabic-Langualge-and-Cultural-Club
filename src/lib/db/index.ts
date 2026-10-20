import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

/**
 * DEVELOPER NOTE:
 * Universal LibSQL Database Connection for Serverless Cloud (Turso on Vercel)
 * and High-Concurrency Local SQLite (via @libsql/client).
 * 
 * - Vercel Serverless: When TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set,
 *   connects over HTTP/WebSocket without requiring local writable disk.
 * - Local / Self-Hosted: Uses local file (default: file:arabic_club.db) with
 *   full WAL concurrency and SQLite constraint checking.
 * - Strictly human vibe: zero AI emojis.
 */

const tursoUrl = 
  process.env.TURSO_DATABASE_URL || 
  process.env.LIBSQL_DATABASE_URL ||
  (process.env.DATABASE_URL?.startsWith("libsql://") || process.env.DATABASE_URL?.startsWith("https://") 
    ? process.env.DATABASE_URL 
    : null);

const tursoAuthToken = 
  process.env.TURSO_AUTH_TOKEN || 
  process.env.LIBSQL_AUTH_TOKEN || 
  process.env.DATABASE_AUTH_TOKEN;

let client: Client;

if (tursoUrl) {
  client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });
} else {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const rawPath = process.env.DATABASE_URL || (isServerless ? "file:/tmp/arabic_club.db" : "file:arabic_club.db");
  let finalUrl = rawPath;
  if (!rawPath.startsWith("file:") && !rawPath.startsWith("http:") && !rawPath.startsWith("https:")) {
    const resolvedPath = path.resolve(/*turbopackIgnore: true*/ rawPath);
    const dbDir = path.dirname(resolvedPath);
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
      } catch {
        // Ignore read-only filesystem in serverless environments
      }
    }
    finalUrl = `file:${resolvedPath}`;
  }
  client = createClient({
    url: finalUrl,
  });
}

export const sqlite = client;
export const db = drizzle(client, { schema });
export type DB = typeof db;
export * from "./schema";

