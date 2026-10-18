/**
 * ==============================================================================
 * PAGE COMPONENT: Public Member Directory with Strict Privacy Controls
 * ==============================================================================
 * @file src/app/(public)/members/page.tsx
 * @route /members
 * @access Public
 * @cms_source Database table: `members` via `getPublicMembers({ search, page, limit })`
 * 
 * DEVELOPER ONBOARDING NOTE:
 * ------------------------------------------------------------------------------
 * This page serves as the public verification registry for active club fellows.
 * 
 * PRIVACY GUARANTEES (Strictly Enforced):
 * 1. Only records where `is_public === true` AND `status === 'active'` (or alumni)
 *    are returned by database queries.
 * 2. Personal contact data (telephone numbers, private emails, student IDs,
 *    and reviewer notes) are completely EXCLUDED from the SQL projection.
 * 3. Never display confidential information or mock personal contacts.
 * 4. Elegant Neutral Avatar Fallback: Missing portraits render dignified initials
 *    and an Antique Brass outline.
 * ------------------------------------------------------------------------------
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button, HeritageDivider } from "@/components/ui";
import { 
  getPublicMembers, 
  getMemberCommitteeHistory 
} from "@/lib/db/queries";
import { 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  ArrowRight, 
  Award, 
  Shield, 
  Users, 
  History,
  Lock,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export const metadata: Metadata = {
  title: "Member Directory | Arabic Language & Cultural Club",
  description: "Official public registry of verified members and scholars of the Arabic Language & Cultural Club. Visibility strictly respects individual privacy settings.",
  openGraph: {
    title: "Member Directory — Arabic Language & Cultural Club",
    description: "Search and verify active fellows, student scholars, and alumni of the Arabic Language & Cultural Club.",
  },
};

interface MembersPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { search = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const limit = 12;

  const { data: memberList = [], pagination } = await getPublicMembers({
    search: search.trim() || undefined,
    page: currentPage,
    limit,
  }).catch(() => ({ data: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 1 } }));

  // Query committee history for each member to display historical service badges
  const membersWithRoles = await Promise.all(
    memberList.map(async (member) => {
      const history = await getMemberCommitteeHistory(member.id).catch(() => []);
      const currentRole = history.find((h) => h.isCurrent);
      const pastRolesCount = history.filter((h) => !h.isCurrent).length;
      return {
        ...member,
        currentRole: currentRole ? currentRole.positionTitleEn : null,
        pastRolesCount,
        hasCommitteeService: history.length > 0,
      };
    })
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Directory", href: "/members" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* 1. Header with Breadcrumbs & Privacy Badge */}
      <PageHeader
        title="Institutional Member Directory"
        titleAr="سجل الأعضاء والمنتسبين المعتمدين"
        description="Public registry of active, verified fellows and scholars of the Arabic Language & Cultural Club. Directory publication strictly conforms to individual privacy consent."
        badge="Verified Membership"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        {/* 2. Privacy Policy Guarantee Banner */}
        <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] rounded-[8px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Strict Privacy Safeguards & Data Protection
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Personal telephone numbers, student registration IDs, and private emails are permanently excluded from all public projections.
              </p>
            </div>
          </div>
          <Link href="/policies" className="shrink-0 text-xs font-medium text-[var(--brand-accent)] hover:underline">
            Read Privacy Terms &rarr;
          </Link>
        </div>

        {/* 3. Search & Filter Toolbar */}
        <section className="bg-[var(--bg-surface)] p-6 rounded-[8px] border border-[var(--border-color)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <form method="GET" action="/members" className="w-full sm:max-w-md relative">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by verified name, Arabic name, or ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5 pointer-events-none" />
          </form>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] w-full sm:w-auto justify-between sm:justify-end">
            <span className="font-mono text-[var(--text-muted)]">
              Verified Public Fellows: <strong className="text-[var(--text-primary)]">{pagination.total}</strong>
            </span>
            <Link href="/membership">
              <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Apply to Join
              </Button>
            </Link>
          </div>
        </section>

        {/* 4. Member Directory Cards Grid */}
        <section className="space-y-8" id="members-grid">
          {membersWithRoles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {membersWithRoles.map((member) => (
                <Card 
                  key={member.id} 
                  hoverElevate 
                  className="border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between shadow-sm overflow-hidden"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Member Monogram / Portrait & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-[8px] bg-[var(--bg-surface-elevated)] text-[var(--brand-primary)] flex items-center justify-center font-serif text-lg font-bold border-2 border-[var(--brand-accent)] shrink-0 shadow-xs">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.fullNameEn}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover rounded-[6px]"
                          />
                        ) : (
                          <span>{getInitials(member.fullNameEn)}</span>
                        )}
                      </div>

                      <Badge 
                        variant={member.status === "active" ? "accent" : "neutral"} 
                        size="sm"
                      >
                        {member.status === "active" ? "Active Fellow" : member.status}
                      </Badge>
                    </div>

                    {/* Names & Membership Identifier */}
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight truncate">
                        {member.fullNameEn}
                      </h4>
                      {member.fullNameAr && (
                        <p className="font-arabic text-xs text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {member.fullNameAr}
                        </p>
                      )}
                      <p className="text-[11px] font-mono text-[var(--text-muted)]">
                        ID: {member.membershipId}
                      </p>
                    </div>

                    {/* Committee Officer Service Badge (if applicable) */}
                    {member.currentRole ? (
                      <div className="py-1 px-2.5 rounded-[4px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 text-[11px] font-medium flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{member.currentRole}</span>
                      </div>
                    ) : member.pastRolesCount > 0 ? (
                      <div className="py-1 px-2.5 rounded-[4px] bg-[var(--bg-surface-elevated)] text-[var(--brand-accent)] border border-[var(--border-color)] text-[11px] font-medium flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>Past Committee Officer</span>
                      </div>
                    ) : null}

                    {/* Biography snippet */}
                    {member.bioEn && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 pt-1 border-t border-[var(--border-subtle)]">
                        {member.bioEn}
                      </p>
                    )}
                  </CardContent>

                  {/* Card Footer with Induction Date */}
                  <div className="px-6 py-3 bg-[var(--bg-surface-elevated)] border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      Fellow since {new Date(member.joinedAt).getFullYear()}
                    </span>
                    <span className="text-[var(--brand-primary)] font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={<Search className="w-10 h-10 text-[var(--brand-accent)]" />}
                title={search ? `No Public Fellows Matching "${search}"` : "Directory Registry Under Update"}
                description={
                  search 
                    ? "Try adjusting your search terms or verify the spelling of the member's name or membership ID." 
                    : "No public member listings are currently available for this view. Check back shortly."
                }
                actionLabel={search ? "Clear Search Filter" : "Explore Founders Archive"}
                actionHref={search ? "/members" : "/founders"}
              />
            </div>
          )}

          {/* 5. Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link href={`/members?page=${currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                    <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>
                    Previous
                  </Button>
                )}

                {currentPage < pagination.totalPages ? (
                  <Link href={`/members?page=${currentPage + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                      Next
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 6. Archival Cross-Link Navigation Banner */}
        <section className="bg-[var(--bg-surface)] p-8 rounded-[8px] border border-[var(--border-color)] shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                Interested in Joining Our Academic Brotherhood?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                Membership in the Arabic Language & Cultural Club provides access to advanced syntax circles, oratorical training, calligraphy workshops, and publication opportunities.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/about">
                <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
                  About Our Charter
                </Button>
              </Link>
              <Link href="/leadership">
                <Button variant="outline" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
                  Governing Leadership
                </Button>
              </Link>
              <Link href="/membership">
                <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Membership Application
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
