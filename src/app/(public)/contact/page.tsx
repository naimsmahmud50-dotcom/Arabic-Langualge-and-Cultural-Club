/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/(public)/contact/page.tsx
 * Updated page title and SEO metadata to reflect Kabi Nazrul Government College, Dhaka.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/app/(public)/contact/page.tsx
 * @route /contact
 * @description Official Inquiries, Correspondence, and Institutional Partnerships Portal.
 * 
 * ARCHITECTURE & ROLE:
 * - Server Component fetching verified institutional contact coordinates from `getContactSettings()`.
 * - Strictly observes Anti-Fabrication rules: never invents phone numbers, office hours, or social links.
 * - Embeds client-side `ContactInquiryForm` handling honeypot protection, rate-limiting, and honest delivery state.
 * - Full SEO metadata and WCAG AA accessibility.
 * 
 * REQUIREMENTS COVERED:
 * - REQ-PUB-15: Verified institutional contact details, social links, and validated inquiry form.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import React from "react";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, ClubLogo } from "@/components/ui";
import { getContactSettings } from "@/lib/db/queries";
import { ContactInquiryForm } from "./ContactInquiryForm";
import { 
  Mail, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Building2, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Institutional Relations | Arabic Language & Cultural Club, Kabi Nazrul Govt. College",
  description: "Official correspondence desk for inquiries, academic partnerships, inter-collegiate debate invitations, and membership questions at Kabi Nazrul Government College, Dhaka.",
  openGraph: {
    title: "Contact & Inquiries — Arabic Language & Cultural Club, Kabi Nazrul Govt. College",
    description: "Connect with the Arabic Language & Cultural Club Secretariat at Kabi Nazrul Government College, Dhaka for academic, debate, and institutional inquiries.",
  },
};

export const revalidate = 60; // ISR cache revalidation every 60 seconds

export default async function ContactPage() {
  const settings = await getContactSettings();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
  ];

  // Detect verified social links from database (never invent missing ones)
  const officialSocials = [
    settings.socialFacebook ? { name: "Facebook", url: settings.socialFacebook } : null,
    settings.socialYoutube ? { name: "YouTube", url: settings.socialYoutube } : null,
    settings.socialTwitter ? { name: "X (Twitter)", url: settings.socialTwitter } : null,
    settings.socialLinkedin ? { name: "LinkedIn", url: settings.socialLinkedin } : null,
  ].filter(Boolean) as { name: string; url: string }[];

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950/50 pb-20">
      <PageHeader
        title="Contact & Institutional Relations"
        titleAr="التواصل والعلاقات المؤسسية"
        description="Official correspondence desk for university inquiries, academic partnerships, inter-collegiate debate invitations, and public relations."
        badge="General Secretariat"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar: Approved Institutional Contact Coordinates */}
          <div className="space-y-6">
            <Card className="border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <ClubLogo variant="crest" size="md" className="shrink-0 drop-shadow-xs" />
                  <div>
                    <Badge variant="accent" size="sm">Club Headquarters</Badge>
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
                      Secretariat Office
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 -mt-2">
                  Central campus administrative and cultural headquarters.
                </p>

                <div className="space-y-5 text-xs">
                  {/* Verified Address */}
                  {settings.headquartersAddressEn && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#173D32]/10 dark:bg-[#173D32]/30 flex items-center justify-center text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-stone-900 dark:text-stone-100 block mb-0.5">Physical Venue</strong>
                        <span className="text-stone-600 dark:text-stone-300 leading-relaxed block">
                          {settings.headquartersAddressEn}
                        </span>
                        {settings.headquartersAddressAr && (
                          <span className="text-stone-400 dark:text-stone-500 font-serif text-[11px] block mt-0.5" dir="rtl">
                            {settings.headquartersAddressAr}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verified Email */}
                  {settings.contactEmail && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#173D32]/10 dark:bg-[#173D32]/30 flex items-center justify-center text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-stone-900 dark:text-stone-100 block mb-0.5">Official Email</strong>
                        <a 
                          href={`mailto:${settings.contactEmail}`}
                          className="text-[#173D32] dark:text-[#B18A4A] hover:underline font-mono"
                        >
                          {settings.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Telephone / Direct Line Handling (Anti-Fabrication Notice) */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-stone-900 dark:text-stone-100 block mb-0.5">Telephone Inquiries</strong>
                      {settings.contactPhone ? (
                        <span className="font-mono text-stone-700 dark:text-stone-300">{settings.contactPhone}</span>
                      ) : (
                        <span className="text-stone-500 dark:text-stone-400 italic">
                          Official phone line not published. Please reach out via official email or correspondence form.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verified Office Hours */}
                  {settings.officeHoursEn && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#173D32]/10 dark:bg-[#173D32]/30 flex items-center justify-center text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-stone-900 dark:text-stone-100 block mb-0.5">Office Hours</strong>
                        <span className="text-stone-600 dark:text-stone-300 block">
                          {settings.officeHoursEn}
                        </span>
                        {settings.officeHoursAr && (
                          <span className="text-stone-400 dark:text-stone-500 font-serif text-[11px] block mt-0.5" dir="rtl">
                            {settings.officeHoursAr}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Official Social Media Channels (Only if configured in DB) */}
            {officialSocials.length > 0 && (
              <Card className="border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#173D32] dark:text-[#B18A4A]">
                    <Globe className="w-4 h-4" />
                    Verified Social Channels
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Official broadcast announcements and media highlights are shared through our verified accounts:
                  </p>
                  <div className="space-y-2 pt-1">
                    {officialSocials.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-xs font-medium text-stone-800 dark:text-stone-200 transition-colors"
                      >
                        <span>{social.name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Press & Academic Liaison Note */}
            <Card className="border border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/50">
              <CardContent className="p-6 space-y-2 text-xs">
                <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100">
                  Press & Inter-Club Invitations
                </h4>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  For competitive debate invitations, joint academic seminars, symposium partnerships, or press releases, select the appropriate Department in the inquiry dispatch form.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Inquiry Form */}
          <div className="lg:col-span-2">
            <ContactInquiryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
