/**
 * @file src/lib/actions/membership-application.ts
 * @description Next.js Server Actions for Membership Admissions & Application Lifecycle.
 * 
 * ARCHITECTURE & ROLE IN ARABIC CLUB SYSTEM:
 * - Handles validated public submission of membership applications.
 * - Handles dual-verification application status tracking without exposing private PII.
 * - Handles self-service withdrawal for pending dossiers.
 * - Handles administrative review decisions with immutable audit log recording.
 * - Fulfills Requirements REQ-PUB-13, REQ-ADM-06, and SPEC-APP-01 through SPEC-APP-13.
 * 
 * STRIX-SUPABASE SECURITY SAFEGUARDS:
 * 1. Server-side execution only: zero client database credentials.
 * 2. Sliding-window IP rate limiter: max 5 application attempts per 15-minute window.
 * 3. Strict Zod validation: checks all academic, personal, and motivation fields.
 * 4. Duplicate prevention: rejects active duplicate submissions by email and student ID.
 * 5. Tamper-resistant Reference IDs (e.g. APP-2026-F91B02).
 * 6. Dual-factor status checks: requires matching BOTH Reference ID and Email.
 * 7. Immutable audit logging: records reviewer identity and previous/new status.
 * 8. Zero PII logging: prevents personal contact details from being dumped to stdout.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { 
  submitMembershipApplication, 
  getMembershipApplicationStatus, 
  withdrawMembershipApplication, 
  reviewMembershipApplication,
  SubmitMembershipApplicationInput 
} from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";

// ----------------------------------------------------------------------
// SLIDING WINDOW RATE LIMITER (Abuse Prevention)
// ----------------------------------------------------------------------

const APPLICATION_RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_APPLICATIONS_PER_WINDOW = 5;

interface RateRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateRecord>();

function checkApplicationRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - APPLICATION_RATE_WINDOW_MS;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  const activeTimestamps = record.timestamps.filter(t => t > windowStart);

  if (activeTimestamps.length >= MAX_APPLICATIONS_PER_WINDOW) {
    const oldestInWindow = activeTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + APPLICATION_RATE_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: activeTimestamps });
  return { allowed: true, retryAfterSeconds: 0 };
}

// Anti-enumeration tracking rate limiter (15 status lookups per 10 minutes per IP)
const TRACKING_RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_TRACKING_PER_WINDOW = 15;
const trackingRateLimitStore = new Map<string, RateRecord>();

function checkTrackingRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - TRACKING_RATE_WINDOW_MS;

  const record = trackingRateLimitStore.get(identifier) || { timestamps: [] };
  const activeTimestamps = record.timestamps.filter(t => t > windowStart);

  if (activeTimestamps.length >= MAX_TRACKING_PER_WINDOW) {
    const oldestInWindow = activeTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + TRACKING_RATE_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  activeTimestamps.push(now);
  trackingRateLimitStore.set(identifier, { timestamps: activeTimestamps });
  return { allowed: true, retryAfterSeconds: 0 };
}

import {
  MembershipApplicationSchema,
  StatusTrackingSchema,
  type MembershipApplicationInput,
  type StatusTrackingInput,
} from "@/lib/validations/membership";

// ----------------------------------------------------------------------
// SERVER ACTIONS
// ----------------------------------------------------------------------

export interface ApplicationSubmissionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  application?: {
    id: string;
    referenceNo: string;
    applicantName: string;
    email: string;
    status: string;
    createdAt: Date;
  };
}

/**
 * Server Action: Submit a verified membership application dossier.
 */
export async function submitMembershipApplicationAction(
  rawInput: unknown
): Promise<ApplicationSubmissionResult> {
  // 1. IP Rate Limiting Check
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const rateCheck = checkApplicationRateLimit(`app_submit_${clientIp}`);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Too many submissions from this connection. For institutional security, please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
    };
  }

  // 2. Validate input against Zod schema
  const parseResult = MembershipApplicationSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      error: "Please review and correct the errors indicated on the application form.",
      fieldErrors,
    };
  }

  // 3. Database persistence with duplicate detection
  try {
    const createdApp = await submitMembershipApplication(parseResult.data as SubmitMembershipApplicationInput);
    revalidatePath("/admin/applications");

    return {
      success: true,
      application: createdApp,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while persisting your application. Please try again.",
    };
  }
}

export interface StatusTrackingResult {
  success: boolean;
  error?: string;
  application?: {
    referenceNo: string;
    applicantName: string;
    applicantNameAr: string | null;
    category: string;
    status: string;
    reviewerNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    reviewedAt: Date | null;
  } | null;
}

/**
 * Server Action: Securely query application status via dual-factor lookup (Reference ID + Email).
 */
export async function trackApplicationStatusAction(
  rawInput: unknown
): Promise<StatusTrackingResult> {
  // 1. IP Rate Limiting Check to prevent brute-force Reference ID enumeration
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const rateCheck = checkTrackingRateLimit(`app_track_${clientIp}`);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Too many lookup attempts from this connection. For institutional security, please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const parseResult = StatusTrackingSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid reference number or email format.",
    };
  }

  const { referenceNo, email } = parseResult.data;

  try {
    const record = await getMembershipApplicationStatus(referenceNo, email);
    if (!record) {
      return {
        success: false,
        error: "No application matching this Reference Number and Email address was found. Please check your credentials.",
      };
    }

    return {
      success: true,
      application: record,
    };
  } catch (err: any) {
    return {
      success: false,
      error: "Unable to retrieve status at this time. Please try again later.",
    };
  }
}

export interface WithdrawalResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Server Action: Self-service withdrawal of a pending application.
 */
export async function withdrawApplicationAction(
  rawInput: unknown
): Promise<WithdrawalResult> {
  const parseResult = StatusTrackingSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid withdrawal credentials provided.",
    };
  }

  const { referenceNo, email } = parseResult.data;

  try {
    await withdrawMembershipApplication(referenceNo, email);
    revalidatePath("/admin/applications");
    revalidatePath("/membership");

    return {
      success: true,
      message: "Your membership application has been formally withdrawn.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to process withdrawal.",
    };
  }
}

export interface ReviewApplicationInput {
  applicationId: string;
  status: "approved" | "rejected" | "under_review";
  reviewerNotes?: string;
}

/**
 * Server Action: Administrative review decision on a submitted application dossier.
 * Strictly asserts RBAC permission `admissions:review`.
 */
export async function reviewMembershipApplicationAction(
  input: ReviewApplicationInput
): Promise<{ success: boolean; error?: string }> {
  // 1. Session verification & RBAC check
  const sessionUser = await getSession();
  if (!sessionUser) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  const canReview = hasPermission(sessionUser.role, "applications:manage") || 
                    sessionUser.role === "super_admin" || 
                    sessionUser.role === "administrator";
  if (!canReview) {
    return { success: false, error: "Forbidden: You do not possess admissions review authority." };
  }

  if (!input.applicationId || !input.status) {
    return { success: false, error: "Missing application ID or review decision." };
  }

  try {
    await reviewMembershipApplication(
      input.applicationId,
      sessionUser.id,
      input.status,
      input.reviewerNotes
    );

    revalidatePath("/admin/applications");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to record admissions review decision.",
    };
  }
}
