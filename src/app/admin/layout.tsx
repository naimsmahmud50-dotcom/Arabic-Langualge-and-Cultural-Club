/**
 * @file src/app/admin/layout.tsx
 * @description Master Server Layout wrapper for the Administrative CMS (Feature 014 Foundation).
 * 
 * DEVELOPER ARCHITECTURE NOTE:
 * - Route boundary: /admin/*
 * - Enforces server-side session authentication defense-in-depth via `getSession()`.
 * - Passes authenticated user session to client `AdminShell`, which coordinates desktop
 *   fixed navigation (`AdminSidebar`) and mobile slide-out drawer (`AdminMobileNav`).
 * - Exposes `AdminContext` for subcomponents (e.g. `AdminHeader`, user profile dropdown).
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Retrieve authenticated administrative session
  const session = await getSession();

  return (
    <AdminShell user={session}>
      {children}
    </AdminShell>
  );
}
