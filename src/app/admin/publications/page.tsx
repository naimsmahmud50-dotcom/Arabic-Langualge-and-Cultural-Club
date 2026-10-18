/**
 * @file src/app/admin/publications/page.tsx
 * @route /admin/publications
 * @description Master Publications, Journals, and Competitive Distinctions Console (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Server component protecting Publications & Achievements behind administrative session auth.
 * - Queries publications and achievements directly from SQLite via getAdminPublications and getAdminAchievements.
 * - Passes full records to AdminPublicationsClient.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  getAdminPublications, 
  getAdminAchievements 
} from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminPublicationsClient } from "./AdminPublicationsClient";

export const dynamic = "force-dynamic";

export default async function AdminPublicationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/publications");
  }

  const [publicationsResult, achievementsResult] = await Promise.all([
    getAdminPublications({ limit: 100 }),
    getAdminAchievements({ limit: 100 }),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Publications & Institutional Distinctions"
        subtitle="Manage literary journals, academic magazines, and inter-collegiate tournament trophies"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Publications & Honors" },
        ]}
      />

      <AdminPublicationsClient
        initialPublications={publicationsResult.data as any}
        initialAchievements={achievementsResult.data as any}
      />
    </div>
  );
}
