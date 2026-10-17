/**
 * @file admin/layout.tsx
 * @description Dedicated layout wrapper for the Administrative CMS.
 * Separate from the public layout: includes fixed AdminSidebar, scrollable admin workspace, and security boundary.
 */

import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar className="hidden md:flex" />

      {/* Main Admin Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
