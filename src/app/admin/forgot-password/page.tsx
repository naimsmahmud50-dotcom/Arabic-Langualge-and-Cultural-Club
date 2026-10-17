/**
 * @file src/app/admin/forgot-password/page.tsx
 * @route /admin/forgot-password
 * @description Password Recovery Request Portal for Institutional Officers.
 * 
 * ARCHITECTURE & ROLE:
 * - Initiates secure password recovery workflow.
 * - Prevents user enumeration by showing generic, positive dispatch feedback.
 * - Records all recovery requests in immutable audit logs.
 */

"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { Card, Button, Input, Alert } from "@/components/ui";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { ActionResponse } from "@/lib/auth/types";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    requestPasswordResetAction,
    null
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-xl mx-auto border border-[var(--brand-accent)] shadow-xs">
            ض
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Reset Administrative Access
          </h1>
          <p className="font-arabic text-sm text-[var(--brand-accent)]" dir="rtl">
            استعادة كلمة المرور • نادي اللغة والثقافة العربية
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Provide your verified institutional email to receive a single-use recovery token.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-[var(--border-color)] p-8 space-y-6 bg-[var(--bg-surface)]">
          {state?.success && (
            <Alert variant="success" title="Recovery Request Dispatched">
              {state.message}
            </Alert>
          )}

          {state && !state.success && (
            <Alert variant="error" title="Unable to Process Request">
              {state.message}
            </Alert>
          )}

          {!state?.success && (
            <form action={formAction} className="space-y-4">
              <Input
                label="Institutional Email Address"
                name="email"
                type="email"
                placeholder="officer@arabicclub.org"
                required
                helperText="Must match your verified administrative account."
              />

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full justify-center"
                disabled={isPending}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isPending ? "Validating Institutional Record..." : "Dispatch Recovery Link"}
              </Button>
            </form>
          )}

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
