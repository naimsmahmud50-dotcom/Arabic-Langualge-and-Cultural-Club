/**
 * @file src/app/robots.ts
 * @description Dynamic Robots.txt Route Handler for Search Engine Crawlers.
 * 
 * DEVELOPER USAGE NOTE:
 * - Allows indexing across all public scholarly routes (home, about, history, events, news, etc.).
 * - Strictly disallows administrative, private API, and session endpoints (/admin/*, /api/admin/*).
 * - References the dynamic XML sitemap at /sitemap.xml.
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arabicclub.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/admin",
          "/api/admin/",
          "/admin/*",
          "/api/admin/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
