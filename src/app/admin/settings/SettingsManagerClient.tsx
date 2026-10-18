/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/admin/settings/SettingsManagerClient.tsx
 * Updated administrative settings defaults to Kabi Nazrul Government College, Dhaka
 * and official contact email (arabicclubkngc2025@gmail.com).
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/app/admin/settings/SettingsManagerClient.tsx
 * @description Interactive Client Console for Site Settings, SEO, and Database Recovery.
 * 
 * ARCHITECTURE & USER EXPERIENCE:
 * - Provides tabs or categorized cards for General Identity, Contact Coordinates, Social Channels, SEO, and Backups.
 * - Connects directly to `saveSiteSettingsAction` and `generateDatabaseBackupAction`.
 * - Provides live download links for verified database snapshots.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography, Lucide SVG icons, and responsive cards.
 * - Meets Requirements REQ-ADM-13, REQ-ADM-14, and SPEC-SET-01 through SPEC-SET-04.
 */

"use client";

import React, { useState, useActionState, useTransition } from "react";
import { Card, Badge, Button, Input, Alert } from "@/components/ui";
import {
  Save,
  Globe,
  Mail,
  Share2,
  Search,
  Sliders,
  HardDriveDownload,
  Database,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { saveSiteSettingsAction, generateDatabaseBackupAction } from "@/lib/actions/governance";
import { ActionResponse } from "@/lib/auth/types";

interface SettingsManagerClientProps {
  initialSettings: Record<string, { valueEn: string; valueAr: string; category: string }>;
  existingBackups: Array<{ filename: string; sizeBytes: number; createdAt: Date }>;
}

export function SettingsManagerClient({
  initialSettings,
  existingBackups,
}: SettingsManagerClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "social" | "seo" | "system" | "backups">("general");
  const [backupList, setBackupList] = useState(existingBackups);
  const [backupFeedback, setBackupFeedback] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isBackupPending, startBackupTransition] = useTransition();

  const [saveState, formAction, isSaving] = useActionState<ActionResponse | null, FormData>(
    saveSiteSettingsAction,
    null
  );

  const getVal = (key: string, lang: "en" | "ar" = "en") => {
    const entry = initialSettings[key];
    if (!entry) return "";
    return lang === "ar" ? entry.valueAr : entry.valueEn;
  };

  const handleGenerateBackup = () => {
    startBackupTransition(async () => {
      try {
        const res = await generateDatabaseBackupAction();
        if (res.success && res.backup) {
          setBackupFeedback({
            success: true,
            message: res.message || "Snapshot generated successfully.",
            details: res.backup,
          });
          setBackupList((prev) => [
            {
              filename: res.backup.filename,
              sizeBytes: res.backup.sizeBytes,
              createdAt: new Date(),
            },
            ...prev,
          ]);
        } else {
          setBackupFeedback({
            success: false,
            message: res.message || "Failed to create database snapshot.",
          });
        }
      } catch (err: any) {
        setBackupFeedback({
          success: false,
          message: err.message || "Operational backup failed.",
        });
      }
    });
  };

  const tabs = [
    { id: "general", label: "Brand & Identity", icon: Globe },
    { id: "contact", label: "Contact Coordinates", icon: Mail },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "seo", label: "Search & Metadata", icon: Search },
    { id: "system", label: "System Defaults", icon: Sliders },
    { id: "backups", label: "Backups & Recovery", icon: Database },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "backups" && backupList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  {backupList.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Save Feedback Alerts */}
      {saveState?.success && (
        <Alert variant="success" title="Settings Saved">
          {saveState.message}
        </Alert>
      )}

      {saveState && !saveState.success && (
        <Alert variant="error" title="Validation Error">
          {saveState.message}
        </Alert>
      )}

      <form action={formAction} className="space-y-6">
        {/* TAB 1: GENERAL IDENTITY */}
        {activeTab === "general" && (
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Brand Nomenclature</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Official Institutional Nomenclature
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Authoritative organization naming and institutional slogans reflected across header, footer, and diplomas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization Title (English)"
                name="club_name_en"
                defaultValue={getVal("club_name", "en") || "Arabic Language & Cultural Club"}
                required
              />
              <Input
                label="الاسم الرسمي باللغة العربية (Arabic Title)"
                name="club_name_ar"
                defaultValue={getVal("club_name", "ar") || "نادي اللغة والثقافة العربية"}
                dir="rtl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institutional Tagline (English)"
                name="club_tagline_en"
                defaultValue={getVal("club_tagline", "en") || "Preserving Heritage, Advancing Eloquence, Cultivating Leadership"}
              />
              <Input
                label="شعار الكيان باللغة العربية (Arabic Tagline)"
                name="club_tagline_ar"
                defaultValue={getVal("club_tagline", "ar") || "صون التراث، وترقية البيان، وبناء القيادات"}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Motto (English)"
                name="club_motto_en"
                defaultValue={getVal("club_motto", "en") || "Preserving Heritage, Advancing Eloquence, Cultivating Leadership."}
              />
              <Input
                label="الشعار اللغوي الرسمي (Arabic Motto)"
                name="club_motto_ar"
                defaultValue={getVal("club_motto", "ar") || "لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ"}
                dir="rtl"
              />
            </div>
          </Card>
        )}

        {/* TAB 2: CONTACT COORDINATES */}
        {activeTab === "contact" && (
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Secretariat Contacts</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Institutional Secretariat Communication Channels
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Verified communication coordinates rendered on the public contact portal and inquiry confirmations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official General Email"
                name="contact_email"
                type="email"
                defaultValue={getVal("contact_email", "en") || "arabicclubkngc2025@gmail.com"}
                required
                helperText="Must be a valid email format."
              />
              <Input
                label="Secretariat Telephone / Hotline"
                name="contact_phone"
                type="tel"
                defaultValue={getVal("contact_phone", "en") || "+880 1700-000000"}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Secretariat Physical Address (English)"
                name="headquarters_address_en"
                defaultValue={getVal("headquarters_address", "en") || "Department of Arabic & Islamic Studies, Kabi Nazrul Government College, Laxmibazar, Dhaka-1100, Bangladesh"}
              />
              <Input
                label="عنوان المقر الرئيسي (Arabic Address)"
                name="headquarters_address_ar"
                defaultValue={getVal("headquarters_address", "ar") || "قسم اللغة العربية والدراسات الإسلامية، كلية كابي نذرول الحكومية، لکشمي بازار، دكا-1100، بنغلاديش"}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Office Hours (English)"
                name="office_hours_en"
                defaultValue={getVal("office_hours", "en") || "Sunday – Thursday: 10:00 AM – 4:00 PM (Term time)"}
              />
              <Input
                label="ساعات العمل الرسمية (Arabic Office Hours)"
                name="office_hours_ar"
                defaultValue={getVal("office_hours", "ar") || "الأحد – الخميس: 10:00 صباحاً – 4:00 مساءً (أوقات الدراسة)"}
                dir="rtl"
              />
            </div>
          </Card>
        )}

        {/* TAB 3: SOCIAL MEDIA */}
        {activeTab === "social" && (
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Social Channels</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Official Institutional Social Handles
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Supply only authorized official handles. Must begin with http:// or https://.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Facebook Page URL"
                name="social_facebook"
                type="url"
                placeholder="https://facebook.com/ArabicClubOfficial"
                defaultValue={getVal("social_facebook", "en")}
              />
              <Input
                label="YouTube Channel URL"
                name="social_youtube"
                type="url"
                placeholder="https://youtube.com/@ArabicClubOfficial"
                defaultValue={getVal("social_youtube", "en")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Twitter / X Profile URL"
                name="social_twitter"
                type="url"
                placeholder="https://x.com/ArabicClub"
                defaultValue={getVal("social_twitter", "en")}
              />
              <Input
                label="Instagram Profile URL"
                name="social_instagram"
                type="url"
                placeholder="https://instagram.com/ArabicClubOfficial"
                defaultValue={getVal("social_instagram", "en")}
              />
              <Input
                label="LinkedIn Organization URL"
                name="social_linkedin"
                type="url"
                placeholder="https://linkedin.com/company/arabic-club"
                defaultValue={getVal("social_linkedin", "en")}
              />
            </div>
          </Card>
        )}

        {/* TAB 4: SEO & METADATA */}
        {activeTab === "seo" && (
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Metadata & Indexing</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Global Search Engine Configuration & OpenGraph
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Controls default search previews, rich social cards, and search crawler parameters.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                  Default Meta Description (English)
                </label>
                <textarea
                  rows={3}
                  name="meta_description_en"
                  defaultValue={getVal("meta_description", "en") || "Preserving heritage, advancing eloquence, and cultivating scholarly student leadership in classical Arabic linguistics and Islamic cultural studies."}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5" dir="rtl">
                  الوصف التعريفي لمحركات البحث (Arabic Meta Description)
                </label>
                <textarea
                  rows={3}
                  name="meta_description_ar"
                  dir="rtl"
                  defaultValue={getVal("meta_description", "ar") || "صون التراث اللغوي، وترقية البيان العربي، ورعاية القيادات الطلابية في علوم اللسان والدراسات الثقافية."}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)] font-arabic"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Meta Keywords (Comma separated)"
                  name="meta_keywords"
                  placeholder="arabic, linguistics, calligraphy, literature, debate, cultural club"
                  defaultValue={getVal("meta_keywords", "en")}
                />
                <Input
                  label="Official Canonical Base URL"
                  name="canonical_url"
                  type="url"
                  placeholder="https://arabicclub.edu"
                  defaultValue={getVal("canonical_url", "en") || "https://arabicclub.internal"}
                />
              </div>

              <Input
                label="Default OpenGraph Sharing Image URL"
                name="og_image_url"
                type="url"
                placeholder="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"
                defaultValue={getVal("og_image_url", "en")}
                helperText="High-resolution image (1200x630px recommended) for social previews."
              />
            </div>
          </Card>
        )}

        {/* TAB 5: SYSTEM DEFAULTS */}
        {activeTab === "system" && (
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">System Configuration</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Default Theme & Localization Parameters
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Institutional defaults applied to unauthenticated first-time visitors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Default Color Theme
                </label>
                <select
                  name="theme_default"
                  defaultValue={getVal("theme_default", "en") || "system"}
                  className="w-full px-3 py-2 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                >
                  <option value="system">System Preference (Automatic)</option>
                  <option value="light">Warm Ivory (Light Mode)</option>
                  <option value="dark">Heritage Forest Green (Dark Mode)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Default Platform Language
                </label>
                <select
                  name="language_default"
                  defaultValue={getVal("language_default", "en") || "en"}
                  className="w-full px-3 py-2 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                >
                  <option value="en">English (Primary Navigation)</option>
                  <option value="ar">العربية (Arabic RTL First)</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* SUBMIT BUTTON (For Settings Tabs) */}
        {activeTab !== "backups" && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="accent"
              size="md"
              disabled={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? "Saving Changes..." : "Save Settings"}
            </Button>
          </div>
        )}
      </form>

      {/* TAB 6: BACKUPS & DISASTER RECOVERY */}
      {activeTab === "backups" && (
        <div className="space-y-6">
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div>
                <Badge variant="accent" size="sm">Operational Continuity</Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                  Database Snapshots & Disaster Recovery
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Generate authenticated, cryptographically signed JSON dumps of all 22 relational tables.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBackup}
                  disabled={isBackupPending}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isBackupPending ? "animate-spin" : ""}`} />}
                >
                  {isBackupPending ? "Creating Snapshot..." : "Generate Verified Snapshot"}
                </Button>

                <a href="/api/admin/backup/export" download>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    leftIcon={<HardDriveDownload className="w-3.5 h-3.5" />}
                  >
                    Download Direct Export
                  </Button>
                </a>
              </div>
            </div>

            {/* Backup Action Feedback */}
            {backupFeedback && (
              <Alert
                variant={backupFeedback.success ? "success" : "error"}
                title={backupFeedback.success ? "Snapshot Created Successfully" : "Snapshot Failed"}
              >
                <div>
                  <p>{backupFeedback.message}</p>
                  {backupFeedback.details && (
                    <div className="mt-2 text-[11px] font-mono bg-[var(--bg-surface-elevated)] p-2 rounded border border-[var(--border-subtle)] space-y-1">
                      <div>File: {backupFeedback.details.filename}</div>
                      <div>SHA-256: {backupFeedback.details.checksumSha256}</div>
                      <div>Size: {(backupFeedback.details.sizeBytes / 1024).toFixed(1)} KB</div>
                    </div>
                  )}
                </div>
              </Alert>
            )}

            {/* Backups List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Available Verified Snapshots ({backupList.length})
              </h4>

              {backupList.length > 0 ? (
                <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-color)] rounded-[6px] overflow-hidden">
                  {backupList.map((b) => (
                    <div
                      key={b.filename}
                      className="p-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-[var(--brand-accent)] border border-[var(--border-subtle)]">
                          <FileCheck2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-[var(--text-primary)]">{b.filename}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            Created on {new Date(b.createdAt).toLocaleString()} • {(b.sizeBytes / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="accent" size="sm">Verified SHA-256</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] text-xs text-[var(--text-secondary)]">
                  No local snapshots generated yet. Click &quot;Generate Verified Snapshot&quot; above to create the initial snapshot.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
