/**
 * @file src/app/admin/settings/page.tsx
 * @route /admin/settings
 * @description Administrative Site Settings, Brand Identity, Metadata, SEO & Backup Console.
 * 
 * ARCHITECTURE & GOVERNANCE:
 * - Server Component protected by least-privilege RBAC: requires `settings:manage` (Super Admin).
 * - Queries authoritative `site_settings` directly from SQLite database via Drizzle ORM.
 * - Provides verified snapshot backups with cryptographic SHA-256 integrity hash.
 * - Meets Requirements REQ-ADM-13, REQ-ADM-14, and SPEC-SET-01 through SPEC-SET-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { getAdminSiteSettings } from "@/lib/db/queries";
import { listExistingBackups } from "@/lib/utils/db-backup";
import { SettingsManagerClient } from "./SettingsManagerClient";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/settings");
  }

  // Enforce server-side authorization: settings:manage (Super Admin only)
  assertPermission(session.role, "settings:manage");

  const [settings, backups] = await Promise.all([
    getAdminSiteSettings(),
    Promise.resolve(listExistingBackups()),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Institutional Settings & SEO"
        subtitle="Manage global brand parameters, contact coordinates, search meta, and verified database backups"
      />

      <div className="p-6 sm:p-8 max-w-7xl">
        <SettingsManagerClient
          initialSettings={settings}
          existingBackups={backups}
        />
      </div>
    </div>
  );
}
