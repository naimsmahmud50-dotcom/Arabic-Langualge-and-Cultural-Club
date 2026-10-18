/**
 * @file src/app/(public)/membership/page.tsx
 * @route /membership
 * @description Official Membership Application and Admissions Portal.
 * 
 * ARCHITECTURE & ROLE:
 * - Public portal for prospective student members to submit admissions applications,
 *   review eligibility requirements, and check status of previous submissions.
 * - Server component with dynamic SEO metadata and accessible semantic structure.
 * - Embeds client-side `MembershipPortalView` handling interactive admissions workflows.
 * 
 * REQUIREMENTS COVERED:
 * - REQ-PUB-13: Comprehensive membership admissions workflow.
 * - SPEC-APP-01 through SPEC-APP-06.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import React from "react";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { MembershipPortalView } from "./MembershipPortalView";

export const metadata: Metadata = {
  title: "Membership Admissions & Application | Arabic Language & Cultural Club",
  description: "Official admissions portal for prospective student members of the Arabic Language & Cultural Club. Submit your admissions dossier or securely verify application status.",
  openGraph: {
    title: "Membership Admissions | Arabic Language & Cultural Club",
    description: "Submit your student admissions dossier or check the review status of your application.",
  },
};

export default function MembershipPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Admissions", href: "/membership" },
  ];

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950/50 pb-20">
      <PageHeader
        title="Membership Application & Admissions"
        titleAr="طلب الانضمام إلى عضوية النادي"
        description="Join an enduring scholarly community. Membership grants access to our classical linguistic seminars, debate squads, manuscript archives, and cultural assemblies."
        badge="Open Admissions"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <MembershipPortalView />
      </div>
    </div>
  );
}
