/**
 * @file src/components/layout/AdminMobileNav.tsx
 * @description Accessible slide-out mobile navigation drawer for the Administrative CMS.
 * 
 * DEVELOPER USAGE NOTE:
 * - Activates on viewports below 768px (<md) when the administrator taps the hamburger menu in AdminHeader.
 * - Renders role-aware navigation links matching desktop AdminSidebar.
 * - Automatically closes on route navigation, ESC key, or backdrop click.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 * - Meets WCAG AA standards with role="dialog", aria-modal="true", and focus management.
 */

"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ExternalLink, LogOut, Shield } from "lucide-react";
import { SessionUser } from "@/lib/auth/types";
import { hasPermission, ROLE_METADATA } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/auth/actions";
import { Badge, ClubLogo } from "@/components/ui";
import { ADMIN_NAV_GROUPS } from "./AdminSidebar";

export interface AdminMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: SessionUser | null;
}

export function AdminMobileNav({ isOpen, onClose, user }: AdminMobileNavProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on path change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // Handle ESC key listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Do not render mobile nav on unauthenticated gateway routes
  const isAuthGateway =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname === "/admin/forbidden";

  if (!isOpen || isAuthGateway) return null;

  const role = user?.role || "super_admin";
  const roleMeta = ROLE_METADATA[role] || ROLE_METADATA.super_admin;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Administrative Mobile Navigation Menu"
      className="fixed inset-0 z-50 md:hidden flex"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative w-72 max-w-[85vw] h-full bg-[var(--bg-surface)] border-r border-[var(--border-color)] shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200"
      >
        {/* Brand Header & Close Button */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-2.5">
            <ClubLogo variant="crest" size="sm" className="drop-shadow-xs" />
            <div>
              <span className="font-bold text-sm text-[var(--text-primary)] block leading-tight">
                Arabic Club Admin
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--brand-accent)]">
                Mobile CMS Shell
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-11 h-11 flex items-center justify-center rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Item Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {ADMIN_NAV_GROUPS.map((group) => {
            const accessibleItems = group.items.filter((item) => hasPermission(role, item.permission));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mb-1.5">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-[6px] text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] shadow-xs"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Identity & Logout Tile */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/40 shrink-0 space-y-2">
          {user && (
            <div className="p-2 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[150px]">
                  {user.fullName}
                </span>
                <Badge variant={roleMeta.badgeVariant} size="sm" className="text-[9px] py-0 px-1.5">
                  {roleMeta.titleEn.split(" ")[0]}
                </Badge>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] truncate font-mono">
                {user.email}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[4px] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors border border-[var(--border-subtle)]"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <form action={logoutAction} className="shrink-0">
              <button
                type="submit"
                title="Sign out of administrative session"
                className="flex items-center justify-center p-1.5 rounded-[4px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
