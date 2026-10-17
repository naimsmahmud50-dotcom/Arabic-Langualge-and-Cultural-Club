/**
 * @file src/components/layout/AdminHeader.tsx
 * @description Topbar header for the administrative dashboard.
 * 
 * FEATURES:
 * - Module title & contextual subtitle.
 * - Current administrator active role badge with institutional crest.
 * - Interactive theme toggle.
 * - Secure logout button invoking server-side `logoutAction` and audit logger.
 */

"use client";

import React from "react";
import { ThemeToggle, Badge, Button } from "@/components/ui";
import { LogOut, User, Shield } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  role?: string;
}

export function AdminHeader({
  title,
  subtitle,
  role = "Super Admin",
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <Shield className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">{role}</span>
        </div>

        <ThemeToggle />

        {/* Form-based Secure Logout */}
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            title="Terminate administrative session"
          >
            Logout
          </Button>
        </form>
      </div>
    </header>
  );
}
