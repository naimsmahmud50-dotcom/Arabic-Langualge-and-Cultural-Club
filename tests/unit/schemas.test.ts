/**
 * DEVELOPER NOTE:
 * File: tests/unit/schemas.test.ts
 * Purpose: Vitest unit tests for Zod schemas across sections, settings, and contact inquiries.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { describe, it, expect } from "vitest";
import {
  SectionContentDataSchema,
  SectionQuoteSchema,
  SectionContentItemSchema,
  SectionStatItemSchema,
} from "@/lib/schemas/sections";
import { siteSettingsSchema } from "@/lib/validations/settings";
import { ContactInquirySchema } from "@/lib/actions/contact-inquiry";

describe("SectionContentDataSchema Validation", () => {
  it("validates a complete structured section with all fields", () => {
    const validData = {
      heading: "Academic Pillars of Arabic Eloquence",
      subheading: "Foundational traditions in rhetoric and linguistics",
      badge: "Institutional Charter",
      body: "Comprehensive pedagogical treatise covering syntax and morphology.",
      quote: {
        text: "Language is the gateway to civilization and timeless intellect.",
        attribution: "Scholarly Council",
        arabicText: "اللغة وعاء الفكر وحضارة الأمم",
      },
      items: [
        {
          title: "Classical Rhetoric (البلاغة)",
          description: "Metaphor, clarity, and ornamental speech.",
          year: "2026",
          badge: "Core Discipline",
        },
      ],
      stats: [
        {
          label: "Active Fellows",
          value: "150+",
          labelAr: "الأعضاء الفاعلون",
          valueAr: "١٥٠+",
        },
      ],
      imageUrl: "/assets/history-charter.webp",
      buttonText: "Read Full Charter",
      buttonLink: "/about",
      publicationStatus: "published" as const,
    };

    const result = SectionContentDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.heading).toBe("Academic Pillars of Arabic Eloquence");
      expect(result.data.items).toHaveLength(1);
      expect(result.data.stats).toHaveLength(1);
      expect(result.data.quote?.attribution).toBe("Scholarly Council");
    }
  });

  it("applies sensible defaults when optional fields are omitted", () => {
    const emptyPayload = {};
    const result = SectionContentDataSchema.safeParse(emptyPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.heading).toBe("");
      expect(result.data.body).toBe("");
      expect(result.data.items).toEqual([]);
      expect(result.data.stats).toEqual([]);
      expect(result.data.publicationStatus).toBe("published");
    }
  });

  it("rejects invalid publicationStatus enum value", () => {
    const invalidData = {
      publicationStatus: "unknown_status",
    };
    const result = SectionContentDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("SiteSettingsSchema Validation", () => {
  it("validates valid organizational settings payload", () => {
    const validSettings = {
      club_name_en: "Arabic Language & Cultural Club",
      club_name_ar: "نادي اللغة والثقافة العربية",
      contact_email: "secretariat@kngc.edu.bd",
      contact_phone: "+8801712345678",
      canonical_url: "https://arabicclub.org",
      theme_default: "system" as const,
      language_default: "en" as const,
    };

    const result = siteSettingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it("rejects invalid contact email address", () => {
    const invalidSettings = {
      contact_email: "not-an-email-address",
    };
    const result = siteSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("contact_email");
    }
  });

  it("rejects invalid web URL format", () => {
    const invalidUrl = {
      canonical_url: "invalid-url-without-protocol",
    };
    const result = siteSettingsSchema.safeParse(invalidUrl);
    expect(result.success).toBe(false);
  });
});

describe("ContactInquirySchema Validation", () => {
  it("validates a legitimate student inquiry", () => {
    const validInquiry = {
      fullName: "Zayd Ibn Thabit",
      email: "zayd@kngc.edu.bd",
      department: "academic" as const,
      subject: "Inquiry on Classical Syntax Seminar",
      message: "I would like to inquire about the prerequisites for the upcoming Nahw colloquium.",
      website_url: "",
    };

    const result = ContactInquirySchema.safeParse(validInquiry);
    expect(result.success).toBe(true);
  });

  it("rejects inquiries with names under 2 characters", () => {
    const result = ContactInquirySchema.safeParse({
      fullName: "A",
      email: "test@domain.com",
      subject: "General Inquiry",
      message: "Valid message content with sufficient length.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects inquiries with messages under 10 characters", () => {
    const result = ContactInquirySchema.safeParse({
      fullName: "Valid Student",
      email: "student@kngc.edu.bd",
      subject: "Important Matter",
      message: "Too short",
    });
    expect(result.success).toBe(false);
  });
});
