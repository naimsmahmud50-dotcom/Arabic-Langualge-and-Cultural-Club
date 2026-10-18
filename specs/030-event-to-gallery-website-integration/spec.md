# SPECIFICATION: 030 - Event-to-Gallery Workflow & Comprehensive Website Integration

**Institution:** Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)  
**Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)  
**Phase:** 8 — Event-to-Gallery Workflow and Website Integration  
**Status:** In Progress  

---

## 1. Executive Summary & Objective

The Arabic Language & Cultural Club at Kabi Nazrul Government College, Dhaka conducts symposia, academic debates, calligraphy exhibitions, Arabic language workshops, and annual cultural celebrations. Following the successful implementation of the secure Super Admin system (Phase 4), complete Gallery & Media Archive (Phase 5), Persistent Media Storage (Phase 6), and Safe Historical Photo Import (Phase 7), Phase 8 unites these core systems into a coherent, seamless, and production-ready workflow across the entire website.

### Core Objectives:
1. **Event-to-Gallery Workflow:** Provide administrators with an integrated pipeline:
   - Create future events (title, date, venue, description, poster, capacity, registration).
   - Save events as draft or publish them.
   - Update events after they conclude.
   - Attach or create dedicated photo albums directly linked to the event (`relatedEventId`).
   - Add photographs, designate cover images, edit bilingual captions, and publish the album.
   - Prevent duplicate albums when an existing event is edited or re-associated.
   - Ensure seamless bidirectional public navigation: Event dossier (`/events/[slug]`) features a dedicated Photographic Retrospective section linking to `/gallery/[slug]`, and the Album dossier (`/gallery/[slug]`) links directly back to `/events/[slug]`.
2. **Comprehensive Public Website & Brand Audit:**
   - Verify consistent institutional identity across Homepage, About, History, Founders, Leadership, Events, Gallery, News, Membership, Contact, Policies, and Admin views.
   - Protect Super Admin credentials: ensure the administrative email (`arabicclubkngc2025@gmail.com`) is guarded and not exposed on public pages.
   - Strictly adhere to human academic UI/UX standards with zero AI emojis, authentic bilingual/trilingual typography, and correct Arabic RTL orientation.
3. **Automated Verification:** Implement an automated test harness (`test-event-gallery-integration.ts`) validating the database relationships, duplicate prevention, and bidirectional public query integrity.

---

## 2. User Stories & Acceptance Criteria

### User Story 1 (P1): Administrator Event-to-Gallery Creation & Association
**As an** Event Coordinator or Archival Administrator,  
**I want** to create or link a photographic album directly from an event in the Admin Dashboard,  
**So that** event documentation is directly tied to the authoritative event record without duplicate album creation.

- **Acceptance Criteria 1.1:** In `/admin/events`, each event row displays its album association status ("No Album" or "Has Album [albumSlug]").
- **Acceptance Criteria 1.2:** For events without an album, an action button ("Create Photo Album") initiates album creation pre-filled with the event's title, date, venue, and `relatedEventId`.
- **Acceptance Criteria 1.3:** For events with an existing album, an action button ("View / Manage Photos") links directly to `/admin/gallery?albumId=[id]`.
- **Acceptance Criteria 1.4:** The system strictly prevents duplicate albums for the same event (`relatedEventId`). Attempting to create a second album for an event returns a clear validation error.

### User Story 2 (P1): Public Bidirectional Event & Gallery Experience
**As a** student, faculty member, or public researcher,  
**I want** to discover photo albums from event pages and view event context from photo albums,  
**So that** I have a rich, complete understanding of the club's academic and cultural milestones.

- **Acceptance Criteria 2.1:** On `/events/[slug]`, if an associated published album exists, the page renders an "Event Photographic Retrospective / Photo Gallery" showcase featuring photo count, preview thumbnails, and a direct button to `/gallery/[albumSlug]`.
- **Acceptance Criteria 2.2:** If the associated album is in draft (`isPublished: false`) or archived (`isArchived: true`), it remains hidden from anonymous public visitors.
- **Acceptance Criteria 2.3:** On `/gallery/[slug]`, the page displays the verified "Official Event Association" banner linking directly to `/events/[relatedEventSlug]`.
- **Acceptance Criteria 2.4:** Both pages maintain correct bilingual text rendering, RTL alignment for Arabic text, and responsive layout across mobile and desktop.

### User Story 3 (P1): Comprehensive Website Brand & Privacy Audit
**As a** College Administrator and Security Officer,  
**I want** consistent branding and strict privacy safeguards across all public routes,  
**So that** institutional dignity is preserved and administrative accounts are protected.

- **Acceptance Criteria 3.1:** Official English name ("Kabi Nazrul Government College, Dhaka") and Bangla name ("কবি নজরুল সরকারি কলেজ, ঢাকা") are presented accurately and consistently.
- **Acceptance Criteria 3.2:** The administrative login email (`arabicclubkngc2025@gmail.com`) is strictly reserved for authenticated administration and is not exposed on public inquiry or policy pages.
- **Acceptance Criteria 3.3:** All metadata, OpenGraph tags, page titles, and canonical URLs reflect accurate institutional coordinates.
- **Acceptance Criteria 3.4:** Strictly zero AI emojis are present in public pages, admin panels, code comments, and test scripts.

### User Story 4 (P1): Automated Verification Harness
**As a** Lead Software Engineer,  
**I want** an automated test suite verifying the event-to-gallery workflow,  
**So that** regressions are impossible and all functional criteria are proven with fresh test execution.

- **Acceptance Criteria 4.1:** Automated test suite (`src/lib/db/test-event-gallery-integration.ts`) executes successfully with 0 failures.
- **Acceptance Criteria 4.2:** Verifies event creation, album creation with `relatedEventId`, duplicate album prevention, draft isolation, and public query resolution.
- **Acceptance Criteria 4.3:** Typecheck, build, and test commands pass cleanly.

---

## 3. Institutional Guardrails
- **Zero AI Emojis:** Strictly prohibited across UI, messages, comments, and console outputs.
- **Port Safety:** Port 3000 is reserved for external process PID 23123. Website runs on Port 3005.
- **Privacy:** Admin login email `arabicclubkngc2025@gmail.com` must never be displayed publicly.
