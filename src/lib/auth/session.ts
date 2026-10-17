/**
 * @file src/lib/auth/session.ts
 * @description Secure Session Management with HMAC Signing and Database State.
 * 
 * ARCHITECTURE & DEFENSE IN DEPTH:
 * - Sessions are server-managed, stored in the `sessions` database table, and can be revoked instantly.
 * - Session cookies are signed with HMAC-SHA256 (`${sessionId}.${base64Payload}.${signature}`).
 * - Tampering with the cookie signature invalidates authentication immediately.
 * - Cookie attributes enforce: httpOnly, sameSite="lax", secure (in production), path="/".
 * - Session lifetime is set to 7 days by default.
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { SessionUser, Role } from "./types";
import { createSignedToken, verifySignedToken, SESSION_COOKIE_NAME } from "./token";

export { SESSION_COOKIE_NAME };

const SESSION_TTL_DAYS = 7;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Creates a new server session in the database and sets the signed HTTP-only cookie.
 */
export async function createSession(
  user: { id: string; email: string; fullName: string; role: Role },
  reqInfo?: { ip?: string; userAgent?: string }
): Promise<string> {
  const sessionId = `ses_${crypto.randomBytes(24).toString("hex")}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  // 1. Insert session record into database
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    role: user.role,
    userEmail: user.email,
    fullName: user.fullName,
    expiresAt,
    createdAt: now,
    ipAddress: reqInfo?.ip || null,
    userAgent: reqInfo?.userAgent || null,
  });

  // 2. Create signed session token
  const signedToken = await createSignedToken({
    sid: sessionId,
    uid: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role,
    exp: expiresAt.getTime(),
  });

  // 3. Set signed cookie in client headers
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionId;
}

/**
 * Reads and verifies the current session from request cookies and database.
 * Returns the SessionUser or null if unauthenticated, expired, or deactivated.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    const payload = await verifySignedToken(cookie.value);
    if (!payload) return null;

    const now = new Date();

    // Query active session joined with user to ensure account is still active and not revoked
    const activeSession = await db
      .select({
        sessionId: sessions.id,
        userId: sessions.userId,
        sessionRole: sessions.role,
        userEmail: sessions.userEmail,
        fullName: sessions.fullName,
        expiresAt: sessions.expiresAt,
        isUserActive: users.isActive,
        currentRole: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, payload.sid), gt(sessions.expiresAt, now)))
      .get();

    if (!activeSession) {
      return null;
    }

    if (!activeSession.isUserActive) {
      // Account has been deactivated: revoke session immediately
      await destroySession();
      return null;
    }

    return {
      id: activeSession.userId,
      email: activeSession.userEmail,
      fullName: activeSession.fullName,
      role: (activeSession.currentRole || activeSession.sessionRole) as Role,
      isActive: Boolean(activeSession.isUserActive),
    };
  } catch (error: unknown) {
    // Next.js dynamic bailout signal must be rethrown
    if ((error as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("[Session] Error retrieving current session:", error);
    return null;
  }
}

/**
 * Destroys the current session from the database and clears the HTTP-only cookie.
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (cookie?.value) {
      const payload = await verifySignedToken(cookie.value);
      if (payload?.sid) {
        await db.delete(sessions).where(eq(sessions.id, payload.sid));
      }
    }

    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  } catch (error) {
    console.error("[Session] Error destroying session:", error);
  }
}

/**
 * Revokes all active sessions for a specific user ID (used on password reset or deactivation).
 */
export async function destroyAllUserSessions(userId: string): Promise<void> {
  try {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  } catch (error) {
    console.error("[Session] Error revoking all user sessions:", error);
  }
}
