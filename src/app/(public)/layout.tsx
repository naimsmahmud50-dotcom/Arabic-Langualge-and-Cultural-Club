/**
 * @file (public)/layout.tsx
 * @description Master layout wrapper for all public-facing pages of the Arabic Language & Cultural Club.
 * Provides the shared institutional Header, content container, and institutional Footer.
 */

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
