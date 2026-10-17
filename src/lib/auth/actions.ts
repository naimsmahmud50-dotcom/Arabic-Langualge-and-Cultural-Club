/**
 * @file src/lib/auth/actions.ts
 * @description Next.js Server Actions for Authentication, Password Reset, and User Provisioning.
 * 
 * SECURITY MANDATE:
 * - Direct execution on server; never exposes database credentials or internal hashes to client.
 * - Server-side validation via Zod schemas.
 * - Brute force rate limiting on all authentication entry points.
 * - Least-privilege authorization assertions on user provisioning.
 * - Sensitive audit logging on all administrative lifecycle transitions.
 */

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import { createSession, destroySession, destroyAllUserSessions, getSession } from "./session";
import { checkLoginRateLimit, recordLoginAttempt } from "./rate-limit";
import { recordAuditLog } from "./audit";
import { assertPermission } from "./rbac";
import { Role, ActionResponse } from "./types";

/**
 * Validation schema for administrator login.
 */
const LoginSchema = z.object({
  email: z.string().email("Please provide a valid institutional email address.").toLowerCase().trim(),
  password: z.string().min(1, "Password is required."),
});

/**
 * Validation schema for password reset request.
 */
const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address.").toLowerCase().trim(),
});

/**
 * Validation schema for password reset execution.
 */
const ResetPasswordSchema = z.object({
  token: z.string().min(10, "A valid reset token is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirmation password is required."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

/**
 * Validation schema for user provisioning by Super Admin.
 */
const ProvisionUserSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  fullName: z.string().min(2, "Full name must be at least 2 characters.").trim(),
  role: z.enum([
    "super_admin",
    "administrator",
    "content_editor",
    "membership_manager",
    "event_manager",
    "president",
    "secretary",
    "media_manager",
    "read_only",
  ]),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

/**
 * Helper to safely extract client network information from request headers.
 */
async function getClientContext() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip") || "127.0.0.1";
  const userAgent = headerList.get("user-agent") || "Unknown Client";
  return { ip, userAgent };
}

/**
 * Server Action: Authenticates an administrator and creates a signed session.
 */
export async function loginAction(
  _prevState: ActionResponse<{ redirectUrl?: string }> | null,
  formData: FormData
): Promise<ActionResponse<{ redirectUrl?: string }>> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const validation = LoginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid input.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;
  const { ip, userAgent } = await getClientContext();

  // 1. Abuse protection & Rate limiting
  const rateLimit = await checkLoginRateLimit(ip, email);
  if (!rateLimit.allowed) {
    await recordAuditLog({
      userEmail: email,
      action: "LOGIN_BLOCKED_RATE_LIMIT",
      targetEntity: "auth",
      ipAddress: ip,
      details: { retryAfterSeconds: rateLimit.retryAfterSeconds },
    });

    return {
      success: false,
      message: `Account temporarily locked due to consecutive failed attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before retrying.`,
    };
  }

  // 2. Query user record
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!userRecord || !userRecord.isActive) {
    // Record failed attempt
    await recordLoginAttempt(ip, email, false);
    await recordAuditLog({
      userEmail: email,
      action: "LOGIN_FAILED",
      targetEntity: "auth",
      ipAddress: ip,
      details: { reason: "User not found or account deactivated" },
    });

    return {
      success: false,
      message: "Invalid credentials or inactive account.",
    };
  }

  // 3. Verify password
  const isPasswordValid = verifyPassword(password, userRecord.passwordHash);
  if (!isPasswordValid) {
    await recordLoginAttempt(ip, email, false);
    await recordAuditLog({
      userId: userRecord.id,
      userEmail: email,
      action: "LOGIN_FAILED",
      targetEntity: "auth",
      ipAddress: ip,
      details: { reason: "Invalid password supplied" },
    });

    return {
      success: false,
      message: "Invalid credentials or inactive account.",
    };
  }

  // 4. Record successful login
  await recordLoginAttempt(ip, email, true);
  await recordAuditLog({
    userId: userRecord.id,
    userEmail: email,
    action: "LOGIN_SUCCESS",
    targetEntity: "auth",
    ipAddress: ip,
    details: { role: userRecord.role },
  });

  // 5. Create server session
  await createSession(
    {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      role: userRecord.role as Role,
    },
    { ip, userAgent }
  );

  redirect("/admin");
}

/**
 * Server Action: Logs out the current administrator and revokes the active session.
 */
export async function logoutAction(): Promise<void> {
  const currentSession = await getSession();
  const { ip } = await getClientContext();

  if (currentSession) {
    await recordAuditLog({
      userId: currentSession.id,
      userEmail: currentSession.email,
      action: "LOGOUT_SUCCESS",
      targetEntity: "auth",
      ipAddress: ip,
    });
  }

  await destroySession();
  redirect("/admin/login");
}

/**
 * Server Action: Dispatches a password reset token for authorized administrators.
 */
export async function requestPasswordResetAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rawEmail = formData.get("email");
  const validation = ForgotPasswordSchema.safeParse({ email: rawEmail });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid email address.",
    };
  }

  const { email } = validation.data;
  const { ip } = await getClientContext();

  // Find user
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (user && user.isActive) {
    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      id: `tok_${crypto.randomBytes(12).toString("hex")}`,
      userId: user.id,
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

    await recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: "PASSWORD_RESET_REQUESTED",
      targetEntity: "auth",
      ipAddress: ip,
    });

    // In local development or demo fixtures, log the reset URL for verification
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n======================================================`);
      console.log(`[PASSWORD RESET DEMO URL for ${email}]:`);
      console.log(`/admin/reset-password?token=${rawToken}`);
      console.log(`======================================================\n`);
    }
  }

  // Consistent message regardless of whether user exists to prevent email enumeration
  return {
    success: true,
    message: "If an institutional account exists with this email address, password reset instructions have been generated.",
  };
}

/**
 * Server Action: Completes password reset given a valid one-time token.
 */
export async function resetPasswordAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rawToken = formData.get("token");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  const validation = ResetPasswordSchema.safeParse({
    token: rawToken,
    newPassword,
    confirmPassword,
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid input.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { token, newPassword: validatedPassword } = validation.data;
  const { ip } = await getClientContext();

  // Validate password complexity
  const strength = validatePasswordStrength(validatedPassword);
  if (!strength.isValid) {
    return {
      success: false,
      message: strength.errors.join(" "),
    };
  }

  // Lookup token by hash
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = new Date();

  const tokenRecord = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .get();

  if (!tokenRecord) {
    return {
      success: false,
      message: "The password reset token is invalid, expired, or has already been used.",
    };
  }

  // Hash new password using Scrypt
  const newPasswordHash = hashPassword(validatedPassword);

  // Update user password
  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: now,
    })
    .where(eq(users.id, tokenRecord.userId));

  // Mark token as used
  await db
    .update(passwordResetTokens)
    .set({
      usedAt: now,
    })
    .where(eq(passwordResetTokens.id, tokenRecord.id));

  // Invalidate all active sessions for this user for security
  await destroyAllUserSessions(tokenRecord.userId);

  await recordAuditLog({
    userId: tokenRecord.userId,
    action: "PASSWORD_RESET_SUCCESS",
    targetEntity: "auth",
    ipAddress: ip,
  });

  redirect("/admin/login?reset=success");
}

/**
 * Server Action: Provisions a new administrative user.
 * Protected by Least-Privilege RBAC: requires `users:manage` permission.
 */
export async function provisionUserAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // 1. Authorize calling session
  const callerSession = await getSession();
  if (!callerSession) {
    return {
      success: false,
      message: "Authentication required to perform user provisioning.",
    };
  }

  try {
    assertPermission(callerSession.role, "users:manage");
  } catch (err: unknown) {
    return {
      success: false,
      message: (err as Error).message || "Access denied: insufficient administrative permissions.",
    };
  }

  // 2. Validate input
  const validation = ProvisionUserSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Validation failed.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, fullName, role, password } = validation.data;
  const { ip } = await getClientContext();

  // Validate password strength
  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    return {
      success: false,
      message: strength.errors.join(" "),
    };
  }

  // Check email uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    return {
      success: false,
      message: `An account with email '${email}' already exists.`,
    };
  }

  // Hash password
  const newHash = hashPassword(password);
  const now = new Date();
  const newUserId = `usr_${crypto.randomBytes(10).toString("hex")}`;

  // Insert user
  await db.insert(users).values({
    id: newUserId,
    email,
    passwordHash: newHash,
    fullName,
    role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Record audit log
  await recordAuditLog({
    userId: callerSession.id,
    userEmail: callerSession.email,
    action: "USER_PROVISIONED",
    targetEntity: "users",
    targetId: newUserId,
    ipAddress: ip,
    details: {
      provisionedEmail: email,
      provisionedRole: role,
      provisionedFullName: fullName,
    },
  });

  return {
    success: true,
    message: `Administrative user '${fullName}' successfully provisioned with role '${role}'.`,
  };
}
