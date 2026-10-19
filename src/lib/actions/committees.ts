/**
 * @file src/lib/actions/committees.ts
 * @description Secure Server Actions for Committee Terms & Historical Preservation (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages academic governing terms and executive officer assignments.
 * - Strict Historical Preservation Rule: When creating or activating a new term, previous
 *   terms remain preserved forever in the database without destructive overwrites.
 * - Enforces role-based access control with "committees:manage".
 * - Logs all modifications to immutable audit_logs via recordAuditLog.
 * - Revalidates public /leadership page immediately so visitors see accurate term history.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { committeeTerms } from "@/lib/db/schema";
import { recordAuditLog } from "@/lib/auth/audit";
import { 
  createCommitteeTerm, 
  updateCommitteeTerm, 
  deleteCommitteeTerm,
  assignMemberToCommittee,
  deleteCommitteeAssignment
} from "@/lib/db/queries";
import { eq } from "drizzle-orm";

const CommitteeTermSchema = z.object({
  id: z.string().optional(),
  academicYear: z.string().min(4, "Academic year is required (e.g. 2025–2026)").max(30),
  titleEn: z.string().min(3, "English title is required").max(120),
  titleAr: z.string().max(140).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional().nullable().or(z.literal("")),
  isCurrent: z.boolean().default(false),
  summaryEn: z.string().max(1000).optional().nullable(),
  summaryAr: z.string().max(1000).optional().nullable(),
});

export async function saveCommitteeTermAction(input: {
  id?: string;
  academicYear: string;
  titleEn: string;
  titleAr?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  summaryEn?: string | null;
  summaryAr?: string | null;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "committees:manage")) {
    return { success: false, error: "Forbidden: You lack 'committees:manage' permissions." };
  }

  const parsed = CommitteeTermSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Validate date span logic
  if (parsed.data.endDate && parsed.data.startDate > parsed.data.endDate) {
    return { success: false, error: "Start date must precede or equal end date." };
  }

  try {
    let termId = parsed.data.id;

    if (termId) {
      await updateCommitteeTerm(termId, {
        academicYear: parsed.data.academicYear,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate || null,
        isCurrent: parsed.data.isCurrent,
        summaryEn: parsed.data.summaryEn,
        summaryAr: parsed.data.summaryAr,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "COMMITTEE_TERM_UPDATE",
        targetEntity: "committee_terms",
        targetId: termId,
        details: {
          academicYear: parsed.data.academicYear,
          isCurrent: parsed.data.isCurrent,
          adminEmail: session.email,
        },
      });
    } else {
      termId = await createCommitteeTerm({
        academicYear: parsed.data.academicYear,
        titleEn: parsed.data.titleEn,
        titleAr: parsed.data.titleAr,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate || null,
        isCurrent: parsed.data.isCurrent,
        summaryEn: parsed.data.summaryEn,
        summaryAr: parsed.data.summaryAr,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "COMMITTEE_TERM_CREATE",
        targetEntity: "committee_terms",
        targetId: termId,
        details: {
          academicYear: parsed.data.academicYear,
          isCurrent: parsed.data.isCurrent,
          adminEmail: session.email,
        },
      });
    }

    revalidatePath("/admin/committees");
    revalidatePath("/leadership");
    revalidatePath("/about");

    return { success: true, termId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save committee term." };
  }
}

export async function deleteCommitteeTermAction(termId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "committees:manage")) {
    return { success: false, error: "Forbidden: You lack 'committees:manage' permissions." };
  }

  try {
    const [term] = await db.select().from(committeeTerms).where(eq(committeeTerms.id, termId)).limit(1);
    if (!term) {
      return { success: false, error: "Term not found." };
    }

    if (term.isCurrent) {
      return { 
        success: false, 
        error: "Cannot delete the currently active governing term. Please designate another term as active first." 
      };
    }

    await deleteCommitteeTerm(termId);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "COMMITTEE_TERM_DELETE",
      targetEntity: "committee_terms",
      targetId: termId,
      details: { academicYear: term.academicYear, adminEmail: session.email },
    });

    revalidatePath("/admin/committees");
    revalidatePath("/leadership");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete committee term." };
  }
}

const CommitteeAssignmentSchema = z.object({
  termId: z.string().min(1, "Term ID is required"),
  memberId: z.string().min(1, "Member selection is required"),
  positionTitleEn: z.string().min(2, "English position title is required").max(100),
  positionTitleAr: z.string().max(120).optional().nullable(),
  rankOrder: z.number().int().min(1).max(999).default(100),
  roleDescription: z.string().max(500).optional().nullable(),
});

export async function assignCommitteeMemberAction(input: {
  termId: string;
  memberId: string;
  positionTitleEn: string;
  positionTitleAr?: string | null;
  rankOrder?: number;
  roleDescription?: string | null;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "committees:manage")) {
    return { success: false, error: "Forbidden: You lack 'committees:manage' permissions." };
  }

  const parsed = CommitteeAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const assignmentId = await assignMemberToCommittee({
      termId: parsed.data.termId,
      memberId: parsed.data.memberId,
      positionTitleEn: parsed.data.positionTitleEn,
      positionTitleAr: parsed.data.positionTitleAr,
      rankOrder: parsed.data.rankOrder,
      roleDescription: parsed.data.roleDescription,
    });

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "COMMITTEE_OFFICER_ASSIGNED",
      targetEntity: "committee_assignments",
      targetId: assignmentId,
      details: {
        termId: parsed.data.termId,
        memberId: parsed.data.memberId,
        positionTitleEn: parsed.data.positionTitleEn,
        adminEmail: session.email,
      },
    });

    revalidatePath("/admin/committees");
    revalidatePath("/leadership");

    return { success: true, assignmentId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to assign committee officer." };
  }
}

export async function removeCommitteeMemberAction(assignmentId: string, termId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "committees:manage")) {
    return { success: false, error: "Forbidden: You lack 'committees:manage' permissions." };
  }

  try {
    await deleteCommitteeAssignment(assignmentId);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "COMMITTEE_OFFICER_REMOVED",
      targetEntity: "committee_assignments",
      targetId: assignmentId,
      details: { assignmentId, termId, adminEmail: session.email },
    });

    revalidatePath("/admin/committees");
    revalidatePath("/leadership");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove officer assignment." };
  }
}
