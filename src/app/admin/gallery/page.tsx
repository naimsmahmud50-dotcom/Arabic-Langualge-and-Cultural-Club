/**
 * DEVELOPER NOTE:
 * @file src/app/admin/gallery/page.tsx
 * @route /admin/gallery
 * @description Master Photo Gallery & Archival Media Management Console (Phase 5).
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * CORE CAPABILITIES:
 * - Server component protecting the gallery CMS with session verification.
 * - Queries gallery_albums and media_assets directly from SQLite via Drizzle ORM.
 * - Ingests complete administrative asset inventory (both published and draft items) via getAdminAlbumMediaAssets.
 * - Supplies academic years, event associations, and asset rosters to AdminGalleryClient.
 * - Strictly zero AI emojis.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  getAdminGalleryAlbums, 
  getAnnualPlanYears, 
  getAdminEvents,
  getAdminAlbumMediaAssets 
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

  // Fetch complete admin assets map for each album (including unpublished drafts)
  const albumAssetsMap: Record<string, any[]> = {};
  await Promise.all(
    albums.map(async (alb) => {
      albumAssetsMap[alb.id] = await getAdminAlbumMediaAssets(alb.id);
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
        initialAlbums={albums as any}
        academicYears={academicYears}
        eventsList={eventsList}
        albumAssetsMap={albumAssetsMap}
      />
    </div>
  );
}
