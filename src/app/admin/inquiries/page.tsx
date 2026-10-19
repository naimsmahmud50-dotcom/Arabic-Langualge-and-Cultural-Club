/**
 * @file src/app/admin/inquiries/page.tsx
 * @route /admin/inquiries
 * @description Administrative Correspondence Inbox & Inquiry Triage Queue.
 * 
 * ARCHITECTURE & ROLE:
 * - Authorized administrative repository containing incoming public and institutional inquiries.
 * - Allows Secretariat officers to review inquiries, update status, and record internal notes.
 * - Server Component fetching initial records with revalidate = 0, handing off to `AdminInquiriesClient`.
 * 
 * SECURITY:
 * - Edge middleware asserts `settings:manage` or `administrator`/`super_admin` permissions.
 * - Never exposes private inquiries publicly.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminInquiries } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { AdminInquiriesClient } from "./AdminInquiriesClient";
import { InquiryDossier } from "./InquiryDetailModal";

/**
 * DEVELOPER NOTE:
 * Server-side authorization guard enforcing active session and "settings:manage" RBAC permission.
 * Prevents unauthorized or unauthenticated access to confidential correspondence and inquiries.
 */

export const metadata: Metadata = {
  title: "Correspondence Inbox | Admin Console | Arabic Language & Cultural Club",
  description: "Review, triage, and reply to incoming institutional and student correspondence.",
};

export const revalidate = 0;

export default async function AdminInquiriesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/inquiries");
  }

  try {
    assertPermission(session.role, "settings:manage");
  } catch {
    redirect("/admin/forbidden");
  }

  const inquiries = await getAdminInquiries({ status: "all" }).catch(() => []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Correspondence & Inquiries Inbox"
        subtitle="Review, organize, and triage incoming institutional queries, debate invitations, and student correspondence"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <AdminInquiriesClient initialInquiries={inquiries as InquiryDossier[]} />
      </div>
    </div>
  );
}
