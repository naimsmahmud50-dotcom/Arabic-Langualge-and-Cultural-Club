/**
 * DEVELOPER NOTE:
 * File: src/lib/logger.ts
 * Purpose: Structured asynchronous JSON error logger and monitoring utility.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import fs from "fs";
import path from "path";

export type LogLevel = "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "csrf",
  "key",
  "apikey",
  "api_key",
  "creditcard",
]);

/**
 * Deeply scrubs sensitive tokens, passwords, and cookies from metadata before logging.
 */
function sanitizeMetadata(obj: unknown, depth = 0): unknown {
  if (depth > 5) return "[Truncated]";
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMetadata(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizeMetadata(val, depth + 1);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

class StructuredLogger {
  private logDir: string;
  private appLogPath: string;
  private errorLogPath: string;

  constructor() {
    this.logDir = path.resolve(process.cwd(), "logs");
    this.appLogPath = path.join(this.logDir, "app.log");
    this.errorLogPath = path.join(this.logDir, "app-error.log");
    this.ensureDirectory();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch {
      // Ignore directory creation failure in read-only environments
    }
  }

  private writeToFile(filePath: string, line: string) {
    try {
      this.ensureDirectory();
      fs.appendFileSync(filePath, line + "\n", { encoding: "utf-8" });
    } catch {
      // Fallback silently without throwing unhandled exceptions
    }
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>, err?: Error | unknown, context?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (err instanceof Error) {
      entry.error = {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    } else if (err && typeof err === "object") {
      entry.error = {
        name: "CustomError",
        message: JSON.stringify(err),
      };
    }

    if (meta) {
      entry.metadata = sanitizeMetadata(meta) as Record<string, unknown>;
    }

    const jsonLine = JSON.stringify(entry);

    // Write to console with clear level formatting
    if (level === "error" || level === "fatal") {
      console.error(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, entry.error || "");
      this.writeToFile(this.errorLogPath, jsonLine);
    } else if (level === "warn") {
      console.warn(`[${entry.timestamp}] [WARN] ${message}`);
    } else {
      console.log(`[${entry.timestamp}] [INFO] ${message}`);
    }

    this.writeToFile(this.appLogPath, jsonLine);
  }

  public info(message: string, meta?: Record<string, unknown>, context?: string) {
    this.log("info", message, meta, undefined, context);
  }

  public warn(message: string, meta?: Record<string, unknown>, context?: string) {
    this.log("warn", message, meta, undefined, context);
  }

  public error(message: string, err?: Error | unknown, meta?: Record<string, unknown>, context?: string) {
    this.log("error", message, meta, err, context);
  }

  public fatal(message: string, err?: Error | unknown, meta?: Record<string, unknown>, context?: string) {
    this.log("fatal", message, meta, err, context);
  }
}

export const logger = new StructuredLogger();
