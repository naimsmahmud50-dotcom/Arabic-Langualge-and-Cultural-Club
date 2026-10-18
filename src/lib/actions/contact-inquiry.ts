/**
 * @file src/lib/actions/contact-inquiry.ts
 * @description Secure Server Actions for Public Inquiries, Rate Limiting, and Honest Delivery Fallback.
 * 
 * ARCHITECTURE & STRIX SECURITY GUARANTEES:
 * 1. Sliding-Window Rate Limiter: Max 3 submissions per 15 minutes per IP.
 * 2. Invisible Honeypot Anti-Spam: Traps automated bots without CAPTCHA friction.
 * 3. Honest Delivery Reporting: Checks if SMTP transport credentials exist in server environment.
 *    - If unconfigured, marks `stored_locally` and informs user honestly without false claims.
 * 4. Zero PII Exposure: Never logs message content to stdout or client bundles.
 * 5. RBAC Protection on Admin Status Updates: Restricts triage to authorized personnel.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses clean academic phrasing and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { 
  submitContactInquiry, 
  updateInquiryStatus, 
  getInquiryById 
} from "@/lib/db/queries";

// ----------------------------------------------------------------------
// 1. IN-MEMORY SLIDING-WINDOW RATE LIMITER
// ----------------------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const inquiryRateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_WINDOW = 3; // 3 inquiries per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = inquiryRateLimits.get(ip) || { timestamps: [] };
  
  // Filter out expired timestamps
  const validTimestamps = record.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return true;
  }
  
  validTimestamps.push(now);
  inquiryRateLimits.set(ip, { timestamps: validTimestamps });
  return false;
}

// ----------------------------------------------------------------------
// 2. INPUT VALIDATION SCHEMAS
// ----------------------------------------------------------------------
export const ContactInquirySchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid correspondence email address.")
    .max(150, "Email address is too long.")
    .toLowerCase()
    .trim(),
  department: z
    .enum(["general", "academic", "debate", "membership", "media"])
    .default("general"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters.")
    .max(200, "Subject cannot exceed 200 characters.")
    .trim(),
  message: z
    .string()
    .min(10, "Message must contain at least 10 characters.")
    .max(3000, "Message cannot exceed 3000 characters.")
    .trim(),
  // Anti-Spam Honeypot: Must be empty
  website_url: z
    .string()
    .optional()
    .nullable(),
});

export type ContactInquiryInput = z.infer<typeof ContactInquirySchema>;

export interface InquirySubmissionResult {
  success: boolean;
  referenceNo?: string;
  deliveryStatus?: "stored_locally" | "delivered_smtp" | "delivery_failed";
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

// ----------------------------------------------------------------------
// 3. SERVER ACTION: SUBMIT CONTACT INQUIRY
// ----------------------------------------------------------------------
export async function submitContactInquiryAction(
  rawInput: unknown
): Promise<InquirySubmissionResult> {
  // A. Determine Client IP for Rate Limiting & Audit
  let clientIp = "127.0.0.1";
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const realIp = headerList.get("x-real-ip");
    clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";
  } catch {
    // Safe fallback when executed in test scripts outside request context
    clientIp = "127.0.0.1";
  }

  // B. Anti-Abuse Rate Limiting
  if (isRateLimited(clientIp)) {
    return {
      success: false,
      error: "Transmission limit reached. In accordance with server security policies, you may only dispatch 3 inquiries per 15 minutes. Please wait before attempting another transmission.",
    };
  }

  // C. Zod Schema Validation
  const parseResult = ContactInquirySchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    parseResult.error.issues.forEach(issue => {
      const field = issue.path[0];
      if (field) {
        fieldErrors[field.toString()] = issue.message;
      }
    });

    return {
      success: false,
      error: "Please review the highlighted fields and correct the validation errors.",
      fieldErrors,
    };
  }

  const { fullName, email, department, subject, message, website_url } = parseResult.data;

  // D. Anti-Spam Honeypot Trap
  // If the hidden website_url field is filled by an automated bot, drop silently
  if (website_url && website_url.trim().length > 0) {
    // Return mock success to mislead malicious bots
    return {
      success: true,
      referenceNo: `INQ-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      deliveryStatus: "stored_locally",
      message: "Your inquiry has been accepted by the Secretariat queue.",
    };
  }

  // E. Check SMTP Transport Configuration
  // Do not report an email as sent unless configured provider confirms successful delivery.
  const hasSmtpConfig = !!(
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS
  );

  let deliveryStatus: "stored_locally" | "delivered_smtp" | "delivery_failed" = "stored_locally";
  let honestDeliveryNote = "";

  if (hasSmtpConfig) {
    // If SMTP credentials were provided, we could attempt email relay here.
    // In this deployment, fallback to stored_locally until external mail relay is authorized.
    deliveryStatus = "stored_locally";
    honestDeliveryNote = "Your inquiry has been safely logged in the Secretariat database and flagged for staff review.";
  } else {
    // Honest Fallback: Inform user transparently that SMTP is unconfigured and message is securely stored locally.
    deliveryStatus = "stored_locally";
    honestDeliveryNote = "Your inquiry has been safely recorded in the Secretariat database. (Notice: External SMTP email relay is currently unconfigured; the Secretariat processes incoming correspondence directly via the internal administrative console).";
  }

  try {
    const persisted = await submitContactInquiry({
      fullName,
      email,
      department,
      subject,
      message,
      ipAddress: clientIp,
      deliveryStatus,
    });

    try {
      revalidatePath("/admin/inquiries");
      revalidatePath("/contact");
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      referenceNo: persisted.referenceNo,
      deliveryStatus: persisted.deliveryStatus as any,
      message: honestDeliveryNote,
    };
  } catch (err: any) {
    return {
      success: false,
      error: "An unexpected error occurred while persisting your inquiry. Please try again later or reach out directly to contact@arabicclub.internal.",
    };
  }
}

// ----------------------------------------------------------------------
// 4. SERVER ACTION: UPDATE INQUIRY STATUS (ADMIN ONLY)
// ----------------------------------------------------------------------
export interface UpdateInquiryStatusInput {
  inquiryId: string;
  status: "unread" | "read" | "replied" | "archived";
  adminNotes?: string;
}

export async function updateInquiryStatusAction(
  input: UpdateInquiryStatusInput
): Promise<{ success: boolean; error?: string }> {
  // A. Session & RBAC Verification
  const sessionUser = await getSession();
  if (!sessionUser) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  const canManage = hasPermission(sessionUser.role, "settings:manage") || 
                    sessionUser.role === "super_admin" || 
                    sessionUser.role === "administrator";
  if (!canManage) {
    return { success: false, error: "Forbidden: You lack permissions to triage correspondence inquiries." };
  }

  if (!input.inquiryId || !input.status) {
    return { success: false, error: "Missing required inquiry ID or status transition." };
  }

  try {
    await updateInquiryStatus(input.inquiryId, input.status, input.adminNotes);

    // Audit Logging
    await db.insert(auditLogs).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: sessionUser.id,
      userEmail: sessionUser.email,
      action: `inquiry_status_${input.status}`,
      targetEntity: "contact_inquiry",
      targetId: input.inquiryId,
      detailsJson: JSON.stringify({
        status: input.status,
        notes: input.adminNotes || null,
      }),
      createdAt: new Date(),
    });

    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to update inquiry status.",
    };
  }
}
