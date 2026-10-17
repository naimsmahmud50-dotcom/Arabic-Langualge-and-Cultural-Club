/**
 * @file src/app/(public)/page.tsx
 * @route /
 * @description Master Institutional Homepage for the Arabic Language & Cultural Club.
 * 
 * ARCHITECTURE & ROLE:
 * - Public entryway to the club's digital repository and community.
 * - Showcases verified institutional mission, historical heritage, current leadership preview,
 *   upcoming calendar events, and Arabic learning resource center.
 * - Meets Requirement SPEC-HOM-01 through SPEC-HOM-05.
 * 
 * DESIGN CONSTRAINTS:
 * - Human-curated editorial aesthetic.
 * - Brand palette: Forest green (#173D32), Warm ivory (#F5F0E5), Antique brass (#B18A4A).
 * - Full bilingual typography support (Manrope + Noto Naskh Arabic).
 * - Zero artificial emoji, zero generic AI neon effects.
 */

import React from "react";
import Link from "next/link";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Badge, 
  GeometricPattern, 
  HeritageDivider 
} from "@/components/ui";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  History,
  FileText
} from "lucide-react";
import { getCommitteeTerms, getPublicEvents, getPublicAnnouncements } from "@/lib/db/queries";

export const revalidate = 60; // Refresh every 60 seconds

export default async function HomePage() {
  // Query verified database records for homepage highlights
  const terms = await getCommitteeTerms().catch(() => []);
  const activeTerm = terms.find((t) => t.isCurrent) || terms[0];
  const { data: upcomingEvents = [] } = await getPublicEvents({ limit: 3 }).catch(() => ({ data: [] }));
  const { data: announcements = [] } = await getPublicAnnouncements({ limit: 3 }).catch(() => ({ data: [] }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* HERO SECTION: Institutional Prestige & Calligraphy Header           */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-[var(--brand-dark)] text-[#F5F0E5] pt-24 pb-20 border-b border-[var(--border-color)]">
        {/* Subtle Geometric Background Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <GeometricPattern />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-white/10 border border-white/20 text-xs font-semibold text-[var(--brand-accent)] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Institutional Platform</span>
            </div>

            <div className="space-y-3">
              <p className="font-arabic text-2xl sm:text-3xl text-[var(--brand-accent)] font-semibold leading-relaxed" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • نَادِي اللُّغَةِ وَالثَّقَافَةِ الْعَرَبِيَّةِ
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-serif">
                Preserving Heritage, Advancing Eloquence, Cultivating Leadership.
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-[#D8DFD7] leading-relaxed max-w-2xl font-light">
              An enduring academic forum and student community dedicated to classical Arabic scholarship, cultural legacy, competitive oratory, and intellectual excellence.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/membership">
                <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Apply for Membership
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Explore Our Legacy
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="ghost" size="lg" className="text-[var(--brand-accent)] hover:bg-white/5">
                  12-Month Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PILLARS & CORE VALUES SECTION                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="accent" size="sm">Foundational Mandate</Badge>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Four Pillars of Our Institutional Life
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Guided by scholarly tradition and disciplined stewardship since our inception.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverElevate className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Linguistic Eloquence
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Rigorous immersion in classical Arabic grammar (Nahw), morphology (Sarf), rhetoric (Balaghah), and prose.
                </p>
                <div className="font-arabic text-xs text-[var(--brand-accent)] pt-1" dir="rtl">
                  الفصاحة والبلاغة
                </div>
              </CardContent>
            </Card>

            <Card hoverElevate className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Historical Preservation
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  A permanent archival record honoring our founding scholars, past executive committees, and student achievements.
                </p>
                <div className="font-arabic text-xs text-[var(--brand-accent)] pt-1" dir="rtl">
                  حفظ التراث والتوثيق
                </div>
              </CardContent>
            </Card>

            <Card hoverElevate className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Ethical Leadership
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Democratic governance, mentorship chains between senior alumni and newcomers, and disciplined executive succession.
                </p>
                <div className="font-arabic text-xs text-[var(--brand-accent)] pt-1" dir="rtl">
                  القيادة الرشيدة
                </div>
              </CardContent>
            </Card>

            <Card hoverElevate className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Scholarly Engagement
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Publishing quarterly literary journals, hosting inter-university debate competitions, and public lecture symposiums.
                </p>
                <div className="font-arabic text-xs text-[var(--brand-accent)] pt-1" dir="rtl">
                  النشر والبحث العلمي
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* LEADERSHIP & COMMITTEE BANNER                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 bg-[var(--bg-surface-elevated)] border-y border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <Badge variant="accent" size="sm">Current Governance</Badge>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                Executive Leadership & Council
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {activeTerm ? `Academic Term: ${activeTerm.academicYear} — ${activeTerm.titleEn}` : "Current Governing Committee"}
              </p>
            </div>
            <Link href="/leadership">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Former Committees
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-[var(--border-color)] bg-[var(--bg-surface)]">
              <CardContent className="p-6 space-y-3">
                <Badge variant="neutral" size="sm">Executive Office</Badge>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">
                  Office of the President
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  General executive stewardship, inter-faculty representation, and alignment with the club constitution.
                </p>
                <div className="pt-2 text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                  Presidency & Vice Presidency
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--border-color)] bg-[var(--bg-surface)]">
              <CardContent className="p-6 space-y-3">
                <Badge variant="neutral" size="sm">Academic Affairs</Badge>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">
                  Language & Literary Wing
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Curriculum structuring, Arabic conversation circles, and peer tutoring for non-native speakers.
                </p>
                <div className="pt-2 text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                  Secretariat of Academic Planning
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--border-color)] bg-[var(--bg-surface)]">
              <CardContent className="p-6 space-y-3">
                <Badge variant="neutral" size="sm">Communications</Badge>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">
                  Media & Publications Bureau
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Institutional photography archive, magazine publication, public relations, and event documentation.
                </p>
                <div className="pt-2 text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                  Secretariat of Media & Press
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* UPCOMING EVENTS & 12-MONTH CALENDAR PREVIEW                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="accent" size="sm">Academic Schedule</Badge>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                Calendar & Upcoming Events
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Participate in our literary symposia, competitions, and guest lectures.
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full 12-Month Schedule
              </Button>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((evt) => (
                <Card key={evt.id} hoverElevate className="border-[var(--border-color)]">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--brand-accent)] uppercase">
                        {evt.category || "Event"}
                      </span>
                      <Badge variant="neutral" size="sm">{evt.status}</Badge>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-1">
                      {evt.titleEn}
                    </h3>
                    {evt.titleAr && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">
                        {evt.titleAr}
                      </p>
                    )}

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {evt.summaryEn || "Detailed briefing available on the official event page."}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>{new Date(evt.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <Link href={`/events/${evt.slug}`} className="text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold hover:underline">
                        Details →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-[6px] border border-dashed border-[var(--border-color)] text-center max-w-lg mx-auto">
              <Calendar className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-3 opacity-80" />
              <h4 className="text-base font-bold text-[var(--text-primary)]">Upcoming Events in Preparation</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                The academic secretariat is finalizing dates for the upcoming term. Please consult the full calendar.
              </p>
              <Link href="/events" className="mt-4 inline-block">
                <Button variant="outline" size="sm">Browse Annual Plan</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* INSTITUTIONAL INTEGRITY & MEMBERSHIP INVITATION                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 bg-[var(--brand-primary)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="accent" size="sm" className="bg-white/10 text-[var(--brand-accent)] border-white/20">
            Admissions & Membership
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
            Join the Scholarly Brotherhood of the Arabic Language Club
          </h2>
          <p className="text-base text-[#DCE4DE] max-w-2xl mx-auto leading-relaxed">
            Membership is open to all students passionate about classical Arabic literature, debate, calligraphy, and cultural exploration. Official members receive permanent institutional directory registration, priority library access, and publication eligibility.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link href="/membership">
              <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Submit Membership Application
              </Button>
            </Link>
            <Link href="/members">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Search Member Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
