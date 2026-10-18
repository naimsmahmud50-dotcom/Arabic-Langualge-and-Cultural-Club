# SPECIFICATION: 016 - Events & Annual Plans CMS Modules

## 1. Executive Summary & Problem Definition
The Arabic Language & Cultural Club organizes a rich 12-month calendar of academic symposiums, national calligraphy masterclasses, rhetoric debates, and cultural gatherings. Previously, public event calendars and annual itineraries were browsable by visitors, but administrative managers lacked fully functional CMS tooling to plan, schedule, edit, postpone, cancel, or review attendees.

This feature delivers complete administrative management for:
1. **Annual Plans & Monthly Itineraries:** Academic session management, month-by-month activity scheduler (1-12), verified logistics (dates, times, venues), category classifications, related event links, and document attachments.
2. **Event Dossier Lifecycle:** Full CRUD operations for public and internal events with bilingual titles/summaries, start/end time validations, seating capacity, and registration availability toggles.
3. **Cancellation & Postponement Protocol:** Clear operational status transitions (`planned`, `confirmed`, `completed`, `postponed`, `cancelled`) ensuring event history is strictly preserved without data loss.
4. **Attendee Registrations & Attendance Console:** Real-time seat tracking, attendee roster inspection, and individual attendance verification (`registered`, `confirmed`, `attended`, `cancelled`).
5. **Privacy & Security Mandate:** Server-side RBAC validation (`events:manage`, `plans:manage`), attendee PII protection, and immutable audit logs via `recordAuditLog`.

---

## 2. User Stories & Value Proposition

### User Story 1 (P1): Full Event Dossier & Lifecycle Management
> **As an** Event Coordinator or Club Administrator,  
> **I want to** create, edit, publish, and manage club event dossiers from `/admin/events`,  
> **So that** official club programs are scheduled with accurate dates, times, venues, and descriptions without modifying source code.

**Acceptance Criteria:**
- Given an authorized administrator on `/admin/events`, clicking "New Event" opens the event form modal.
- Given form inputs for `titleEn`, `titleAr`, `summaryEn`, `category`, `startTime`, `endTime`, `venue`, `capacity`, and `isRegistrationOpen`, validating input verifies that `startTime <= endTime` and required fields are populated.
- Given a successful save, the event record is inserted/updated in the `events` table, public caches are purged via `revalidatePath`, and an audit log is recorded.
- Given a cancelled or postponed event, its status transitions to `cancelled` or `postponed`, and public event pages display immediate warning banners while preserving the record.

---

### User Story 2 (P2): Annual Plan & Monthly Activity Scheduler
> **As an** Academic Program Director or Administrator,  
> **I want to** schedule and curate month-by-month annual plan activities organized by academic year,  
> **So that** students and scholars can explore the club's comprehensive 12-month roadmap.

**Acceptance Criteria:**
- Given `/admin/events?tab=annual-plan` or dedicated annual plan management interface, administrators can filter activities by academic year (e.g. `2024–2025`, `2025–2026`) and month (1–12).
- Given activity creation, administrators specify academic year, month number, activity title (EN & AR), category, target date, time, location, status, document link, and optional related event.
- Given an update or deletion, the database `annual_plans` record is updated/removed and public `/events` annual plan tabs are revalidated.

---

### User Story 3 (P3): Event Registration & Attendance Management
> **As an** Event Coordinator,  
> **I want to** review attendee registrations, search participants, and mark attendance status (`attended`, `confirmed`, `cancelled`),  
> **So that** capacity is respected and verified attendance rosters are maintained for certificate issuance.

**Acceptance Criteria:**
- Given any event with registrations, clicking "View Attendees" opens the registration roster modal.
- Given attendee records, managers can filter by status (`registered`, `confirmed`, `attended`, `cancelled`) or search by name, email, or student ID.
- Given an attendee status change (e.g. marking `attended`), the record updates instantly and the change is logged in `audit_logs`.
- Given an unauthenticated visitor, private attendee PII (email, phone, student ID) is strictly inaccessible.

---

## 3. Data Integrity & Validation Rules
1. **Date Consistency:** Event `startTime` must be before or equal to `endTime`.
2. **Month Validity:** Annual plan `monthNumber` must be an integer between 1 and 12.
3. **Unique Slugs:** Event slugs must be unique across the platform.
4. **Historical Preservation:** Completed, cancelled, or postponed events must never be silently deleted when terminating an operation.
5. **Anti-Fabrication:** Never invent synthetic events or fake registrations.

---

## 4. Security & Role-Based Access Control (RBAC)
- Role `event_manager`, `administrator`, and `super_admin` hold `events:manage` and `plans:manage` permissions.
- Roles lacking permissions (`content_editor`, `read_only`) receive 403 Forbidden responses.
- Every state mutation records actor ID, user email, action type, target entity, and timestamp in `audit_logs`.
