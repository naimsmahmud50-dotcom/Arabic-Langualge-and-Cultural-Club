"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
  Textarea,
  Select,
  Label,
  Modal,
  Alert,
  Table,
  TableWrapper,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Breadcrumbs,
  Pagination,
  LoadingSpinner,
  Skeleton,
  EmptyState,
  ThemeToggle,
  GeometricPattern,
  HeritageDivider,
} from "@/components/ui";
import { BookOpen, Calendar, Users, Award, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Watermark Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <GeometricPattern opacity={0.04} />
      </div>

      <div className="relative z-10 space-y-12">
        {/* Top Bar Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="accent">Phase 1 Design System</Badge>
              <Badge variant="neutral">Heritage Edition</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
              Arabic Language & Cultural Club
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              نادي اللغة والثقافة العربية — Institutional Component & Token Specifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle showLabel />
          </div>
        </header>

        {/* Breadcrumb Sample */}
        <section>
          <Breadcrumbs
            items={[
              { label: "Architecture", href: "#" },
              { label: "Design System", isCurrent: true },
            ]}
          />
        </section>

        {/* 1. COLOR PALETTE SYSTEM */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              1. Heritage Color System
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Restrained, scholarly colors inspired by classical manuscripts and university heritage.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-[6px] bg-[#173D32] text-white border border-black/10">
              <div className="text-xs uppercase font-semibold opacity-80">Primary Brand</div>
              <div className="text-base font-bold mt-2">Heritage Forest</div>
              <div className="text-xs font-mono opacity-80 mt-1">#173D32</div>
            </div>

            <div className="p-4 rounded-[6px] bg-[#F5F0E5] text-[#202720] border border-[#DDD8CC]">
              <div className="text-xs uppercase font-semibold opacity-70">Light Background</div>
              <div className="text-base font-bold mt-2">Warm Ivory</div>
              <div className="text-xs font-mono opacity-70 mt-1">#F5F0E5</div>
            </div>

            <div className="p-4 rounded-[6px] bg-[#B18A4A] text-white border border-black/10">
              <div className="text-xs uppercase font-semibold opacity-80">Accent / Prestige</div>
              <div className="text-base font-bold mt-2">Antique Brass</div>
              <div className="text-xs font-mono opacity-80 mt-1">#B18A4A</div>
            </div>

            <div className="p-4 rounded-[6px] bg-[#17211D] text-[#F5F0E5] border border-white/10">
              <div className="text-xs uppercase font-semibold opacity-80">Dark Background</div>
              <div className="text-base font-bold mt-2">Midnight Evergreen</div>
              <div className="text-xs font-mono opacity-80 mt-1">#17211D</div>
            </div>

            <div className="p-4 rounded-[6px] bg-[#829487] text-white border border-black/10">
              <div className="text-xs uppercase font-semibold opacity-80">Supporting Neutral</div>
              <div className="text-base font-bold mt-2">Muted Sage</div>
              <div className="text-xs font-mono opacity-80 mt-1">#829487</div>
            </div>
          </div>
        </section>

        <HeritageDivider />

        {/* 2. BILINGUAL TYPOGRAPHY */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              2. Bilingual Typographic Scale (English & Arabic)
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Manrope for editorial Latin headings, Inter for high-legibility body, and Noto Naskh Arabic for classical prose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Editorial Box */}
            <Card>
              <CardHeader>
                <Badge variant="neutral" size="sm">English Latin Hierarchy</Badge>
                <CardTitle className="text-2xl mt-2">Preserving Heritage, Advancing Eloquence</CardTitle>
                <CardDescription>
                  Designed with deliberate line heights and balanced contrast to support long-form institutional reading.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  The Arabic Language & Cultural Club is dedicated to intellectual vigor, classical literature analysis, and student leadership across cultural domains.
                </p>
              </CardContent>
            </Card>

            {/* Arabic Calligraphic Box */}
            <Card>
              <CardHeader>
                <Badge variant="accent" size="sm">الخط العربي الأصيل (RTL)</Badge>
                <CardTitle className="text-2xl mt-2 font-arabic" dir="rtl">
                  صون التراث، وترقية البيان، وبناء القيادات
                </CardTitle>
                <CardDescription dir="rtl">
                  خط النسخ العربي مع الحفاظ على التشكيل الصحيح والمسافات البصرية المتناسقة.
                </CardDescription>
              </CardHeader>
              <CardContent dir="rtl">
                <p className="text-base font-arabic text-[var(--text-secondary)] leading-loose">
                  «لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ، وَمِفْتَاحُ الْفَهْمِ، وَجِسْرُ التَّوَاصُلِ الْحَضَارِيِّ بَيْنَ الْأَجْيَالِ.»
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <HeritageDivider />

        {/* 3. BUTTONS SHOWCASE */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              3. Interactive Buttons & Actions
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Zero generic AI glow. Distinct primary, secondary, and antique brass states with accessible keyboard rings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Primary Heritage
            </Button>
            <Button variant="accent" leftIcon={<Award className="w-4 h-4" />}>
              Antique Brass Action
            </Button>
            <Button variant="secondary" leftIcon={<Calendar className="w-4 h-4" />}>
              Secondary Surface
            </Button>
            <Button variant="outline">
              Outline Stroke
            </Button>
            <Button variant="ghost">
              Ghost Link
            </Button>
            <Button variant="destructive">
              Destructive
            </Button>
            <Button variant="primary" isLoading>
              Loading State
            </Button>
          </div>
        </section>

        <HeritageDivider />

        {/* 4. BADGES & STATUS TAGS */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              4. Badges & Status Tags
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="primary">Executive Officer</Badge>
            <Badge variant="accent">Founder</Badge>
            <Badge variant="neutral">Term 2024–2025</Badge>
            <Badge variant="success">Confirmed Event</Badge>
            <Badge variant="warning">Application Pending</Badge>
            <Badge variant="destructive">Registration Closed</Badge>
            <Badge variant="outline">Archival Record</Badge>
          </div>
        </section>

        <HeritageDivider />

        {/* 5. FORM CONTROLS & INPUTS */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              5. Form Controls & Validation States
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label required>Applicant Full Name</Label>
              <Input placeholder="e.g. Zaid Al-Mahmoud" leftIcon={<Users className="w-4 h-4" />} />
            </div>

            <div>
              <Label required>Institutional Email</Label>
              <Input type="email" placeholder="student@university.edu" leftIcon={<Mail className="w-4 h-4" />} />
            </div>

            <div>
              <Label>Membership Category</Label>
              <Select defaultValue="general">
                <option value="general">Regular Student Member</option>
                <option value="calligraphy">Arabic Calligraphy Guild</option>
                <option value="debate">Arabic Oratory & Debate Circle</option>
                <option value="alumni">Graduated Alumni</option>
              </Select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Label required>Personal Statement / Motivation</Label>
              <Textarea placeholder="Describe your interest in classical Arabic language, rhetoric, and club participation..." />
            </div>
          </div>
        </section>

        <HeritageDivider />

        {/* 6. ALERTS & NOTIFICATIONS */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              6. Institutional Alerts (No Emojis)
            </h2>
          </div>

          <div className="space-y-3">
            <Alert variant="info" title="Official Notice">
              Registrations for the Classical Calligraphy Workshop are open until October 25.
            </Alert>
            <Alert variant="success" title="Application Persisted">
              Your membership application has been received and assigned unique reference ID: <strong>APP-2026-9812</strong>.
            </Alert>
            <Alert variant="warning" title="Archival Notice">
              You are viewing the historical leadership archive for academic term 2023–2024.
            </Alert>
            <Alert variant="error" title="Access Prohibited">
              You do not have administrative privileges to manage user account permissions.
            </Alert>
          </div>
        </section>

        <HeritageDivider />

        {/* 7. DATA TABLES */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              7. Responsive Data Tables
            </h2>
          </div>

          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Term</TableHead>
                  <TableHead>Designated Officeholder</TableHead>
                  <TableHead>Position Title</TableHead>
                  <TableHead>Archive Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">2024–2025</TableCell>
                  <TableCell>Zaid Al-Mahmoud [DEMO]</TableCell>
                  <TableCell>President</TableCell>
                  <TableCell><Badge variant="success">Current Council</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Inspect Record</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">2024–2025</TableCell>
                  <TableCell>Fatima Al-Zahra [DEMO]</TableCell>
                  <TableCell>Vice President</TableCell>
                  <TableCell><Badge variant="success">Current Council</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Inspect Record</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">2023–2024</TableCell>
                  <TableCell>Zaid Al-Mahmoud [DEMO]</TableCell>
                  <TableCell>Cultural Secretary</TableCell>
                  <TableCell><Badge variant="outline">Historical Archive</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Inspect Record</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableWrapper>

          <Pagination
            currentPage={currentPage}
            totalPages={4}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </section>

        <HeritageDivider />

        {/* 8. MODAL & EMPTY STATES */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              8. Modal Dialogs & Empty States
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Card>
              <CardHeader>
                <CardTitle>Accessible Modal Trigger</CardTitle>
                <CardDescription>
                  Focus-trapped dialog supporting keyboard Escape key dismissal and body overflow lock.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Open Executive Charter Modal
                </Button>
              </CardContent>
            </Card>

            <EmptyState
              title="No Archival Records Found"
              description="There are currently no published events for the selected academic filter."
              action={
                <Button variant="secondary" size="sm">
                  Reset Filter
                </Button>
              }
            />
          </div>

          {/* Modal Instance */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Arabic Club Executive Charter"
            description="Institutional governance standards and ethical code."
          >
            <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              <p>
                The Arabic Language & Cultural Club commits to maintaining academic integrity, supporting open student scholarship, and preserving the classical traditions of Arabic prose, poetry, and linguistics.
              </p>
              <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-[6px] text-xs">
                All records within this platform are permanently logged and verified under constitutional article IV.
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Dismiss
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                Acknowledge
              </Button>
            </div>
          </Modal>
        </section>
      </div>
    </div>
  );
}
