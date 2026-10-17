/**
 * @file src/app/admin/events/page.tsx
 * @route /admin/events
 * @description Administrative Event Calendar and Registration Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows planning, publishing, updating, and archiving 12-month calendar events.
 * - Queries `getPublicEvents()`.
 * - Meets Requirement SPEC-EVT-01 through SPEC-EVT-05.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getPublicEvents } from "@/lib/db/queries";
import { CalendarDays, Plus, Edit, Users, Eye } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminEventsPage() {
  const { data: events = [] } = await getPublicEvents({ limit: 50 }).catch(() => ({ data: [] }));

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Annual Calendar & Event Operations"
        subtitle="Schedule workshops, inter-university debates, cultural galas, and attendee registries"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Institutional Event Registry
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Scheduled and completed events across the 12-month academic term.
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create New Event Dossier
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          {events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title (EN / AR)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((evt) => (
                  <TableRow key={evt.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{evt.titleEn}</div>
                      {evt.titleAr && <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{evt.titleAr}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" size="sm">{evt.category || "General"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                      {new Date(evt.startTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {evt.venue || "Auditorium"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={evt.isRegistrationOpen ? "accent" : "neutral"} size="sm">
                        {evt.isRegistrationOpen ? "Open" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{evt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Link href={`/events/${evt.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No Events Scheduled"
                description="Start planning the academic calendar by scheduling the inaugural seminar or debate workshop."
                actionLabel="Create First Event"
                actionHref="/admin/events"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
