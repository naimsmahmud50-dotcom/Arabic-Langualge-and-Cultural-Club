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
 * DESIGN CONSTRAINTS:
 * - Restrained institutional aesthetic: forest green (#173D32), warm ivory (#F5F0E5), antique brass (#B18A4A).
 * - Accessible focus states and keyboard navigation.
 * - Zero unauthorized self-registration endpoints.
 */

"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, Badge, Button, Input, Alert } from "@/components/ui";
import { Shield, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, KeyRound, ChevronDown, ChevronUp } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import { ActionResponse } from "@/lib/auth/types";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const sessionExpired = searchParams.get("error") === "session_expired";
  const [selectedDemoRole, setSelectedDemoRole] = useState<{ email: string; role: string } | null>(null);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionResponse<{ redirectUrl?: string }> | null, FormData>(
    loginAction,
    null
  );

  const demoAccounts = [
    { role: "Super Admin", email: "admin@arabicclub.org", desc: "Full root access, user provisioning, audit logs, system settings" },
    { role: "Administrator", email: "operations@arabicclub.org", desc: "Operations, committees, members, events, content CMS" },
    { role: "Content Editor", email: "editor@arabicclub.org", desc: "Editorial CMS, news bulletins, library, publications, gallery" },
    { role: "Membership Manager", email: "membership@arabicclub.org", desc: "Applications review queue, member records & verification" },
    { role: "Event Manager", email: "events@arabicclub.org", desc: "Event scheduling, annual roadmap, registration lists" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-xl mx-auto border border-[var(--brand-accent)] shadow-xs">
            ض
          </div>
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
              name="email"
              type="email"
              placeholder="officer@arabicclub.org"
              defaultValue={selectedDemoRole ? selectedDemoRole.email : "admin@arabicclub.org"}
              key={selectedDemoRole ? selectedDemoRole.email : "default-email"}
              required
              helperText="Institutional Google Workspace or authorized email"
            />

            <Input
              label="Master Password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              defaultValue="AdminSecure2026!"
              key={selectedDemoRole ? `pw-${selectedDemoRole.email}` : "default-pw"}
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

          {/* Test & Staging Role Profiles Assistance */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setShowDemoProfiles(!showDemoProfiles)}
              className="w-full flex items-center justify-between py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--brand-accent)] transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="w-3.5 h-3.5" />
                Institutional Testing Roles (5 Roles)
              </span>
              {showDemoProfiles ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoProfiles && (
              <div className="mt-3 space-y-2 bg-[var(--bg-primary)] p-3 rounded-[6px] border border-[var(--border-subtle)]">
                <p className="text-[11px] text-[var(--text-muted)]">
                  Click a role profile below to auto-fill development credentials for verification:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {demoAccounts.map((acct) => (
                    <button
                      key={acct.email}
                      type="button"
                      onClick={() => {
                        setSelectedDemoRole(acct);
                      }}
                      className="w-full text-left p-2 rounded-[4px] border border-[var(--border-subtle)] hover:border-[var(--brand-accent)] bg-[var(--bg-surface)] text-[11px] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-primary)]">{acct.role}</span>
                        <code className="text-[10px] text-[var(--brand-accent)] font-mono">{acct.email}</code>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{acct.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                  Default Dev Password: <code className="font-mono font-semibold text-[var(--text-primary)]">AdminSecure2026!</code>
                </div>
              </div>
            )}
          </div>

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
