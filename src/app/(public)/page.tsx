/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/(public)/page.tsx
 * Updated flagship homepage SEO metadata and branding to Kabi Nazrul Government College, Dhaka.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/app/(public)/page.tsx
 * @route /
 * @description Master Flagship Institutional Homepage for the Arabic Language & Cultural Club.
 * 
 * ARCHITECTURE & ROLE:
 * - Public entryway to the club's digital repository, academic fellowship, and cultural activities.
 * - Implements all 14 required institutional sections:
 *   1. Institutional hero with clear headline, description, and meaningful calls to action.
 *   2. Introduction to the club (Mission, Vision, and Four Pillars).
 *   3. Founders & Archival Origins preview.
 *   4. Current Governing Committee preview.
 *   5. Upcoming Academic Events & Lectures.
 *   6. 12-Month Annual Operational Plan milestones.
 *   7. Signature Cultural Programs & Circles.
 *   8. Arabic Learning Resources & Digital Library.
 *   9. Collegiate Achievements & Official Publications.
 *   10. Latest Secretariat Bulletins & Announcements.
 *   11. Visual Archives & Photographic Albums.
 *   12. Membership Invitation & Fellowship privileges.
 *   13. Verified Campus Coordinates & Contacts.
 *   14. Full Institutional Footer (rendered by shared public layout).
 * 
 * INSTITUTIONAL DATA INTEGRITY:
 * - Fetches real published records from the database in parallel.
 * - Zero fabricated people, statistics, dates, or trophies.
 * - Graceful fallback and empty states when content is in archival ingestion.
 * 
 * MEETS REQUIREMENTS:
 * - SPEC-HOM-01 through SPEC-HOM-14
 * - REQ-PUB-01, REQ-PUB-02
 */

import React from "react";
import type { Metadata } from "next";
import {
  HeroSection,
  IntroductionSection,
  FoundersPreviewSection,
  CommitteePreviewSection,
  UpcomingEventsSection,
  AnnualPlanSection,
  CulturalProgramsSection,
  LearningResourcesSection,
  AchievementsSection,
  NewsAnnouncementsSection,
  GalleryPreviewSection,
  MembershipInvitationSection,
  VerifiedContactSection,
} from "@/components/home";
import {
  getPublicFounders,
  getCommitteeTerms,
  getCommitteeMembersByTerm,
  getPublicEvents,
  getPublicAnnualPlans,
  getPublicLearningResources,
  getPublicAchievements,
  getPublicPublications,
  getPublicAnnouncements,
  getPublicGalleryAlbums,
  getPublicSiteSettings,
} from "@/lib/db/queries";

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

  // 2. Query all dynamic sections concurrently in parallel
  const [
    founders,
    officers,
    eventsResult,
    plans,
    resourcesResult,
    achievements,
    publications,
    announcementsResult,
    albumsResult,
    settings,
  ] = await Promise.all([
    getPublicFounders().catch(() => []),
    activeTerm ? getCommitteeMembersByTerm(activeTerm.id).catch(() => []) : Promise.resolve([]),
    getPublicEvents({ status: "upcoming", limit: 3 }).catch(() => ({ data: [] })),
    getPublicAnnualPlans().catch(() => []),
    getPublicLearningResources({ limit: 4 }).catch(() => ({ data: [] })),
    getPublicAchievements().catch(() => []),
    getPublicPublications().catch(() => []),
    getPublicAnnouncements({ limit: 3 }).catch(() => ({ data: [] })),
    getPublicGalleryAlbums({ limit: 4 }).catch(() => ({ data: [] })),
    getPublicSiteSettings().catch(() => ({})),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Institutional Hero */}
      <HeroSection
        stats={{
          foundingYear: 2022,
          upcomingEvents: eventsResult.data.length,
        }}
      />

      {/* 2. Introduction to the Club & Four Pillars */}
      <IntroductionSection />

      {/* 3. Founders & Archival Genesis Preview */}
      <FoundersPreviewSection founders={founders} />

      {/* 4. Current Governing Committee Preview */}
      <CommitteePreviewSection
        termTitle={activeTerm?.titleEn}
        academicYear={activeTerm?.academicYear}
        officers={officers}
      />

      {/* 5. Upcoming Events & Scholarly Assemblies */}
      <UpcomingEventsSection events={eventsResult.data} />

      {/* 6. 12-Month Annual Operational Plan Highlights */}
      <AnnualPlanSection plans={plans} />

      {/* 7. Signature Cultural Programs & Rhetoric Circles */}
      <CulturalProgramsSection />

      {/* 8. Arabic Learning Resources & Digital Library */}
      <LearningResourcesSection resources={resourcesResult.data} />

      {/* 9. Honors, Accolades & Official Publications */}
      <AchievementsSection
        achievements={achievements}
        publications={publications}
      />

      {/* 10. Latest News & Institutional Notices */}
      <NewsAnnouncementsSection announcements={announcementsResult.data} />

      {/* 11. Visual Archives & Photo Gallery Preview */}
      <GalleryPreviewSection albums={albumsResult.data} />

      {/* 12. Membership Invitation & Fellowship Privileges */}
      <MembershipInvitationSection />

      {/* 13. Verified Institutional Coordinates & Contacts */}
      <VerifiedContactSection settings={settings} />

      {/* 14. Full Institutional Footer is rendered globally via src/app/(public)/layout.tsx */}
    </div>
  );
}
