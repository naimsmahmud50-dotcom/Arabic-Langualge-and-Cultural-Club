/**
 * @file src/app/(public)/members/page.tsx
 * @route /members
 * @description Public Institutional Member Directory with Privacy Controls.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows searching and verifying registered, active club fellows and scholars.
 * - Queries `getPublicMembers({ search, page })` with strict privacy projection.
 * - Meets Requirement SPEC-MEM-01 through SPEC-MEM-04.
 * 
 * PRIVACY SAFEGUARDS:
 * - Only members with `is_public: true` and `status: 'active'` are surfaced.
 * - Private email addresses, telephone numbers, and student IDs are excluded from DB queries.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicMembers } from "@/lib/db/queries";
import { Search, ShieldCheck, UserCheck, Calendar, ArrowRight } from "lucide-react";

export const revalidate = 60;

interface MembersPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { search = "", page = "1" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  const { data: memberList = [], pagination } = await getPublicMembers({
    search: search || undefined,
    page: currentPage,
    limit: 12,
  }).catch(() => ({ data: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 1 } }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Directory", href: "/members" },
  ];

  return (
    <div>
      <PageHeader
        title="Institutional Member Directory"
        titleAr="سجل الأعضاء والمنتسبين المعتمدين"
        description="Public registry of active, verified members of the Arabic Language & Cultural Club. Directory visibility respects individual member privacy consent."
        badge="Verified Membership"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Search & Filter Toolbar */}
        <div className="bg-[var(--bg-surface-elevated)] p-6 rounded-[6px] border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <form method="GET" action="/members" className="w-full sm:max-w-md relative">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by verified name, Arabic name, or ID..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span>Verified Public Fellows: <strong className="text-[var(--text-primary)]">{pagination.total}</strong></span>
            <Link href="/membership">
              <Button variant="accent" size="sm">
                Apply to Join
              </Button>
            </Link>
          </div>
        </div>

        {/* Member Directory Grid */}
        {memberList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {memberList.map((member) => (
              <Card key={member.id} hoverElevate className="border-[var(--border-color)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-lg border border-[var(--border-color)] shrink-0">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.fullNameEn}
                          className="w-full h-full object-cover rounded-[6px]"
                        />
                      ) : (
                        member.fullNameEn.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {member.fullNameEn}
                      </h4>
                      {member.fullNameAr && (
                        <p className="font-arabic text-xs text-[var(--brand-accent)] truncate" dir="rtl">
                          {member.fullNameAr}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    {member.bioEn && (
                      <p className="line-clamp-2 leading-relaxed">
                        {member.bioEn}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="font-mono">{member.membershipId}</span>
                    <Badge variant="accent" size="sm">Active Fellow</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Verified Members Found"
            description={
              search
                ? `No public members matched your query "${search}". Try another name or clear the filter.`
                : "The public registry is being synchronized. Registered members who granted privacy consent will appear here."
            }
            actionLabel="Reset Search Filter"
            actionHref="/members"
          />
        )}
      </div>
    </div>
  );
}
