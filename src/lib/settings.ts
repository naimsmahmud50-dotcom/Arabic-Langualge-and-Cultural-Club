/**
 * DEVELOPER NOTE:
 * @file src/lib/settings.ts
 * @description Central Typed Site Settings Engine & Invalidation Layer (Phase 4).
 * Provides cached, strongly-typed retrieval of all institutional site settings,
 * including Navigation, Brand Logos, Hero Section, Contact Coordinates, and Footer copy.
 * 
 * ARCHITECTURE & DEFENSE IN DEPTH:
 * - Employs React cache() + Next.js unstable_cache() with tag "site-settings".
 * - Resilient Fail-Safe: Every single field has an authoritative default fallback matching
 *   the verified collegiate identity of Kabi Nazrul Government College, Dhaka.
 * - JSON Parsing Defense: Safely parses navigation menus with schema fallback on corruption.
 * - Zero AI emojis; pure institutional typography and semantic clarity.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

export * from "./types/settings";
import { NavMenuItem, SiteSettings, DEFAULT_NAV_ITEMS, DEFAULT_SITE_SETTINGS } from "./types/settings";

/**
 * Direct un-cached database query for settings.
 */
export async function fetchSiteSettingsDirect(): Promise<SiteSettings> {
  try {
    const rows = await db.select().from(siteSettings);
    const map: Record<string, { valueEn: string | null; valueAr: string | null }> = {};
    for (const r of rows) {
      map[r.key] = { valueEn: r.valueEn, valueAr: r.valueAr };
    }

    const get = (key: string, lang: "en" | "ar" = "en", fallback: string): string => {
      const entry = map[key];
      if (!entry) return fallback;
      const val = lang === "ar" ? entry.valueAr : entry.valueEn;
      return (val !== null && val !== undefined && val !== "") ? val : fallback;
    };

    // Parse navigation menu JSON
    let navigationMenu: NavMenuItem[] = DEFAULT_NAV_ITEMS;
    const rawNavJson = map["navigation_menu"]?.valueEn;
    if (rawNavJson) {
      try {
        const parsed = JSON.parse(rawNavJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          navigationMenu = parsed.map((item, index) => ({
            id: item.id || `nav_${index}`,
            labelEn: item.labelEn || "Link",
            labelAr: item.labelAr || item.labelEn || "رابط",
            href: item.href || "/",
            sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index + 1,
            isVisible: item.isVisible !== false,
            isExternal: Boolean(item.isExternal),
          })).sort((a, b) => a.sortOrder - b.sortOrder);
        }
      } catch (err) {
        console.warn("[SiteSettings] Malformed navigation_menu JSON; falling back to default.", err);
      }
    }

    return {
      // General & Brand Identity
      club_name_en: get("club_name", "en", DEFAULT_SITE_SETTINGS.club_name_en),
      club_name_ar: get("club_name", "ar", DEFAULT_SITE_SETTINGS.club_name_ar),
      club_short_name_en: get("club_short_name", "en", DEFAULT_SITE_SETTINGS.club_short_name_en),
      club_short_name_ar: get("club_short_name", "ar", DEFAULT_SITE_SETTINGS.club_short_name_ar),
      college_name_en: get("college_name", "en", DEFAULT_SITE_SETTINGS.college_name_en),
      college_name_ar: get("college_name", "ar", DEFAULT_SITE_SETTINGS.college_name_ar),
      club_tagline_en: get("club_tagline", "en", DEFAULT_SITE_SETTINGS.club_tagline_en),
      club_tagline_ar: get("club_tagline", "ar", DEFAULT_SITE_SETTINGS.club_tagline_ar),
      club_motto_en: get("club_motto", "en", DEFAULT_SITE_SETTINGS.club_motto_en),
      club_motto_ar: get("club_motto", "ar", DEFAULT_SITE_SETTINGS.club_motto_ar),
      founding_year: get("founding_year", "en", DEFAULT_SITE_SETTINGS.founding_year),
      logo_crest_url: get("logo_crest_url", "en", DEFAULT_SITE_SETTINGS.logo_crest_url),
      logo_full_url: get("logo_full_url", "en", DEFAULT_SITE_SETTINGS.logo_full_url),

      // Contact Coordinates
      contact_email: get("contact_email", "en", DEFAULT_SITE_SETTINGS.contact_email),
      contact_phone: get("contact_phone", "en", DEFAULT_SITE_SETTINGS.contact_phone),
      headquarters_address_en: get("headquarters_address", "en", DEFAULT_SITE_SETTINGS.headquarters_address_en),
      headquarters_address_ar: get("headquarters_address", "ar", DEFAULT_SITE_SETTINGS.headquarters_address_ar),
      office_hours_en: get("office_hours", "en", DEFAULT_SITE_SETTINGS.office_hours_en),
      office_hours_ar: get("office_hours", "ar", DEFAULT_SITE_SETTINGS.office_hours_ar),

      // Social Media
      social_facebook: get("social_facebook", "en", DEFAULT_SITE_SETTINGS.social_facebook),
      social_youtube: get("social_youtube", "en", DEFAULT_SITE_SETTINGS.social_youtube),
      social_twitter: get("social_twitter", "en", DEFAULT_SITE_SETTINGS.social_twitter),
      social_instagram: get("social_instagram", "en", DEFAULT_SITE_SETTINGS.social_instagram),
      social_linkedin: get("social_linkedin", "en", DEFAULT_SITE_SETTINGS.social_linkedin),

      // SEO & Meta
      meta_description_en: get("meta_description", "en", DEFAULT_SITE_SETTINGS.meta_description_en),
      meta_description_ar: get("meta_description", "ar", DEFAULT_SITE_SETTINGS.meta_description_ar),
      meta_keywords: get("meta_keywords", "en", DEFAULT_SITE_SETTINGS.meta_keywords),
      canonical_url: get("canonical_url", "en", DEFAULT_SITE_SETTINGS.canonical_url),
      og_image_url: get("og_image_url", "en", DEFAULT_SITE_SETTINGS.og_image_url),

      // System
      theme_default: get("theme_default", "en", DEFAULT_SITE_SETTINGS.theme_default),
      language_default: get("language_default", "en", DEFAULT_SITE_SETTINGS.language_default),

      // Navigation
      navigation_menu: navigationMenu,
      nav_cta_label_en: get("nav_cta_label", "en", DEFAULT_SITE_SETTINGS.nav_cta_label_en),
      nav_cta_label_ar: get("nav_cta_label", "ar", DEFAULT_SITE_SETTINGS.nav_cta_label_ar),
      nav_cta_link: get("nav_cta_link", "en", DEFAULT_SITE_SETTINGS.nav_cta_link),

      // Hero Section
      hero_badge_en: get("hero_badge", "en", DEFAULT_SITE_SETTINGS.hero_badge_en),
      hero_badge_ar: get("hero_badge", "ar", DEFAULT_SITE_SETTINGS.hero_badge_ar),
      hero_arabic_heading: get("hero_arabic_heading", "en", DEFAULT_SITE_SETTINGS.hero_arabic_heading),
      hero_title_en: get("hero_title", "en", DEFAULT_SITE_SETTINGS.hero_title_en),
      hero_title_ar: get("hero_title", "ar", DEFAULT_SITE_SETTINGS.hero_title_ar),
      hero_subtitle_en: get("hero_subtitle", "en", DEFAULT_SITE_SETTINGS.hero_subtitle_en),
      hero_subtitle_ar: get("hero_subtitle", "ar", DEFAULT_SITE_SETTINGS.hero_subtitle_ar),
      hero_bg_image_url: get("hero_bg_image_url", "en", DEFAULT_SITE_SETTINGS.hero_bg_image_url),
      hero_cta_primary_label_en: get("hero_cta_primary_label", "en", DEFAULT_SITE_SETTINGS.hero_cta_primary_label_en),
      hero_cta_primary_label_ar: get("hero_cta_primary_label", "ar", DEFAULT_SITE_SETTINGS.hero_cta_primary_label_ar),
      hero_cta_primary_link: get("hero_cta_primary_link", "en", DEFAULT_SITE_SETTINGS.hero_cta_primary_link),
      hero_cta_secondary_label_en: get("hero_cta_secondary_label", "en", DEFAULT_SITE_SETTINGS.hero_cta_secondary_label_en),
      hero_cta_secondary_label_ar: get("hero_cta_secondary_label", "ar", DEFAULT_SITE_SETTINGS.hero_cta_secondary_label_ar),
      hero_cta_secondary_link: get("hero_cta_secondary_link", "en", DEFAULT_SITE_SETTINGS.hero_cta_secondary_link),
      hero_cta_tertiary_label_en: get("hero_cta_tertiary_label", "en", DEFAULT_SITE_SETTINGS.hero_cta_tertiary_label_en),
      hero_cta_tertiary_label_ar: get("hero_cta_tertiary_label", "ar", DEFAULT_SITE_SETTINGS.hero_cta_tertiary_label_ar),
      hero_cta_tertiary_link: get("hero_cta_tertiary_link", "en", DEFAULT_SITE_SETTINGS.hero_cta_tertiary_link),
      hero_card_title_en: get("hero_card_title", "en", DEFAULT_SITE_SETTINGS.hero_card_title_en),
      hero_card_title_ar: get("hero_card_title", "ar", DEFAULT_SITE_SETTINGS.hero_card_title_ar),
      hero_card_quote_ar: get("hero_card_quote", "en", DEFAULT_SITE_SETTINGS.hero_card_quote_ar),
      hero_card_desc_en: get("hero_card_desc", "en", DEFAULT_SITE_SETTINGS.hero_card_desc_en),
      hero_card_desc_ar: get("hero_card_desc", "ar", DEFAULT_SITE_SETTINGS.hero_card_desc_ar),
      hero_card_badge_en: get("hero_card_badge", "en", DEFAULT_SITE_SETTINGS.hero_card_badge_en),
      hero_card_badge_ar: get("hero_card_badge", "ar", DEFAULT_SITE_SETTINGS.hero_card_badge_ar),

      // Mission
      mission_badge_en: get("mission_badge", "en", DEFAULT_SITE_SETTINGS.mission_badge_en),
      mission_badge_ar: get("mission_badge", "ar", DEFAULT_SITE_SETTINGS.mission_badge_ar),
      mission_title_en: get("mission_title", "en", DEFAULT_SITE_SETTINGS.mission_title_en),
      mission_title_ar: get("mission_title", "ar", DEFAULT_SITE_SETTINGS.mission_title_ar),
      mission_subtitle_ar: get("mission_subtitle", "en", DEFAULT_SITE_SETTINGS.mission_subtitle_ar),
      mission_desc_en: get("mission_desc", "en", DEFAULT_SITE_SETTINGS.mission_desc_en),
      mission_desc_ar: get("mission_desc", "ar", DEFAULT_SITE_SETTINGS.mission_desc_ar),

      // Footer
      footer_about_text_en: get("footer_about_text", "en", DEFAULT_SITE_SETTINGS.footer_about_text_en),
      footer_about_text_ar: get("footer_about_text", "ar", DEFAULT_SITE_SETTINGS.footer_about_text_ar),
      footer_motto_en: get("footer_motto", "en", DEFAULT_SITE_SETTINGS.footer_motto_en),
      footer_motto_ar: get("footer_motto", "ar", DEFAULT_SITE_SETTINGS.footer_motto_ar),
      footer_copyright_en: get("footer_copyright", "en", DEFAULT_SITE_SETTINGS.footer_copyright_en),
      footer_copyright_ar: get("footer_copyright", "ar", DEFAULT_SITE_SETTINGS.footer_copyright_ar),
    };
  } catch (err) {
    console.error("[SiteSettings] Database query failed, utilizing resilient defaults:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Cached getter for SiteSettings:
 * Wraps unstable_cache with tag 'site-settings' so revalidateTag('site-settings') invalidates it immediately.
 * Further memoized per-request with React cache().
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return unstable_cache(
    async () => fetchSiteSettingsDirect(),
    ["site-settings-v1"],
    {
      tags: ["site-settings"],
      revalidate: 60,
    }
  )();
});
