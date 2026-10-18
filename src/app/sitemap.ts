/**
 * @file src/app/sitemap.ts
 * @description Dynamic XML Sitemap Generator for the Arabic Language & Cultural Club.
 * 
 * DEVELOPER USAGE NOTE:
 * - Generates sitemap entries for all core institutional routes with appropriate change frequencies and priorities.
 * - Dynamically queries published events, news communiqués, and gallery albums from SQLite.
 * - Excludes draft, archived, or administrative paths.
 */

import { MetadataRoute } from "next";
import { getPublicEvents, getPublicAnnouncements, getPublicGalleryAlbums } from "@/lib/db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arabicclub.org";
  const now = new Date();

  // 1. Core Institutional Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/founders`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leadership`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publications`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/membership`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // 2. Published Events
  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const eventsResult = await getPublicEvents({ limit: 50 });
    const eventsList = eventsResult.data || [];
    eventRoutes = eventsList.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.startTime ? new Date(e.startTime) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[Sitemap] Error fetching events:", err);
  }

  // 3. Published Announcements / News
  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const newsResult = await getPublicAnnouncements({ limit: 50 });
    const newsList = newsResult.data || [];
    newsRoutes = newsList.map((n) => ({
      url: `${baseUrl}/news/${n.slug}`,
      lastModified: n.publishedAt ? new Date(n.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap] Error fetching news:", err);
  }

  // 4. Published Gallery Albums
  let galleryRoutes: MetadataRoute.Sitemap = [];
  try {
    const albumsResult = await getPublicGalleryAlbums({ limit: 50 });
    const albumList = albumsResult.data || [];
    galleryRoutes = albumList.map((a) => ({
      url: `${baseUrl}/gallery/${a.slug}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap] Error fetching gallery:", err);
  }

  return [...staticRoutes, ...eventRoutes, ...newsRoutes, ...galleryRoutes];
}
