/**
 * @file src/app/admin/layout.tsx
 * @description Dedicated Server Layout wrapper for the Administrative CMS.
 * 
 * ARCHITECTURE & SECURITY:
 * - Retrieves the verified session from the database/cookies via `getSession()`.
 * - Passes authenticated user context to the AdminSidebar.
 * - Enforces security boundary separating public pages from administrative workspace.
 */

import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Fixed Admin Sidebar with dynamic role filtering */}
      <AdminSidebar className="hidden md:flex" user={session} />

      {/* Main Admin Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
