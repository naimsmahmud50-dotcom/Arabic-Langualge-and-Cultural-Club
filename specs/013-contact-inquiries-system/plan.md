# IMPLEMENTATION PLAN: 013 - Contact & Inquiries System

## Architectural Blueprint

```
User Request (Browser)
       │
       ▼
   /contact (Public Page)
       ├── Reads verified coordinates from `getContactSettings()` (siteSettings table)
       └── Embeds `ContactInquiryForm.tsx` (Client component)
               │ (Submits via Server Action)
               ▼
   `submitContactInquiryAction()` (src/lib/actions/contact-inquiry.ts)
       ├── 1. Rate Limiting Check (3 per 15 min per IP)
       ├── 2. Anti-Spam Honeypot Check (reject if hidden bot field populated)
       ├── 3. Zod Input Validation
       ├── 4. Check SMTP Credentials (process.env.SMTP_*)
       │        ├── Configured → Attempt Dispatch via nodemailer/fetch → mark `delivered_smtp`
       │        └── Unconfigured → Honest Fallback → mark `stored_locally`
       ├── 5. Persist to DB `contact_inquiries` table
       └── 6. Return Reference Voucher (`INQ-2026-XXXX`) with honest delivery state
```

## Proposed File Changes & Additions

1. **Schema & Migration**:
   - `src/lib/db/schema.ts`:
     - Add `contactInquiries` table:
       - `id`, `referenceNo`, `fullName`, `email`, `department`, `subject`, `message`, `status`, `deliveryStatus`, `ipAddress`, `adminNotes`, `repliedAt`, `createdAt`, `updatedAt`.
   - Migration file:
     - `src/lib/db/migrations/0006_contact_inquiries_table.sql`.
   - Seed addition:
     - Ensure `site_settings` contains verified institutional details: `contact_email`, `headquarters_address`, `office_hours`, `social_facebook`, `social_youtube`, `social_twitter`, `emergency_notice`.

2. **Database Queries (`src/lib/db/queries.ts`)**:
   - `getContactSettings()`: Queries verified contact details from `site_settings` (never returns invented data).
   - `submitContactInquiry()`: Persists inquiry, generates unique `INQ-2026-XXXX`, records delivery state.
   - `getAdminInquiries()`: Retrieves inquiries for administrative inbox with status/department filters.
   - `updateInquiryStatus()`: Updates status to `read`, `replied`, or `archived`, with optional admin notes.

3. **Server Actions (`src/lib/actions/contact-inquiry.ts`)**:
   - Zod schema for input validation (`ContactInquirySchema`).
   - Anti-spam honeypot verification.
   - Sliding-window IP rate limiter.
   - SMTP configuration check with honest delivery message.
   - `submitContactInquiryAction()` and `updateInquiryStatusAction()`.

4. **Client Form & Public Page**:
   - `src/app/(public)/contact/ContactInquiryForm.tsx`:
     - Clean, accessible client form with live error states, honeypot field, pending indicator, and confirmation voucher showing Reference ID and honest delivery status.
   - `src/app/(public)/contact/page.tsx`:
     - Server Component loading verified contact coordinates from `getContactSettings()`.
     - Displays Headquarters Address, Verified Email, Verified Office Hours, and Verified Social Links only if configured.
     - Embeds `ContactInquiryForm`.

5. **Administrative Inquiry Queue**:
   - `src/app/admin/inquiries/page.tsx` & `src/app/admin/inquiries/AdminInquiriesClient.tsx`:
     - Inbox filterable by status (`unread`, `read`, `replied`, `archived`) and department.
     - View inquiry detail modal, reply tracking, and admin notes.

6. **Automated Verification Test Suite**:
   - `src/lib/db/test-contact-inquiries.ts`:
     - Test contact settings retrieval (and absence of unverified data).
     - Test inquiry submission and reference ID generation.
     - Test spam honeypot blocking.
     - Test rate limiting.
     - Test honest delivery status fallback.
     - Test administrative queue filtering and status updates.
     - Test privacy isolation (no public exposure of messages).
