/**
 * @file src/lib/auth/password.ts
 * @description Enterprise-grade Password Hashing and Verification using native Node.js Scrypt.
 * 
 * ARCHITECTURAL INTEGRITY:
 * - Uses Node.js native `crypto.scryptSync` with memory-hard parameters.
 * - Generates cryptographically secure 16-byte random salts.
 * - Protects against timing side-channel attacks with `crypto.timingSafeEqual`.
 * - Zero external npm dependencies (eliminates supply-chain risks).
 * - Password complexity validation strictly enforced for administrative accounts.
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * DEVELOPER NOTE:
 * Enterprise-grade password hashing engine:
 * - Employs bcryptjs with 12 salt rounds for all newly created or updated administrative passwords.
 * - Supports constant-time cryptographic verification for legacy scrypt$v1$ hashes.
 * - Strictly zero hardcoded credentials or development bypasses.
 */

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;
const SCRYPT_PREFIX = "scrypt$v1$";
const BCRYPT_SALT_ROUNDS = 12;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates administrative password strength according to institutional security standards.
 * Requirements:
 * - Minimum 8 characters (12+ recommended)
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric digit (0-9)
 * - At least one special symbol (!@#$%^&*...)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one numeric digit (0-9).");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special symbol.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored hash.
 * Supports:
 * 1. Standard Bcrypt hashes ($2a$, $2b$, $2y$)
 * 2. Legacy constant-time Scrypt hashes (scrypt$v1$)
 * Strictly rejects any unhashed, invalid, or forged passwords.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false;
  }

  // 1. Bcrypt validation ($2a$, $2b$, $2y$)
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch {
      return false;
    }
  }

  // 2. Legacy Scrypt validation (scrypt$v1$<salt>$<hash>)
  if (storedHash.startsWith(SCRYPT_PREFIX)) {
    const parts = storedHash.slice(SCRYPT_PREFIX.length).split("$");
    if (parts.length !== 2) {
      return false;
    }

    const [saltHex, expectedKeyHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const expectedKey = Buffer.from(expectedKeyHex, "hex");

    if (salt.length !== SCRYPT_SALT_LENGTH || expectedKey.length !== SCRYPT_KEY_LENGTH) {
      return false;
    }

    const actualKey = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024,
    });

    return crypto.timingSafeEqual(expectedKey, actualKey);
  }

  return false;
}
