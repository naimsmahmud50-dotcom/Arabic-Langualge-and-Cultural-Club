/**
 * @file src/app/admin/reset-password/page.tsx
 * @route /admin/reset-password
 * @description Password Reset Execution Portal with One-Time Token Verification.
 * 
 * ARCHITECTURE & ROLE:
 * - Validates one-time cryptographically hashed reset tokens.
 * - Enforces administrative password complexity (minimum 8 chars, uppercase, lowercase, numbers, symbols).
 * - Invalidates all previous active sessions upon successful reset to prevent session hijacking.
 */

"use client";

import React, { useActionState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, Button, Input, Alert } from "@/components/ui";
import { KeyRound, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/lib/auth/actions";
import { ActionResponse } from "@/lib/auth/types";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    resetPasswordAction,
    null
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-xl mx-auto border border-[var(--brand-accent)] shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Establish New Password
          </h1>
          <p className="font-arabic text-sm text-[var(--brand-accent)]" dir="rtl">
            تعيين كلمة مرور جديدة
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Create a high-entropy password to protect your institutional administrative access.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-[var(--border-color)] p-8 space-y-6 bg-[var(--bg-surface)]">
          {state && !state.success && (
            <Alert variant="error" title="Password Reset Failed">
              {state.message}
            </Alert>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={tokenFromUrl} />

            {!tokenFromUrl && (
              <Input
                label="Recovery Token"
                name="token"
                type="text"
                placeholder="Paste your 64-character token"
                required
                helperText="Provided in your institutional recovery dispatch."
              />
            )}

            <Input
              label="New Master Password"
              name="newPassword"
              type="password"
              placeholder="••••••••••••"
              required
              helperText="Min 8 characters, uppercase, lowercase, number, and symbol."
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••••••"
              required
            />

            <div className="p-3 rounded-[6px] bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1.5 text-[11px] text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)] block">Security Requirements:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[var(--brand-accent)]" /> Min 8 characters</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[var(--brand-accent)]" /> Mixed case (A-z)</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[var(--brand-accent)]" /> Numeric digit (0-9)</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[var(--brand-accent)]" /> Special character</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full justify-center"
              disabled={isPending}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isPending ? "Hashing & Securing Account..." : "Confirm & Update Password"}
            </Button>
          </form>

          <div className="pt-4 border-t border-[var(--border-subtle)] text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Login Portal
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
