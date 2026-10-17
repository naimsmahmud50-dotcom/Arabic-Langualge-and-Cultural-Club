/**
 * @file src/app/admin/forbidden/page.tsx
 * @route /admin/forbidden
 * @description Institutional 403 Forbidden Access State.
 * 
 * ARCHITECTURE & GOVERNANCE:
 * - Rendered when an authenticated administrator attempts to access a module
 *   outside their role's least-privilege boundary (e.g. Content Editor visiting /admin/users).
 * - Avoids opaque error screens: clearly communicates current role privileges and authorized destinations.
 * - Meets Requirement SPEC-SEC-01 and SPEC-SEC-03.
 */

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { ROLE_METADATA, ROLE_PERMISSIONS } from "@/lib/auth/rbac";
import { Role } from "@/lib/auth/types";
import { logoutAction } from "@/lib/auth/actions";

interface ForbiddenPageProps {
  searchParams: Promise<{
    from?: string;
    role?: string;
  }>;
}

export default async function ForbiddenPage({ searchParams }: ForbiddenPageProps) {
  const params = await searchParams;
  const userRole = (params.role as Role) || "administrator";
  const attemptedPath = params.from || "/admin";
  const roleMeta = ROLE_METADATA[userRole] || ROLE_METADATA.administrator;
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[var(--bg-primary)]">
      <div className="w-full max-w-lg space-y-6">
        {/* Emblem */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-[8px] bg-red-950/20 text-red-700 dark:text-red-400 border border-red-800/30 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Access Restricted
          </h1>
          <p className="font-arabic text-base text-[var(--brand-accent)]" dir="rtl">
            وصول مقيد • غير مصرح لهذه الرتبة
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Institutional security policy: The requested path <code className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-[11px]">{attemptedPath}</code> requires elevated governance clearance.
          </p>
        </div>

        {/* Diagnostic Card */}
        <Card className="border-[var(--border-color)] p-6 space-y-5 bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <span className="text-xs text-[var(--text-muted)] block uppercase tracking-wider font-semibold">
                Active Institutional Role
              </span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {roleMeta.titleEn}
              </span>
            </div>
            <Badge variant="outline" size="sm" className="font-arabic">
              {roleMeta.titleAr}
            </Badge>
          </div>

          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {roleMeta.description}
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-xs font-semibold text-[var(--text-primary)] block">
              Authorized Privileges for Your Account:
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {permissions.map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-mono bg-[var(--bg-primary)] px-2 py-1 rounded-[4px] border border-[var(--border-subtle)]"
                >
                  <CheckCircle2 className="w-3 h-3 text-[var(--brand-accent)] shrink-0" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Pathways */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-3">
            <Link href="/admin" className="flex-1">
              <Button variant="primary" size="md" className="w-full justify-center" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Dashboard
              </Button>
            </Link>

            <form action={logoutAction} className="sm:w-auto">
              <Button type="submit" variant="outline" size="md" className="w-full justify-center" leftIcon={<LogOut className="w-4 h-4" />}>
                Switch Account
              </Button>
            </form>
          </div>
        </Card>

        {/* Security Disclaimers */}
        <div className="text-center text-[11px] text-[var(--text-muted)]">
          If you require elevated governance clearance, submit an institutional petition to the Lead Systems Administrator.
        </div>
      </div>
    </div>
  );
}
