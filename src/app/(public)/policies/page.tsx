/**
 * @file src/app/(public)/policies/page.tsx
 * @route /policies
 * @description Institutional Privacy, Data Protection, Media Consent & Accessibility Charters.
 * 
 * ARCHITECTURE & ROLE:
 * - Public governance documentation defining member privacy rights, photo consent
 *   rules, archival storage terms, and WCAG 2.2 AA compliance commitments.
 * - Meets Requirement SPEC-POL-01 through SPEC-POL-04.
 */

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge } from "@/components/ui";
import { Shield, Eye, FileText, CheckCircle2 } from "lucide-react";

export default function PoliciesPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Governance & Policies", href: "/policies" },
  ];

  return (
    <div>
      <PageHeader
        title="Institutional Policies & Charters"
        titleAr="السياسات المؤسسية وميثاق الخصوصية"
        description="Official charters governing member privacy safeguards, digital media publication consent, archival preservation, and web accessibility standards."
        badge="Regulatory Compliance"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Privacy Policy */}
        <section id="privacy" className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--brand-accent)]" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              1. Institutional Privacy & Data Protection Policy
            </h2>
          </div>
          <Card className="border-[var(--border-color)] p-6 space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              The Arabic Language & Cultural Club is firmly committed to safeguarding the personal information of student members, committee officers, and applicants. Personal contact information (telephone numbers, personal home addresses, and private student ID identifiers) are treated with strict confidentiality.
            </p>
            <h4 className="font-bold text-[var(--text-primary)] text-sm pt-2">
              Protected Information Boundaries:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Private emails and phone numbers are stored securely and never exposed via public API endpoints or client-rendered pages.</li>
              <li>Only verified names, approved academic department designations, and explicit roles appear in public directories.</li>
              <li>Administrative access to membership data is role-restricted and monitored via immutable audit logs.</li>
            </ul>
          </Card>
        </section>

        {/* Media & Photo Publication Consent */}
        <section id="consent" className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[var(--brand-accent)]" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              2. Media & Photographic Publication Consent Charter
            </h2>
          </div>
          <Card className="border-[var(--border-color)] p-6 space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              Photographs captured during official club assemblies, Arabic calligraphy workshops, debate competitions, and public symposia form part of the club's permanent historical archive.
            </p>
            <p className="text-xs">
              <strong>Right to Revocation:</strong> Any member or event participant holds the institutional right to request the redaction or removal of specific individual portraits from public gallery albums by writing directly to <span className="font-mono text-[var(--brand-accent)]">privacy@arabicclub.edu</span>.
            </p>
          </Card>
        </section>

        {/* Accessibility Statement */}
        <section id="accessibility" className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--brand-accent)]" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              3. Web Accessibility Statement (WCAG 2.2 AA)
            </h2>
          </div>
          <Card className="border-[var(--border-color)] p-6 space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              We believe knowledge and eloquence should be accessible to all students. This digital platform has been engineered in alignment with Web Content Accessibility Guidelines (WCAG) 2.2 Level AA requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Full semantic HTML hierarchy with correct document language attributes (<span className="font-mono">lang="en"</span> / <span className="font-mono">dir="rtl"</span> for Arabic excerpts).</li>
              <li>High-contrast color tokens exceeding 4.5:1 ratio for all body text.</li>
              <li>Keyboard-visible focus rings and full keyboard navigable menus and drawers.</li>
              <li>Respect for user <span className="font-mono">prefers-reduced-motion</span> browser preferences.</li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
