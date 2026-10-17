/**
 * @file src/app/(public)/contact/page.tsx
 * @route /contact
 * @description Official Inquiries, Correspondence, and Institutional Partnerships.
 * 
 * ARCHITECTURE & ROLE:
 * - Public gateway for student questions, university liaison, inter-collegiate
 *   debate invitations, and historical archive queries.
 * - Meets Requirement SPEC-CNT-01 through SPEC-CNT-04.
 */

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { Mail, MapPin, Phone, Clock, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div>
      <PageHeader
        title="Contact & Institutional Relations"
        titleAr="التواصل والعلاقات المؤسسية"
        description="Official correspondence desk for university inquiries, academic partnerships, inter-collegiate debate invites, and membership questions."
        badge="General Secretariat"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information & Hours */}
          <div className="space-y-6">
            <Card className="border-[var(--border-color)] bg-[var(--bg-surface-elevated)] p-6 space-y-6">
              <div>
                <Badge variant="accent" size="sm">Club Headquarters</Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-2">
                  Secretariat Office
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Located within the Faculty of Arts & Humanities complex.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[var(--text-secondary)]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] block">Physical Venue</strong>
                    <span>Room 402, Student Activity Building, Central University Campus</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] block">Official Email</strong>
                    <span>contact@arabicclub.edu</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] block">Office Hours</strong>
                    <span>Sunday – Thursday: 10:00 AM – 4:00 PM</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-[var(--border-color)] p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                Press & Inter-Club Invitations
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                For competitive debate invitations, joint academic seminars, or media inquiries, please direct correspondence to the Secretariat of Public Relations.
              </p>
            </Card>
          </div>

          {/* Contact Dispatch Form */}
          <div className="lg:col-span-2">
            <Card className="border-[var(--border-color)] p-8 space-y-6">
              <div>
                <Badge variant="neutral" size="sm">Direct Dispatch</Badge>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mt-2">
                  Send an Official Inquiry
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Inquiries are routed directly to the appropriate executive portfolio.
                </p>
              </div>

              <form className="space-y-4" action="#">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Your official name"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="your.email@university.edu"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                      Inquiry Department <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-3.5 py-2.5 rounded-[5px] text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]">
                      <option value="general">General Secretariat (General Inquiries)</option>
                      <option value="academic">Academic & Arabic Learning Inquiries</option>
                      <option value="debate">Debate & Oratorical Competitions</option>
                      <option value="membership">Membership Registration & Status</option>
                      <option value="media">Media, Press & Publications</option>
                    </select>
                  </div>
                  <Input
                    label="Subject Title"
                    placeholder="Brief subject of inquiry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Detailed Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Please formulate your inquiry clearly..."
                    className="w-full p-3.5 rounded-[5px] text-sm bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] placeholder-[var(--text-muted)]"
                  />
                </div>

                <Button variant="accent" size="lg" className="w-full sm:w-auto" rightIcon={<Send className="w-3.5 h-3.5" />}>
                  Dispatch Inquiry to Secretariat
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
