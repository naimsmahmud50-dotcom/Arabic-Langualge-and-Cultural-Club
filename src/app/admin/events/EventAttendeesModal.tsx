/**
 * @file src/app/admin/events/EventAttendeesModal.tsx
 * @description Administrative Attendee Roster & Attendance Verification Console (Feature 016).
 * 
 * DEVELOPER USAGE NOTE:
 * - Displays registered participants for a selected event.
 * - Allows searching by attendee name, email, or student ID.
 * - Allows verifying and updating attendance status (registered, confirmed, attended, cancelled).
 * - Enforces Strix Security: Attendee PII (email, phone, studentId) is strictly restricted to administrative managers.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { X, Search, CheckCircle2, UserCheck, UserX, Clock, Users, Mail, Phone, Hash, AlertCircle } from "lucide-react";
import { updateRegistrationAttendanceAction } from "@/lib/actions/events";

interface AttendeeRecord {
  id: string;
  eventId: string;
  attendeeName: string;
  email: string;
  phone?: string | null;
  studentId?: string | null;
  status: "registered" | "confirmed" | "attended" | "cancelled";
  registeredAt: Date | string;
}

interface EventAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  capacity?: number | null;
  registrations: AttendeeRecord[];
  onAttendanceChanged: () => void;
}

export function EventAttendeesModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  capacity,
  registrations,
  onAttendanceChanged,
}: EventAttendeesModalProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    const s = search.toLowerCase();
    const matchesSearch = !search.trim() || 
      reg.attendeeName.toLowerCase().includes(s) ||
      reg.email.toLowerCase().includes(s) ||
      (reg.studentId && reg.studentId.toLowerCase().includes(s)) ||
      reg.id.toLowerCase().includes(s);

    return matchesStatus && matchesSearch;
  });

  const activeCount = registrations.filter(r => r.status !== "cancelled").length;
  const attendedCount = registrations.filter(r => r.status === "attended").length;

  const handleStatusChange = async (registrationId: string, newStatus: "registered" | "confirmed" | "attended" | "cancelled") => {
    setUpdatingId(registrationId);
    setActionError(null);

    try {
      const res = await updateRegistrationAttendanceAction(registrationId, eventId, newStatus);
      if (!res.success) {
        setActionError(res.error || "Failed to update attendance status.");
      } else {
        onAttendanceChanged();
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-muted)]/30">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Attendee Registration & Attendance Roster
              </h3>
              <Badge variant="accent" size="sm">
                {activeCount} {capacity ? `/ ${capacity}` : ""} Registered
              </Badge>
              {attendedCount > 0 && (
                <Badge variant="neutral" size="sm" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {attendedCount} Attended
                </Badge>
              )}
            </div>
            <p className="text-xs text-[var(--brand-accent)] font-medium mt-0.5">
              {eventTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              type="text"
              placeholder="Search by name, email, student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[var(--text-muted)]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
            >
              <option value="all">All Registrations ({registrations.length})</option>
              <option value="registered">Registered</option>
              <option value="confirmed">Confirmed</option>
              <option value="attended">Attended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {actionError && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRegistrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Contact (Private)</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Registered At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Attendance Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-[var(--bg-muted)]/40 transition-colors">
                    <TableCell>
                      <div className="font-bold text-xs text-[var(--text-primary)]">
                        {reg.attendeeName}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        {reg.id}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{reg.email}</span>
                      </div>
                      {reg.phone && (
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{reg.phone}</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-[var(--text-primary)]">
                      {reg.studentId ? (
                        <span className="px-1.5 py-0.5 bg-[var(--bg-muted)] rounded border border-[var(--border-color)]">
                          {reg.studentId}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          reg.status === "attended" ? "accent" :
                          reg.status === "confirmed" ? "accent" :
                          reg.status === "cancelled" ? "neutral" : "outline"
                        }
                        size="sm"
                        className={reg.status === "attended" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : ""}
                      >
                        {reg.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      {reg.status !== "attended" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updatingId === reg.id}
                          onClick={() => handleStatusChange(reg.id, "attended")}
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 px-2 py-1"
                          title="Mark Attended"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Mark Attended
                        </Button>
                      )}

                      {reg.status !== "confirmed" && reg.status !== "attended" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updatingId === reg.id}
                          onClick={() => handleStatusChange(reg.id, "confirmed")}
                          className="text-xs text-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/10 px-2 py-1"
                        >
                          Confirm
                        </Button>
                      )}

                      {reg.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updatingId === reg.id}
                          onClick={() => handleStatusChange(reg.id, "cancelled")}
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1"
                          title="Cancel Registration"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12">
              <EmptyState
                title="No Registrations Found"
                description={search ? "No attendees matched your search criteria." : "No attendees have registered for this event yet."}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-muted)]/30">
          <span className="text-xs text-[var(--text-muted)]">
            Institutional Privacy: Attendee emails and student numbers are never exposed to public queries.
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
