/**
 * @file src/components/layout/AdminHeader.tsx
 * @description Master Topbar Header for the Administrative CMS.
 * 
 * DEVELOPER USAGE NOTE:
 * - Used across all administrative pages (/admin, /admin/inquiries, /admin/applications, etc.)
 * - Supports responsive mobile navigation drawer toggle (hamburger button).
 * - Renders accessible breadcrumb hierarchy (<nav aria-label="Breadcrumb">).
 * - Features an accessible User Profile Dropdown Menu with session identity, role badges,
 *   quick navigation shortcuts, and one-click secure Sign Out.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 * - Automatically connects with AdminShell context or accepts explicit props.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ThemeToggle, 
  Badge, 
  Button 
} from "@/components/ui";
import { 
  Menu, 
  ChevronRight, 
  User, 
  LogOut, 
  Shield, 
  History, 
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { SessionUser } from "@/lib/auth/types";
import { ROLE_METADATA } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/auth/actions";
import { useAdminContext } from "./AdminShell";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  role?: string;
  user?: SessionUser | null;
  breadcrumbs?: BreadcrumbItem[];
  onToggleMobileNav?: () => void;
  actions?: React.ReactNode;
}

export function AdminHeader({
  title,
  subtitle,
  role: roleProp,
  user: userProp,
  breadcrumbs,
  onToggleMobileNav,
  actions,
}: AdminHeaderProps) {
  const adminContext = useAdminContext();
  const user = userProp !== undefined ? userProp : adminContext?.user;
  const toggleMobileNav = onToggleMobileNav || adminContext?.toggleMobileNav;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const role = user?.role || "super_admin";
  const roleMeta = ROLE_METADATA[role] || ROLE_METADATA.super_admin;
  const displayRole = roleProp || roleMeta.titleEn;

  // Close profile dropdown on click outside or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  // Generate initial monogram for user avatar
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 sm:px-6 py-3.5 flex flex-col gap-2">
      {/* Top Bar: Breadcrumbs & Actions */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Mobile Hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Navigation Toggle (visible only on <md) */}
          {toggleMobileNav && (
            <button
              type="button"
              onClick={toggleMobileNav}
              aria-label="Open mobile navigation menu"
              className="md:hidden p-1.5 rounded-[5px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Breadcrumbs Navigation */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)] min-w-0 truncate">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-[var(--text-muted)]" />}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-[var(--brand-accent)] transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={`truncate ${isLast ? "text-[var(--text-primary)] font-semibold" : ""}`}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : (
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Link href="/admin" className="hover:text-[var(--brand-accent)] transition-colors">
                Admin
              </Link>
              <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="text-[var(--text-primary)] font-semibold truncate">{title}</span>
            </nav>
          )}
        </div>

        {/* Right Side: Theme Toggle, Custom Actions, & User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

          {/* Role Badge on Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <Shield className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{displayRole}</span>
          </div>

          <ThemeToggle />

          {/* User Profile Dropdown Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              aria-label="User Profile Menu"
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] transition-all"
            >
              <div className="w-6 h-6 rounded-[4px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] font-bold text-[10px] flex items-center justify-center font-mono">
                {initials}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[var(--text-primary)] max-w-[110px] truncate">
                {user ? user.fullName.split(" ")[0] : "Admin"}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)] hidden sm:inline" />
            </button>

            {/* Accessible Profile Dropdown Card */}
            {isProfileOpen && (
              <div
                role="menu"
                aria-label="User account actions"
                className="absolute right-0 mt-2 w-64 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* User Identity Details */}
                <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] space-y-1">
                  <div className="font-bold text-xs text-[var(--text-primary)] truncate">
                    {user?.fullName || "Administrator"}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                    {user?.email || "admin@arabicclub.internal"}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Badge variant={roleMeta.badgeVariant} size="sm" className="text-[9px] py-0 px-1.5">
                      {roleMeta.titleEn}
                    </Badge>
                    <span className="text-[10px] font-arabic text-[var(--brand-accent)]">
                      {roleMeta.titleAr}
                    </span>
                  </div>
                </div>

                {/* Quick Menu Shortcuts */}
                <div className="p-1 space-y-0.5 border-b border-[var(--border-subtle)]">
                  <Link
                    href="/admin/profile"
                    onClick={() => setIsProfileOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>My Profile & Security</span>
                  </Link>

                  <Link
                    href="/admin/audit-logs"
                    onClick={() => setIsProfileOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Activity & Audit Trail</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setIsProfileOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>View Public Website</span>
                  </Link>
                </div>

                {/* Form-based Secure Logout */}
                <div className="p-1">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      role="menuitem"
                      title="Terminate administrative session"
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-[5px] text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title & Contextual Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
