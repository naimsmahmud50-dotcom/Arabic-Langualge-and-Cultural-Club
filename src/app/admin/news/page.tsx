/**
 * @file src/app/admin/news/page.tsx
 * @route /admin/news
 * @description Master News, Editorial Bulletins & Press Dispatch Console (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Server component protecting the News CMS behind administrative session auth.
 * - Queries announcements directly from SQLite via getAdminAnnouncements.
 * - Passes full records (drafts, published, archived) to AdminNewsClient.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminAnnouncements } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminNewsClient } from "./AdminNewsClient";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/news");
  }

  const { data: announcements = [] } = await getAdminAnnouncements({ limit: 100 });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Official News & Bulletins Dispatch"
        subtitle="Publish executive circulars, pin notices, and disseminate press releases"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "News & Bulletins" },
        ]}
      />

      <AdminNewsClient initialAnnouncements={announcements} />
    </div>
  );
}
