/**
 * @file not-found.tsx
 * @description Global 404 Page for unmapped or non-existent routes.
 * Dignified, bilingual error message with clear navigation links.
 */

import React from "react";
import Link from "next/link";
import { Button, GeometricPattern } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <GeometricPattern />
      </div>

      <div className="relative z-10 max-w-md space-y-5">
        <div className="w-16 h-16 rounded-[8px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] flex items-center justify-center font-bold text-2xl text-[var(--brand-accent)] mx-auto shadow-xs">
          ٤٠٤
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Page Not Found
        </h1>

        <p className="font-arabic text-lg text-[var(--brand-accent)]" dir="rtl">
          الصفحة المطلوبة غير موجودة
        </p>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          The requested archival document, event, or page could not be located in the club registry.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary">
              About the Club
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
