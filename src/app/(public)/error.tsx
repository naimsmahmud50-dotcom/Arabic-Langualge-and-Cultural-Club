/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/(public)/error.tsx
 * Purpose: Branded public routes error boundary with dignified recovery.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Strictly human vibe; zero AI emojis.
 */

"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui";
import { RefreshCcw, Home, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public route runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center text-center">
      <div className="max-w-lg space-y-6 bg-[var(--bg-surface)] p-8 sm:p-10 rounded-[12px] border border-[var(--border-color)] shadow-sm">
        <div className="w-14 h-14 rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-mono text-[var(--brand-accent)] font-semibold">
            Institutional Portal Notice
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Archive Retrieval Interrupted
          </h2>
          <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
            عذراً، تعذر تحميل السجل الأكاديمي المطلوب حالياً
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
            An unexpected error occurred while communicating with the repository server. Please attempt to refresh the view or return to the main portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => reset()}
            leftIcon={<RefreshCcw className="w-3.5 h-3.5" />}
          >
            Retry Retrieval
          </Button>
          <Link href="/">
            <Button variant="outline" leftIcon={<Home className="w-3.5 h-3.5" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
