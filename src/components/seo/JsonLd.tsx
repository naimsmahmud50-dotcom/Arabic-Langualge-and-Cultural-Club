/**
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
    name: "Arabic Language & Cultural Club",
    alternateName: "نادي اللغة والثقافة العربية",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "An academic and cultural society dedicated to preserving classical Arabic eloquence, literary arts, and scholarly leadership.",
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
    name: "Arabic Language & Cultural Club",
    alternateName: "نادي اللغة والثقافة العربية",
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
