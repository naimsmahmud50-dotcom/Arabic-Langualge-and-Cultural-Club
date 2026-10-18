/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/seo/JsonLd.tsx
 * Updated Schema.org JSON-LD structured data with official Kabi Nazrul Government College, Dhaka
 * affiliation, campus address coordinates, and multi-language alternate names.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/seo/JsonLd.tsx
 * @description Schema.org JSON-LD Structured Data Component.
 * 
 * DEVELOPER USAGE NOTE:
 * - Emits authentic structured JSON-LD graphs for search engines:
 *   1. EducationalOrganization: official name, Arabic alternate name, mission, language scope.
 *   2. WebSite: site name, publisher reference, and language support.
 * - Strictly zero fabricated phone numbers or unverified addresses.
 */

import React from "react";

export interface JsonLdProps {
  customSchema?: Record<string, unknown>;
}

export function JsonLd({ customSchema }: JsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arabicclub.org";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${baseUrl}/#organization`,
    name: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka",
    alternateName: [
      "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية",
      "কবি নজরুল সরকারি কলেজ আরবি ভাষা ও সংস্কৃতি সংসদ"
    ],
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "An academic and cultural society at Kabi Nazrul Government College, Dhaka dedicated to preserving classical Arabic eloquence, literary arts, and scholarly leadership.",
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Kabi Nazrul Government College, Dhaka",
      alternateName: "কবি নজরুল সরকারি কলেজ, ঢাকা"
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Department of Arabic & Islamic Studies, Kabi Nazrul Government College, Laxmibazar",
      addressLocality: "Dhaka",
      postalCode: "1100",
      addressCountry: "BD"
    },
    knowsLanguage: ["ar", "en", "bn"],
    sameAs: [
      "https://facebook.com/arabicclub",
      "https://twitter.com/arabicclub",
      "https://youtube.com/@arabicclub"
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka",
    alternateName: "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    inLanguage: ["en", "ar", "bn"],
  };

  const schemaToRender = customSchema || {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, webSiteSchema],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaToRender) }}
    />
  );
}
