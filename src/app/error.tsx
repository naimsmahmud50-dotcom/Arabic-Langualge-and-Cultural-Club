"use client";

/**
 * @file error.tsx
 * @description Global runtime error boundary.
 * Renders dignified failure recovery UI with error reset capability.
 */

import React, { useEffect } from "react";
import { Button, Alert } from "@/components/ui";
import { RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-[8px] bg-rose-500/10 border border-rose-500/20 text-[var(--state-error)] flex items-center justify-center font-bold text-2xl mx-auto">
          !
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            System Notice: Processing Error
          </h2>
          <p className="font-arabic text-base text-[var(--brand-accent)]" dir="rtl">
            عذراً، حدث خطأ غير متوقع أثناء معالجة الطلب
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            An unexpected condition occurred while querying the club archive. The error has been isolated.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => reset()}
            leftIcon={<RefreshCcw className="w-4 h-4" />}
          >
            Retry Request
          </Button>
          <Link href="/">
            <Button variant="secondary" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
