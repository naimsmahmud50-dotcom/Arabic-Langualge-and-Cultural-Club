/**
 * @file src/lib/actions/events.ts
 * @description Secure Server Actions for Events, Annual Plans, and Attendee Registrations (Feature 016).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages club events dossiers, date/time scheduling, cancellation and postponement.
 * - Manages annual plan month-by-month itineraries (1-12) linked to academic years.
 * - Manages attendee registrations and attendance marking (attended, confirmed, cancelled).
 * - Enforces server-side RBAC with "events:manage" and "plans:manage".
 * - Records all mutations to immutable audit_logs via recordAuditLog.
 * - Revalidates public routes immediately (/events, /events/[slug]).
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/auth/audit";
import { 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getAdminEventById,
  updateEventRegistrationStatus,
  createAnnualPlanItem,
  updateAnnualPlanItem,
  deleteAnnualPlanItem
} from "@/lib/db/queries";

// ============================================================================
// 1. EVENT DOSSIER SCHEMAS & ACTIONS
// ============================================================================

const EventSchema = z.object({
  id: z.string().optional(),
  slug: z.string().max(120).optional(),
  titleEn: z.string().min(2, "English event title is required").max(140),
  titleAr: z.string().max(160).optional().nullable(),
  summaryEn: z.string().min(5, "Brief summary is required").max(300),
  summaryAr: z.string().max(350).optional().nullable(),
  descriptionEn: z.string().max(5000).optional().nullable(),
  descriptionAr: z.string().max(5000).optional().nullable(),
  category: z.string().min(2, "Category is required").max(60),
  startTime: z.string().min(1, "Start date and time are required"),
  endTime: z.string().optional().nullable().or(z.literal("")),
  venue: z.string().min(2, "Venue location is required").max(150),
  coverImageUrl: z.string().url("Valid image URL required").optional().nullable().or(z.literal("")),
  capacity: z.number().int().min(1, "Capacity must be at least 1 seat").max(10000).optional().nullable(),
  status: z.enum(["planned", "confirmed", "completed", "postponed", "cancelled"]).default("confirmed"),
  isRegistrationOpen: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export async function saveEventAction(input: {
  id?: string;
  slug?: string;
  titleEn: string;
  titleAr?: string | null;
  summaryEn: string;
  summaryAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  startTime: string; // ISO string or datetime-local
  endTime?: string | null;
  venue: string;
  coverImageUrl?: string | null;
  capacity?: number | null;
  status?: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  isRegistrationOpen?: boolean;
  isPublished?: boolean;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "events:manage")) {
    return { success: false, error: "Forbidden: You lack 'events:manage' permissions." };
  }

  const parsed = EventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  const startDate = new Date(parsed.data.startTime);
  const endDate = parsed.data.endTime ? new Date(parsed.data.endTime) : null;

  if (isNaN(startDate.getTime())) {
    return { success: false, error: "Invalid start date/time format." };
  }

  if (endDate && !isNaN(endDate.getTime()) && startDate > endDate) {
    return { success: false, error: "Start time must precede or equal end time." };
  }

  try {
    let eventId = parsed.data.id;

    if (eventId) {
      await updateEvent(eventId, {
        slug: parsed.data.slug || undefined,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        summaryEn: parsed.data.summaryEn,
        summaryAr: parsed.data.summaryAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        category: parsed.data.category,
        startTime: startDate,
        endTime: endDate,
        venue: parsed.data.venue,
        coverImageUrl: parsed.data.coverImageUrl || null,
        capacity: parsed.data.capacity !== undefined ? parsed.data.capacity : null,
        status: parsed.data.status,
        isRegistrationOpen: parsed.data.isRegistrationOpen,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "EVENT_UPDATE",
        targetEntity: "events",
        targetId: eventId,
        details: {
          titleEn: parsed.data.titleEn,
          status: parsed.data.status,
          isRegistrationOpen: parsed.data.isRegistrationOpen,
          adminEmail: session.email,
        },
      });
    } else {
      eventId = await createEvent({
        slug: parsed.data.slug || undefined,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr || null,
        summaryEn: parsed.data.summaryEn,
        summaryAr: parsed.data.summaryAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        category: parsed.data.category,
        startTime: startDate,
        endTime: endDate,
        venue: parsed.data.venue,
        coverImageUrl: parsed.data.coverImageUrl || null,
        capacity: parsed.data.capacity !== undefined ? parsed.data.capacity : null,
        status: parsed.data.status,
        isRegistrationOpen: parsed.data.isRegistrationOpen,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "EVENT_CREATE",
        targetEntity: "events",
        targetId: eventId,
        details: {
          titleEn: parsed.data.titleEn,
          category: parsed.data.category,
          adminEmail: session.email,
        },
      });
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true, eventId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save event dossier." };
  }
}

export async function updateEventStatusAction(
  eventId: string,
  status: "planned" | "confirmed" | "completed" | "postponed" | "cancelled",
  reason?: string
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "events:manage")) {
    return { success: false, error: "Forbidden: You lack 'events:manage' permissions." };
  }

  try {
    const existing = await getAdminEventById(eventId);
    if (!existing) {
      return { success: false, error: "Event record not found." };
    }

    await updateEvent(eventId, { status });

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "EVENT_STATUS_CHANGE",
      targetEntity: "events",
      targetId: eventId,
      details: {
        titleEn: existing.titleEn,
        previousStatus: existing.status,
        newStatus: status,
        reason: reason || null,
        adminEmail: session.email,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/events/${existing.slug}`);
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update event status." };
  }
}

export async function deleteEventAction(eventId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "events:manage")) {
    return { success: false, error: "Forbidden: You lack 'events:manage' permissions." };
  }

  try {
    const existing = await getAdminEventById(eventId);
    if (!existing) {
      return { success: false, error: "Event record not found." };
    }

    await deleteEvent(eventId);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "EVENT_DELETE",
      targetEntity: "events",
      targetId: eventId,
      details: { titleEn: existing.titleEn, slug: existing.slug, adminEmail: session.email },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete event." };
  }
}

// ============================================================================
// 2. ATTENDANCE & REGISTRATION MANAGEMENT ACTIONS
// ============================================================================

export async function updateRegistrationAttendanceAction(
  registrationId: string,
  eventId: string,
  status: "registered" | "confirmed" | "attended" | "cancelled"
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "events:manage")) {
    return { success: false, error: "Forbidden: You lack 'events:manage' permissions." };
  }

  try {
    await updateEventRegistrationStatus(registrationId, status);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "EVENT_REGISTRATION_STATUS_UPDATE",
      targetEntity: "event_registrations",
      targetId: registrationId,
      details: { eventId, newStatus: status, adminEmail: session.email },
    });

    revalidatePath("/admin/events");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update attendance status." };
  }
}

// ============================================================================
// 3. ANNUAL PLANS & MONTHLY ACTIVITIES SCHEDULER ACTIONS
// ============================================================================

const AnnualPlanActivitySchema = z.object({
  id: z.string().optional(),
  academicYear: z.string().min(4, "Academic year is required (e.g. 2024–2025)").max(30),
  monthNumber: z.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  activityTitleEn: z.string().min(2, "English activity title is required").max(140),
  activityTitleAr: z.string().max(160).optional().nullable(),
  descriptionEn: z.string().max(1000).optional().nullable(),
  descriptionAr: z.string().max(1000).optional().nullable(),
  category: z.string().min(2, "Category is required").max(60),
  status: z.enum(["planned", "confirmed", "completed", "postponed", "cancelled"]).default("planned"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must be in YYYY-MM-DD format").optional().nullable().or(z.literal("")),
  time: z.string().max(60).optional().nullable(),
  location: z.string().max(150).optional().nullable(),
  relatedEventId: z.string().optional().nullable().or(z.literal("")),
  documentUrl: z.string().url("Valid URL required").optional().nullable().or(z.literal("")),
  documentTitle: z.string().max(120).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export async function saveAnnualPlanActivityAction(input: {
  id?: string;
  academicYear: string;
  monthNumber: number;
  activityTitleEn: string;
  activityTitleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  status?: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  targetDate?: string | null;
  time?: string | null;
  location?: string | null;
  relatedEventId?: string | null;
  documentUrl?: string | null;
  documentTitle?: string | null;
  notes?: string | null;
  isPublished?: boolean;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "plans:manage")) {
    return { success: false, error: "Forbidden: You lack 'plans:manage' permissions." };
  }

  const parsed = AnnualPlanActivitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    let activityId = parsed.data.id;

    if (activityId) {
      await updateAnnualPlanItem(activityId, {
        academicYear: parsed.data.academicYear,
        monthNumber: parsed.data.monthNumber,
        activityTitleEn: parsed.data.activityTitleEn,
        activityTitleAr: parsed.data.activityTitleAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        category: parsed.data.category,
        status: parsed.data.status,
        targetDate: parsed.data.targetDate || null,
        time: parsed.data.time || null,
        location: parsed.data.location || null,
        relatedEventId: parsed.data.relatedEventId || null,
        documentUrl: parsed.data.documentUrl || null,
        documentTitle: parsed.data.documentTitle || null,
        notes: parsed.data.notes || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "ANNUAL_PLAN_UPDATE",
        targetEntity: "annual_plans",
        targetId: activityId,
        details: {
          activityTitleEn: parsed.data.activityTitleEn,
          academicYear: parsed.data.academicYear,
          monthNumber: parsed.data.monthNumber,
          adminEmail: session.email,
        },
      });
    } else {
      activityId = await createAnnualPlanItem({
        academicYear: parsed.data.academicYear,
        monthNumber: parsed.data.monthNumber,
        activityTitleEn: parsed.data.activityTitleEn,
        activityTitleAr: parsed.data.activityTitleAr || null,
        descriptionEn: parsed.data.descriptionEn || null,
        descriptionAr: parsed.data.descriptionAr || null,
        category: parsed.data.category,
        status: parsed.data.status,
        targetDate: parsed.data.targetDate || null,
        time: parsed.data.time || null,
        location: parsed.data.location || null,
        relatedEventId: parsed.data.relatedEventId || null,
        documentUrl: parsed.data.documentUrl || null,
        documentTitle: parsed.data.documentTitle || null,
        notes: parsed.data.notes || null,
        isPublished: parsed.data.isPublished,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "ANNUAL_PLAN_CREATE",
        targetEntity: "annual_plans",
        targetId: activityId,
        details: {
          activityTitleEn: parsed.data.activityTitleEn,
          academicYear: parsed.data.academicYear,
          monthNumber: parsed.data.monthNumber,
          adminEmail: session.email,
        },
      });
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true, activityId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save annual plan activity." };
  }
}

export async function deleteAnnualPlanActivityAction(activityId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "plans:manage")) {
    return { success: false, error: "Forbidden: You lack 'plans:manage' permissions." };
  }

  try {
    await deleteAnnualPlanItem(activityId);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ANNUAL_PLAN_DELETE",
      targetEntity: "annual_plans",
      targetId: activityId,
      details: { activityId, adminEmail: session.email },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete annual plan activity." };
  }
}
