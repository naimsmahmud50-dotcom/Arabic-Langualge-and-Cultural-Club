/**
 * DEVELOPER NOTE:
 * File: src/lib/validations/settings.ts
 * Module: Administrative Site Settings Validation Schema
 * Institution: Kabi Nazrul Government College, Dhaka
 * Phase 1 Enhancement (034-fix-site-settings-wipe-bug):
 * - Implements strict Zod validation for site identity, contact coordinates, social URLs, and SEO metadata.
 * - Supports both full and partial schema evaluation for safe tabbed updates.
 * - Enforces RFC 5322 email patterns, E.164 / local telephone patterns, and valid web protocols.
 * Strictly human vibe; zero AI emojis.
 */

import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid web address starting with http:// or https://" }
  );

const optionalPhone = z
  .string()
  .trim()
  .max(50, { message: "Phone number cannot exceed 50 characters." })
  .refine(
    (val) => {
      if (!val) return true;
      // Allow +, digits, spaces, hyphens, and parentheses
      return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(val);
    },
    { message: "Invalid phone number format." }
  );

const optionalPathOrUrl = z
  .string()
  .trim()
  .max(500, { message: "Path or URL is too long (max 500 characters)." })
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith("/") || val.startsWith("#")) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid path starting with '/' or a web address starting with http:// or https://" }
  );

export const siteSettingsSchema = z.object({
  // General Identity & Branding
  club_name_en: z.string().trim().min(1, "Organization English title is required.").max(200, "Title is too long (max 200 chars).").optional(),
  club_name_ar: z.string().trim().min(1, "Organization Arabic title is required.").max(200, "Title is too long (max 200 chars).").optional(),
  club_short_name_en: z.string().trim().max(100, "Short name cannot exceed 100 characters.").optional(),
  club_short_name_ar: z.string().trim().max(100, "Arabic short name cannot exceed 100 characters.").optional(),
  college_name_en: z.string().trim().max(200, "College name cannot exceed 200 characters.").optional(),
  college_name_ar: z.string().trim().max(200, "Arabic college name cannot exceed 200 characters.").optional(),
  club_tagline_en: z.string().trim().max(300, "Tagline cannot exceed 300 characters.").optional(),
  club_tagline_ar: z.string().trim().max(300, "Tagline cannot exceed 300 characters.").optional(),
  club_motto_en: z.string().trim().max(300, "Motto cannot exceed 300 characters.").optional(),
  club_motto_ar: z.string().trim().max(300, "Motto cannot exceed 300 characters.").optional(),
  founding_year: z.string().trim().max(20, "Founding year cannot exceed 20 characters.").optional(),
  logo_crest_url: optionalPathOrUrl.optional(),
  logo_full_url: optionalPathOrUrl.optional(),

  // Contact Coordinates
  contact_email: z.string().trim().email("Please enter a valid administrative contact email.").optional(),
  contact_phone: optionalPhone.optional(),
  headquarters_address_en: z.string().trim().max(500, "Headquarters address cannot exceed 500 characters.").optional(),
  headquarters_address_ar: z.string().trim().max(500, "Headquarters address cannot exceed 500 characters.").optional(),
  office_hours_en: z.string().trim().max(250, "Office hours cannot exceed 250 characters.").optional(),
  office_hours_ar: z.string().trim().max(250, "Office hours cannot exceed 250 characters.").optional(),

  // Social Channels
  social_facebook: optionalUrl.optional(),
  social_youtube: optionalUrl.optional(),
  social_twitter: optionalUrl.optional(),
  social_instagram: optionalUrl.optional(),
  social_linkedin: optionalUrl.optional(),

  // SEO & Metadata
  meta_description_en: z.string().trim().max(350, "English meta description cannot exceed 350 characters.").optional(),
  meta_description_ar: z.string().trim().max(350, "Arabic meta description cannot exceed 350 characters.").optional(),
  meta_keywords: z.string().trim().max(300, "Meta keywords cannot exceed 300 characters.").optional(),
  canonical_url: optionalUrl.optional(),
  og_image_url: optionalPathOrUrl.optional(),

  // System & Locale Defaults
  theme_default: z.enum(["system", "light", "dark"]).optional(),
  language_default: z.enum(["en", "ar"]).optional(),

  // Navigation & Header CTA
  navigation_menu: z.string().optional(),
  nav_cta_label_en: z.string().trim().max(100, "CTA label cannot exceed 100 characters.").optional(),
  nav_cta_label_ar: z.string().trim().max(100, "Arabic CTA label cannot exceed 100 characters.").optional(),
  nav_cta_link: optionalPathOrUrl.optional(),

  // Homepage Hero Section
  hero_badge_en: z.string().trim().max(200, "Hero badge cannot exceed 200 characters.").optional(),
  hero_badge_ar: z.string().trim().max(200, "Hero badge cannot exceed 200 characters.").optional(),
  hero_arabic_heading: z.string().trim().max(500, "Arabic heading cannot exceed 500 characters.").optional(),
  hero_title_en: z.string().trim().max(300, "Hero title cannot exceed 300 characters.").optional(),
  hero_title_ar: z.string().trim().max(300, "Hero title cannot exceed 300 characters.").optional(),
  hero_subtitle_en: z.string().trim().max(1000, "Hero subtitle cannot exceed 1000 characters.").optional(),
  hero_subtitle_ar: z.string().trim().max(1000, "Hero subtitle cannot exceed 1000 characters.").optional(),
  hero_bg_image_url: optionalPathOrUrl.optional(),
  hero_cta_primary_label_en: z.string().trim().max(100, "CTA label cannot exceed 100 characters.").optional(),
  hero_cta_primary_label_ar: z.string().trim().max(100, "CTA label cannot exceed 100 characters.").optional(),
  hero_cta_primary_link: optionalPathOrUrl.optional(),
  hero_cta_secondary_label_en: z.string().trim().max(100, "CTA label cannot exceed 100 characters.").optional(),
  hero_cta_secondary_label_ar: z.string().trim().max(100, "CTA label cannot exceed 100 characters.").optional(),
  hero_cta_secondary_link: optionalPathOrUrl.optional(),
  hero_cta_tertiary_label_en: z.string().trim().max(100, "CTA label cannot exceed 100 characters.").optional(),
  hero_cta_tertiary_label_ar: z.string().trim().max(100, "CTA label cannot exceed 100 characters.").optional(),
  hero_cta_tertiary_link: optionalPathOrUrl.optional(),
  hero_card_title_en: z.string().trim().max(200, "Card title cannot exceed 200 characters.").optional(),
  hero_card_title_ar: z.string().trim().max(200, "Card title cannot exceed 200 characters.").optional(),
  hero_card_quote_ar: z.string().trim().max(300, "Card quote cannot exceed 300 characters.").optional(),
  hero_card_desc_en: z.string().trim().max(500, "Card description cannot exceed 500 characters.").optional(),
  hero_card_desc_ar: z.string().trim().max(500, "Card description cannot exceed 500 characters.").optional(),
  hero_card_badge_en: z.string().trim().max(100, "Card badge cannot exceed 100 characters.").optional(),
  hero_card_badge_ar: z.string().trim().max(100, "Card badge cannot exceed 100 characters.").optional(),

  // Mission & Intro
  mission_badge_en: z.string().trim().max(200, "Mission badge cannot exceed 200 characters.").optional(),
  mission_badge_ar: z.string().trim().max(200, "Mission badge cannot exceed 200 characters.").optional(),
  mission_title_en: z.string().trim().max(300, "Mission title cannot exceed 300 characters.").optional(),
  mission_title_ar: z.string().trim().max(300, "Mission title cannot exceed 300 characters.").optional(),
  mission_subtitle_ar: z.string().trim().max(500, "Mission subtitle cannot exceed 500 characters.").optional(),
  mission_desc_en: z.string().trim().max(1000, "Mission description cannot exceed 1000 characters.").optional(),
  mission_desc_ar: z.string().trim().max(1000, "Mission description cannot exceed 1000 characters.").optional(),

  // Footer & Legal
  footer_about_text_en: z.string().trim().max(1000, "Footer text cannot exceed 1000 characters.").optional(),
  footer_about_text_ar: z.string().trim().max(1000, "Footer text cannot exceed 1000 characters.").optional(),
  footer_motto_en: z.string().trim().max(300, "Footer motto cannot exceed 300 characters.").optional(),
  footer_motto_ar: z.string().trim().max(300, "Footer motto cannot exceed 300 characters.").optional(),
  footer_copyright_en: z.string().trim().max(500, "Copyright cannot exceed 500 characters.").optional(),
  footer_copyright_ar: z.string().trim().max(500, "Copyright cannot exceed 500 characters.").optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
