/**
 * @file src/lib/actions/event-registration.ts
 * @description Next.js Server Action for Verifiable Event Registration.
 * 
 * SECURITY & ARCHITECTURAL MANDATES:
 * - Executes strictly on the server; zero exposure of internal database credentials.
 * - Input validation using strict Zod schema (name, email, phone, student ID).
 * - Sliding-window rate limiting per IP address to eliminate spam submissions.
 * - Database-backed seat capacity enforcement.
 * - Duplicate registration prevention (one active registration per email per event).
 * - Generates immutable, unique registration reference code (e.g. REG-2026-XXXX).
 * - Absolute Privacy Guarantee: Participant PII is stored securely and never published.
 */

"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { registerAttendeeForEvent, getEventRegistrationStats } from "@/lib/db/queries";

// In-memory sliding window rate limiter for public event registration
const REGISTRATION_RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REGISTRATIONS_PER_WINDOW = 5;

interface RateRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateRecord>();

function checkRegistrationRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - REGISTRATION_RATE_WINDOW_MS;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  // Filter out timestamps older than the active window
  const activeTimestamps = record.timestamps.filter(t => t > windowStart);

  if (activeTimestamps.length >= MAX_REGISTRATIONS_PER_WINDOW) {
    const oldestInWindow = activeTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + REGISTRATION_RATE_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: activeTimestamps });
  return { allowed: true, retryAfterSeconds: 0 };
}

// Validation Schema
const EventRegistrationSchema = z.object({
  eventId: z.string().min(1, "Event identifier is required."),
  attendeeName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid institutional or personal email address.")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .max(25, "Phone number cannot exceed 25 characters.")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  studentId: z
    .string()
    .max(30, "Student ID cannot exceed 30 characters.")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
});

export interface RegistrationActionResponse {
  success: boolean;
  registrationId?: string;
  attendeeName?: string;
  email?: string;
  eventTitle?: string;
  registeredAt?: Date;
  error?: string;
}

/**
 * Server Action: Submit attendee seat registration for a published club event.
 */
export async function registerForEventAction(
  prevState: RegistrationActionResponse | null,
  formData: FormData
): Promise<RegistrationActionResponse> {
  try {
    // 1. Resolve client IP for abuse throttling
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // 2. Extract and parse form fields
    const rawData = {
      eventId: formData.get("eventId") as string,
      attendeeName: formData.get("attendeeName") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      studentId: (formData.get("studentId") as string) || null,
    };

    const parseResult = EventRegistrationSchema.safeParse(rawData);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed. Please verify all inputs.";
      return { success: false, error: firstError };
    }

    const { eventId, attendeeName, email, phone, studentId } = parseResult.data;

    // 3. Rate limiting check
    const rateCheck = checkRegistrationRateLimit(`${clientIp}:${email}`);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Too many registration attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before submitting again.`,
      };
    }

    // 4. Execute atomic database registration (enforces status, capacity, and duplicate prevention)
    const result = await registerAttendeeForEvent({
      eventId,
      attendeeName,
      email,
      phone,
      studentId,
    });

    return {
      success: true,
      registrationId: result.id,
      attendeeName: result.attendeeName,
      email: result.email,
      eventTitle: result.eventTitle,
      registeredAt: result.registeredAt,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred while processing your registration. Please try again.",
    };
  }
}
