# TASKS: 009 - Complete Event System & Real Registration Experience

- [x] Task 1: Add registration business operations (`getEventRegistrationStats`, `registerAttendeeForEvent`, `getAdminEventRegistrations`, `updateEventRegistrationStatus`) to `src/lib/db/queries.ts`.
- [x] Task 2: Create Server Action `src/lib/actions/event-registration.ts` with Zod validation, sliding-window rate limiting, duplicate protection, and capacity enforcement.
- [x] Task 3: Implement client component `src/app/(public)/events/[slug]/EventRegistrationCard.tsx` with live seat tracker, interactive form, and instant confirmation ticket.
- [x] Task 4: Upgrade `src/app/(public)/events/[slug]/page.tsx` with complete logistics, speaker details, postponement/cancellation banners, and strict attendee privacy.
- [x] Task 5: Enhance `src/app/(public)/events/AnnualPlanCalendarClient.tsx` and `src/app/(public)/events/page.tsx` to support dedicated Upcoming Events and Past Events views with filters and empty states.
- [x] Task 6: Seed additional event test cases (1 past event, 1 capacity-full event, 1 cancelled/postponed event) in `src/lib/db/seed.ts` and re-seed database.
- [x] Task 7: Implement automated verification test suite `src/lib/db/test-event-registration-system.ts` covering all 8 test suites.
- [x] Task 8: Run automated test suite and fix any bugs.
- [x] Task 9: Run Next.js production build (`pnpm exec next build`) to verify 0 errors across all routes.
- [x] Task 10: Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`.
