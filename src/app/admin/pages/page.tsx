/**
 * @file src/app/admin/pages/page.tsx
 * @route /admin/pages
 * @description Master CMS Page & Section Content Management (Feature 015).
 * 
 * DEVELOPER ARCHITECTURE NOTE:
 * - Allows executive administrators to update editable sections across the public site
 *   (Hero text, About intro, Constitution text, Mission/Vision/Values, History timeline) in English & Arabic.
 * - Queries editablePages and pageSections directly from SQLite via Drizzle ORM.
 * - Sits behind server-side RBAC session authorization.
 * - Zero static mock arrays; fully persistent and reactive.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminPages, getAdminPageWithSections } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminPagesClient } from "./AdminPagesClient";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/pages");
  }

  // Fetch all pages and enrich with their sections
  const pagesSummary = await getAdminPages();
  const pagesWithSections = await Promise.all(
    pagesSummary.map(async (p) => {
      const full = await getAdminPageWithSections(p.slug);
      return {
        ...p,
        sections: full?.sections || [],
      };
    })
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Page Content & Sections CMS"
        subtitle="Manage bilingual narratives, mission statements, and timeline milestones"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Page Content CMS" },
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
        <AdminPagesClient initialPages={pagesWithSections} />
      </div>
    </div>
  );
}
