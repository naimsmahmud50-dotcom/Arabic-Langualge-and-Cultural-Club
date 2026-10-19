/**
 * DEVELOPER NOTE:
 * @file src/app/admin/settings/SettingsManagerClient.tsx
 * @description Comprehensive Administrative Settings Console for Brand, Navigation, Hero, Contact, Footer, SEO & Backups.
 * Institution: Kabi Nazrul Government College, Dhaka (Arabic Language & Cultural Club)
 * Phase 4 Enhancement:
 * - Dynamic CMS for all site content: navigation manager, hero section, mission pillars, branding logos, footer copy.
 * - Unified Form State: Manages all setting values in a single persistent React state object.
 * - Persistent DOM Mounting: Keeps all settings tabs mounted in the DOM using CSS hidden toggles
 *   so FormData always includes all inputs across tabs upon submission, preventing data wipes.
 * - Navigation Manager: Allows adding, editing English/Arabic labels, reordering (up/down), toggling visibility, and deleting menu items.
 * - Unsaved Changes Protection: Tracks dirty state and prompts `beforeunload` confirmation.
 * - Interactive Toast Feedback: Provides auto-dismissing and manual-dismissing status alerts.
 * - Zero AI emojis; pure collegiate typography and semantic design.
 */

"use client";

import React, { useState, useActionState, useTransition, useMemo, useEffect } from "react";
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
  RefreshCw,
  X,
  AlertTriangle,
  Menu as MenuIcon,
  LayoutTemplate,
  FileText,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { saveSiteSettingsAction, generateDatabaseBackupAction } from "@/lib/actions/governance";
import { ActionResponse } from "@/lib/auth/types";
import { NavMenuItem, DEFAULT_NAV_ITEMS } from "@/lib/types/settings";

interface SettingsManagerClientProps {
  initialSettings: Record<string, { valueEn: string; valueAr: string; category: string }>;
  existingBackups: Array<{ filename: string; sizeBytes: number; createdAt: Date }>;
}

type TabKey =
  | "general"
  | "navigation"
  | "hero"
  | "contact"
  | "social"
  | "footer"
  | "seo"
  | "system"
  | "backups";

export function SettingsManagerClient({
  initialSettings,
  existingBackups,
}: SettingsManagerClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [backupList, setBackupList] = useState(existingBackups);
  const [backupFeedback, setBackupFeedback] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isBackupPending, startBackupTransition] = useTransition();

  const getVal = (key: string, lang: "en" | "ar" = "en") => {
    const entry = initialSettings[key];
    if (!entry) return "";
    return lang === "ar" ? entry.valueAr : entry.valueEn;
  };

  // 1. Parse initial navigation menu items
  const initialNavItems: NavMenuItem[] = useMemo(() => {
    const rawNavJson = getVal("navigation_menu", "en");
    if (!rawNavJson) return DEFAULT_NAV_ITEMS;
    try {
      const parsed = JSON.parse(rawNavJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, index) => ({
          id: item.id || `nav_${index}`,
          labelEn: item.labelEn || "Link",
          labelAr: item.labelAr || item.labelEn || "رابط",
          href: item.href || "/",
          sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index + 1,
          isVisible: item.isVisible !== false,
          isExternal: Boolean(item.isExternal),
        })).sort((a, b) => a.sortOrder - b.sortOrder);
      }
    } catch {
      // fallback
    }
    return DEFAULT_NAV_ITEMS;
  }, [initialSettings]);

  // 2. Unified state baseline initialized from server data
  const initialFormState = useMemo(() => ({
    // Brand & Identity
    club_name_en: getVal("club_name", "en") || "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka",
    club_name_ar: getVal("club_name", "ar") || "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية، دكا",
    club_short_name_en: getVal("club_short_name", "en") || "Arabic Language & Cultural Club",
    club_short_name_ar: getVal("club_short_name", "ar") || "نادي اللغة والثقافة العربية",
    college_name_en: getVal("college_name", "en") || "Kabi Nazrul Government College, Dhaka",
    college_name_ar: getVal("college_name", "ar") || "كلية كابي نذرول الحكومية، دكا",
    club_tagline_en: getVal("club_tagline", "en") || "Preserving Heritage, Advancing Eloquence, Cultivating Leadership",
    club_tagline_ar: getVal("club_tagline", "ar") || "صون التراث، وترقية البيان، وبناء القيادات",
    club_motto_en: getVal("club_motto", "en") || "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.",
    club_motto_ar: getVal("club_motto", "ar") || "لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ",
    founding_year: getVal("founding_year", "en") || "2022",
    logo_crest_url: getVal("logo_crest_url", "en") || "/images/logo/club-crest-transparent.png",
    logo_full_url: getVal("logo_full_url", "en") || "/images/logo/club-logo-full.png",

    // Navigation & CTA
    navigation_menu: JSON.stringify(initialNavItems),
    nav_cta_label_en: getVal("nav_cta_label", "en") || "Join Club",
    nav_cta_label_ar: getVal("nav_cta_label", "ar") || "انضم للنادي",
    nav_cta_link: getVal("nav_cta_link", "en") || "/membership",

    // Homepage Hero Section
    hero_badge_en: getVal("hero_badge", "en") || "Official Collegiate Society • Kabi Nazrul Govt. College, Dhaka",
    hero_badge_ar: getVal("hero_badge", "ar") || "جمعية جامعية رسمية • كلية كابي نذرول الحكومية، دكا",
    hero_arabic_heading: getVal("hero_arabic_heading", "en") || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • نَادِي اللُّغَةِ وَالثَّقَافَةِ الْعَرَبِيَّةِ - كُلِّيَّةُ كَابِي نَذْرُول الْحُكُومِيَّة",
    hero_title_en: getVal("hero_title", "en") || "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.",
    hero_title_ar: getVal("hero_title", "ar") || "صون التراث، وترقية البيان، وبناء القيادات.",
    hero_subtitle_en: getVal("hero_subtitle", "en") || "An enduring collegiate forum at Kabi Nazrul Government College, Dhaka, dedicated to classical Arabic scholarship, rhetorical mastery, competitive debate, and intellectual fellowship.",
    hero_subtitle_ar: getVal("hero_subtitle", "ar") || "منبر أكاديمي عريق في كلية كابي نذرول الحكومية بدكا، يُعنى بتعليم الفصحى، وبلاغة الخطاب، والمناظرات العلمية، وروح الإخاء المعرفي.",
    hero_bg_image_url: getVal("hero_bg_image_url", "en") || "",
    hero_cta_primary_label_en: getVal("hero_cta_primary_label", "en") || "Apply for Membership",
    hero_cta_primary_label_ar: getVal("hero_cta_primary_label", "ar") || "تقديم طلب العضوية",
    hero_cta_primary_link: getVal("hero_cta_primary_link", "en") || "/membership",
    hero_cta_secondary_label_en: getVal("hero_cta_secondary_label", "en") || "Explore Our Legacy",
    hero_cta_secondary_label_ar: getVal("hero_cta_secondary_label", "ar") || "استكشف مسيرتنا",
    hero_cta_secondary_link: getVal("hero_cta_secondary_link", "en") || "/about",
    hero_cta_tertiary_label_en: getVal("hero_cta_tertiary_label", "en") || "12-Month Calendar",
    hero_cta_tertiary_label_ar: getVal("hero_cta_tertiary_label", "ar") || "التقويم السنوي",
    hero_cta_tertiary_link: getVal("hero_cta_tertiary_link", "en") || "/events",
    hero_card_title_en: getVal("hero_card_title", "en") || "Lisan Al-Arab Heritage",
    hero_card_title_ar: getVal("hero_card_title", "ar") || "تراث لسان العرب",
    hero_card_quote_ar: getVal("hero_card_quote", "en") || "«لُغَةُ الضَّادِ حِلْيَةُ الْأَدَبِ»",
    hero_card_desc_en: getVal("hero_card_desc", "en") || "Dedicated to students, scholars, and orators honoring the classical language of Islamic civilization and literature.",
    hero_card_desc_ar: getVal("hero_card_desc", "ar") || "ملتقى الطلاب والباحثين وخطباء الضاد لخدمة لغة الحضارة الإسلامية الخالدة وآدابها الرصينة.",
    hero_card_badge_en: getVal("hero_card_badge", "en") || "University Chartered",
    hero_card_badge_ar: getVal("hero_card_badge", "ar") || "اعتماد جامعي",

    // Mission & Pillars
    mission_badge_en: getVal("mission_badge", "en") || "Foundational Mandate",
    mission_badge_ar: getVal("mission_badge", "ar") || "الولاية التأسيسية",
    mission_title_en: getVal("mission_title", "en") || "The Purpose & Four Pillars of Our Society",
    mission_title_ar: getVal("mission_title", "ar") || "غاية النادي وأركانه الأربعة",
    mission_subtitle_ar: getVal("mission_subtitle", "en") || "«إِنَّ مِنَ الْبَيَانِ لَسِحْرًا» • أربعة أركان تقوم عليها مسيرتنا في كلية كابي نذرول الحكومية",
    mission_desc_en: getVal("mission_desc", "en") || "Founded as the premier collegiate society at Kabi Nazrul Government College, Dhaka, the Arabic Language & Cultural Club provides an intellectually rigorous sanctuary for the mastery, celebration, and dissemination of classical Arabic letters.",
    mission_desc_ar: getVal("mission_desc", "ar") || "تأسس النادي ليكون الصرح الطلابي الرائد في كلية كابي نذرول الحكومية بدكا، موفراً بيئة أكاديمية رصينة لتعلم العربية وإتقان بيانها.",

    // Contact Coordinates
    contact_email: getVal("contact_email", "en") || "arabicclubkngc2025@gmail.com",
    contact_phone: getVal("contact_phone", "en") || "+880 1700-000000",
    headquarters_address_en: getVal("headquarters_address", "en") || "Department of Arabic & Islamic Studies, Kabi Nazrul Government College, Laxmibazar, Dhaka-1100, Bangladesh",
    headquarters_address_ar: getVal("headquarters_address", "ar") || "قسم اللغة العربية والدراسات الإسلامية، كلية كابي نذرول الحكومية، لکشمي بازار، دكا-1100، بنغلاديش",
    office_hours_en: getVal("office_hours", "en") || "Sunday – Thursday: 10:00 AM – 4:00 PM (Term time)",
    office_hours_ar: getVal("office_hours", "ar") || "الأحد – الخميس: 10:00 صباحاً – 4:00 مساءً (أوقات الدراسة)",

    // Social Channels
    social_facebook: getVal("social_facebook", "en") || "",
    social_youtube: getVal("social_youtube", "en") || "",
    social_twitter: getVal("social_twitter", "en") || "",
    social_instagram: getVal("social_instagram", "en") || "",
    social_linkedin: getVal("social_linkedin", "en") || "",

    // Footer & Legal
    footer_about_text_en: getVal("footer_about_text", "en") || "An enduring institutional archive and digital platform advancing classical Arabic eloquence, literary scholarship, cultural heritage, and student leadership.",
    footer_about_text_ar: getVal("footer_about_text", "ar") || "منصة توثيقية رقمية وأرشيف مؤسسي دائم يرعى الفصاحة العربية، والبحث الأدبي، والتراث العريق، وبناء القيادات الطلابية.",
    footer_motto_en: getVal("footer_motto", "en") || "«لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ»",
    footer_motto_ar: getVal("footer_motto", "ar") || "«لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ»",
    footer_copyright_en: getVal("footer_copyright", "en") || "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka. All institutional rights reserved.",
    footer_copyright_ar: getVal("footer_copyright", "ar") || "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية، دكا. جميع الحقوق محفوظة.",

    // SEO & Metadata
    meta_description_en: getVal("meta_description", "en") || "Preserving heritage, advancing eloquence, and cultivating scholarly student leadership in classical Arabic linguistics and Islamic cultural studies.",
    meta_description_ar: getVal("meta_description", "ar") || "صون التراث اللغوي، وترقية البيان العربي، ورعاية القيادات الطلابية في علوم اللسان والدراسات الثقافية.",
    meta_keywords: getVal("meta_keywords", "en") || "",
    canonical_url: getVal("canonical_url", "en") || "https://kngc-arabic.edu.bd",
    og_image_url: getVal("og_image_url", "en") || "",

    // System Defaults
    theme_default: getVal("theme_default", "en") || "system",
    language_default: getVal("language_default", "en") || "en",
  }), [initialSettings, initialNavItems]);

  const [formDataState, setFormDataState] = useState(initialFormState);
  const [savedBaseline, setSavedBaseline] = useState(initialFormState);
  const [navItems, setNavItems] = useState<NavMenuItem[]>(initialNavItems);

  // Toast notification state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [saveState, formAction, isSaving] = useActionState<ActionResponse | null, FormData>(
    async (prevState, formData) => {
      const res = await saveSiteSettingsAction(prevState, formData);
      if (res.success) {
        setSavedBaseline(formDataState);
        setToast({ type: "success", message: res.message || "Settings saved successfully." });
      } else {
        setToast({ type: "error", message: res.message || "Failed to save settings." });
      }
      return res;
    },
    null
  );

  // Synchronize navItems changes into formDataState.navigation_menu
  const updateNavItemsState = (items: NavMenuItem[]) => {
    // Sort and re-number sort orders
    const normalized = items.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));
    setNavItems(normalized);
    setFormDataState((prev) => ({
      ...prev,
      navigation_menu: JSON.stringify(normalized),
    }));
  };

  const handleNavItemFieldChange = (id: string, field: "labelEn" | "labelAr" | "href" | "isExternal", value: any) => {
    const updated = navItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateNavItemsState(updated);
  };

  const handleToggleNavVisibility = (id: string) => {
    const updated = navItems.map((item) => {
      if (item.id === id) {
        return { ...item, isVisible: !item.isVisible };
      }
      return item;
    });
    updateNavItemsState(updated);
  };

  const handleMoveNavItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;
    const reordered = [...navItems];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateNavItemsState(reordered);
  };

  const handleDeleteNavItem = (id: string) => {
    if (navItems.length <= 1) {
      alert("A minimum of one navigation menu item is required.");
      return;
    }
    const filtered = navItems.filter((i) => i.id !== id);
    updateNavItemsState(filtered);
  };

  const handleAddNavItem = () => {
    const newItem: NavMenuItem = {
      id: `nav_${Date.now()}`,
      labelEn: "New Link",
      labelAr: "رابط جديد",
      href: "/",
      sortOrder: navItems.length + 1,
      isVisible: true,
      isExternal: false,
    };
    updateNavItemsState([...navItems, newItem]);
  };

  // Track standard field change
  const handleFieldChange = (field: keyof typeof initialFormState, value: string) => {
    setFormDataState((prev) => ({ ...prev, [field]: value }));
  };

  // Compute dirty state
  const isDirty = useMemo(() => {
    return Object.keys(formDataState).some(
      (k) => formDataState[k as keyof typeof formDataState] !== savedBaseline[k as keyof typeof savedBaseline]
    );
  }, [formDataState, savedBaseline]);

  // Tab dirty checks for badges
  const isTabDirty = (tabId: TabKey) => {
    switch (tabId) {
      case "general":
        return (
          formDataState.club_name_en !== savedBaseline.club_name_en ||
          formDataState.club_name_ar !== savedBaseline.club_name_ar ||
          formDataState.club_short_name_en !== savedBaseline.club_short_name_en ||
          formDataState.club_short_name_ar !== savedBaseline.club_short_name_ar ||
          formDataState.college_name_en !== savedBaseline.college_name_en ||
          formDataState.college_name_ar !== savedBaseline.college_name_ar ||
          formDataState.club_tagline_en !== savedBaseline.club_tagline_en ||
          formDataState.club_tagline_ar !== savedBaseline.club_tagline_ar ||
          formDataState.club_motto_en !== savedBaseline.club_motto_en ||
          formDataState.club_motto_ar !== savedBaseline.club_motto_ar ||
          formDataState.founding_year !== savedBaseline.founding_year ||
          formDataState.logo_crest_url !== savedBaseline.logo_crest_url ||
          formDataState.logo_full_url !== savedBaseline.logo_full_url
        );
      case "navigation":
        return (
          formDataState.navigation_menu !== savedBaseline.navigation_menu ||
          formDataState.nav_cta_label_en !== savedBaseline.nav_cta_label_en ||
          formDataState.nav_cta_label_ar !== savedBaseline.nav_cta_label_ar ||
          formDataState.nav_cta_link !== savedBaseline.nav_cta_link
        );
      case "hero":
        return (
          formDataState.hero_badge_en !== savedBaseline.hero_badge_en ||
          formDataState.hero_badge_ar !== savedBaseline.hero_badge_ar ||
          formDataState.hero_arabic_heading !== savedBaseline.hero_arabic_heading ||
          formDataState.hero_title_en !== savedBaseline.hero_title_en ||
          formDataState.hero_title_ar !== savedBaseline.hero_title_ar ||
          formDataState.hero_subtitle_en !== savedBaseline.hero_subtitle_en ||
          formDataState.hero_subtitle_ar !== savedBaseline.hero_subtitle_ar ||
          formDataState.hero_bg_image_url !== savedBaseline.hero_bg_image_url ||
          formDataState.hero_cta_primary_label_en !== savedBaseline.hero_cta_primary_label_en ||
          formDataState.hero_cta_primary_label_ar !== savedBaseline.hero_cta_primary_label_ar ||
          formDataState.hero_cta_primary_link !== savedBaseline.hero_cta_primary_link ||
          formDataState.hero_cta_secondary_label_en !== savedBaseline.hero_cta_secondary_label_en ||
          formDataState.hero_cta_secondary_label_ar !== savedBaseline.hero_cta_secondary_label_ar ||
          formDataState.hero_cta_secondary_link !== savedBaseline.hero_cta_secondary_link ||
          formDataState.hero_cta_tertiary_label_en !== savedBaseline.hero_cta_tertiary_label_en ||
          formDataState.hero_cta_tertiary_label_ar !== savedBaseline.hero_cta_tertiary_label_ar ||
          formDataState.hero_cta_tertiary_link !== savedBaseline.hero_cta_tertiary_link ||
          formDataState.hero_card_title_en !== savedBaseline.hero_card_title_en ||
          formDataState.hero_card_title_ar !== savedBaseline.hero_card_title_ar ||
          formDataState.hero_card_quote_ar !== savedBaseline.hero_card_quote_ar ||
          formDataState.hero_card_desc_en !== savedBaseline.hero_card_desc_en ||
          formDataState.hero_card_desc_ar !== savedBaseline.hero_card_desc_ar ||
          formDataState.hero_card_badge_en !== savedBaseline.hero_card_badge_en ||
          formDataState.hero_card_badge_ar !== savedBaseline.hero_card_badge_ar ||
          formDataState.mission_badge_en !== savedBaseline.mission_badge_en ||
          formDataState.mission_badge_ar !== savedBaseline.mission_badge_ar ||
          formDataState.mission_title_en !== savedBaseline.mission_title_en ||
          formDataState.mission_title_ar !== savedBaseline.mission_title_ar ||
          formDataState.mission_subtitle_ar !== savedBaseline.mission_subtitle_ar ||
          formDataState.mission_desc_en !== savedBaseline.mission_desc_en ||
          formDataState.mission_desc_ar !== savedBaseline.mission_desc_ar
        );
      case "contact":
        return (
          formDataState.contact_email !== savedBaseline.contact_email ||
          formDataState.contact_phone !== savedBaseline.contact_phone ||
          formDataState.headquarters_address_en !== savedBaseline.headquarters_address_en ||
          formDataState.headquarters_address_ar !== savedBaseline.headquarters_address_ar ||
          formDataState.office_hours_en !== savedBaseline.office_hours_en ||
          formDataState.office_hours_ar !== savedBaseline.office_hours_ar
        );
      case "social":
        return (
          formDataState.social_facebook !== savedBaseline.social_facebook ||
          formDataState.social_youtube !== savedBaseline.social_youtube ||
          formDataState.social_twitter !== savedBaseline.social_twitter ||
          formDataState.social_instagram !== savedBaseline.social_instagram ||
          formDataState.social_linkedin !== savedBaseline.social_linkedin
        );
      case "footer":
        return (
          formDataState.footer_about_text_en !== savedBaseline.footer_about_text_en ||
          formDataState.footer_about_text_ar !== savedBaseline.footer_about_text_ar ||
          formDataState.footer_motto_en !== savedBaseline.footer_motto_en ||
          formDataState.footer_motto_ar !== savedBaseline.footer_motto_ar ||
          formDataState.footer_copyright_en !== savedBaseline.footer_copyright_en ||
          formDataState.footer_copyright_ar !== savedBaseline.footer_copyright_ar
        );
      case "seo":
        return (
          formDataState.meta_description_en !== savedBaseline.meta_description_en ||
          formDataState.meta_description_ar !== savedBaseline.meta_description_ar ||
          formDataState.meta_keywords !== savedBaseline.meta_keywords ||
          formDataState.canonical_url !== savedBaseline.canonical_url ||
          formDataState.og_image_url !== savedBaseline.og_image_url
        );
      case "system":
        return (
          formDataState.theme_default !== savedBaseline.theme_default ||
          formDataState.language_default !== savedBaseline.language_default
        );
      default:
        return false;
    }
  };

  // Browser navigation unsaved changes alert
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-dismiss success toast after 6 seconds
  useEffect(() => {
    if (toast && toast.type === "success") {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const tabs: Array<{ id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "general", label: "Brand & Identity", icon: Globe },
    { id: "navigation", label: "Navigation Menu", icon: MenuIcon },
    { id: "hero", label: "Hero & Homepage", icon: LayoutTemplate },
    { id: "contact", label: "Contact Coordinates", icon: Mail },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "footer", label: "Footer & Legal", icon: FileText },
    { id: "seo", label: "Search & Metadata", icon: Search },
    { id: "system", label: "System Defaults", icon: Sliders },
    { id: "backups", label: "Backups & Recovery", icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start justify-between p-4 rounded-[6px] border text-xs shadow-sm transition-all ${
            toast.type === "success"
              ? "bg-[var(--bg-surface)] border-[var(--brand-primary)] text-[var(--text-primary)]"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <div>
              <p className="font-semibold">
                {toast.type === "success" ? "Settings Updated" : "Submission Error"}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-[6px] text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>You have unsaved changes in settings. Remember to click &quot;Save Settings&quot; before leaving.</span>
          </div>
          <Badge variant="accent" size="sm">Unsaved Edits</Badge>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-[var(--border-color)] overflow-x-auto gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const tabHasChanges = isTabDirty(tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === "backups" && isDirty) {
                  const confirmSwitch = window.confirm(
                    "You have unsaved settings modifications. Switching to Backups will not discard them, but consider saving first. Proceed?"
                  );
                  if (!confirmSwitch) return;
                }
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors relative cursor-pointer ${
                isActive
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tabHasChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Tab has unsaved changes" />
              )}
              {tab.id === "backups" && backupList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  {backupList.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN SETTINGS FORM - ALL TABS ARE CONTINUOUSLY MOUNTED IN THE DOM */}
      <form action={formAction} className="space-y-6">
        {/* Hidden input for synchronized navigation menu JSON */}
        <input type="hidden" name="navigation_menu" value={formDataState.navigation_menu} />

        {/* ========================================================================= */}
        {/* TAB 1: BRAND & IDENTITY                                                   */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "general" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "general"}
        >
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Brand Nomenclature</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Official Institutional Nomenclature & Logos
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Authoritative organization naming, affiliated college title, insignia paths, and institutional slogans.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization Title (English)"
                name="club_name_en"
                value={formDataState.club_name_en}
                onChange={(e) => handleFieldChange("club_name_en", e.target.value)}
                required
              />
              <Input
                label="الاسم الرسمي باللغة العربية (Arabic Title)"
                name="club_name_ar"
                value={formDataState.club_name_ar}
                onChange={(e) => handleFieldChange("club_name_ar", e.target.value)}
                dir="rtl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Short Name / Acronym (English)"
                name="club_short_name_en"
                value={formDataState.club_short_name_en}
                onChange={(e) => handleFieldChange("club_short_name_en", e.target.value)}
                helperText="Used in header badge and compact mobile branding."
              />
              <Input
                label="الاسم المختصر بالعربية (Arabic Short Name)"
                name="club_short_name_ar"
                value={formDataState.club_short_name_ar}
                onChange={(e) => handleFieldChange("club_short_name_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Affiliated College Name (English)"
                name="college_name_en"
                value={formDataState.college_name_en}
                onChange={(e) => handleFieldChange("college_name_en", e.target.value)}
              />
              <Input
                label="اسم الكلية التابع لها (Arabic College Name)"
                name="college_name_ar"
                value={formDataState.college_name_ar}
                onChange={(e) => handleFieldChange("college_name_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institutional Tagline (English)"
                name="club_tagline_en"
                value={formDataState.club_tagline_en}
                onChange={(e) => handleFieldChange("club_tagline_en", e.target.value)}
              />
              <Input
                label="شعار الكيان باللغة العربية (Arabic Tagline)"
                name="club_tagline_ar"
                value={formDataState.club_tagline_ar}
                onChange={(e) => handleFieldChange("club_tagline_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Motto (English)"
                name="club_motto_en"
                value={formDataState.club_motto_en}
                onChange={(e) => handleFieldChange("club_motto_en", e.target.value)}
              />
              <Input
                label="الشعار اللغوي الرسمي (Arabic Motto)"
                name="club_motto_ar"
                value={formDataState.club_motto_ar}
                onChange={(e) => handleFieldChange("club_motto_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Founding Year"
                name="founding_year"
                value={formDataState.founding_year}
                onChange={(e) => handleFieldChange("founding_year", e.target.value)}
                helperText="Collegiate society establishment year."
              />
              <Input
                label="Official Crest Icon Path / URL"
                name="logo_crest_url"
                value={formDataState.logo_crest_url}
                onChange={(e) => handleFieldChange("logo_crest_url", e.target.value)}
                helperText="Square crest transparent PNG (e.g. /images/logo/club-crest-transparent.png)."
              />
              <Input
                label="Full Horizontal Logo Path / URL"
                name="logo_full_url"
                value={formDataState.logo_full_url}
                onChange={(e) => handleFieldChange("logo_full_url", e.target.value)}
                helperText="Complete horizontal insignia with calligraphy."
              />
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TAB 2: NAVIGATION MANAGER & HEADER CTA                                    */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "navigation" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "navigation"}
        >
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div>
                <Badge variant="accent" size="sm">Site Navigation</Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                  Public Navigation Menu Manager
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Configure primary header links, bilingual titles, sort orders, visibility toggles, and call-to-action buttons.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddNavItem}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Menu Item
              </Button>
            </div>

            {/* Menu Items List */}
            <div className="space-y-3">
              {navItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-[6px] border transition-colors ${
                    item.isVisible
                      ? "bg-[var(--bg-surface)] border-[var(--border-color)]"
                      : "bg-[var(--bg-surface-elevated)]/60 border-[var(--border-subtle)] opacity-70"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Reorder and Status Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-bold text-[var(--text-secondary)]">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveNavItem(index, "up")}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveNavItem(index, "down")}
                        disabled={index === navItems.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleNavVisibility(item.id)}
                        title={item.isVisible ? "Visible on site (Click to hide)" : "Hidden on site (Click to show)"}
                        className={`p-1 rounded transition-colors ${
                          item.isVisible
                            ? "text-[var(--brand-primary)] hover:bg-[var(--bg-surface-hover)]"
                            : "text-amber-600 hover:bg-amber-100/50"
                        }`}
                      >
                        {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                      <input
                        type="text"
                        placeholder="Label (English)"
                        value={item.labelEn}
                        onChange={(e) => handleNavItemFieldChange(item.id, "labelEn", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="العنوان بالعربية"
                        value={item.labelAr}
                        onChange={(e) => handleNavItemFieldChange(item.id, "labelAr", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)] font-arabic"
                      />
                      <input
                        type="text"
                        placeholder="Route (/about, /events)"
                        value={item.href}
                        onChange={(e) => handleNavItemFieldChange(item.id, "href", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                      />
                    </div>

                    {/* Delete Action */}
                    <div className="flex items-center gap-2 justify-end shrink-0">
                      {!item.isVisible && (
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteNavItem(item.id)}
                        title="Delete menu item"
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Header Call-To-Action Button */}
            <div className="border-t border-[var(--border-color)] pt-5 space-y-4">
              <Badge variant="accent" size="sm">Header Action Button</Badge>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Header Main Call-to-Action (CTA)
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Prominent button anchored on the top-right of the desktop navbar and mobile drawer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Button Label (English)"
                  name="nav_cta_label_en"
                  value={formDataState.nav_cta_label_en}
                  onChange={(e) => handleFieldChange("nav_cta_label_en", e.target.value)}
                />
                <Input
                  label="نص الزر بالعربية (Arabic CTA Label)"
                  name="nav_cta_label_ar"
                  value={formDataState.nav_cta_label_ar}
                  onChange={(e) => handleFieldChange("nav_cta_label_ar", e.target.value)}
                  dir="rtl"
                />
                <Input
                  label="Target Link / Route"
                  name="nav_cta_link"
                  value={formDataState.nav_cta_link}
                  onChange={(e) => handleFieldChange("nav_cta_link", e.target.value)}
                  helperText="Default: /membership"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TAB 3: HOMEPAGE HERO & MISSION                                            */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "hero" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "hero"}
        >
          {/* Hero Main Copy */}
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Homepage Showcase</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Hero Section Headline & Visual Background
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Front-page focal presentation: badges, sacred Arabic invocations, primary titles, and background texture.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hero Top Badge (English)"
                name="hero_badge_en"
                value={formDataState.hero_badge_en}
                onChange={(e) => handleFieldChange("hero_badge_en", e.target.value)}
              />
              <Input
                label="شارة العنوان الرئيسي بالعربية (Arabic Badge)"
                name="hero_badge_ar"
                value={formDataState.hero_badge_ar}
                onChange={(e) => handleFieldChange("hero_badge_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <Input
              label="Sacred Arabic Heading / Inscription"
              name="hero_arabic_heading"
              value={formDataState.hero_arabic_heading}
              onChange={(e) => handleFieldChange("hero_arabic_heading", e.target.value)}
              dir="rtl"
              helperText="Traditional invocation displayed atop the hero section (e.g. Bismillah + Society title)."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Main Hero Title (English)"
                name="hero_title_en"
                value={formDataState.hero_title_en}
                onChange={(e) => handleFieldChange("hero_title_en", e.target.value)}
                required
              />
              <Input
                label="العنوان الرئيسي بالعربية (Arabic Hero Title)"
                name="hero_title_ar"
                value={formDataState.hero_title_ar}
                onChange={(e) => handleFieldChange("hero_title_ar", e.target.value)}
                dir="rtl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Hero Subtitle / Narrative (English)
                </label>
                <textarea
                  rows={4}
                  name="hero_subtitle_en"
                  value={formDataState.hero_subtitle_en}
                  onChange={(e) => handleFieldChange("hero_subtitle_en", e.target.value)}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block" dir="rtl">
                  البيان التمهيدي بالعربية (Arabic Hero Subtitle)
                </label>
                <textarea
                  rows={4}
                  dir="rtl"
                  name="hero_subtitle_ar"
                  value={formDataState.hero_subtitle_ar}
                  onChange={(e) => handleFieldChange("hero_subtitle_ar", e.target.value)}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)] font-arabic"
                />
              </div>
            </div>

            <Input
              label="Hero Background Image URL (Optional)"
              name="hero_bg_image_url"
              value={formDataState.hero_bg_image_url}
              onChange={(e) => handleFieldChange("hero_bg_image_url", e.target.value)}
              helperText="Optional custom hero photography. If blank, the collegiate heritage gradient and geometric motifs will be displayed."
            />
          </Card>

          {/* Hero Call-To-Action Buttons */}
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Action Pathways</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Hero Call-to-Action Buttons
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Configure primary, secondary, and tertiary action buttons shown below the hero subtitle.
              </p>
            </div>

            {/* Primary CTA */}
            <div className="p-4 rounded-[6px] bg-[var(--bg-surface-elevated)]/40 border border-[var(--border-subtle)] space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Primary Button (Accent)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Label (English)"
                  name="hero_cta_primary_label_en"
                  value={formDataState.hero_cta_primary_label_en}
                  onChange={(e) => handleFieldChange("hero_cta_primary_label_en", e.target.value)}
                />
                <Input
                  label="النص بالعربية"
                  name="hero_cta_primary_label_ar"
                  value={formDataState.hero_cta_primary_label_ar}
                  onChange={(e) => handleFieldChange("hero_cta_primary_label_ar", e.target.value)}
                  dir="rtl"
                />
                <Input
                  label="Target Link"
                  name="hero_cta_primary_link"
                  value={formDataState.hero_cta_primary_link}
                  onChange={(e) => handleFieldChange("hero_cta_primary_link", e.target.value)}
                />
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="p-4 rounded-[6px] bg-[var(--bg-surface-elevated)]/40 border border-[var(--border-subtle)] space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Secondary Button (Outline)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Label (English)"
                  name="hero_cta_secondary_label_en"
                  value={formDataState.hero_cta_secondary_label_en}
                  onChange={(e) => handleFieldChange("hero_cta_secondary_label_en", e.target.value)}
                />
                <Input
                  label="النص بالعربية"
                  name="hero_cta_secondary_label_ar"
                  value={formDataState.hero_cta_secondary_label_ar}
                  onChange={(e) => handleFieldChange("hero_cta_secondary_label_ar", e.target.value)}
                  dir="rtl"
                />
                <Input
                  label="Target Link"
                  name="hero_cta_secondary_link"
                  value={formDataState.hero_cta_secondary_link}
                  onChange={(e) => handleFieldChange("hero_cta_secondary_link", e.target.value)}
                />
              </div>
            </div>

            {/* Tertiary CTA */}
            <div className="p-4 rounded-[6px] bg-[var(--bg-surface-elevated)]/40 border border-[var(--border-subtle)] space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Tertiary Button (Ghost)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Label (English)"
                  name="hero_cta_tertiary_label_en"
                  value={formDataState.hero_cta_tertiary_label_en}
                  onChange={(e) => handleFieldChange("hero_cta_tertiary_label_en", e.target.value)}
                />
                <Input
                  label="النص بالعربية"
                  name="hero_cta_tertiary_label_ar"
                  value={formDataState.hero_cta_tertiary_label_ar}
                  onChange={(e) => handleFieldChange("hero_cta_tertiary_label_ar", e.target.value)}
                  dir="rtl"
                />
                <Input
                  label="Target Link"
                  name="hero_cta_tertiary_link"
                  value={formDataState.hero_cta_tertiary_link}
                  onChange={(e) => handleFieldChange("hero_cta_tertiary_link", e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Hero Emblem Card */}
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Emblem Feature Card</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Lisan Al-Arab Heritage Emblem Card
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                The institutional card positioned beside the hero headline celebrating classical Arabic traditions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Card Title (English)"
                name="hero_card_title_en"
                value={formDataState.hero_card_title_en}
                onChange={(e) => handleFieldChange("hero_card_title_en", e.target.value)}
              />
              <Input
                label="عنوان البطاقة بالعربية (Arabic Card Title)"
                name="hero_card_title_ar"
                value={formDataState.hero_card_title_ar}
                onChange={(e) => handleFieldChange("hero_card_title_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <Input
              label="Arabic Classical Inscription / Quote"
              name="hero_card_quote_ar"
              value={formDataState.hero_card_quote_ar}
              onChange={(e) => handleFieldChange("hero_card_quote_ar", e.target.value)}
              dir="rtl"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Card Description (English)"
                name="hero_card_desc_en"
                value={formDataState.hero_card_desc_en}
                onChange={(e) => handleFieldChange("hero_card_desc_en", e.target.value)}
              />
              <Input
                label="الوصف بالعربية (Arabic Description)"
                name="hero_card_desc_ar"
                value={formDataState.hero_card_desc_ar}
                onChange={(e) => handleFieldChange("hero_card_desc_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Card Badge (English)"
                name="hero_card_badge_en"
                value={formDataState.hero_card_badge_en}
                onChange={(e) => handleFieldChange("hero_card_badge_en", e.target.value)}
              />
              <Input
                label="شارة الاعتماد بالعربية (Arabic Badge)"
                name="hero_card_badge_ar"
                value={formDataState.hero_card_badge_ar}
                onChange={(e) => handleFieldChange("hero_card_badge_ar", e.target.value)}
                dir="rtl"
              />
            </div>
          </Card>

          {/* Mission & Four Pillars */}
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Foundational Mandate</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                The Purpose & Pillars of the Society
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Front-page mission overview text displayed immediately below the hero showcase.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mission Badge (English)"
                name="mission_badge_en"
                value={formDataState.mission_badge_en}
                onChange={(e) => handleFieldChange("mission_badge_en", e.target.value)}
              />
              <Input
                label="شارة الرسالة بالعربية (Arabic Badge)"
                name="mission_badge_ar"
                value={formDataState.mission_badge_ar}
                onChange={(e) => handleFieldChange("mission_badge_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mission Title (English)"
                name="mission_title_en"
                value={formDataState.mission_title_en}
                onChange={(e) => handleFieldChange("mission_title_en", e.target.value)}
              />
              <Input
                label="عنوان الرسالة بالعربية (Arabic Title)"
                name="mission_title_ar"
                value={formDataState.mission_title_ar}
                onChange={(e) => handleFieldChange("mission_title_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <Input
              label="Arabic Subtitle Inscription"
              name="mission_subtitle_ar"
              value={formDataState.mission_subtitle_ar}
              onChange={(e) => handleFieldChange("mission_subtitle_ar", e.target.value)}
              dir="rtl"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Mission Statement (English)
                </label>
                <textarea
                  rows={4}
                  name="mission_desc_en"
                  value={formDataState.mission_desc_en}
                  onChange={(e) => handleFieldChange("mission_desc_en", e.target.value)}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block" dir="rtl">
                  بيان الرسالة التأسيسية بالعربية (Arabic Mission Statement)
                </label>
                <textarea
                  rows={4}
                  dir="rtl"
                  name="mission_desc_ar"
                  value={formDataState.mission_desc_ar}
                  onChange={(e) => handleFieldChange("mission_desc_ar", e.target.value)}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)] font-arabic"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TAB 4: CONTACT COORDINATES                                                */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "contact" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "contact"}
        >
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
                value={formDataState.contact_email}
                onChange={(e) => handleFieldChange("contact_email", e.target.value)}
                required
                helperText="Must be a valid email format."
              />
              <Input
                label="Secretariat Telephone / Hotline"
                name="contact_phone"
                type="tel"
                value={formDataState.contact_phone}
                onChange={(e) => handleFieldChange("contact_phone", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Secretariat Physical Address (English)"
                name="headquarters_address_en"
                value={formDataState.headquarters_address_en}
                onChange={(e) => handleFieldChange("headquarters_address_en", e.target.value)}
              />
              <Input
                label="عنوان المقر الرئيسي (Arabic Address)"
                name="headquarters_address_ar"
                value={formDataState.headquarters_address_ar}
                onChange={(e) => handleFieldChange("headquarters_address_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Office Hours (English)"
                name="office_hours_en"
                value={formDataState.office_hours_en}
                onChange={(e) => handleFieldChange("office_hours_en", e.target.value)}
              />
              <Input
                label="ساعات العمل الرسمية (Arabic Office Hours)"
                name="office_hours_ar"
                value={formDataState.office_hours_ar}
                onChange={(e) => handleFieldChange("office_hours_ar", e.target.value)}
                dir="rtl"
              />
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TAB 5: SOCIAL MEDIA                                                       */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "social" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "social"}
        >
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Social Channels</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Official Institutional Social Handles
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Supply authorized official handles. Must begin with http:// or https://.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Facebook Page URL"
                name="social_facebook"
                type="url"
                placeholder="https://facebook.com/ArabicClubOfficial"
                value={formDataState.social_facebook}
                onChange={(e) => handleFieldChange("social_facebook", e.target.value)}
              />
              <Input
                label="YouTube Channel URL"
                name="social_youtube"
                type="url"
                placeholder="https://youtube.com/@ArabicClubOfficial"
                value={formDataState.social_youtube}
                onChange={(e) => handleFieldChange("social_youtube", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Twitter / X Profile URL"
                name="social_twitter"
                type="url"
                placeholder="https://x.com/ArabicClub"
                value={formDataState.social_twitter}
                onChange={(e) => handleFieldChange("social_twitter", e.target.value)}
              />
              <Input
                label="Instagram Profile URL"
                name="social_instagram"
                type="url"
                placeholder="https://instagram.com/ArabicClubOfficial"
                value={formDataState.social_instagram}
                onChange={(e) => handleFieldChange("social_instagram", e.target.value)}
              />
              <Input
                label="LinkedIn Organization URL"
                name="social_linkedin"
                type="url"
                placeholder="https://linkedin.com/company/arabic-club"
                value={formDataState.social_linkedin}
                onChange={(e) => handleFieldChange("social_linkedin", e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TAB 6: FOOTER & LEGAL                                                     */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "footer" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "footer"}
        >
          <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4">
              <Badge variant="accent" size="sm">Footer & Archival Identity</Badge>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                Footer Content, Archival Overview & Copyright Notice
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Institutional descriptions, classical mottos, and intellectual property notices displayed across the global page footer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Footer About Narrative (English)
                </label>
                <textarea
                  rows={4}
                  name="footer_about_text_en"
                  value={formDataState.footer_about_text_en}
                  onChange={(e) => handleFieldChange("footer_about_text_en", e.target.value)}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)] block" dir="rtl">
                  البيان التعريفي بأسفل الصفحة بالعربية (Arabic Footer Narrative)
                </label>
                <textarea
                  rows={4}
                  dir="rtl"
                  name="footer_about_text_ar"
                  value={formDataState.footer_about_text_ar}
                  onChange={(e) => handleFieldChange("footer_about_text_ar", e.target.value)}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)] font-arabic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Footer Classical Motto (English)"
                name="footer_motto_en"
                value={formDataState.footer_motto_en}
                onChange={(e) => handleFieldChange("footer_motto_en", e.target.value)}
              />
              <Input
                label="شعار التذييل اللغوي (Arabic Footer Motto)"
                name="footer_motto_ar"
                value={formDataState.footer_motto_ar}
                onChange={(e) => handleFieldChange("footer_motto_ar", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Copyright Notice (English)"
                name="footer_copyright_en"
                value={formDataState.footer_copyright_en}
                onChange={(e) => handleFieldChange("footer_copyright_en", e.target.value)}
              />
              <Input
                label="حقوق النشر والملكية الفكرية بالعربية (Arabic Copyright)"
                name="footer_copyright_ar"
                value={formDataState.footer_copyright_ar}
                onChange={(e) => handleFieldChange("footer_copyright_ar", e.target.value)}
                dir="rtl"
              />
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TAB 7: SEO & METADATA                                                     */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "seo" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "seo"}
        >
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
                  value={formDataState.meta_description_en}
                  onChange={(e) => handleFieldChange("meta_description_en", e.target.value)}
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
                  value={formDataState.meta_description_ar}
                  onChange={(e) => handleFieldChange("meta_description_ar", e.target.value)}
                  className="w-full p-3 rounded-[6px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)] font-arabic"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Meta Keywords (Comma separated)"
                  name="meta_keywords"
                  placeholder="arabic, linguistics, calligraphy, literature, debate, cultural club"
                  value={formDataState.meta_keywords}
                  onChange={(e) => handleFieldChange("meta_keywords", e.target.value)}
                />
                <Input
                  label="Official Canonical Base URL"
                  name="canonical_url"
                  type="url"
                  placeholder="https://kngc-arabic.edu.bd"
                  value={formDataState.canonical_url}
                  onChange={(e) => handleFieldChange("canonical_url", e.target.value)}
                />
              </div>

              <Input
                label="Default OpenGraph Sharing Image URL"
                name="og_image_url"
                placeholder="/images/og/preview.png or https://..."
                value={formDataState.og_image_url}
                onChange={(e) => handleFieldChange("og_image_url", e.target.value)}
                helperText="High-resolution image (1200x630px recommended) for social previews."
              />
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TAB 8: SYSTEM DEFAULTS                                                    */}
        {/* ========================================================================= */}
        <div
          className={activeTab === "system" ? "space-y-6 block" : "hidden"}
          aria-hidden={activeTab !== "system"}
        >
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
                  value={formDataState.theme_default}
                  onChange={(e) => handleFieldChange("theme_default", e.target.value)}
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
                  value={formDataState.language_default}
                  onChange={(e) => handleFieldChange("language_default", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                >
                  <option value="en">English (Primary Navigation)</option>
                  <option value="ar">العربية (Arabic RTL First)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* SUBMIT ACTION BAR (For all content tabs) */}
        {activeTab !== "backups" && (
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[var(--text-muted)]">
              {isDirty ? (
                <span className="text-amber-700 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes detected across tabs
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All tabs in sync with database
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="md"
              disabled={isSaving}
              leftIcon={<Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />}
            >
              {isSaving ? "Saving Settings..." : isDirty ? "Save Settings (Unsaved Changes)" : "Save Settings"}
            </Button>
          </div>
        )}
      </form>

      {/* ========================================================================= */}
      {/* TAB 9: BACKUPS & DISASTER RECOVERY                                        */}
      {/* ========================================================================= */}
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
