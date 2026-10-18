# TASKS: 013 - Contact & Inquiries System

- [x] **Task 1: Schema Enhancement & Migration** <!-- id: 1 -->
  - [x] Add `contactInquiries` table to `src/lib/db/schema.ts`
  - [x] Generate migration `src/lib/db/migrations/0006_contact_inquiries_table.sql`
  - [x] Run migration runner `pnpm exec tsx src/lib/db/migrate.ts`
  - [x] Update seed data in `src/lib/db/seed.ts` with verified contact settings

- [x] **Task 2: Database Queries for Contact Settings & Inquiries** <!-- id: 2 -->
  - [x] Implement `getContactSettings()` in `src/lib/db/queries.ts` (retrieving approved settings, no invented data)
  - [x] Implement `submitContactInquiry()`, `getAdminInquiries()`, and `updateInquiryStatus()` in `src/lib/db/queries.ts`

- [x] **Task 3: Server Actions with Rate Limiting & Honest Delivery Fallback** <!-- id: 3 -->
  - [x] Create `src/lib/actions/contact-inquiry.ts` with Zod validation, honeypot detection, sliding-window rate limit
  - [x] Check SMTP environment configuration and record honest delivery status (`stored_locally` or `delivered_smtp`)
  - [x] Implement `submitContactInquiryAction()` and `updateInquiryStatusAction()` with RBAC

- [x] **Task 4: Interactive Client Inquiry Form Component** <!-- id: 4 -->
  - [x] Create `src/app/(public)/contact/ContactInquiryForm.tsx` with validation, accessible labels, honeypot field, and honest confirmation voucher

- [x] **Task 5: Upgrade Public Contact Page** <!-- id: 5 -->
  - [x] Refactor `src/app/(public)/contact/page.tsx` as a Server Component fetching verified contact coordinates
  - [x] Render verified headquarters address, email, office hours, and official social links (never invent missing channels)
  - [x] Embed `ContactInquiryForm`

- [x] **Task 6: Administrative Inquiries Inbox Console** <!-- id: 6 -->
  - [x] Create `src/app/admin/inquiries/page.tsx` and `src/app/admin/inquiries/AdminInquiriesClient.tsx`
  - [x] Support filtering by status (`unread`, `read`, `replied`, `archived`) and departmental portfolio

- [x] **Task 7: Automated Test Suite & Build Verification** <!-- id: 7 -->
  - [x] Create `src/lib/db/test-contact-inquiries.ts` covering settings retrieval, submission, honeypot trap, rate limiting, honest fallback, and admin status updates
  - [x] Run test runner until 100% pass
  - [x] Run full regression test suite (all previous suites)
  - [x] Run `pnpm exec next build` ensuring 0 TypeScript/ESLint errors
  - [x] Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
