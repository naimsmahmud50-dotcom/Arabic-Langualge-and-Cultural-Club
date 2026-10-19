/**
 * @file src/app/admin/applications/page.tsx
 * @route /admin/applications
 * @description Administrative Membership Admissions Queue & Adjudication Pipeline.
 * 
 * ARCHITECTURE & ROLE:
 * - Central adjudication queue for student membership admissions dossiers.
 * - Allows committee reviewers to filter dossiers by status, examine academic
 *   credentials, evaluate Arabic proficiency, and record official decisions with notes.
 * - Server component fetching initial records with revalidate = 0, handing off to `AdminApplicationsClient`.
 * 
 * REQUIREMENTS COVERED:
 * - REQ-ADM-06: Administrative application management & status updates.
 * - SPEC-APP-04: Secure dossier review interface with immutable audit logging.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminMembershipApplications } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { AdminApplicationsClient } from "./AdminApplicationsClient";
import { ApplicationDossier } from "./ApplicationReviewModal";

/**
 * DEVELOPER NOTE:
 * Server-side authorization guard enforcing active session and "applications:manage" RBAC permission.
 * Prevents unauthorized or unauthenticated access to student admissions dossiers.
 */

export const metadata: Metadata = {
  title: "Admissions Review Queue | Admin Console | Arabic Language & Cultural Club",
  description: "Review, evaluate, and adjudicate incoming student membership application dossiers.",
};

export const revalidate = 0;

export default async function AdminApplicationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/applications");
  }

  try {
    assertPermission(session.role, "applications:manage");
  } catch {
    redirect("/admin/forbidden");
  }

  const applications = await getAdminMembershipApplications({ status: "all" }).catch(() => []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Membership Admissions Queue"
        subtitle="Review prospective student dossiers, evaluate Arabic linguistic profiles, and issue committee decisions"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <AdminApplicationsClient initialApplications={applications as ApplicationDossier[]} />
      </div>
    </div>
  );
}
