# PLAN: 016 - Events & Annual Plans CMS Modules

## Architecture & Data Flow

```
+-------------------------------------------------------------+
|                Admin UI: /admin/events                      |
|                                                             |
| [Tab 1: Event Dossiers]         [Tab 2: Annual Plan / Mo.]  |
| - Filter by Status & Category   - Filter by Academic Year   |
| - Event List & Metrics          - Month-by-month Schedule   |
| - Create/Edit Event Modal       - Activity Create/Edit Modal|
| - Attendees Roster Modal        - Related Event Selector    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|        Server Actions Layer (src/lib/actions/events.ts)     |
| - saveEventAction                                           |
| - updateEventStatusAction (Cancel/Postpone/Complete)        |
| - deleteEventAction                                         |
| - updateRegistrationAttendanceAction                        |
| - saveAnnualPlanActivityAction                              |
| - deleteAnnualPlanActivityAction                            |
|                                                             |
| Security & Governance:                                      |
| - RBAC Assertions: events:manage / plans:manage             |
| - Input Validation with Zod                                 |
| - Immutable Audit Logging via recordAuditLog                |
| - Public Cache Revalidation (revalidatePath)                |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|      Database Layer (src/lib/db/queries.ts & schema.ts)     |
| - events table                                              |
| - event_registrations table                                 |
| - annual_plans table                                        |
| - audit_logs table                                          |
+-------------------------------------------------------------+
```

## Component Architecture
1. `src/app/admin/events/page.tsx`: Server component fetching initial events, annual plan activities, and academic years.
2. `src/app/admin/events/AdminEventsClient.tsx`: Interactive dashboard handling tabs ("Events" vs "Annual Plan Itinerary"), filters, modals, and status badges.
3. `src/app/admin/events/EventFormModal.tsx`: Accessible dialog for creating and updating event dossiers.
4. `src/app/admin/events/EventAttendeesModal.tsx`: Accessible roster drawer for viewing registered participants and updating attendance status.
5. `src/app/admin/events/AnnualPlanActivityModal.tsx`: Accessible dialog for scheduling monthly activities linked to academic years.

## Verification & Testing Strategy
- Unit & Integration test suite `src/lib/db/test-events-annual-plans-cms.ts`:
  1. Event CRUD operations, start/end date validation, unique slug handling.
  2. Event status transitions (`confirmed` -> `postponed` -> `cancelled`) with historical preservation.
  3. Registration roster querying, capacity enforcement, and attendance status updates.
  4. Annual plan activity CRUD operations and month number validation (1-12).
  5. RBAC permission checks and audit log generation.
- Full regression suite execution across all 13 test files.
- Production build verification (`pnpm exec next build`).
