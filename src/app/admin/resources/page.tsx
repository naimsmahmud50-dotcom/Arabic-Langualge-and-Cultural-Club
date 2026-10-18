/**
 * @file src/app/admin/resources/page.tsx
 * @route /admin/resources
 * @description Master Arabic Learning Resources Management Console (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Server component protecting the Learning Resources CMS behind administrative session auth.
 * - Queries learning_resources directly from SQLite via getAdminLearningResources.
 * - Passes full records (drafts and published) to AdminResourcesClient.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminLearningResources } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminResourcesClient } from "./AdminResourcesClient";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/resources");
  }

  const { data: resources = [] } = await getAdminLearningResources({ limit: 100 });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Arabic Learning Resources Hub"
        subtitle="Upload pedagogical guides, grammar references, and vocabulary lists"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Learning Resources" },
        ]}
      />

      <AdminResourcesClient initialResources={resources as any} />
    </div>
  );
}
