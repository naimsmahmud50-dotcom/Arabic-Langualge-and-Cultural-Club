/**
 * @file src/app/admin/profile/page.tsx
 * @route /admin/profile
 * @description Administrative Operator Profile & Security Credentials Console.
 * 
 * ARCHITECTURE & GOVERNANCE:
 * - Server Component protected by session authentication.
 * - Sourced directly from `users` table via `getUserById(session.userId)`.
 * - Enables self-service password updates, RBAC permissions audit, and session inspection.
 * - Meets Requirement REQ-ADM-11 and SPEC-SEC-01.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { ProfileSettingsClient } from "./ProfileSettingsClient";

export const revalidate = 0;

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/profile");
  }

  const user = await getUserById(session.id);
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Administrative Profile & Security"
        subtitle="Manage personal operator credentials, Scrypt authentication keys, and assigned privileges"
      />

      <div className="p-6 sm:p-8 max-w-5xl">
        <ProfileSettingsClient user={user} />
      </div>
    </div>
  );
}
