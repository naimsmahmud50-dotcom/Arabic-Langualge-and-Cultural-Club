/**
 * @file src/app/admin/founders/page.tsx
 * @route /admin/founders
 * @description Master CMS Founders & Originators Archive (Feature 015).
 * 
 * DEVELOPER ARCHITECTURE NOTE:
 * - Allows managing verified founders, biographical text, and founding year records.
 * - Queries founders directly from SQLite via Drizzle ORM.
 * - Sits behind server-side RBAC session authorization.
 * - Zero static mock arrays; fully persistent and reactive.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminFounders } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminFoundersClient } from "./AdminFoundersClient";

export const dynamic = "force-dynamic";

export default async function AdminFoundersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/founders");
  }

  const founders = await getAdminFounders();

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Founders & Originators Archive"
        subtitle="Manage permanent historical founders, patron scholars, and inception records"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Founders Archive" },
        ]}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
        <AdminFoundersClient initialFounders={founders} />
      </div>
    </div>
  );
}
