/**
 * @file src/components/layout/AdminShell.tsx
 * @description Client shell wrapper for the Administrative CMS Layout.
 * 
 * DEVELOPER USAGE NOTE:
 * - Coordinates responsive desktop sidebar (AdminSidebar) and mobile slide-out drawer (AdminMobileNav).
 * - Exposes AdminContext (useAdminContext) for AdminHeader hamburger toggle and user session.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 * - Sits directly inside src/app/admin/layout.tsx.
 */

"use client";

import React, { createContext, useContext, useState } from "react";
import { SessionUser } from "@/lib/auth/types";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileNav } from "./AdminMobileNav";

interface AdminContextType {
  user: SessionUser | null;
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdminContext() {
  const context = useContext(AdminContext);
  return context;
}

export interface AdminShellProps {
  user: SessionUser | null;
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const openMobileNav = () => setIsMobileNavOpen(true);
  const closeMobileNav = () => setIsMobileNavOpen(false);
  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);

  return (
    <AdminContext.Provider
      value={{
        user,
        isMobileNavOpen,
        openMobileNav,
        closeMobileNav,
        toggleMobileNav,
      }}
    >
      <div className="flex min-h-screen bg-[var(--bg-primary)]">
        {/* Desktop Fixed Sidebar (visible >= 768px) */}
        <AdminSidebar className="hidden md:flex" user={user} />

        {/* Mobile Slide-out Drawer (< 768px) */}
        <AdminMobileNav
          isOpen={isMobileNavOpen}
          onClose={closeMobileNav}
          user={user}
        />

        {/* Main Administrative Workspace */}
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col min-w-0 overflow-y-auto outline-none">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}
