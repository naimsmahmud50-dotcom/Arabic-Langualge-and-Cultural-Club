# TASKS: 008 - Annual Plan & Academic Calendar Experience

- [x] Task 1: Create SQL migration `0002_annual_plans_enhancement.sql` and update `src/lib/db/schema.ts` with description, targetDate, time, location, relatedEventId, documentUrl, and isPublished fields.
- [x] Task 2: Apply migration to local SQLite database and verify table structure.
- [x] Task 3: Enhance `src/lib/db/seed.ts` with comprehensive 12-month annual plans for 2024–2025 and 2023–2024, including edge cases (postponed, cancelled, unverified dates).
- [x] Task 4: Re-seed database and verify records.
- [x] Task 5: Enhance `src/lib/db/queries.ts` with `getPublicAnnualPlans`, `getAnnualPlanYears`, `createAnnualPlanItem`, `updateAnnualPlanItem`, and `deleteAnnualPlanItem`.
- [x] Task 6: Implement interactive client component `src/app/(public)/events/AnnualPlanCalendarClient.tsx` supporting Month-by-Month View, Calendar Grid View, and Itinerary List View with filters, search, and accessible keyboard navigation.
- [x] Task 7: Update `src/app/(public)/events/page.tsx` with unified data fetching and full JSDoc headers.
- [x] Task 8: Implement and run automated test suite `src/lib/db/test-annual-plan-calendar.ts` verifying all 8 test suites (queries, filters, empty states, admin mutations).
- [x] Task 9: Run Next.js production build check (`pnpm exec next build`) to verify 0 errors across all routes.
- [x] Task 10: Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`.
