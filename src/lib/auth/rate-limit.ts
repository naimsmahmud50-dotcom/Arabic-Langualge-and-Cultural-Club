/**
 * @file src/lib/auth/rate-limit.ts
 * @description Brute-force abuse protection and login attempt throttling.
 * 
 * ARCHITECTURE & DEFENSE STRATEGY:
 * - Employs a sliding time window (15 minutes) tracking failed login attempts per IP and email.
 * - Caps failed attempts at 5 within the window before triggering a lock.
 * - Records all attempts in the `login_attempts` database table for forensic inspection.
 * - Emits retry-after countdown to prevent automated credential stuffing.
 */

import { db } from "@/lib/db";
import { loginAttempts } from "@/lib/db/schema";
import { and, eq, gte, desc } from "drizzle-orm";
import crypto from "crypto";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

/**
 * Checks if a login attempt from a specific IP address and email target is currently permitted.
 */
export async function checkLoginRateLimit(
  ipAddress: string,
  email: string
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - WINDOW_MS);
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Count failed attempts by IP and email within the active window
    const recentFailures = await db
      .select({
        attemptedAt: loginAttempts.attemptedAt,
      })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.isSuccessful, false),
          eq(loginAttempts.ipAddress, ipAddress),
          eq(loginAttempts.email, normalizedEmail),
          gte(loginAttempts.attemptedAt, windowStart)
        )
      )
      .orderBy(desc(loginAttempts.attemptedAt));

    const failureCount = recentFailures.length;

    if (failureCount >= MAX_FAILED_ATTEMPTS) {
      // Find oldest failure in current block to compute cooldown
      const latestAttemptTime = recentFailures[0]?.attemptedAt.getTime() || Date.now();
      const elapsedSinceLatest = Date.now() - latestAttemptTime;
      const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - elapsedSinceLatest) / 1000));

      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS - failureCount,
      retryAfterSeconds: 0,
    };
  } catch (error) {
    console.error("[RateLimit] Error checking rate limit in database:", error);
    // Fail securely but don't crash the server: permit attempt while logging
    return {
      allowed: true,
      remainingAttempts: 1,
      retryAfterSeconds: 0,
    };
  }
}

/**
 * Persists an authentication attempt to the database for rate limiting and forensic tracking.
 */
export async function recordLoginAttempt(
  ipAddress: string,
  email: string,
  isSuccessful: boolean
): Promise<void> {
  try {
    await db.insert(loginAttempts).values({
      id: `att_${crypto.randomBytes(12).toString("hex")}`,
      ipAddress,
      email: email.trim().toLowerCase(),
      attemptedAt: new Date(),
      isSuccessful,
    });
  } catch (error) {
    console.error("[RateLimit] Error recording login attempt:", error);
  }
}
