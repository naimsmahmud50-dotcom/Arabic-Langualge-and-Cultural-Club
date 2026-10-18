/**
 * @file src/lib/actions/members.ts
 * @description Secure Server Actions for Member Records & Privacy Consent Management (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages verified member roster, status transitions, and public directory visibility consent.
 * - Strix Security & Privacy Guarantee:
 *   - Private fields (email, phone, studentId) are strictly excluded from public queries.
 *   - Only members who have isPublic === true are ever published on the public /members directory.
 * - Enforces role-based access control with "members:manage".
 * - Logs all status and privacy visibility changes to immutable audit_logs via recordAuditLog.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/auth/audit";
import { 
  createMember, 
  updateMember, 
  setMemberPublicVisibility, 
  updateMemberStatus, 
  deleteMember 
} from "@/lib/db/queries";

const MemberSchema = z.object({
  id: z.string().optional(),
  membershipId: z.string().max(40).optional(),
  fullNameEn: z.string().min(2, "English name is required").max(100),
  fullNameAr: z.string().max(120).optional().nullable(),
  photoUrl: z.string().url("Valid photo URL required").optional().nullable().or(z.literal("")),
  email: z.string().email("Valid institutional email is required"),
  phone: z.string().max(30).optional().nullable(),
  studentId: z.string().max(40).optional().nullable(),
  status: z.enum(["active", "alumni", "honorary", "suspended"]).default("active"),
  isPublic: z.boolean().default(false),
  bioEn: z.string().max(1000).optional().nullable(),
  bioAr: z.string().max(1000).optional().nullable(),
});

export async function saveMemberAction(input: {
  id?: string;
  membershipId?: string;
  fullNameEn: string;
  fullNameAr?: string | null;
  photoUrl?: string | null;
  email: string;
  phone?: string | null;
  studentId?: string | null;
  status?: "active" | "alumni" | "honorary" | "suspended";
  isPublic?: boolean;
  bioEn?: string | null;
  bioAr?: string | null;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "members:manage")) {
    return { success: false, error: "Forbidden: You lack 'members:manage' permissions." };
  }

  const parsed = MemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed." };
  }

  try {
    let memberId = parsed.data.id;

    if (memberId) {
      await updateMember(memberId, {
        fullNameEn: parsed.data.fullNameEn,
        fullNameAr: parsed.data.fullNameAr,
        photoUrl: parsed.data.photoUrl || null,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        studentId: parsed.data.studentId || null,
        status: parsed.data.status,
        isPublic: parsed.data.isPublic,
        bioEn: parsed.data.bioEn,
        bioAr: parsed.data.bioAr,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "MEMBER_PROFILE_UPDATE",
        targetEntity: "members",
        targetId: memberId,
        details: {
          fullNameEn: parsed.data.fullNameEn,
          status: parsed.data.status,
          isPublic: parsed.data.isPublic,
          adminEmail: session.email,
        },
      });
    } else {
      memberId = await createMember({
        membershipId: parsed.data.membershipId,
        fullNameEn: parsed.data.fullNameEn,
        fullNameAr: parsed.data.fullNameAr,
        photoUrl: parsed.data.photoUrl || null,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        studentId: parsed.data.studentId || null,
        status: parsed.data.status,
        isPublic: parsed.data.isPublic,
        bioEn: parsed.data.bioEn,
        bioAr: parsed.data.bioAr,
      });

      await recordAuditLog({
        userId: session.id,
        userEmail: session.email,
        action: "MEMBER_PROFILE_CREATE",
        targetEntity: "members",
        targetId: memberId,
        details: {
          fullNameEn: parsed.data.fullNameEn,
          status: parsed.data.status,
          isPublic: parsed.data.isPublic,
          adminEmail: session.email,
        },
      });
    }

    revalidatePath("/admin/members");
    revalidatePath("/members");
    revalidatePath("/admin");

    return { success: true, memberId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save member profile." };
  }
}

export async function updateMemberVisibilityAction(memberId: string, isPublic: boolean) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "members:manage")) {
    return { success: false, error: "Forbidden: You lack 'members:manage' permissions." };
  }

  try {
    await setMemberPublicVisibility(memberId, isPublic);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: isPublic ? "MEMBER_VISIBILITY_PUBLIC" : "MEMBER_VISIBILITY_PRIVATE",
      targetEntity: "members",
      targetId: memberId,
      details: { memberId, isPublic, adminEmail: session.email },
    });

    revalidatePath("/admin/members");
    revalidatePath("/members");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update member visibility." };
  }
}

export async function updateMemberStatusAction(
  memberId: string,
  status: "active" | "alumni" | "honorary" | "suspended"
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "members:manage")) {
    return { success: false, error: "Forbidden: You lack 'members:manage' permissions." };
  }

  try {
    await updateMemberStatus(memberId, status);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "MEMBER_STATUS_CHANGE",
      targetEntity: "members",
      targetId: memberId,
      details: { memberId, status, adminEmail: session.email },
    });

    revalidatePath("/admin/members");
    revalidatePath("/members");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update member status." };
  }
}

export async function deleteMemberAction(memberId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Active administrative session required." };
  }

  if (!hasPermission(session.role, "members:manage")) {
    return { success: false, error: "Forbidden: You lack 'members:manage' permissions." };
  }

  try {
    await deleteMember(memberId);

    await recordAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "MEMBER_PROFILE_DELETE",
      targetEntity: "members",
      targetId: memberId,
      details: { memberId, adminEmail: session.email },
    });

    revalidatePath("/admin/members");
    revalidatePath("/members");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete member." };
  }
}
