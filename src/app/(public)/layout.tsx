/**
 * @file (public)/layout.tsx
 * @description Master layout wrapper for all public-facing pages of the Arabic Language & Cultural Club.
 * Provides the shared institutional Header, content container, and institutional Footer.
 */

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
