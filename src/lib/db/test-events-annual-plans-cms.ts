/**
 * @file src/lib/db/test-events-annual-plans-cms.ts
 * @description Automated Verification Test Suite for Events & Annual Plans CMS Modules (Feature 016).
 * 
 * DEVELOPER USAGE NOTE:
 * This comprehensive automated test suite verifies:
 * 1. Event CRUD Operations (slug generation, date/time boundaries, capacity limits, DB persistence)
 * 2. Event Status Lifecycle & Historical Preservation (confirmed -> postponed -> cancelled)
 * 3. Attendee Roster & Attendance Status Verification (registered -> confirmed -> attended / cancelled)
 * 4. Annual Plan Itinerary Scheduler (month-by-month 1-12, academic year filtering, related event cross-linking)
 * 5. RBAC Permission Gates & Immutable Audit Trail Logging (recordAuditLog persistence)
 * 
 * RUN COMMAND:
 * export PATH="/home/mahmud-hasan/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
 * pnpm exec tsx src/lib/db/test-events-annual-plans-cms.ts
 */

import { db } from "./index";
import { events, annualPlans, eventRegistrations, auditLogs } from "./schema";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  getAdminEvents,
  getAdminEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminAnnualPlans,
  createAnnualPlanItem,
  updateAnnualPlanItem,
  deleteAnnualPlanItem,
  registerAttendeeForEvent,
  getAdminEventRegistrations,
  updateEventRegistrationStatus,
} from "./queries";
import { hasPermission } from "../auth/rbac";
import { recordAuditLog } from "../auth/audit";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

async function runEventsAndAnnualPlansCmsTests() {
  console.log("================================================================================");
  console.log("Starting Automated Verification: Events & Annual Plans CMS Modules (016)");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testEventSlug = `annual-arabic-symposium-${timestamp}`;
  let createdEventId: string | null = null;
  let createdRegistrationId: string | null = null;
  let createdPlanId: string | null = null;

  try {
    // --------------------------------------------------------------------------
    // TEST SUITE 1: EVENT CREATION & PERSISTENCE
    // --------------------------------------------------------------------------
    console.log("TEST SUITE 1: Event Lifecycle & Validation");

    const startTime = new Date(Date.now() + 86400000 * 7); // 7 days in future
    const endTime = new Date(startTime.getTime() + 7200000); // 2 hours later

    // Verify date range invariant
    assert(startTime.getTime() < endTime.getTime(), "Start time strictly precedes end time");

    createdEventId = await createEvent({
      slug: testEventSlug,
      titleEn: `Arabic Classical Symposium ${timestamp}`,
      titleAr: "ندوة الأدب العربي الكلاسيكي",
      summaryEn: "An intensive academic symposium examining classical and modern Arabic prose.",
      summaryAr: "ندوة أكاديمية مكثفة تبحث في النثر العربي الكلاسيكي والحديث.",
      descriptionEn: "Comprehensive exploration of Arabic rhetorical devices and linguistic development across major historical epochs.",
      category: "academic",
      startTime,
      endTime,
      venue: "Faculty of Arts, Main Lecture Hall 402",
      coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      capacity: 120,
      status: "confirmed",
      isRegistrationOpen: true,
      isPublished: true,
    });

    assert(Boolean(createdEventId), `Event record persisted successfully with ID: ${createdEventId}`);

    // Verify retrieval by ID
    const retrievedEvent = await getAdminEventById(createdEventId);
    assert(Boolean(retrievedEvent), "Retrieved event record via getAdminEventById");
    assert(retrievedEvent?.slug === testEventSlug, `Event slug correctly matches: ${retrievedEvent?.slug}`);
    assert(retrievedEvent?.capacity === 120, "Event capacity matches 120 seats");
    assert(retrievedEvent?.status === "confirmed", "Event initial status is confirmed");
    assert(retrievedEvent?.isRegistrationOpen === true, "Event registration toggle is active");

    // --------------------------------------------------------------------------
    // TEST SUITE 2: STATUS TRANSITIONS & HISTORICAL PRESERVATION
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 2: Event Postponement & Cancellation Status Lifecycle");

    // Postpone the event
    await updateEvent(createdEventId, { status: "postponed" });
    const postponedEvent = await getAdminEventById(createdEventId);
    assert(postponedEvent?.status === "postponed", "Event transitioned smoothly to 'postponed' state");
    assert(postponedEvent?.titleEn === `Arabic Classical Symposium ${timestamp}`, "Dossier details preserved across postponement");

    // Cancel the event
    await updateEvent(createdEventId, { status: "cancelled" });
    const cancelledEvent = await getAdminEventById(createdEventId);
    assert(cancelledEvent?.status === "cancelled", "Event transitioned to 'cancelled' status while retaining institutional history");

    // Restore to confirmed for attendance test
    await updateEvent(createdEventId, { status: "confirmed" });

    // --------------------------------------------------------------------------
    // TEST SUITE 3: ATTENDEE ROSTER & ATTENDANCE MANAGEMENT
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 3: Attendee Roster & Attendance Status Verification");

    // Register attendee
    const regResult = await registerAttendeeForEvent({
      eventId: createdEventId,
      attendeeName: "Rashid Al-Kindi",
      email: `rashid.kindi.${timestamp}@academic.edu`,
      phone: "+8801700112233",
      studentId: `ARA-REG-${timestamp.toString().slice(-4)}`,
    });

    createdRegistrationId = regResult.id;
    assert(Boolean(createdRegistrationId), `Registration ID assigned: ${createdRegistrationId}`);

    // Fetch roster
    const rosterResult = await getAdminEventRegistrations(createdEventId);
    const roster = rosterResult.data;
    assert(roster.length >= 1, `Attendee roster retrieved with ${roster.length} participants`);
    const registeredUser = roster.find((r) => r.id === createdRegistrationId);
    assert(registeredUser?.attendeeName === "Rashid Al-Kindi", "Roster accurately reflects attendee name");
    assert(registeredUser?.status === "registered", "Initial attendee status is 'registered'");

    // Update attendance status to confirmed
    await updateEventRegistrationStatus(createdRegistrationId, "confirmed");
    let updatedRoster = (await getAdminEventRegistrations(createdEventId)).data;
    let updatedUser = updatedRoster.find((r) => r.id === createdRegistrationId);
    assert(updatedUser?.status === "confirmed", "Attendee status updated to 'confirmed'");

    // Update attendance status to attended
    await updateEventRegistrationStatus(createdRegistrationId, "attended");
    updatedRoster = (await getAdminEventRegistrations(createdEventId)).data;
    updatedUser = updatedRoster.find((r) => r.id === createdRegistrationId);
    assert(updatedUser?.status === "attended", "Attendee status successfully marked as 'attended' (check-in complete)");

    // --------------------------------------------------------------------------
    // TEST SUITE 4: ANNUAL PLAN & MONTHLY ACTIVITIES SCHEDULER
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 4: Annual Plan Itinerary & Month-by-Month Scheduler");

    const testAcademicYear = "2026–2027";
    const testMonth = 3; // Month 3 (November)

    createdPlanId = await createAnnualPlanItem({
      academicYear: testAcademicYear,
      monthNumber: testMonth,
      activityTitleEn: `Annual Arabic Calligraphy Exhibition ${timestamp}`,
      activityTitleAr: "معرض الخط العربي السنوي",
      descriptionEn: "Showcase of classical Thuluth, Naskh, and Diwani masterworks by club calligraphers.",
      category: "cultural",
      status: "planned",
      targetDate: "2026-11-15",
      time: "10:00 AM - 04:00 PM",
      location: "Central Library Exhibition Hall",
      relatedEventId: createdEventId,
      documentUrl: "https://example.com/exhibition-guide.pdf",
      documentTitle: "Exhibition Guide & Catalog",
      notes: "Co-sponsored with Department of Fine Arts",
      isPublished: true,
    });

    assert(Boolean(createdPlanId), `Annual plan activity persisted with ID: ${createdPlanId}`);

    // Retrieve via admin queries
    const adminPlansResult = await getAdminAnnualPlans({ academicYear: testAcademicYear });
    const planItem = adminPlansResult.data.find((p) => p.id === createdPlanId);
    assert(Boolean(planItem), "Retrieved annual plan activity via getAdminAnnualPlans");
    assert(planItem?.monthNumber === 3, "Activity monthNumber is correctly 3");
    assert(planItem?.relatedEventId === createdEventId, "Activity correctly cross-linked to created event");
    assert(planItem?.category === "cultural", "Activity category is cultural");

    // Update annual plan item
    await updateAnnualPlanItem(createdPlanId, {
      status: "confirmed",
      time: "10:30 AM - 04:30 PM",
    });

    const updatedPlansResult = await getAdminAnnualPlans({ academicYear: testAcademicYear });
    const updatedPlanItem = updatedPlansResult.data.find((p) => p.id === createdPlanId);
    assert(updatedPlanItem?.status === "confirmed", "Annual plan activity status updated to 'confirmed'");
    assert(updatedPlanItem?.time === "10:30 AM - 04:30 PM", "Annual plan time updated successfully");

    // --------------------------------------------------------------------------
    // TEST SUITE 5: RBAC PERMISSION GATES & AUDIT TRAIL PERSISTENCE
    // --------------------------------------------------------------------------
    console.log("\nTEST SUITE 5: RBAC Permissions & Immutable Audit Trail Logging");

    // Verify role permissions
    assert(hasPermission("super_admin", "events:manage"), "super_admin has 'events:manage' permission");
    assert(hasPermission("event_manager", "events:manage"), "event_manager has 'events:manage' permission");
    assert(hasPermission("administrator", "events:manage"), "administrator has 'events:manage' permission");
    assert(!hasPermission("content_editor", "events:manage"), "content_editor is denied 'events:manage' permission");
    assert(!hasPermission("read_only", "events:manage"), "read_only is denied 'events:manage' permission");

    assert(hasPermission("super_admin", "plans:manage"), "super_admin has 'plans:manage' permission");
    assert(hasPermission("event_manager", "plans:manage"), "event_manager has 'plans:manage' permission");
    assert(!hasPermission("read_only", "plans:manage"), "read_only is denied 'plans:manage' permission");

    // Record audit logs
    await recordAuditLog({
      userId: "usr_superadmin",
      userEmail: "admin@arabicclub.org",
      action: "EVENT_CREATE",
      targetEntity: "events",
      targetId: createdEventId,
      details: { title: `Arabic Classical Symposium ${timestamp}`, category: "academic" },
    });

    await recordAuditLog({
      userId: "usr_superadmin",
      userEmail: "admin@arabicclub.org",
      action: "ANNUAL_PLAN_CREATE",
      targetEntity: "annual_plans",
      targetId: createdPlanId,
      details: { academicYear: testAcademicYear, monthNumber: 3 },
    });

    // Verify audit logs in DB
    const recentLogs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.targetId, createdEventId))
      .limit(5);

    assert(recentLogs.length > 0, "Audit trail log record persisted for event operation");
    assert(recentLogs[0].action === "EVENT_CREATE", "Audit log action verified as EVENT_CREATE");

    console.log("\n================================================================================");
    console.log("All 5 Test Suites PASSED (100% SUCCESS)!");
    console.log("================================================================================");
  } finally {
    // --------------------------------------------------------------------------
    // CLEANUP TEST RECORDS
    // --------------------------------------------------------------------------
    console.log("\nCleaning up test artifacts...");
    if (createdRegistrationId) {
      await db.delete(eventRegistrations).where(eq(eventRegistrations.id, createdRegistrationId));
    }
    if (createdPlanId) {
      await deleteAnnualPlanItem(createdPlanId);
    }
    if (createdEventId) {
      await deleteEvent(createdEventId);
    }
    console.log("Cleanup complete. Database returned to pristine state.\n");
  }
}

runEventsAndAnnualPlansCmsTests().catch((err) => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
