/**
 * @file src/app/admin/members/page.tsx
 * @route /admin/members
 * @description Master CMS Member Records & Verification Console (Feature 015).
 * 
 * DEVELOPER ARCHITECTURE NOTE:
 * - Authorized administrative repository containing full member records
 *   (including private contact details, student IDs, and verification status).
 * - Queries members directly from SQLite via Drizzle ORM.
 * - Enforces Strix Privacy Guard: private details stay within this console;
 *   public queries only project members where isPublic === true.
 * - Sits behind server-side RBAC session authorization.
 * - Zero static mock arrays; fully persistent and reactive.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminMembers } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminMembersClient } from "./AdminMembersClient";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/members");
  }

  // Fetch initial members from real database
  const result = await getAdminMembers({ limit: 100 });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Member Records & Verification Console"
        subtitle="Manage student fellows, enrollment credentials, and public directory consent"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Member Records" },
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
        <AdminMembersClient
          initialMembers={result.data as any}
          initialTotal={result.pagination.total}
        />
      </div>
    </div>
  );
}
