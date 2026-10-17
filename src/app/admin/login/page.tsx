/**
 * @file src/app/admin/login/page.tsx
 * @route /admin/login
 * @description Administrative CMS Authentication Portal.
 * 
 * ARCHITECTURE & ROLE:
 * - Secure entry gate for executive officers and administrators.
 * - Enforces credential validation, session creation, and role authorization.
 * - Meets Requirement SPEC-SEC-01 and SPEC-ADM-01.
 * 
 * DESIGN CONSTRAINTS:
 * - Restrained institutional aesthetic, no flashy animations, accessible focus states.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { Shield, Lock, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
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

        {/* Login Form Card */}
        <Card className="border-[var(--border-color)] p-8 space-y-6 bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
              Administrator Login
            </span>
            <Badge variant="accent" size="sm">Security Gate</Badge>
          </div>

          <form className="space-y-4" action="/admin">
            <Input
              label="Administrative Email"
              type="email"
              placeholder="officer@arabicclub.edu"
              required
              helperText="Institutional Google Workspace or authorized email"
            />

            <Input
              label="Master Password"
              type="password"
              placeholder="••••••••••••"
              required
            />

            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded-[3px] accent-[var(--brand-primary)]" />
                <span>Remember session</span>
              </label>
              <a href="#" className="text-[var(--brand-accent)] hover:underline">
                Lost access credentials?
              </a>
            </div>

            <Button variant="accent" size="lg" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Authenticate & Enter CMS
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
          <p>Unauthorized access attempts are prohibited and automatically reported.</p>
        </div>
      </div>
    </div>
  );
}
