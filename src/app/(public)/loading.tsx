/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/(public)/loading.tsx
 * Purpose: Branded public routes suspense skeleton loader.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Strictly human vibe; zero AI emojis.
 */

import React from "react";
import { LoadingSpinner, Skeleton } from "@/components/ui";

export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
      <div className="relative mb-6">
        <LoadingSpinner size="lg" />
      </div>
      <p className="text-sm font-semibold tracking-wide uppercase text-[var(--brand-accent)] font-serif mb-1" dir="rtl">
        نادي اللغة والثقافة العربية • كلية كابي نذرول الحكومية
      </p>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Loading Institutional Archive...
      </h2>
      <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-md">
        Retrieving official club annals, publications, events calendar, and academic dossiers.
      </p>

      {/* Structured collegiate skeleton preview */}
      <div className="w-full max-w-xl mt-10 space-y-4 opacity-70">
        <Skeleton variant="text" className="h-6 w-3/4 mx-auto" />
        <Skeleton variant="text" className="h-4 w-1/2 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Skeleton variant="rectangular" className="h-28 rounded-[8px]" />
          <Skeleton variant="rectangular" className="h-28 rounded-[8px]" />
          <Skeleton variant="rectangular" className="h-28 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
