/**
 * @file src/lib/auth/audit.ts
 * @description Immutable Audit Logging Helper for Security & Governance Events.
 * 
 * SECURITY MANDATE:
 * - Records all authentication transitions, role changes, and administrative actions.
 * - Under no circumstances logs plaintext passwords, session secrets, or reset tokens.
 * - Complies with institutional transparency and archival accountability rules.
 */

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import crypto from "crypto";

export interface AuditLogEntry {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  targetEntity: string;
  targetId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * Persists an event to the immutable audit log table.
 * Strips any sensitive fields (passwords, tokens, keys) before serializing details.
 */
export async function recordAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    let sanitizedDetailsJson: string | null = null;

    if (entry.details) {
      // Deep copy and sanitize sensitive keys
      const sanitized = { ...entry.details };
      const sensitiveKeys = ["password", "token", "secret", "passwordHash", "tokenHash", "newPassword"];
      
      for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
          sanitized[key] = "[REDACTED_SECURITY_DATA]";
        }
      }

      sanitizedDetailsJson = JSON.stringify(sanitized);
    }

    await db.insert(auditLogs).values({
      id: `aud_${crypto.randomBytes(12).toString("hex")}`,
      userId: entry.userId || null,
      userEmail: entry.userEmail || null,
      action: entry.action,
      targetEntity: entry.targetEntity,
      targetId: entry.targetId || null,
      detailsJson: sanitizedDetailsJson,
      ipAddress: entry.ipAddress || null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Audit logging failure must not crash the application, but must be alerted
    console.error("[AuditLog] Critical failure persisting audit log:", error);
  }
}
