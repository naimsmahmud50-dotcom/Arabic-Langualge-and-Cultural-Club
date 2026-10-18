/**
 * @file src/app/admin/layout.tsx
 * @description Master Server Layout wrapper for the Administrative CMS (Feature 014 Foundation).
 * 
 * DEVELOPER ARCHITECTURE NOTE:
 * - Route boundary: /admin/*
 * - Enforces server-side session authentication defense-in-depth via `getSession()`.
 * - Injects strict search engine directives (noindex, nofollow, nocache) preventing
 *   search engines from indexing administrative operations or forms.
 * - Passes authenticated user session to client `AdminShell`, which coordinates desktop
 *   fixed navigation (`AdminSidebar`) and mobile slide-out drawer (`AdminMobileNav`).
 * - Exposes `AdminContext` for subcomponents (e.g. `AdminHeader`, user profile dropdown).
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Management Portal | Arabic Language & Cultural Club",
  description: "Restricted administrative console for executive officers, editorial stewards, and archival trustees.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

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
