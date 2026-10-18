# TASKS: 012 - Membership Application & Admissions Workflow

- [x] **Task 1: Schema Enhancement & SQLite Migration** <!-- id: 1 -->
  - [x] Add `applicantNameAr`, `studentId`, `department`, `faculty`, `academicLevel`, `arabicProficiency`, `consentAgreed`, `directoryConsent`, and `reviewedAt` to `membershipApplications` in `src/lib/db/schema.ts`
  - [x] Create `src/lib/db/migrations/0005_membership_applications_enhancements.sql`
  - [x] Run migration runner `pnpm exec tsx src/lib/db/migrate.ts`

- [x] **Task 2: Database Queries & Security Operations** <!-- id: 2 -->
  - [x] Implement `submitMembershipApplication`, `getMembershipApplicationStatus`, `withdrawMembershipApplication`, and `reviewMembershipApplication` in `src/lib/db/queries.ts`
  - [x] Enhance `getAdminMembershipApplications` with status and search filtering

- [x] **Task 3: Server Actions with Strix Security Guardrails** <!-- id: 3 -->
  - [x] Create `src/lib/actions/membership-application.ts` with Zod validation, sliding-window rate limiting, duplicate prevention, and audit logging
  - [x] Implement `submitMembershipApplicationAction`, `trackApplicationStatusAction`, `withdrawApplicationAction`, and `reviewMembershipApplicationAction`
  - [x] Add comprehensive JSDoc headers for new developers

- [x] **Task 4: Interactive Client Components for Application & Tracking** <!-- id: 4 -->
  - [x] Create `src/app/(public)/membership/MembershipApplicationForm.tsx` with field validation, live states, and confirmation voucher
  - [x] Create `src/app/(public)/membership/ApplicationStatusTracker.tsx` with dual-factor lookup (RefNo + Email) and self-service withdrawal

- [x] **Task 5: Upgrade Public Admissions Page** <!-- id: 5 -->
  - [x] Refactor `src/app/(public)/membership/page.tsx` with eligibility criteria, privileges, tabs between Apply and Status Tracker, and clear privacy notices

- [x] **Task 6: Administrative Review Queue & Dossier Modal** <!-- id: 6 -->
  - [x] Create `src/app/admin/applications/ApplicationReviewModal.tsx` for reviewing dossiers, adding reviewer notes, and submitting decisions
  - [x] Upgrade `src/app/admin/applications/page.tsx` with status tabs, search, and review modal integration

- [x] **Task 7: Automated Test Suite & Build Verification** <!-- id: 7 -->
  - [x] Create `src/lib/db/test-membership-application-workflow.ts` covering submission, duplicate prevention, status check, withdrawal, review transitions, and audit logs
  - [x] Execute test runner until 100% pass
  - [x] Run `pnpm exec next build` to guarantee 0 TypeScript/ESLint errors
  - [x] Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
