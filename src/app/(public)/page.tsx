/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/(public)/page.tsx
 * Module: Master Flagship Institutional Homepage & Overview Dashboard
 * Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
 * Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
 * 
 * ARCHITECTURE & ROLE (Feature 033 Refactoring):
 * - Serves as the central executive overview dashboard for the institution.
 * - Eliminates redundant monolithic cascading of all sub-pages into one continuous vertical scroll.
 * - Each major division is cleanly routed to its own standalone page:
 *   1. /about — Permanent charter, institutional narrative, mission, pillars, and cultural circles.
 *   2. /history — Chronological timeline of milestones and genesis.
 *   3. /founders — Verified Roll of Honor for founding conveners and scholars.
 *   4. /leadership — Governing Councils, executive committees by academic term.
 *   5. /events — 12-month annual plan and calendar of colloquia, debates, and symposia.
 *   6. /gallery — Permanent photographic archive and media collections.
 *   7. /resources — Arabic linguistic guides, grammar treatises, and digital library.
 *   8. /news — Official secretarial gazettes, communiqués, and bulletins.
 *   9. /publications — Literary periodicals (Al-Bayan), monographs, and distinction awards.
 *   10. /contact — Secretariat headquarters, verified coordinates, and correspondence portal.
 *   11. /membership — Admissions portal, applicant criteria, and registration.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 */

import React from "react";
import type { Metadata } from "next";
import {
  HeroSection,
  IntroductionSection,
  OverviewGatewaySection,
  UpcomingEventsSection,
  GalleryPreviewSection,
  MembershipInvitationSection,
  VerifiedContactSection,
  NewsAnnouncementsSection,
  CommitteePreviewSection,
  LearningResourcesSection,
} from "@/components/home";
import {
  getCommitteeTerms,
  getCommitteeMembersByTerm,
  getPublicEvents,
  getPublicLearningResources,
  getPublicPublications,
  getPublicAnnouncements,
  getPublicGalleryAlbums,
  getPublicSiteSettings,
} from "@/lib/db/queries";
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings";

export const revalidate = 60; // Refresh dynamic queries every 60 seconds

export const metadata: Metadata = {
  title: "Arabic Language & Cultural Club — Kabi Nazrul Govt. College, Dhaka",
  description: "Official institutional digital platform of the Arabic Language & Cultural Club at Kabi Nazrul Government College, Dhaka. An academic forum and student society dedicated to classical Arabic scholarship, rhetorical mastery, competitive debate, and cultural legacy.",
  openGraph: {
    title: "Arabic Language & Cultural Club — Kabi Nazrul Govt. College, Dhaka",
    description: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership at Kabi Nazrul Government College, Dhaka.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arabic Language & Cultural Club — Kabi Nazrul Govt. College, Dhaka",
    description: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership at Kabi Nazrul Government College, Dhaka.",
  },
};

export default async function HomePage() {
  // 1. Fetch foundational committee terms to determine active term
  const terms = await getCommitteeTerms().catch(() => []);
  const activeTerm = terms.find((t) => t.isCurrent) || terms[0];

  // 2. Query dynamic sections concurrently in parallel
  const [
    eventsResult,
    resourcesResult,
    publications,
    announcementsResult,
    albumsResult,
    settings,
    siteSettings,
    committeeOfficers,
  ] = await Promise.all([
    getPublicEvents({ status: "upcoming", limit: 3 }).catch(() => ({ data: [] })),
    getPublicLearningResources({ limit: 4 }).catch(() => ({ data: [] })),
    getPublicPublications().catch(() => []),
    getPublicAnnouncements({ limit: 3 }).catch(() => ({ data: [] })),
    getPublicGalleryAlbums({ limit: 4 }).catch(() => ({ data: [] })),
    getPublicSiteSettings().catch(() => ({})),
    getSiteSettings().catch(() => DEFAULT_SITE_SETTINGS),
    activeTerm ? getCommitteeMembersByTerm(activeTerm.id).catch(() => []) : Promise.resolve([]),
  ]);

  const nextUpcomingEvent = eventsResult.data[0];
  const latestAnnouncement = announcementsResult.data[0];
  const latestAlbum = albumsResult.data[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Flagship Institutional Hero */}
      <HeroSection
        stats={{
          foundingYear: parseInt(siteSettings.founding_year, 10) || 2022,
          upcomingEvents: eventsResult.data.length,
        }}
        settings={siteSettings}
      />

      {/* 2. Institutional Overview: Mission, Vision & Core Pillars */}
      <IntroductionSection settings={siteSettings} />

      {/* 3. Upcoming Events Strip */}
      <UpcomingEventsSection events={eventsResult.data} />

      {/* 4. Latest News & Secretarial Bulletins */}
      <NewsAnnouncementsSection announcements={announcementsResult.data} />

      {/* 5. Curated Visual Archives Highlights Grid */}
      <GalleryPreviewSection albums={albumsResult.data} />

      {/* 6. Active Executive Committee Preview */}
      <CommitteePreviewSection
        termTitle={activeTerm?.titleEn}
        academicYear={activeTerm?.academicYear}
        officers={committeeOfficers}
      />

      {/* 7. Learning Resources Teaser */}
      <LearningResourcesSection resources={resourcesResult.data} />

      {/* 8. Central Gateway Hub: Connecting Visitors to Dedicated Standalone Pages */}
      <OverviewGatewaySection
        stats={{
          upcomingEventsCount: eventsResult.data.length,
          nextEventTitle: nextUpcomingEvent?.titleEn,
          nextEventDate: nextUpcomingEvent?.startTime ? new Date(nextUpcomingEvent.startTime).toISOString().split("T")[0] : null,
          albumsCount: albumsResult.data.length,
          latestAlbumTitle: latestAlbum?.titleEn,
          resourcesCount: resourcesResult.data.length,
          announcementsCount: announcementsResult.data.length,
          latestAnnouncementTitle: latestAnnouncement?.titleEn,
          activeTermTitle: activeTerm?.titleEn,
          publicationsCount: publications.length,
        }}
      />

      {/* 9. Membership Fellowship Invitation */}
      <MembershipInvitationSection />

      {/* 10. Verified Institutional Coordinates & Contacts */}
      <VerifiedContactSection settings={settings} />
    </div>
  );
}
