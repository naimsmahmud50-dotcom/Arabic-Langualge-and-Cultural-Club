/**
 * @file src/app/loading.tsx
 * @description Global application suspense loader.
 * Renders an institutional skeleton view with refined typography and subtle spinner.
 * Adheres to Phase 3 Foundation requirements: zero neon, respectful pacing, accessible.
 */

import React from "react";
import { LoadingSpinner, Skeleton } from "@/components/ui";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-6">
        <LoadingSpinner size="lg" />
      </div>
      <p className="text-sm font-medium tracking-wide uppercase text-[var(--brand-accent)] font-serif mb-2">
        نادي اللغة والثقافة العربية
      </p>
      <h2 className="text-lg font-bold text-[var(--text-primary)]">
        Loading Institutional Archive...
      </h2>
      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
        Retrieving verified club records, historical directories, and academic resources.
      </p>

      {/* Decorative skeleton preview */}
      <div className="w-full max-w-md mt-8 space-y-3 opacity-60">
        <Skeleton variant="text" className="h-4 w-3/4 mx-auto" />
        <Skeleton variant="text" className="h-4 w-1/2 mx-auto" />
        <Skeleton variant="rectangular" className="h-24 w-full rounded-[6px]" />
      </div>
    </div>
  );
}
