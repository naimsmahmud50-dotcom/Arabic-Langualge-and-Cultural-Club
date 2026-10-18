/**
 * @file src/components/layout/AdminSidebar.tsx
 * @description Administrative sidebar navigation for the Arabic Club CMS.
 * 
 * FEATURES:
 * - Module groupings: Overview, Institutional Legacy, Operations & Content, System & Governance.
 * - Role-Based Visibility: dynamically filters accessible navigation links based on user permissions.
 * - Active route highlighting with institutional color palette.
 * - User identity tile with role badge, Arabic role title, and one-click Sign Out.
 * - Direct shortcut back to public platform.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Award,
  Users2,
  UserCheck,
  UserPlus,
  CalendarDays,
  Image,
  Bell,
  BookOpen,
  Newspaper,
  ShieldCheck,
  Settings,
  History,
  ExternalLink,
  LogOut,
  User,
  Mail,
} from "lucide-react";
import { SessionUser, Permission, Role } from "@/lib/auth/types";
import { hasPermission, ROLE_METADATA } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/auth/actions";
import { Badge, ClubLogo } from "@/components/ui";

interface AdminSidebarProps {
  className?: string;
  user?: SessionUser | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard Metrics", href: "/admin", icon: LayoutDashboard, permission: "dashboard:view" },
    ],
  },
  {
    group: "Institutional Legacy",
    items: [
      { label: "Founders & Origin", href: "/admin/founders", icon: Award, permission: "committees:manage" },
      { label: "Committees & Terms", href: "/admin/committees", icon: Users2, permission: "committees:manage" },
      { label: "Member Records", href: "/admin/members", icon: UserCheck, permission: "members:manage" },
      { label: "Application Queue", href: "/admin/applications", icon: UserPlus, permission: "applications:manage" },
    ],
  },
  {
    group: "Operations & Content",
    items: [
      { label: "Annual Plan & Events", href: "/admin/events", icon: CalendarDays, permission: "events:manage" },
      { label: "Gallery & Photos", href: "/admin/gallery", icon: Image, permission: "gallery:manage" },
      { label: "News & Notices", href: "/admin/news", icon: Bell, permission: "news:manage" },
      { label: "Learning Resources", href: "/admin/resources", icon: BookOpen, permission: "resources:manage" },
      { label: "Publications & Awards", href: "/admin/publications", icon: Newspaper, permission: "publications:manage" },
      { label: "Page Content CMS", href: "/admin/pages", icon: FileText, permission: "pages:manage" },
    ],
  },
  {
    group: "System & Governance",
    items: [
      { label: "Inquiries & Inbox", href: "/admin/inquiries", icon: Mail, permission: "settings:manage" },
      { label: "Users & Roles", href: "/admin/users", icon: ShieldCheck, permission: "users:manage" },
      { label: "Site Settings & SEO", href: "/admin/settings", icon: Settings, permission: "settings:manage" },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History, permission: "audit:read" },
    ],
  },
];

export function AdminSidebar({ className, user }: AdminSidebarProps) {
  const pathname = usePathname();

  // Do not render sidebar on unauthenticated entry gates or forbidden screen
  const isAuthGateway =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname === "/admin/forbidden";

  if (isAuthGateway) {
    return null;
  }

  const role = user?.role || "super_admin";
  const roleMeta = ROLE_METADATA[role] || ROLE_METADATA.super_admin;

  return (
    <aside
      className={`w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col justify-between shrink-0 h-screen sticky top-0 ${className || ""}`}
      aria-label="Administrative CMS Navigation"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <ClubLogo variant="crest" size="sm" className="group-hover:scale-105 transition-transform drop-shadow-xs" />
            <div>
              <span className="font-bold text-sm text-[var(--text-primary)] block leading-tight">
                Arabic Club Admin
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--brand-accent)]">
                Institutional CMS
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {ADMIN_NAV_GROUPS.map((group) => {
            // Filter items based on user's role permission
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
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-semibold transition-colors ${
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
                <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[130px]">
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
    </aside>
  );
}
