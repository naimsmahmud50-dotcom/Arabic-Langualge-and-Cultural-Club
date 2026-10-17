/**
 * @file src/components/home/MembershipInvitationSection.tsx
 * @description Formal Membership Invitation & Scholarly Fellowship Call.
 * 
 * ARCHITECTURAL ROLE:
 * - Formal invitation welcoming university students and scholars into club ranks.
 * - Outlines eligibility, fellowship privileges, and admission pathways.
 * - Meets Requirement SPEC-HOM-12 and SPEC-MEM-01.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { UserPlus, CheckCircle2, ArrowRight, ShieldCheck, BookOpen, Users } from "lucide-react";

export function MembershipInvitationSection() {
  const benefits = [
    "Permanent institutional directory registration with verified fellowship ID.",
    "Eligibility for national collegiate Arabic debate delegations and symposium panels.",
    "Full borrowing and research privileges for club manuscripts, journals, and audio archives.",
    "Direct mentorship from senior executive alumni and visiting Arabic philologists.",
    "Participation in voting for executive terms and annual constitution amendments.",
  ];

  return (
    <section className="py-20 bg-[var(--brand-primary)] text-white relative overflow-hidden" aria-label="Membership Invitation">
      {/* Visual Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Narrative Call */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-white/10 border border-white/20 text-xs font-semibold text-[var(--brand-accent)] uppercase tracking-wider">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Admissions & Fellowship Intake</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif leading-tight">
                Join the Scholarly Brotherhood of the Arabic Language Club
              </h2>
              <p className="font-arabic text-xl text-[var(--brand-accent)] font-medium" dir="rtl">
                «انْضَمَّ إِلَى رِحَابِ اللُّغَةِ وَالْأَدَبِ» • بَابُ الِانْتِسَابِ مَفْتُوحٌ لِكُلِّ شَغُوفٍ
              </p>
            </div>

            <p className="text-base text-[#D4DDD6] leading-relaxed font-light">
              Admission is open to all enrolled students and faculty members who possess a genuine passion for classical Arabic prose, poetry, rhetoric, and cultural preservation. No prior formal degree in Arabic is required—only intellectual curiosity and commitment to disciplined practice.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
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

          {/* Right Column: Privilege Card */}
          <div className="lg:col-span-5">
            <Card className="border-white/20 bg-white/10 backdrop-blur-md p-8 text-white space-y-6">
              <div className="border-b border-white/15 pb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--brand-accent)] block">
                  Fellowship Entitlements
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  What Membership Confers
                </h3>
              </div>

              <ul className="space-y-3.5 text-xs text-[#E3ECE5]">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/15 text-[11px] text-[#A6B8AA]">
                Applications undergo expedited review by the Membership Officer within 3 academic working days.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
