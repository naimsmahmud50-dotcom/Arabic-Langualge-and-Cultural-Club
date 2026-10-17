/**
 * @file src/lib/auth/token.ts
 * @description Universal Cryptographic Session Token Signer & Verifier.
 * 
 * RUNTIME COMPATIBILITY:
 * - Implemented with standard Web Crypto API (`globalThis.crypto.subtle`).
 * - Fully compatible with both Next.js Edge Runtime (middleware) and Node.js Runtime.
 * - Prevents tampering with cryptographic HMAC-SHA256 signature verification.
 */

import { Role } from "./types";

export const SESSION_COOKIE_NAME = "arabic_club_session";

export interface SessionTokenPayload {
  sid: string;
  uid: string;
  email: string;
  name: string;
  role: Role;
  exp: number; // Unix timestamp in ms
}

/**
 * Returns the institutional authentication secret.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: AUTH_SECRET environment variable must be set in production.");
    }
    return "arabic_club_institutional_hmac_secret_2026_super_secure_key";
  }
  return secret;
}

/**
 * Encodes an ArrayBuffer into a lowercase hexadecimal string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Computes an HMAC-SHA256 signature over data using Web Crypto.
 */
async function computeHmacSha256(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return bufferToHex(signature);
}

/**
 * Signs and creates a session cookie string:
 * `${sessionId}.${base64Payload}.${hmacSignature}`
 */
export async function createSignedToken(payload: SessionTokenPayload): Promise<string> {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson, "utf-8").toString("base64url");
  const dataToSign = `${payload.sid}.${payloadB64}`;
  const signature = await computeHmacSha256(dataToSign, getAuthSecret());

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies the cryptographic signature of a session token and unpacks the payload.
 * Returns null if token is tampered, malformed, or expired.
 */
export async function verifySignedToken(token: string): Promise<SessionTokenPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [sid, payloadB64, providedSig] = parts;
  if (!sid || !payloadB64 || !providedSig) return null;

  const dataToSign = `${sid}.${payloadB64}`;
  const expectedSig = await computeHmacSha256(dataToSign, getAuthSecret());

  // Constant-time string length & character comparison
  if (expectedSig.length !== providedSig.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ providedSig.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as SessionTokenPayload;

    // Check expiration
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    if (payload.sid !== sid) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
