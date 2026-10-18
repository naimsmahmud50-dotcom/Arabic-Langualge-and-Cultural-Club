/**
 * @file src/app/(public)/membership/MembershipApplicationForm.tsx
 * @description Interactive Client Form for Student Membership Application & Confirmation Voucher.
 * 
 * ARCHITECTURE & ROLE IN ARABIC CLUB SYSTEM:
 * - Collects and validates prospective member admissions dossiers.
 * - Submits via Next.js Server Action `submitMembershipApplicationAction()`.
 * - Renders a tamper-resistant confirmation voucher with unique Reference ID.
 * - Fulfills Requirements REQ-PUB-13, SPEC-APP-01 through SPEC-APP-06.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { submitMembershipApplicationAction, ApplicationSubmissionResult } from "@/lib/actions/membership-application";
import { 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  Check, 
  Clock, 
  UserPlus, 
  FileText,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";

export function MembershipApplicationForm() {
  const [isPending, startTransition] = useTransition();
  const [submissionResult, setSubmissionResult] = useState<ApplicationSubmissionResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Form Field States
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantNameAr: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
    faculty: "",
    academicLevel: "1st Year (Freshman)",
    category: "general_student",
    arabicProficiency: "intermediate",
    motivation: "",
    consentAgreed: true,
    directoryConsent: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear field-level error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const res = await submitMembershipApplicationAction(formData);
      setSubmissionResult(res);
      if (!res.success && res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    });
  };

  const handleCopyReference = (ref: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // --------------------------------------------------------------------------
  // SUCCESS CONFIRMATION VOUCHER STATE
  // --------------------------------------------------------------------------
  if (submissionResult?.success && submissionResult.application) {
    const app = submissionResult.application;

    return (
      <Card className="border-[var(--border-color)] overflow-hidden shadow-md animate-in fade-in duration-300">
        <div className="bg-[var(--brand-primary)] text-white p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--brand-accent)] text-[var(--brand-dark)] flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-semibold text-[var(--brand-accent)]">
              Application Officially Registered
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Admissions Dossier Confirmed
            </h2>
            <p className="text-xs text-white/80 max-w-md mx-auto">
              Your membership application has been persisted in the institutional registry and scheduled for executive committee review.
            </p>
          </div>
        </div>

        <CardContent className="p-8 space-y-8">
          {/* Reference Number Box */}
          <div className="bg-[var(--surface-color)] p-6 rounded-xl border border-[var(--brand-accent)]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Official Reference Number
              </span>
              <div className="font-mono text-2xl font-bold text-[var(--brand-accent)] tracking-wider">
                {app.referenceNo}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Save this reference code to track review decisions on our status portal.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyReference(app.referenceNo)}
              className="border-[var(--brand-accent)] text-[var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-[var(--brand-dark)] shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  <span>Copy Reference ID</span>
                </>
              )}
            </Button>
          </div>

          {/* Dossier Summary Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Dossier Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <div>
                <span className="text-[var(--text-muted)]">Applicant Name:</span>
                <p className="font-semibold text-[var(--text-primary)] mt-0.5">{app.applicantName}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Notification Email:</span>
                <p className="font-semibold text-[var(--text-primary)] font-mono mt-0.5">{app.email}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Review Stage:</span>
                <div className="mt-0.5">
                  <Badge variant="accent" size="sm">
                    Pending Committee Review
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Submission Timestamp:</span>
                <p className="font-mono text-[var(--text-secondary)] mt-0.5">
                  {new Date(app.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps Guidance */}
          <div className="bg-[var(--bg-card)] p-5 rounded-lg border border-[var(--border-color)] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[var(--brand-accent)] font-semibold">
              <Clock className="w-4 h-4" />
              <span>Admissions Evaluation Schedule</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Applications are reviewed semi-monthly by the Executive Admissions Secretariat. You will receive an official communique upon status decision. You can also check your real-time review progress at any time using the status tracker below.
            </p>
          </div>

          {/* Reset Action */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmissionResult(null);
                setFormData({
                  applicantName: "",
                  applicantNameAr: "",
                  email: "",
                  phone: "",
                  studentId: "",
                  department: "",
                  faculty: "",
                  academicLevel: "1st Year (Freshman)",
                  category: "general_student",
                  arabicProficiency: "intermediate",
                  motivation: "",
                  consentAgreed: true,
                  directoryConsent: true,
                });
              }}
            >
              Submit Another Application
            </Button>

            <a
              href="#status-tracker"
              className="text-xs font-semibold text-[var(--brand-accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>Go to Status Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --------------------------------------------------------------------------
  // APPLICATION INPUT FORM
  // --------------------------------------------------------------------------
  return (
    <Card className="border-[var(--border-color)] p-8 space-y-8 shadow-sm">
      <div className="space-y-2 border-b border-[var(--border-color)] pb-6">
        <Badge variant="accent" size="sm">Official Enrollment Form</Badge>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Student Member Admissions Dossier
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          All fields marked with an asterisk (<span className="text-red-500">*</span>) are mandatory. Please provide verified academic coordinates.
        </p>
      </div>

      {/* General Submission Error Alert */}
      {submissionResult && !submissionResult.success && submissionResult.error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Submission Notice</span>
            <p className="leading-relaxed">{submissionResult.error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Personal Identity & Names */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)] flex items-center gap-2">
            <span>1. Personal Identity & Names</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name (English)"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleChange}
              placeholder="e.g. Abdullah Bin Salem"
              required
              error={!!fieldErrors.applicantName}
              helperText={fieldErrors.applicantName || "As printed on your university identification card"}
            />
            <Input
              label="الاسم الكامل باللغة العربية (Arabic Name)"
              name="applicantNameAr"
              value={formData.applicantNameAr}
              onChange={handleChange}
              placeholder="مثال: عبد الله بن سالم"
              dir="rtl"
              error={!!fieldErrors.applicantNameAr}
              helperText={fieldErrors.applicantNameAr || "الاسم الثلاثي أو الرباعي بالرسم الصحيح"}
            />
          </div>
        </div>

        {/* Section 2: Academic Affiliation */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
            2. Academic Affiliation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Identification Number"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. 2024-ARB-104"
              error={!!fieldErrors.studentId}
              helperText={fieldErrors.studentId || "University matriculation reference"}
            />
            <Input
              label="Department / Major"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Arabic Language & Literature / Law"
              error={!!fieldErrors.department}
              helperText={fieldErrors.department || undefined}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Faculty / College"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="e.g. Faculty of Arts & Humanities"
              error={!!fieldErrors.faculty}
              helperText={fieldErrors.faculty || undefined}
            />
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Academic Year / Level <span className="text-red-500">*</span>
              </label>
              <select
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-[5px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              >
                <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                <option value="4th Year (Senior)">4th Year (Senior)</option>
                <option value="Postgraduate / Master's">Postgraduate / Master's</option>
                <option value="Faculty / Staff Fellow">Faculty / Staff Fellow</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Coordinates */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
            3. Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Institutional Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@university.edu"
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || "Official university correspondence address"}
            />
            <Input
              label="Telephone / WhatsApp Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+880 1700-000000"
              required
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone || undefined}
            />
          </div>
        </div>

        {/* Section 4: Linguistic Proficiency & Motivation */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-accent)]">
            4. Linguistic Proficiency & Motivation
          </h3>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Self-Assessed Arabic Language Level <span className="text-red-500">*</span>
            </label>
            <select
              name="arabicProficiency"
              value={formData.arabicProficiency}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-[5px] text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
            >
              <option value="beginner">Beginner — Learning alphabet, phonetics, and basic vocabulary</option>
              <option value="intermediate">Intermediate — Functional conversation, elementary grammar (Nahw)</option>
              <option value="advanced">Advanced — Literary comprehension, rhetoric (Balaghah), poetry</option>
              <option value="native">Fluent / Native Speaker — Full classical oratorical command</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Statement of Intent / Motivation (بيان الدافع) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Why do you wish to join the Arabic Language & Cultural Club? Mention relevant interests such as debate, calligraphy, poetry, or grammar tutoring..."
              className={`w-full p-3.5 rounded-[5px] text-xs bg-[var(--bg-surface)] border ${
                fieldErrors.motivation ? "border-red-500" : "border-[var(--border-color)]"
              } text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] placeholder-[var(--text-muted)]`}
            />
            {fieldErrors.motivation && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.motivation}</p>
            )}
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Minimum 15 characters. State your specific linguistic goals.
            </p>
          </div>
        </div>

        {/* Section 5: Consent & Compliance Checkboxes */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)] bg-[var(--surface-color)] p-5 rounded-lg border border-[var(--border-color)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Consent & Institutional Charter Agreement</span>
          </h4>

          <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              name="consentAgreed"
              checked={formData.consentAgreed}
              onChange={handleChange}
              required
              className="mt-0.5 rounded-[3px] accent-[var(--brand-primary)]"
            />
            <span>
              I solemnly agree to abide by the permanent constitution, bylaws, and academic ethics of the Arabic Language & Cultural Club. <span className="text-red-500">*</span>
            </span>
          </label>
          {fieldErrors.consentAgreed && (
            <p className="text-xs text-red-500 pl-6">{fieldErrors.consentAgreed}</p>
          )}

          <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              name="directoryConsent"
              checked={formData.directoryConsent}
              onChange={handleChange}
              className="mt-0.5 rounded-[3px] accent-[var(--brand-primary)]"
            />
            <span>
              I consent to having my verified student member profile (Name and Department) listed in the public member directory upon admission approval.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={isPending}
          className="w-full justify-center bg-[var(--brand-primary)] hover:bg-[var(--brand-dark)] text-white font-semibold py-3"
        >
          {isPending ? (
            <span>Persisting Admissions Dossier...</span>
          ) : (
            <span>Submit Official Membership Application</span>
          )}
        </Button>
      </form>
    </Card>
  );
}
