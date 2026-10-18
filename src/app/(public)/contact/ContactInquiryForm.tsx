/**
 * @file src/app/(public)/contact/ContactInquiryForm.tsx
 * @description Interactive Client Form for Official Correspondence & Institutional Inquiries.
 * 
 * ARCHITECTURE & SECURITY:
 * - Submits via Next.js Server Action `submitContactInquiryAction()`.
 * - Includes hidden anti-bot honeypot field (`website_url`).
 * - Sliding-window IP rate limiting (3 inquiries per 15 min).
 * - Full WCAG AA accessibility: semantic labels, keyboard support, live aria feedback.
 * - Honest Confirmation Voucher: renders unique Reference ID and true storage/delivery state.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { 
  submitContactInquiryAction, 
  InquirySubmissionResult 
} from "@/lib/actions/contact-inquiry";
import { 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Info, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function ContactInquiryForm() {
  const [isPending, startTransition] = useTransition();
  const [submissionResult, setSubmissionResult] = useState<InquirySubmissionResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "general",
    subject: "",
    message: "",
    website_url: "", // Anti-spam honeypot
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const result = await submitContactInquiryAction(formData);
      if (result.success) {
        setSubmissionResult(result);
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  const handleCopyReference = () => {
    if (submissionResult?.referenceNo) {
      navigator.clipboard.writeText(submissionResult.referenceNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setFormData({
      fullName: "",
      email: "",
      department: "general",
      subject: "",
      message: "",
      website_url: "",
    });
    setFieldErrors({});
  };

  // SUCCESS VOUCHER STATE
  if (submissionResult?.success) {
    return (
      <Card className="border-2 border-[#B18A4A]/40 dark:border-[#B18A4A]/30 bg-stone-50/90 dark:bg-stone-900/90 shadow-md">
        <CardContent className="p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-3 pb-6 border-b border-stone-200 dark:border-stone-800">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Badge variant="accent" size="sm">
              Inquiry Formally Registered
            </Badge>
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Correspondence Dispatched to Secretariat
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
              Your message has been assigned an official reference number and entered into the Secretariat correspondence queue.
            </p>
          </div>

          {/* Reference ID Voucher */}
          <div className="p-5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-wider text-stone-500 uppercase block">
                Official Reference ID
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#173D32] dark:text-[#B18A4A]">
                {submissionResult.referenceNo}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyReference}
              className="text-xs flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied Reference</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Reference</span>
                </>
              )}
            </Button>
          </div>

          {/* Honest Delivery Status Explanation */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Info className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
              Delivery Protocol & Staff Review
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
              {submissionResult.message}
            </p>
          </div>

          {/* Next Steps Guidance */}
          <div className="p-5 rounded-xl bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B18A4A]" />
              Response Expectations
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
              <li className="flex items-start gap-2">
                <span className="text-[#B18A4A] font-bold">•</span>
                <span>The General Secretariat responds to routine academic inquiries within 2 to 3 university working days.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#B18A4A] font-bold">•</span>
                <span>Inter-collegiate debate invitations and institutional partnerships are forwarded to the Executive Committee during weekly sessions.</span>
              </li>
            </ul>
          </div>

          {/* Action Reset */}
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="text-xs"
            >
              Send Another Inquiry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ACTIVE FORM STATE
  return (
    <Card className="border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div>
          <Badge variant="neutral" size="sm">Direct Correspondence</Badge>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
            Send an Official Inquiry
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Inquiries are routed directly to the appropriate executive portfolio of the Secretariat.
          </p>
        </div>

        {/* Form Level Error Alert */}
        {submissionResult?.error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Submission Error</span>
              <p>{submissionResult.error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot Field (Invisible to human users, traps bot harvesters) */}
          <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
            <label htmlFor="website_url">Leave this field blank</label>
            <input
              type="text"
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Dr. Rashid Al-Hasan"
              required
              error={!!fieldErrors.fullName}
              helperText={fieldErrors.fullName || "Your legal or academic name"}
            />

            <Input
              label="Correspondence Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correspondence@university.edu"
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || "We will reply to this address"}
            />
          </div>

          {/* Department / Portfolio & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Inquiry Department / Portfolio <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-[6px] text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#173D32]"
              >
                <option value="general">General Secretariat (General Inquiries)</option>
                <option value="academic">Academic & Arabic Learning Inquiries</option>
                <option value="debate">Debate & Oratorical Competitions</option>
                <option value="membership">Membership Admissions & Inquiries</option>
                <option value="media">Media, Press & Publication Inquiries</option>
              </select>
            </div>

            <Input
              label="Subject Title *"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Inter-University Debate Invitation"
              required
              error={!!fieldErrors.subject}
              helperText={fieldErrors.subject || "Brief summary of your inquiry"}
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Detailed Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Please formulate your inquiry clearly, including relevant institutional affiliations or event dates..."
              className={`w-full p-3.5 rounded-[6px] text-xs bg-white dark:bg-stone-900 border text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#173D32] ${
                fieldErrors.message
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-stone-200 dark:border-stone-700"
              }`}
            />
            {fieldErrors.message ? (
              <p className="text-[11px] text-rose-500">{fieldErrors.message}</p>
            ) : (
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Minimum 10 characters. Please avoid submitting sensitive financial information.
              </p>
            )}
          </div>

          {/* Privacy & Governance Notice */}
          <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 flex items-start gap-2.5 text-stone-500 dark:text-stone-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-stone-700 dark:text-stone-300">Institutional Privacy Notice:</strong> Inquiries are transmitted through encrypted channels and accessed strictly by designated secretariat officers for correspondence resolution.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#173D32] hover:bg-[#122e26] text-white text-xs font-medium px-6 py-2.5 rounded-lg flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Dispatching Inquiry...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Inquiry to Secretariat
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
