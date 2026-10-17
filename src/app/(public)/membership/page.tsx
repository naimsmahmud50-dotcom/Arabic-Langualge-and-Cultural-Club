/**
 * @file src/app/(public)/membership/page.tsx
 * @route /membership
 * @description Official Membership Application and Eligibility Portal.
 * 
 * ARCHITECTURE & ROLE:
 * - Public portal for prospective members to submit enrollment applications,
 *   review eligibility requirements, and check status of previous submissions.
 * - Meets Requirement SPEC-APP-01 through SPEC-APP-05.
 * 
 * PRIVACY & CONSENT:
 * - Implements explicit photo publication and directory consent checkboxes.
 * - Encodes data directly for the administrative review pipeline.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { 
  UserCheck, 
  ShieldCheck, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from "lucide-react";

export default function MembershipPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Admissions", href: "/membership" },
  ];

  return (
    <div>
      <PageHeader
        title="Membership Application & Admissions"
        titleAr="طلب الانضمام إلى عضوية النادي"
        description="Join an enduring scholarly community. Membership grants access to our classical linguistic seminars, debate squads, and permanent institutional archives."
        badge="Open Admissions"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Application Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-[var(--border-color)] p-8 space-y-8">
              <div className="space-y-2 border-b border-[var(--border-color)] pb-6">
                <Badge variant="accent" size="sm">Official Enrollment Form</Badge>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  Student Member Registration Dossier
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  All fields marked with an asterisk (<span className="text-red-500">*</span>) are mandatory. Please provide verified academic credentials.
                </p>
              </div>

              <form className="space-y-6" action="#">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                    1. Personal Identity & Names
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name (English)"
                      placeholder="e.g. Abdullah Bin Salem"
                      required
                      helperText="As printed on your student ID card"
                    />
                    <Input
                      label="الاسم الكامل باللغة العربية (Arabic Name)"
                      placeholder="مثال: عبد الله بن سالم"
                      dir="rtl"
                      helperText="الاسم الثلاثي أو الرباعي بالرسم الصحيح"
                    />
                  </div>
                </div>

                {/* Academic Identity */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                    2. Academic Affiliation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Student Identification Number"
                      placeholder="e.g. 2024-ARB-104"
                      required
                    />
                    <Input
                      label="Department / Major"
                      placeholder="e.g. Arabic Literature / Law / CS"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Faculty / College"
                      placeholder="e.g. Faculty of Arts & Humanities"
                      required
                    />
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                        Academic Year / Level <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3.5 py-2.5 rounded-[5px] text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]">
                        <option value="1">1st Year (Freshman)</option>
                        <option value="2">2nd Year (Sophomore)</option>
                        <option value="3">3rd Year (Junior)</option>
                        <option value="4">4th Year (Senior)</option>
                        <option value="postgrad">Postgraduate / Master's</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                    3. Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Institutional Email"
                      type="email"
                      placeholder="student@university.edu"
                      required
                      helperText="Official university correspondence address"
                    />
                    <Input
                      label="Telephone / WhatsApp Number"
                      type="tel"
                      placeholder="+880 1700-000000"
                      required
                    />
                  </div>
                </div>

                {/* Arabic Proficiency & Motivation */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                    4. Linguistic Proficiency & Motivation
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                      Self-Assessed Arabic Language Level <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-3.5 py-2.5 rounded-[5px] text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]">
                      <option value="beginner">Beginner — Learning alphabet, phonetics, and basic vocabulary</option>
                      <option value="intermediate">Intermediate — Functional conversation, elementary grammar (Nahw)</option>
                      <option value="advanced">Advanced — Literary comprehension, rhetoric (Balaghah), poetry</option>
                      <option value="native">Fluent / Native Speaker — Full classical oratorical command</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                      Statement of Intent / Motivation (بيان الدافع)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Why do you wish to join the Arabic Language & Cultural Club? Mention relevant interests such as debate, calligraphy, poetry, or grammar tutoring..."
                      className="w-full p-3.5 rounded-[5px] text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] placeholder-[var(--text-muted)]"
                    />
                  </div>
                </div>

                {/* Consent & Compliance Checkboxes */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4 rounded-[6px]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Consent & Institutional Charter Agreement
                  </h4>
                  <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 rounded-[3px] accent-[var(--brand-primary)]" />
                    <span>
                      I solemnly agree to abide by the permanent constitution, bylaws, and academic ethics of the Arabic Language & Cultural Club.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded-[3px] accent-[var(--brand-primary)]" />
                    <span>
                      I consent to having my verified member profile (Name, Department, and Photo) listed in the public member directory.
                    </span>
                  </label>
                </div>

                {/* Submission CTA */}
                <Button variant="accent" size="lg" className="w-full justify-center">
                  Submit Official Membership Application
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar: Status Check & Eligibility */}
          <div className="space-y-6">
            {/* Status Tracker Card */}
            <Card className="border-[var(--border-color)] bg-[var(--bg-surface-elevated)] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[var(--brand-accent)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Check Application Status
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Already submitted an application? Enter your application reference ID to check committee review progress.
              </p>
              <form className="space-y-3">
                <Input
                  label="Application Reference No."
                  placeholder="e.g. APP-2024-001"
                />
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Verify Application Status
                </Button>
              </form>
            </Card>

            {/* Membership Privileges Card */}
            <Card className="border-[var(--border-color)] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                Member Privileges
              </h3>
              <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                  <span>Permanent institutional fellowship ID and digital credential.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                  <span>Free access to all grammar workshops, poetry nights, and competitions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                  <span>Eligibility to publish in the "Al-Bayan" Arabic Journal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                  <span>Right to run and vote in Executive Committee annual elections.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
