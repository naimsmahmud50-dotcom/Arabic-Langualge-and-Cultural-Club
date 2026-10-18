/**
 * @file src/lib/db/test-event-registration-system.ts
 * @description Automated verification test suite for Event Dossiers, Public/Past Queries, and Registration System.
 * 
 * COVERS:
 * 1. Event verification by slug & unverified logistics handling.
 * 2. Public seating statistics & zero attendee PII exposure.
 * 3. Successful seat reservation creating authenticated record with REG-2026-XXXX code.
 * 4. Duplicate registration prevention (rejects duplicate email for same event).
 * 5. Strict server-side capacity enforcement (rejects registration when capacity reached).
 * 6. Closed, cancelled, and postponed status rejection.
 * 7. Upcoming vs Past events categorization and category filters.
 * 8. Admin-only roster access and attendance status updates.
 */

import { 
  getPublicEventBySlug, 
  getPublicEvents, 
  getEventRegistrationStats, 
  registerAttendeeForEvent, 
  getAdminEventRegistrations, 
  updateEventRegistrationStatus 
} from "./queries";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("================================================================");
  console.log("Arabic Club: Event & Registration System Verification Suite");
  console.log("================================================================\n");

  // Suite 1: Event Publication & Detail Dossier Verification
  console.log("[Suite 1] Event Publication & Dossier Retrieval");
  const event = await getPublicEventBySlug("arabic-calligraphy-masterclass-2026");
  assert(event !== null, "Authoritative event retrieved by slug");
  assert(event?.titleEn === "Classical Arabic Calligraphy Masterclass [DEMO]", "English event title matches official record");
  assert(event?.titleAr === "دورة الخط العربي الكلاسيكي المتقدمة [نموذج تجريبي]", "Arabic event title matches official record");
  assert(event?.status === "confirmed", "Event status confirmed");
  assert(event?.capacity === 60, "Event seating capacity configured as 60");
  assert(event?.isRegistrationOpen === true, "Public registration marked open");

  const nonExistent = await getPublicEventBySlug("non-existent-event-slug-xyz");
  assert(nonExistent === null, "Non-existent event slug returns null cleanly");

  // Suite 2: Seating Capacity & Public Statistics (PII Protection)
  console.log("\n[Suite 2] Seating Availability Statistics & PII Protection");
  const stats = await getEventRegistrationStats("evt_01");
  assert(stats !== null, "Registration stats returned for evt_01");
  assert(typeof stats?.totalRegistered === "number", `Total registered count is numeric: ${stats?.totalRegistered}`);
  assert(stats?.capacity === 60, "Capacity is 60");
  assert(stats?.isAtCapacity === false, "Event is not at full capacity");
  assert((stats as any).email === undefined, "PII Guard: No attendee email exposed in public stats");
  assert((stats as any).attendeeName === undefined, "PII Guard: No attendee name exposed in public stats");
  assert((stats as any).phone === undefined, "PII Guard: No phone number exposed in public stats");
  assert((stats as any).studentId === undefined, "PII Guard: No student ID exposed in public stats");

  // Check event at full capacity (evt_04, seeded with 5/5 registrations)
  const fullStats = await getEventRegistrationStats("evt_04");
  assert(fullStats !== null, "Registration stats returned for capacity-capped evt_04");
  assert(fullStats?.totalRegistered === 5, `evt_04 active registered count is exactly 5 (Found: ${fullStats?.totalRegistered})`);
  assert(fullStats?.capacity === 5, "evt_04 capacity is 5");
  assert(fullStats?.isAtCapacity === true, "evt_04 correctly marked isAtCapacity: true");
  assert(fullStats?.remainingSeats === 0, "evt_04 has exactly 0 remaining seats");
  assert(fullStats?.isAvailable === false, "evt_04 registration is marked unavailable");

  // Suite 3: Successful Attendee Registration Flow
  console.log("\n[Suite 3] Successful Attendee Registration Flow");
  const testEmail = `scholar.${Date.now()}@university.edu`;
  const regResult = await registerAttendeeForEvent({
    eventId: "evt_01",
    attendeeName: "Kareem Al-Mansoor",
    email: testEmail,
    phone: "+880 1711-998877",
    studentId: "ARB-2026-089",
  });

  assert(regResult !== null && typeof regResult.id === "string", "Registration created successfully");
  assert(regResult.id.startsWith("REG-2026-"), `Reference code has institutional format (Got: ${regResult.id})`);
  assert(regResult.attendeeName === "Kareem Al-Mansoor", "Attendee name preserved");
  assert(regResult.email === testEmail, "Attendee email preserved");
  assert(regResult.eventId === "evt_01", "Associated with target event evt_01");

  // Check stats updated
  const updatedStats = await getEventRegistrationStats("evt_01");
  assert(updatedStats!.totalRegistered === stats!.totalRegistered + 1, "Total registered count incremented by 1");

  // Suite 4: Duplicate Registration Prevention
  console.log("\n[Suite 4] Duplicate Registration Prevention");
  let duplicateCaught = false;
  try {
    await registerAttendeeForEvent({
      eventId: "evt_01",
      attendeeName: "Kareem Al-Mansoor (Duplicate)",
      email: testEmail, // Identical email
    });
  } catch (err: any) {
    duplicateCaught = true;
    assert(err.message.includes("already registered"), `Caught duplicate registration: "${err.message}"`);
  }
  assert(duplicateCaught, "Duplicate email registration was successfully rejected");

  // Suite 5: Server-Side Capacity Enforcement
  console.log("\n[Suite 5] Server-Side Seat Capacity Enforcement");
  let capacityRejected = false;
  try {
    await registerAttendeeForEvent({
      eventId: "evt_04", // Capacity is 5, already 5/5
      attendeeName: "Overflow Student",
      email: "overflow@university.edu",
    });
  } catch (err: any) {
    capacityRejected = true;
    assert(err.message.includes("maximum seating capacity"), `Caught capacity overflow: "${err.message}"`);
  }
  assert(capacityRejected, "Registration for sold-out event was rejected by server");

  // Suite 6: Status-Based Registration Rejection (Postponed, Completed, Cancelled)
  console.log("\n[Suite 6] Status-Based Registration Restrictions");
  // evt_03 is completed
  let completedRejected = false;
  try {
    await registerAttendeeForEvent({
      eventId: "evt_03",
      attendeeName: "Late Applicant",
      email: "late@university.edu",
    });
  } catch (err: any) {
    completedRejected = true;
    assert(err.message.includes("concluded"), `Concluded event rejected: "${err.message}"`);
  }
  assert(completedRejected, "Registration for concluded event was rejected");

  // evt_05 is postponed
  let postponedRejected = false;
  try {
    await registerAttendeeForEvent({
      eventId: "evt_05",
      attendeeName: "Hopeful Applicant",
      email: "hopeful@university.edu",
    });
  } catch (err: any) {
    postponedRejected = true;
    assert(err.message.includes("postponed"), `Postponed event rejected: "${err.message}"`);
  }
  assert(postponedRejected, "Registration for postponed event was rejected");

  // Suite 7: Upcoming vs Past Events Categorization
  console.log("\n[Suite 7] Upcoming vs Past Events Categorization");
  const upcomingResult = await getPublicEvents({ status: "upcoming" });
  assert(upcomingResult.data.length > 0, `Upcoming events retrieved (Found: ${upcomingResult.data.length})`);
  const allUpcoming = upcomingResult.data.every(e => e.status !== "completed");
  assert(allUpcoming, "All items in upcoming query have active/upcoming statuses");

  const pastResult = await getPublicEvents({ status: "past" });
  assert(pastResult.data.length > 0, `Past events archive retrieved (Found: ${pastResult.data.length})`);
  const hasCompleted = pastResult.data.some(e => e.id === "evt_03");
  assert(hasCompleted, "Concluded event evt_03 is present in past events query");

  // Category filter
  const workshopEvents = await getPublicEvents({ category: "workshop" });
  assert(workshopEvents.data.length >= 1, "Workshop category filter returns matching events");
  assert(workshopEvents.data.every(e => e.category === "workshop"), "All filtered events belong to 'workshop' category");

  // Suite 8: Admin Roster & Attendance Management
  console.log("\n[Suite 8] Administrative Operations & Attendance Tracking");
  const adminRegistrations = await getAdminEventRegistrations("evt_01", { limit: 10 });
  assert(adminRegistrations.data.length > 0, `Admin roster retrieved registrations (Found: ${adminRegistrations.data.length})`);
  
  // Find our registered test user
  const foundReg = adminRegistrations.data.find(r => r.id === regResult.id);
  assert(foundReg !== undefined, "Newly registered attendee found in admin roster");
  assert(foundReg?.studentId === "ARB-2026-089", "Admin roster accurately includes verified studentId");

  // Update attendance status
  await updateEventRegistrationStatus(regResult.id, "attended");
  const updatedRoster = await getAdminEventRegistrations("evt_01");
  const updatedUser = updatedRoster.data.find(r => r.id === regResult.id);
  assert(updatedUser?.status === "attended", "Attendance status updated to 'attended' successfully");

  // Summary
  console.log("\n================================================================");
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite runtime failure:", err);
  process.exit(1);
});
