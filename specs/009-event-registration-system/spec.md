# SPECIFICATION: 009 - Complete Event System & Real Registration Experience

## 1. Executive Summary
Establish the comprehensive, verifiable event lifecycle and registration system for the Arabic Language & Cultural Club:
- **Upcoming Events:** Public showcase of confirmed upcoming gatherings, symposia, and competitions.
- **Past Events:** Archival repository of completed events with historical documentation and summaries.
- **Event Details (`/events/[slug]`):** Authoritative event dossier displaying title, bilingual description, schedule, venue, speaker profile, seat capacity status, and postponement/cancellation alerts.
- **Real Event Registration:** A hardened, server-side validated registration mechanism with database persistence, seat limit capping, duplicate registration prevention, rate limiting, and instant verifiable confirmation reference.
- **Attendee Privacy Protection:** Absolute zero public leakage of attendee personal contact records (email, phone, student ID).
- **Administrative Attendance Preparation:** Type-safe queries for administrators to inspect registrations and mark attendance statuses.

---

## 2. Core User Stories & Personas

- **US-01 (Prospective Attendee):** As a student or fellow, I want to inspect upcoming and past club events, view venue and time logistics, and register with my name, student ID, and email.
- **US-02 (Verified Registrant):** As a registered participant, I want to receive an authentic confirmation receipt with a unique reference number (e.g., `REG-2026-XXXX`) so I have verifiable proof of seat reservation.
- **US-03 (Public Visitor):** As a visitor, I want clear, honest notices if an event is postponed or cancelled, or if registration has reached full capacity, so I am never misled.
- **US-04 (Event Manager & Secretariat):** As an event manager, I want to enforce strict capacity limits on the server, prevent duplicate registrations with the same email, review registered attendees in the admin portal, and record attendance.

---

## 3. Acceptance Criteria & Integrity Gates

### Gate 1: Real Database Registration Persistence
- **Given** an event with `is_registration_open: true`,
- **When** a student submits valid registration details (name, email, phone, student ID),
- **Then** a new record is created in `event_registrations` with a unique ID (`REG-2026-...`), status `registered`, and timestamp, and the server returns success with the registration reference.

### Gate 2: Duplicate Registration Prevention
- **Given** an attendee already registered for event `X` with email `user@university.edu`,
- **When** the same email attempts to register again for event `X`,
- **Then** the submission is rejected with a clear message: `"This email address is already registered for this event."`

### Gate 3: Server-Side Seat Capacity Enforcement
- **Given** an event with a configured capacity limit (e.g. 60 seats) and 60 existing active registrations,
- **When** any user attempts to submit a registration,
- **Then** the server rejects the request with `"This event has reached maximum seating capacity."`, and the UI displays a clear "At Full Capacity / Registration Closed" state.

### Gate 4: Cancellation & Postponement Handling
- **Given** an event with status `cancelled` or `postponed`,
- **When** viewed on the public website,
- **Then** the page renders prominent warning banners with official administrative explanations, and registration is strictly disabled.

### Gate 5: Strict Attendee Privacy Boundary
- **Given** all event registrations stored in the database,
- **When** public queries or pages are accessed,
- **Then** attendee records are NEVER returned or rendered publicly. Only authenticated administrators with `events:manage` permissions can query attendee lists.

---

## 4. Design & Aesthetic Standards
- **Heritage Tokens:** Forest Green (`#173D32`), Antique Brass (`#B18A4A`), Warm Ivory (`#F5F0E5`), Midnight Evergreen (`#17211D`).
- **Human Vibe:** Zero cheesy AI emojis. Clean SVG icons from `lucide-react`.
- **Developer Documentation:** JSDoc annotations on all pages and server actions.
