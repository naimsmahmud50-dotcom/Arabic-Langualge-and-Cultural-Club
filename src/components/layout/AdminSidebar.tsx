/**
 * @file AdminSidebar.tsx
 * @description Administrative sidebar navigation for the Arabic Club CMS.
 * Features:
 * - Module groupings: Core, Institutional Legacy, Operations, Academic/Media, System
 * - Active route highlight
 * - Direct link back to public site
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
} from "lucide-react";

export const ADMIN_MODULES = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard Metrics", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    group: "Institutional Legacy",
    items: [
      { label: "Founders & Origin", href: "/admin/founders", icon: Award },
      { label: "Committees & Terms", href: "/admin/committees", icon: Users2 },
      { label: "Member Records", href: "/admin/members", icon: UserCheck },
      { label: "Application Queue", href: "/admin/applications", icon: UserPlus },
    ],
  },
  {
    group: "Operations & Content",
    items: [
      { label: "Annual Plan & Events", href: "/admin/events", icon: CalendarDays },
      { label: "Gallery & Photos", href: "/admin/gallery", icon: Image },
      { label: "News & Notices", href: "/admin/news", icon: Bell },
      { label: "Learning Resources", href: "/admin/resources", icon: BookOpen },
      { label: "Publications & Awards", href: "/admin/publications", icon: Newspaper },
      { label: "Page Content CMS", href: "/admin/pages", icon: FileText },
    ],
  },
  {
    group: "System & Governance",
    items: [
      { label: "Users & Roles", href: "/admin/users", icon: ShieldCheck },
      { label: "Site Settings & SEO", href: "/admin/settings", icon: Settings },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
    ],
  },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col justify-between shrink-0 h-screen sticky top-0 ${className || ""}`}
      aria-label="Administrative CMS Navigation"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-sm">
              ض
            </div>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {ADMIN_MODULES.map((group) => (
            <div key={group.group}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 mb-2">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
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
          ))}
        </div>

        {/* Bottom Public Link Shortcut */}
        <div className="p-4 border-t border-[var(--border-color)] shrink-0">
          <Link
            href="/"
            className="flex items-center justify-between p-2 rounded-[6px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors border border-[var(--border-subtle)]"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
