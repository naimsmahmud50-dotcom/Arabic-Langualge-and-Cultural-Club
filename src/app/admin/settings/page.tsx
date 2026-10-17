/**
 * @file src/app/admin/settings/page.tsx
 * @route /admin/settings
 * @description Administrative Site Settings, Metadata, and SEO Configuration.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows updating global institutional configuration, primary email/telephone,
 *   physical headquarters venue, social links, meta descriptions, and backup tools.
 * - Meets Requirement SPEC-SET-01 through SPEC-SET-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { Settings, Save, Globe, ShieldCheck, Database, HardDriveDownload } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/settings");
  }

  // Enforce server-side authorization: settings:manage (Super Admin only)
  assertPermission(session.role, "settings:manage");
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Institutional Settings & SEO"
        subtitle="Manage global brand parameters, contact coordinates, search meta, and database backups"
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
        <form className="space-y-8" action="#">
          {/* Institutional Identity Card */}
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Brand Identity</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Official Institutional Nomenclature
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization Title (English)"
                defaultValue="Arabic Language & Cultural Club"
                required
              />
              <Input
                label="الاسم الرسمي باللغة العربية (Arabic Title)"
                defaultValue="نادي اللغة والثقافة العربية"
                dir="rtl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Motto (English)"
                defaultValue="Preserving Heritage, Advancing Eloquence, Cultivating Leadership."
              />
              <Input
                label="الشعار العربي (Arabic Motto)"
                defaultValue="لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ"
                dir="rtl"
              />
            </div>
          </Card>

          {/* Contact Coordinates Card */}
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Contact Coordinates</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Secretariat Communication Channels
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official General Email"
                type="email"
                defaultValue="contact@arabicclub.edu"
                required
              />
              <Input
                label="Secretariat Telephone"
                type="tel"
                defaultValue="+880 1700-000000"
              />
            </div>

            <Input
              label="Secretariat Physical Venue"
              defaultValue="Room 402, Student Activity Building, Central University Campus"
            />
          </Card>

          {/* Search Engine Optimization & Meta */}
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Metadata & SEO</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Global Search Engine Configuration
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Default Meta Description (English)
              </label>
              <textarea
                rows={3}
                defaultValue="Preserving heritage, advancing eloquence, and cultivating scholarly student leadership in classical Arabic linguistics and Islamic cultural studies."
                className="w-full p-3.5 rounded-[5px] text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              />
            </div>
          </Card>

          {/* Database & Archival Snapshot */}
          <Card className="border-[var(--border-color)] bg-[var(--bg-surface-elevated)] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Database Snapshot & Archival Recovery
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Export an authenticated SQLite snapshot of all 22 relational tables and schema state.
                </p>
              </div>
              <Button variant="outline" size="sm" leftIcon={<HardDriveDownload className="w-3.5 h-3.5" />}>
                Export DB Snapshot
              </Button>
            </div>
          </Card>

          {/* Save Action */}
          <div className="flex justify-end">
            <Button variant="accent" size="lg" leftIcon={<Save className="w-4 h-4" />}>
              Save Global Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
