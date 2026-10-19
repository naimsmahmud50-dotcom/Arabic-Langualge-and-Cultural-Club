/**
 * DEVELOPER NOTE:
 * Module: src/lib/schemas/sections.ts
 * Purpose: Shared Zod schemas and validation utilities for CMS page sections.
 * Used by: PageSectionModal (Admin UI), savePageSectionAction (Server Action),
 *          and getPageWithSections/parseSectionJson (Public Page Query).
 * Architecture:
 * - Guarantees end-to-end type safety between admin editor and public page rendering.
 * - Supports bilingual structured content (English and Arabic with RTL).
 * - Backward-compatible: plain text is gracefully normalized into structured format.
 * - Strictly human vibe: zero AI emojis.
 */

import { z } from "zod";

// ==============================================================================
// 1. NESTED SUB-SCHEMAS
// ==============================================================================

export const SectionQuoteSchema = z.object({
  text: z.string().default(""),
  attribution: z.string().optional(),
  arabicText: z.string().optional(),
});

export type SectionQuote = z.infer<typeof SectionQuoteSchema>;

export const SectionContentItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().default(""),
  arabicTitle: z.string().optional(),
  description: z.string().default(""),
  arabicDescription: z.string().optional(),
  iconName: z.string().optional(),
  badge: z.string().optional(),
  year: z.string().optional(),
  date: z.string().optional(),
  citation: z.string().optional(),
  isVerified: z.boolean().optional(),
  imageUrl: z.string().optional(),
  imageCaption: z.string().optional(),
  label: z.string().optional(),
  value: z.string().optional(),
});

export type SectionContentItem = z.infer<typeof SectionContentItemSchema>;

export const SectionStatItemSchema = z.object({
  label: z.string().default(""),
  value: z.string().default(""),
  labelAr: z.string().optional(),
  valueAr: z.string().optional(),
  change: z.string().optional(),
});

export type SectionStatItem = z.infer<typeof SectionStatItemSchema>;

// ==============================================================================
// 2. ROOT SECTION CONTENT SCHEMA
// ==============================================================================

export const SectionContentDataSchema = z.object({
  heading: z.string().optional().default(""),
  subheading: z.string().optional().default(""),
  subtitle: z.string().optional().default(""), // Accepted alias for subheading
  badge: z.string().optional().default(""),
  body: z.string().optional().default(""),
  quote: SectionQuoteSchema.optional(),
  items: z.array(SectionContentItemSchema).optional().default([]),
  stats: z.array(SectionStatItemSchema).optional().default([]),
  imageUrl: z.string().optional().default(""),
  imageCaption: z.string().optional().default(""),
  documentUrl: z.string().optional().default(""),
  documentTitle: z.string().optional().default(""),
  documentSize: z.string().optional().default(""),
  buttonText: z.string().optional().default(""),
  buttonLink: z.string().optional().default(""),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional().default("published"),
});

export type SectionContentData = z.infer<typeof SectionContentDataSchema>;

// ==============================================================================
// 3. PARSER & NORMALIZER UTILITY
// ==============================================================================

/**
 * Safely parses raw text or JSON from SQLite page_sections table.
 * 
 * Rules:
 * 1. Null, empty, or whitespace-only strings return an empty object.
 * 2. If text starts with '{' or '[', attempt JSON.parse:
 *    - On success: normalizes subtitle/subheading and defaults.
 *    - On failure: logs warning and returns fallback object with { body: rawText }.
 * 3. If text is plain string: wraps as { body: rawText } for backward compatibility.
 */
export function safeParseSectionJson(rawText: string | null | undefined): SectionContentData {
  if (!rawText || typeof rawText !== "string") {
    return {
      heading: "",
      subheading: "",
      subtitle: "",
      badge: "",
      body: "",
      items: [],
      stats: [],
      imageUrl: "",
      imageCaption: "",
      documentUrl: "",
      documentTitle: "",
      documentSize: "",
      buttonText: "",
      buttonLink: "",
      publicationStatus: "published",
    };
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      heading: "",
      subheading: "",
      subtitle: "",
      badge: "",
      body: "",
      items: [],
      stats: [],
      imageUrl: "",
      imageCaption: "",
      documentUrl: "",
      documentTitle: "",
      documentSize: "",
      buttonText: "",
      buttonLink: "",
      publicationStatus: "published",
    };
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return {
          heading: "",
          subheading: "",
          subtitle: "",
          badge: "",
          body: "",
          items: parsed,
          stats: [],
          imageUrl: "",
          imageCaption: "",
          documentUrl: "",
          documentTitle: "",
          documentSize: "",
          buttonText: "",
          buttonLink: "",
          publicationStatus: "published",
        };
      }

      // Alias normalization between subheading and subtitle
      const subheading = parsed.subheading || parsed.subtitle || "";
      const subtitle = parsed.subtitle || parsed.subheading || "";

      return {
        heading: parsed.heading || "",
        subheading,
        subtitle,
        badge: parsed.badge || "",
        body: parsed.body || "",
        quote: parsed.quote ? {
          text: parsed.quote.text || "",
          attribution: parsed.quote.attribution || "",
          arabicText: parsed.quote.arabicText || "",
        } : undefined,
        items: Array.isArray(parsed.items) ? parsed.items : [],
        stats: Array.isArray(parsed.stats) ? parsed.stats : [],
        imageUrl: parsed.imageUrl || "",
        imageCaption: parsed.imageCaption || "",
        documentUrl: parsed.documentUrl || "",
        documentTitle: parsed.documentTitle || "",
        documentSize: parsed.documentSize || "",
        buttonText: parsed.buttonText || "",
        buttonLink: parsed.buttonLink || "",
        publicationStatus: parsed.publicationStatus || "published",
      };
    } catch (err) {
      console.warn("[CMS Warning] Failed to parse JSON section content; falling back to body wrap:", err);
      return {
        heading: "",
        subheading: "",
        subtitle: "",
        badge: "",
        body: trimmed,
        items: [],
        stats: [],
        imageUrl: "",
        imageCaption: "",
        documentUrl: "",
        documentTitle: "",
        documentSize: "",
        buttonText: "",
        buttonLink: "",
        publicationStatus: "published",
      };
    }
  }

  // Plain text backward compatibility: wrap raw text in body
  return {
    heading: "",
    subheading: "",
    subtitle: "",
    badge: "",
    body: trimmed,
    items: [],
    stats: [],
    imageUrl: "",
    imageCaption: "",
    documentUrl: "",
    documentTitle: "",
    documentSize: "",
    buttonText: "",
    buttonLink: "",
    publicationStatus: "published",
  };
}

// ==============================================================================
// 4. SERIALIZATION HELPER
// ==============================================================================

/**
 * Serializes SectionContentData into formatted JSON string for SQLite storage.
 * Omit empty or undefined fields to keep database payloads compact.
 */
export function serializeSectionJson(data: Partial<SectionContentData>): string {
  const clean: Record<string, any> = {};

  if (data.heading?.trim()) clean.heading = data.heading.trim();
  if (data.subheading?.trim()) clean.subheading = data.subheading.trim();
  if (data.subtitle?.trim() && !clean.subheading) clean.subheading = data.subtitle.trim();
  if (data.badge?.trim()) clean.badge = data.badge.trim();
  if (data.body?.trim()) clean.body = data.body.trim();

  if (data.quote && (data.quote.text?.trim() || data.quote.attribution?.trim())) {
    clean.quote = {
      text: data.quote.text?.trim() || "",
      attribution: data.quote.attribution?.trim() || "",
      arabicText: data.quote.arabicText?.trim() || "",
    };
  }

  if (Array.isArray(data.items) && data.items.length > 0) {
    clean.items = data.items.map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      title: item.title?.trim() || "",
      ...(item.arabicTitle?.trim() ? { arabicTitle: item.arabicTitle.trim() } : {}),
      description: item.description?.trim() || "",
      ...(item.arabicDescription?.trim() ? { arabicDescription: item.arabicDescription.trim() } : {}),
      ...(item.iconName?.trim() ? { iconName: item.iconName.trim() } : {}),
      ...(item.badge?.trim() ? { badge: item.badge.trim() } : {}),
      ...(item.year?.trim() ? { year: item.year.trim() } : {}),
      ...(item.date?.trim() ? { date: item.date.trim() } : {}),
      ...(item.citation?.trim() ? { citation: item.citation.trim() } : {}),
      ...(item.isVerified !== undefined ? { isVerified: item.isVerified } : {}),
      ...(item.label?.trim() ? { label: item.label.trim() } : {}),
      ...(item.value?.trim() ? { value: item.value.trim() } : {}),
    }));
  }

  if (Array.isArray(data.stats) && data.stats.length > 0) {
    clean.stats = data.stats.map((s) => ({
      label: s.label?.trim() || "",
      value: s.value?.trim() || "",
      ...(s.labelAr?.trim() ? { labelAr: s.labelAr.trim() } : {}),
      ...(s.valueAr?.trim() ? { valueAr: s.valueAr.trim() } : {}),
      ...(s.change?.trim() ? { change: s.change.trim() } : {}),
    }));
  }

  if (data.imageUrl?.trim()) clean.imageUrl = data.imageUrl.trim();
  if (data.imageCaption?.trim()) clean.imageCaption = data.imageCaption.trim();
  if (data.documentUrl?.trim()) clean.documentUrl = data.documentUrl.trim();
  if (data.documentTitle?.trim()) clean.documentTitle = data.documentTitle.trim();
  if (data.documentSize?.trim()) clean.documentSize = data.documentSize.trim();
  if (data.buttonText?.trim()) clean.buttonText = data.buttonText.trim();
  if (data.buttonLink?.trim()) clean.buttonLink = data.buttonLink.trim();

  return JSON.stringify(clean, null, 2);
}
