/**
 * @file src/app/admin/login/page.tsx
 * @route /admin/login
 * @description Administrative CMS Authentication Portal.
 * 
 * ARCHITECTURE & ROLE:
 * - Secure entry gate for executive officers, editors, and administrators.
 * - Enforces credential validation, session creation, and role authorization.
 * - Implements brute-force rate-limiting feedback and secure error states.
 * - Meets Requirements SPEC-SEC-01, SPEC-SEC-02, and SPEC-ADM-01.
 * 
 * SECURITY MANDATE:
 * - Strictly zero hardcoded credentials or demo accounts.
 * - Form starts completely empty (no defaultValue or credential placeholders).
 * - Proper HTML autocomplete attributes for browser credential managers.
 * - Authentication handled strictly on the server; zero secrets exposed.
 */

"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, Badge, Button, Input, Alert, ClubLogo } from "@/components/ui";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import { ActionResponse } from "@/lib/auth/types";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const sessionExpired = searchParams.get("error") === "session_expired";

  const [state, formAction, isPending] = useActionState<ActionResponse<{ redirectUrl?: string }> | null, FormData>(
    loginAction,
    null
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <ClubLogo variant="crest" size="lg" className="mx-auto filter drop-shadow-sm mb-1" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Institutional CMS Portal
          </h1>
          <p className="font-arabic text-sm text-[var(--brand-accent)]" dir="rtl">
            بوابة الإدارة المركزية • نادي اللغة والثقافة العربية
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Restricted access for authorized executive officers and archival trustees.
          </p>
        </div>

        {/* Status Alerts */}
        {resetSuccess && (
          <Alert variant="success" title="Password Reset Complete">
            Your master password has been successfully updated. Please authenticate with your new credentials.
          </Alert>
        )}

        {sessionExpired && (
          <Alert variant="warning" title="Session Expired">
            Your previous administrative session has expired or was revoked. Please log in again.
          </Alert>
        )}

        {state && !state.success && (
          <Alert variant="error" title="Authentication Blocked">
            {state.message}
          </Alert>
        )}

        {/* Login Form Card */}
        <Card className="border-[var(--border-color)] p-8 space-y-6 bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
              Administrator Login
            </span>
            <Badge variant="accent" size="sm">Security Gate</Badge>
          </div>

          <form action={formAction} className="space-y-4">
            <Input
              label="Administrative Email"
              id="admin-email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="username"
              required
              helperText="Institutional email or authorized administrator account"
            />

            <Input
              label="Master Password"
              id="admin-password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked
                  className="rounded-[3px] accent-[var(--brand-primary)]"
                />
                <span>Maintain active session (7d)</span>
              </label>
              <Link href="/admin/forgot-password" className="text-[var(--brand-accent)] hover:underline">
                Lost credentials?
              </Link>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full justify-center"
              disabled={isPending}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isPending ? "Verifying Credentials..." : "Authenticate & Enter CMS"}
            </Button>
          </form>

          <div className="pt-4 border-t border-[var(--border-subtle)] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Public Website
            </Link>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-[var(--text-muted)] space-y-1">
          <p>All administrative sessions and modifications are recorded in immutable audit logs.</p>
          <p>Public self-registration is permanently disabled for institutional security.</p>
        </div>
      </div>
    </div>
  );
}
