# IMPLEMENTATION PLAN: 008 - Annual Plan & Academic Calendar Experience

## 1. Architectural Strategy
We will enhance the existing `/events` experience to deliver a full **12-Month Annual Plan & Master Calendar** while keeping the foundation for detailed event pages (`/events/[slug]`) and admin management.

```
                    ┌────────────────────────────────────────┐
                    │    Public Route: /events               │
                    │  (Server Component with 60s ISR / SSR) │
                    └───────────────────┬────────────────────┘
                                        │
             ┌──────────────────────────┴─────────────────────────┐
             ▼                                                    ▼
┌─────────────────────────────┐                      ┌─────────────────────────────┐
│  Academic Year & Filter Bar │                      │  Annual Plan & Event Views  │
│ - Academic Year Selector    │                      │ - Month-by-Month Plan View  │
│ - Category Filter Pills     │                      │ - Interactive Calendar Grid │
│ - Search & Status Filters   │                      │ - Chronological List View   │
│ - Calendar / List Switcher  │                      │ - Related Event & PDF Links │
└─────────────────────────────┘                      └─────────────────────────────┘
                                        │
                                        ▼
                    ┌────────────────────────────────────────┐
                    │   Database Queries & Type-Safe Layer   │
                    │ - getPublicAnnualPlans(academicYear)   │
                    │ - getAnnualPlanYears()                 │
                    │ - create/update/deleteAnnualPlanItem() │
                    └────────────────────────────────────────┘
```

---

## 2. Step-by-Step Execution Plan

### Step 1: Database Schema Enhancement & Migration
- Add fields to `annual_plans` table:
  - `description_en`: Detailed itinerary or syllabus text.
  - `description_ar`: Arabic translation of itinerary.
  - `target_date`: Verified date string (`YYYY-MM-DD`).
  - `time`: Verified time window (e.g., `10:00 AM - 1:00 PM`).
  - `location`: Physical or virtual hall venue.
  - `related_event_id`: FK to `events.id` with `onDelete: 'set null'`.
  - `document_url`: URL to approved prospectus / syllabus PDF.
  - `document_title`: Title of the approved document.
  - `is_published`: Visibility toggle (default `true`).
- Create SQL migration file `src/lib/db/migrations/0002_annual_plans_enhancement.sql`.
- Run database migration and verify table schema.

### Step 2: Database Seeding Enhancement
- Enrich `src/lib/db/seed.ts` with:
  - A complete 12-month program for `2024–2025` with verified dates, venues, categories, descriptions, documents, and related events.
  - Realistic edge cases: 1 `postponed` activity with administrative note, 1 `cancelled` activity with official explanation, and unverified tentative activities with `[Date to be finalized]`.
  - An archived 12-month program for `2023–2024` to verify historical year switching.
- Run `pnpm exec tsx src/lib/db/seed.ts`.

### Step 3: Type-Safe Data Access Layer (`src/lib/db/queries.ts`)
- Implement:
  - `getPublicAnnualPlans(academicYear, options)`: Returns published items with related event join, ordered by `monthNumber` and `targetDate`.
  - `getAnnualPlanYears()`: Returns available academic sessions.
  - Administrative mutations: `createAnnualPlanItem`, `updateAnnualPlanItem`, `deleteAnnualPlanItem`.

### Step 4: UI Architecture & Client Interactive Components
- `src/app/(public)/events/AnnualPlanCalendarClient.tsx`:
  - Interactive Tab / Mode switcher: **Month-by-Month Schedule (12-Month Plan)**, **Interactive Calendar Grid View**, and **Detailed Chronological List**.
  - Academic year dropdown/selector (`2024–2025`, `2023–2024`, etc.).
  - Search input with instantaneous client-side filtering.
  - Category selector pills (All, Workshop, Competition, Seminar, Cultural, Academic).
  - Status filters (All, Confirmed, Planned, Completed, Postponed/Cancelled).
  - Calendar View: Displays an accessible monthly grid with day cells, status color indicators, event titles, and detailed modal/popover drawer for day logistics.
  - Month-by-Month View: Clean 12-month academic blocks (Month 1: Muharram/September through Month 12: Dhu al-Hijjah/August) with verified timestamps, venues, documents, and event cards.
  - Respects `prefers-reduced-motion` and ensures WCAG 2.2 AA keyboard navigation.

### Step 5: Public Route Integration (`src/app/(public)/events/page.tsx`)
- Server component querying both `getPublicAnnualPlans` and `getPublicEvents`.
- Passes server-fetched published data to `AnnualPlanCalendarClient`.
- Full JSDoc documentation headers with `@file`, `@route`, `@description`, design token bindings, and query sources.

### Step 6: Automated Testing Suite
- Create `src/lib/db/test-annual-plan-calendar.ts`:
  - Test 1: Query published annual plan items by academic year.
  - Test 2: Verify academic year selection and historical preservation.
  - Test 3: Verify month-by-month ordering (1 through 12).
  - Test 4: Verify status handling (`confirmed`, `planned`, `completed`, `postponed`, `cancelled`).
  - Test 5: Verify related event linkage (`relatedEventId`).
  - Test 6: Verify document link projection (`documentUrl`).
  - Test 7: Verify empty state handling for unratified academic years.
  - Test 8: Verify admin CRUD operations (`createAnnualPlanItem`, `updateAnnualPlanItem`, `deleteAnnualPlanItem`).
- Run tests via `pnpm exec tsx src/lib/db/test-annual-plan-calendar.ts`.
- Run production build `pnpm exec next build`.

### Step 7: Documentation & Phase Status Update
- Update `docs/REQUIREMENTS_CHECKLIST.md` (mark `REQ-PUB-08` completed).
- Update `docs/PHASE_STATUS.md`.
