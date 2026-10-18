# SPECIFICATION: 012 - Membership Application & Admissions Workflow

## 1. Overview & Objective
Implement a complete, secure, and privacy-preserving Membership Admissions Workflow for the Arabic Language & Cultural Club:
1. **Membership Information Portal (`/membership`):** Institutional briefing outlining member privileges, constitutional responsibilities, eligibility rules, and transparent privacy disclosures.
2. **Validated Application Dossier Form:** Collects only officially approved fields:
   - Full Name (English + Arabic)
   - Institutional Contact Email
   - Telephone Number
   - Student Identification Number
   - Academic Department & Faculty
   - Academic Year / Level (Freshman, Sophomore, Junior, Senior, Postgraduate)
   - Self-Assessed Arabic Language Proficiency (Beginner, Intermediate, Advanced, Native)
   - Motivation Statement / Statement of Intent
   - Mandatory Constitution & Ethics Consent
   - Optional Public Directory Visibility Consent
3. **Submission Confirmation Voucher:** Immediate truthful confirmation voucher rendered upon successful persistence, presenting applicant coordinates and a unique, tamper-resistant reference code (e.g. `APP-2026-XXXX`).
4. **Secure Status Tracker:** Allows applicants to check review progress (`pending`, `under_review`, `approved`, `rejected`, `withdrawn`) using dual verification (Reference ID + Email) to prevent enumeration or information leaks.
5. **Administrative Review Pipeline (`/admin/applications`):** Authorized admissions officers can inspect dossiers, filter by status, append internal committee review notes, and transition statuses with immutable audit log recording.
6. **Strix-Supabase Security & Abuse Prevention:** Sliding-window IP rate limiting, duplicate submission prevention, zero PII logging in server stdout, and prevention of automatic privilege escalation.

---

## 2. User Stories

### Story 1: Prospective Student Applicant
- **As a** university student passionate about classical Arabic and culture,
- **I want to** review admissions criteria and submit an official membership application online,
- **So that** I can join the club and participate in debate tournaments, calligraphy workshops, and linguistic salons.

### Story 2: Application Confirmation & Tracking
- **As an** applicant who has completed the form,
- **I want to** receive a verifiable Reference ID and later check my application status securely using my Reference ID and email,
- **So that** I know when the executive committee has reviewed and decided upon my admission.

### Story 3: Application Self-Withdrawal
- **As an** applicant whose academic schedule or circumstances change,
- **I want to** securely withdraw my pending application before review,
- **So that** the admissions committee does not waste time evaluating my dossier.

### Story 4: Admissions Reviewer (Executive Committee)
- **As an** authorized Admissions Reviewer or General Secretary,
- **I want to** inspect submitted dossiers in the administrative dashboard, review academic details and motivation, append notes, and approve or reject applications,
- **So that** admissions standards are maintained and all actions are recorded in the institutional audit ledger.

---

## 3. Acceptance Criteria

### Public Application Experience (`/membership`)
- **AC-APP-01:** `/membership` displays institutional eligibility guidelines, membership categories, review timeline, and clear privacy/consent notices.
- **AC-APP-02:** Application form validates all required fields on the server with Zod schema (name, email, phone, studentId, department, faculty, level, proficiency, motivation, consent).
- **AC-APP-03:** Disallows duplicate submissions: if an applicant with the same email or studentId already has a `pending` or `under_review` application, returns a descriptive error without leaking other applicants' details.
- **AC-APP-04:** Rate-limits submission attempts to a maximum of 5 submissions per 15-minute window per IP.
- **AC-APP-05:** Upon successful database persistence, generates a unique, non-enumerable Reference ID (e.g., `APP-2026-F91B02`).
- **AC-APP-06:** Renders a truthful confirmation state displaying the assigned Reference ID, applicant name, masked email, and next steps.
- **AC-APP-07:** Status tracker verifies both Reference ID AND Email before returning status (`pending`, `under_review`, `approved`, `rejected`, `withdrawn`). Unmatched lookups return null cleanly.
- **AC-APP-08:** Applicants with `pending` status may elect to withdraw their application.

### Administrative Review Queue (`/admin/applications`)
- **AC-APP-09:** Protected behind server-side authentication (`assertPermission("admissions:review")`); unauthorized users receive 403 Forbidden.
- **AC-APP-10:** Displays application queue filterable by status (`pending`, `under_review`, `approved`, `rejected`, `withdrawn`) and search query.
- **AC-APP-11:** Reviewer can inspect complete dossier (motivation, student ID, Arabic level), append internal reviewer notes, and submit decision.
- **AC-APP-12:** Every status change generates an immutable record in `audit_logs` capturing reviewer ID, application ID, previous status, and new status.
- **AC-APP-13:** Approving an application does NOT automatically grant administrative credentials or bypass manual onboarding rules.

---

## 4. Visual Identity & Human Vibe
- **No AI Emojis:** Use clean Lucide SVG icons (`UserPlus`, `CheckCircle2`, `Clock`, `ShieldCheck`, `FileText`, `BookOpen`, `Search`, `XCircle`).
- **Academic Palette:** Forest Green (`#173D32`), Gold Accent (`#B18A4A`), Dark Charcoal (`#17211D`), and Light Cream (`#F5F0E5`).
- **Developer Onboarding:** Comprehensive JSDoc headers on all modified and newly created files.
