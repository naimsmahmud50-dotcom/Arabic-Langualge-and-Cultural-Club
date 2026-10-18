# IMPLEMENTATION PLAN: 009 - Complete Event System & Real Registration Experience

## 1. Architecture & Component Blueprint

```
                      ┌────────────────────────────────────────┐
                      │          Public Route: /events         │
                      │  Tabs: Master Plan | Upcoming | Past   │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │       Public Route: /events/[slug]     │
                      │   - Verified Event Logistics & Hero    │
                      │   - Capacity / Remaining Seats Meter   │
                      │   - Real Registration Form / Ticket    │
                      │   - Postponed/Cancelled Alert Banners  │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    Server Action: registerForEvent     │
                      │ - Rate Limiting & Input Validation     │
                      │ - Event Status & Capacity Capping      │
                      │ - Duplicate Email Prevention           │
                      │ - Atomic Database Persistence          │
                      │ - Return Unique Confirmation Code      │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │       Database & Admin Queries         │
                      │ - getPublicEventBySlug(slug)           │
                      │ - getEventCapacityAndRegistrations()   │
                      │ - registerAttendeeForEvent(data)       │
                      │ - getAdminEventRegistrations(eventId)  │
                      │ - updateRegistrationStatus(id, status) │
                      └────────────────────────────────────────┘
```

---

## 2. Step-by-Step Execution Plan

### Step 1: Database Operations & Registration Queries (`src/lib/db/queries.ts`)
- Implement:
  - `getEventRegistrationStats(eventId: string)`: Returns `{ totalRegistered, capacity, remainingSeats, isAtCapacity, isRegistrationOpen }`.
  - `registerAttendeeForEvent(data)`: Validates active status, checks duplicate email, checks capacity, generates `REG-2026-XXXX`, inserts into `event_registrations`.
  - `getAdminEventRegistrations(eventId, options)`: Admin-only query for review and attendance marking.
  - `updateEventRegistrationStatus(registrationId, status)`: For checking in attendees.

### Step 2: Server Action with Rate Limiting (`src/lib/actions/event-registration.ts`)
- Implement `registerForEventAction(formData)`:
  - Validates `attendeeName`, `email`, `phone`, `studentId`, `eventId` with Zod.
  - Applies sliding window rate limiting.
  - Enforces server-side capacity and duplicate checks.
  - Returns type-safe response `{ success: boolean, registrationCode?: string, error?: string }`.

### Step 3: Interactive Registration Form & Confirmation Ticket (`src/app/(public)/events/[slug]/EventRegistrationCard.tsx`)
- Client component rendered in the event details sidebar:
  - Live seat counter: e.g. "42 / 60 seats reserved (18 remaining)".
  - Real form inputs with validation messages and loading spinner.
  - Instant confirmation ticket upon success displaying:
    - Verifiable Reference ID (`REG-2026-XXXX`)
    - Attendee Name & Timestamp
    - Event Logistics
    - Print/Save button
  - Distinct disabled states:
    - "Registration Closed" (when `isRegistrationOpen === false`)
    - "At Full Capacity" (when remaining seats === 0)
    - "Event Postponed" or "Event Cancelled"

### Step 4: Full Event Details Dossier Enhancement (`src/app/(public)/events/[slug]/page.tsx`)
- Hero header with category badge, status indicator, and date/venue summary.
- Comprehensive itinerary and academic overview.
- Postponement / cancellation notices with administrative justification.
- Speaker card (name, title, bio if available).
- Strict Attendee Privacy: zero exposure of registrant names, emails, or student IDs on the public page.

### Step 5: Upcoming & Past Events Views on `/events`
- Enhance `/events` and `AnnualPlanCalendarClient.tsx` to support dedicated views:
  - Upcoming Events (with countdown/calendar card, capacity status, direct register CTA).
  - Past Events (with completion badge, event recap, and link to archival dossier).
  - Clear empty states when no upcoming or past events are published.

### Step 6: Automated Test Suite (`src/lib/db/test-event-registration-system.ts`)
- Verifies:
  1. Successful registration persistence and reference ID format.
  2. Duplicate registration prevention (rejects identical email for same event).
  3. Server-side capacity capping (rejects when full).
  4. Closed registration rejection (rejects when `isRegistrationOpen = false`).
  5. Postponed/cancelled event rejection.
  6. Attendee privacy boundary: public queries never project registration details.
  7. Upcoming and past events queries.
  8. Admin registration retrieval and attendance status updates.

### Step 7: Verification & Build Check
- Run automated test suite: `pnpm exec tsx src/lib/db/test-event-registration-system.ts`.
- Run production build: `pnpm exec next build`.
- Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`.
