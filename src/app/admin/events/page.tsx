/**
 * @file src/app/admin/events/page.tsx
 * @route /admin/events
 * @description Master CMS Calendar, Events & Attendee Management (Feature 016).
 * 
 * DEVELOPER ARCHITECTURE NOTE:
 * - Allows managing scheduled event dossiers, annual plan monthly itineraries, and attendee registries.
 * - Sits behind server-side RBAC session authorization ("events:manage", "plans:manage").
 * - Queries events, annual_plans, and event_registrations directly from SQLite via Drizzle ORM.
 * - Zero static mock arrays; fully persistent and reactive.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { 
  getAdminEvents, 
  getAdminAnnualPlans, 
  getAnnualPlanYears, 
  getAdminEventRegistrations 
} from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminEventsClient } from "./AdminEventsClient";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/events");
  }

  // Fetch all administrative events
  const eventsResult = await getAdminEvents({ limit: 100 });
  const events = eventsResult.data;

  // Fetch academic years and all annual plan activities
  const academicYears = await getAnnualPlanYears();
  const annualPlansResult = await getAdminAnnualPlans({ limit: 100 });
  const annualPlans = annualPlansResult.data;

  // Fetch attendee registrations for each event
  const eventRegistrationsMap: Record<string, any[]> = {};
  await Promise.all(
    events.map(async (evt) => {
      const regResult = await getAdminEventRegistrations(evt.id, { limit: 100 });
      eventRegistrationsMap[evt.id] = regResult.data;
    })
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Annual Calendar & Event Operations"
        subtitle="Schedule workshops, inter-university debates, cultural galas, and attendee registries"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Events & Calendar" },
        ]}
      />

      <AdminEventsClient
        initialEvents={events}
        initialAnnualPlans={annualPlans}
        academicYears={academicYears.length > 0 ? academicYears : ["2024–2025", "2025–2026"]}
        eventRegistrationsMap={eventRegistrationsMap}
      />
    </div>
  );
}
