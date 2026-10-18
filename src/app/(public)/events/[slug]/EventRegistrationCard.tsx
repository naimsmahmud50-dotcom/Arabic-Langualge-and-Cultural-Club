/**
 * @file src/app/(public)/events/[slug]/EventRegistrationCard.tsx
 * @description Interactive Seat Reservation Form & Verifiable Confirmation Ticket.
 * 
 * ARCHITECTURE & ROLE:
 * - Real client-side interactive component wired to `registerForEventAction`.
 * - Handles real-time form validation, pending state, server error alerts, and
 *   seat capacity indicators.
 * - Displays an authentic, printable confirmation voucher upon successful submission.
 * - Enforces clear disabled states: At Capacity, Registration Closed, Event Cancelled,
 *   or Event Postponed.
 * 
 * PRIVACY GUARANTEE:
 * - Emphasizes that personal contact info is private and never exposed publicly.
 * 
 * DESIGN TOKENS:
 * - Brand Primary: #173D32 (Forest Green)
 * - Brand Accent: #B18A4A (Antique Brass)
 * - Anti-Emoji: Strictly clean SVG icons from lucide-react.
 */

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Printer, 
  ArrowRight,
  Sparkles,
  Ticket
} from "lucide-react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { registerForEventAction, RegistrationActionResponse } from "@/lib/actions/event-registration";

interface EventRegistrationCardProps {
  eventId: string;
  eventTitle: string;
  isRegistrationOpen: boolean;
  status: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  capacity: number | null;
  totalRegistered: number;
  remainingSeats: number | null;
  isAtCapacity: boolean;
}

export function EventRegistrationCard({
  eventId,
  eventTitle,
  isRegistrationOpen,
  status,
  capacity,
  totalRegistered: initialRegistered,
  remainingSeats: initialRemaining,
  isAtCapacity: initialAtCapacity,
}: EventRegistrationCardProps) {
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState<RegistrationActionResponse | null>(null);

  // Form input state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");

  const isCancelled = status === "cancelled";
  const isPostponed = status === "postponed";
  const isCompleted = status === "completed";

  // Compute live capacity status
  const totalRegistered = response?.success ? initialRegistered + 1 : initialRegistered;
  const isAtCapacity = capacity !== null ? totalRegistered >= capacity : false;
  const remainingSeats = capacity !== null ? Math.max(0, capacity - totalRegistered) : null;

  // Determine whether the form is enabled
  const canRegister = isRegistrationOpen && !isAtCapacity && !isCancelled && !isPostponed && !isCompleted;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canRegister) return;

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("attendeeName", name);
    formData.append("email", email);
    if (phone.trim()) formData.append("phone", phone);
    if (studentId.trim()) formData.append("studentId", studentId);

    startTransition(async () => {
      const result = await registerForEventAction(null, formData);
      setResponse(result);
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // SUCCESS CONFIRMATION VOUCHER
  if (response?.success) {
    return (
      <Card className="border-2 border-[var(--brand-accent)] bg-[var(--bg-surface-elevated)] p-6 space-y-6 shadow-md animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <Badge variant="accent" size="sm" className="gap-1.5 font-mono">
            <Ticket className="w-3.5 h-3.5" />
            Confirmed Seat Reservation
          </Badge>
          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            Registration Confirmed
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Your attendance has been formally entered into the academic society records.
          </p>
        </div>

        {/* Verifiable Reference Code Ticket */}
        <div className="p-4 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--brand-accent)]/40 space-y-3">
          <div className="text-center pb-2 border-b border-[var(--border-color)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block">
              Official Reference Code
            </span>
            <span className="text-lg font-mono font-bold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] tracking-wider">
              {response.registrationId}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Attendee Name:</span>
              <strong className="text-[var(--text-primary)]">{response.attendeeName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Registered Email:</span>
              <span className="font-mono">{response.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Target Event:</span>
              <span className="font-medium truncate max-w-[180px]">{response.eventTitle || eventTitle}</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>Attendance Instructions</span>
          </div>
          <p className="leading-relaxed">
            Please present this registration reference code along with your institutional identity badge at the reception desk for credential verification.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-center gap-2"
            onClick={handlePrint}
          >
            <Printer className="w-3.5 h-3.5" />
            Print Voucher
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full justify-center"
            onClick={() => setResponse(null)}
          >
            Register Another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--border-color)] bg-[var(--bg-surface-elevated)] p-6 space-y-6 sticky top-28 shadow-sm">
      {/* 1. Header & Availability Badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {isCancelled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-rose-900/10 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <XCircle className="w-3 h-3 text-rose-600" />
              Event Cancelled
            </span>
          ) : isPostponed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-amber-900/10 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Event Postponed
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)]">
              <CheckCircle2 className="w-3 h-3 text-[var(--brand-accent)]" />
              Concluded
            </span>
          ) : isAtCapacity ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-amber-900/10 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              At Full Capacity
            </span>
          ) : isRegistrationOpen ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-emerald-900/10 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Registration Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)]">
              <Clock className="w-3 h-3" />
              Registration Closed
            </span>
          )}

          {capacity !== null && (
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Cap: {capacity} Seats
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          Reserve Your Seat
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Admission is complimentary for enrolled university students and verified club fellows.
        </p>
      </div>

      {/* 2. Seating Capacity Live Tracker */}
      {capacity !== null && (
        <div className="p-3.5 rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--text-secondary)]">Seating Availability</span>
            <span className="font-mono text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
              {remainingSeats} {remainingSeats === 1 ? "seat" : "seats"} left
            </span>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden border border-[var(--border-color)]">
            <div 
              className={`h-full transition-all duration-500 ${
                isAtCapacity 
                  ? "bg-rose-500" 
                  : (remainingSeats || 0) < 10 
                  ? "bg-amber-500" 
                  : "bg-[var(--brand-primary)]"
              }`}
              style={{ width: `${Math.min(100, Math.round((totalRegistered / capacity) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>{totalRegistered} reserved</span>
            <span>{capacity} total capacity</span>
          </div>
        </div>
      )}

      {/* 3. Error Alert if Server Action returned an error */}
      {response?.error && (
        <div className="p-3 rounded-[5px] bg-rose-900/10 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[11px] uppercase tracking-wider">Registration Error</div>
            <p className="leading-relaxed">{response.error}</p>
          </div>
        </div>
      )}

      {/* 4. Real Form or Disabled State */}
      {canRegister ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name (English)"
            placeholder="e.g. Tariq Al-Mansur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isPending}
          />

          <Input
            label="Institutional Email"
            type="email"
            placeholder="student@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
          />

          <Input
            label="Student ID / Registration No."
            placeholder="e.g. STU-2024-089 (Optional)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={isPending}
          />

          <Input
            label="Contact Phone"
            type="tel"
            placeholder="e.g. +8801700000000 (Optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isPending}
          />

          <Button
            type="submit"
            variant="accent"
            size="md"
            className="w-full justify-center"
            disabled={isPending}
          >
            {isPending ? "Validating & Reserving..." : "Confirm Seat Reservation"}
          </Button>

          {/* Strict Privacy Guarantee */}
          <div className="p-2.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              <span>Privacy Guarantee</span>
            </div>
            <p className="leading-tight">
              Personal contact details (email, phone, student ID) are stored securely and will never be published on public rosters.
            </p>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-2">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {isCancelled
              ? "This event has been officially cancelled. No attendees can be registered."
              : isPostponed
              ? "This gathering has been postponed. Registration will reopen once the revised academic date is finalized."
              : isCompleted
              ? "This event has concluded. Please inspect our upcoming session schedule."
              : isAtCapacity
              ? "All designated seats for this gathering have been claimed. Check back in case of cancellations."
              : "Official online registration is currently closed for this session."}
          </p>
          <Link href="/contact" className="text-xs text-[var(--brand-accent)] font-semibold hover:underline block pt-1">
            Contact Academic Secretariat →
          </Link>
        </div>
      )}
    </Card>
  );
}
