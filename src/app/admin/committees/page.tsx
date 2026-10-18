/**
 * @file src/app/admin/committees/page.tsx
 * @route /admin/committees
 * @description Master CMS Committee Terms & Executive Portfolios Management (Feature 015).
 * 
 * DEVELOPER ARCHITECTURE NOTE:
 * - Allows managing governing terms (active and historical archives) and assigning officers.
 * - Enforces the institutional Preservation Rule: previous terms remain intact forever.
 * - Queries committeeTerms, committeeAssignments, and members directly from SQLite via Drizzle ORM.
 * - Sits behind server-side RBAC session authorization.
 * - Zero static mock arrays; fully persistent and reactive.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  getAdminCommitteeTerms, 
  getAdminCommitteeAssignments, 
  getAdminMembers 
} from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminCommitteesClient } from "./AdminCommitteesClient";

export const dynamic = "force-dynamic";

export default async function AdminCommitteesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/committees");
  }

  // Fetch all terms
  const terms = await getAdminCommitteeTerms();

  // Fetch assignments for all terms
  const assignmentsMap: Record<string, any[]> = {};
  await Promise.all(
    terms.map(async (t) => {
      const assignments = await getAdminCommitteeAssignments(t.id);
      assignmentsMap[t.id] = assignments;
    })
  );

  // Fetch all registered members for the assignment dropdown
  const membersResult = await getAdminMembers({ limit: 100 });
  const availableMembers = membersResult.data.map((m) => ({
    id: m.id,
    fullNameEn: m.fullNameEn,
    fullNameAr: m.fullNameAr,
    membershipId: m.membershipId,
  }));

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Committee Terms & Executive Portfolios"
        subtitle="Manage active executive council, historical committee preservation, and officer appointments"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Committees & Terms" },
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
        <AdminCommitteesClient
          initialTerms={terms}
          initialAssignments={assignmentsMap}
          availableMembers={availableMembers}
        />
      </div>
    </div>
  );
}
