/**
 * @file src/app/admin/gallery/page.tsx
 * @route /admin/gallery
 * @description Master Photo Gallery & Archival Media Management Console (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Server component protecting the gallery CMS with session verification.
 * - Queries gallery_albums and media_assets directly from SQLite via Drizzle ORM.
 * - Supplies academic years, event associations, and asset rosters to AdminGalleryClient.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  getAdminGalleryAlbums, 
  getAnnualPlanYears, 
  getAdminEvents,
  getAlbumMediaAssets 
} from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminGalleryClient } from "./AdminGalleryClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/gallery");
  }

  // Fetch albums
  const albumsResult = await getAdminGalleryAlbums({ limit: 100 });
  const albums = albumsResult.data;

  // Fetch academic years and events for cross-linking
  const academicYears = await getAnnualPlanYears();
  const eventsResult = await getAdminEvents({ limit: 100 });
  const eventsList = eventsResult.data.map((e) => ({ id: e.id, titleEn: e.titleEn }));

  // Fetch assets map for each album
  const albumAssetsMap: Record<string, any[]> = {};
  await Promise.all(
    albums.map(async (alb) => {
      albumAssetsMap[alb.id] = await getAlbumMediaAssets(alb.id);
    })
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Photo Albums & Media Archive"
        subtitle="Curate visual retrospectives, upload photographs, and manage media publications"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Photo Gallery" },
        ]}
      />

      <AdminGalleryClient
        initialAlbums={albums}
        academicYears={academicYears}
        eventsList={eventsList}
        albumAssetsMap={albumAssetsMap}
      />
    </div>
  );
}
