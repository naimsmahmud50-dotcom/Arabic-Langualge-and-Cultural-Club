/**
 * DEVELOPER NOTE:
 * File: src/components/home/VerifiedContactSection.tsx
 * Module: Homepage Verified Coordinates
 * Phase 8 Enhancement (030-event-to-gallery-website-integration):
 * - Privacy protection: guarded administrative super admin email from public exposure; uses
 *   official institutional secretariat fallback email.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/home/VerifiedContactSection.tsx
 * @description Verified Institutional Contact Information & Headquarters Coordinates.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { MapPin, Mail, Clock, Phone, ArrowRight, MessageSquare, ShieldCheck } from "lucide-react";

interface VerifiedContactSectionProps {
  settings?: Record<string, { en: string | null; ar: string | null }>;
}

export function VerifiedContactSection({ settings = {} }: VerifiedContactSectionProps) {
  const contactEmail = settings["contact_email"]?.en || "secretariat@kngc.edu.bd";
  const clubName = settings["club_name"]?.en || "Arabic Language & Cultural Club";

  return (
    <section className="py-20 bg-[var(--bg-primary)]" aria-label="Verified Contact Information">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Coordinates */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <Badge variant="accent" size="sm">Secretariat Contacts</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
                Institutional Coordinates & Headquarters
              </h2>
              <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
                التَّوَاصُلُ الرَّسْمِيُّ وَمَقَرُّ الْأَمَانَةِ الْعَامَّةِ • لِلِاسْتِفْسَارَاتِ وَالشَّرَاكَاتِ
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                We welcome inquiries from prospective student members, collaborating departments, academic societies, and linguistic scholars.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Campus Secretariat
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Department of Arabic & Islamic Studies<br />
                    Kabi Nazrul Government College, Laxmibazar, Dhaka-1100
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Official Email
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono truncate">
                    {contactEmail}
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    PGP & Institutional Verified
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Secretariat Hours
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Sunday – Thursday<br />
                    10:00 AM – 4:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Institutional Governance
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Chartered Student Society<br />
                    Zero Commercial Affiliations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Action Card */}
          <div className="lg:col-span-5">
            <Card className="border-[var(--border-color)] p-8 bg-[var(--bg-surface)] space-y-6">
              <div className="border-b border-[var(--border-subtle)] pb-4">
                <Badge variant="accent" size="sm">Direct Communication</Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1.5">
                  Submit an Inquiry or Partnership Proposal
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Whether you wish to sponsor an Arabic debate trophy, propose a guest academic lecture, or schedule a consultation with the executive committee, we respond within 48 business hours.
              </p>

              <div className="space-y-3 pt-2">
                <Link href="/contact" className="block">
                  <Button variant="accent" size="lg" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Official Contact Portal
                  </Button>
                </Link>

                <Link href="/policies" className="block text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  Review Data Retention & Inquiries Privacy Policy →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
