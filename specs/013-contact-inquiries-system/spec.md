# SPECIFICATION: 013 - Contact & Inquiries System

## Overview
Implement the official contact and institutional inquiries portal for the Arabic Language & Cultural Club.
The system provides verified institutional contact coordinates from approved site settings, an accessible submission form for public inquiries with spam protection and rate limiting, honest email delivery state handling (database persistence with honest fallback when SMTP relay is not configured), and private administrative review.

## User Stories & Acceptance Criteria

### User Story 1 (P1): Verified Institutional Contact Information & Social Presence
**Goal**: Prospective partners, students, and academic guests can review verified institutional correspondence coordinates without encountering invented or fabricated details.
- **Criteria 1.1**: Contact details (email, address, office hours, official social channels) are read dynamically from database `site_settings`.
- **Criteria 1.2**: Never invent unverified phone numbers, office hours, or social links. If an official coordinate is absent, render an honest note directing visitors to official email.
- **Criteria 1.3**: Social links (e.g. YouTube, Facebook, Twitter, LinkedIn) only render if an approved institutional URL is present in the database settings.

### User Story 2 (P1): Validated Inquiry Form with Spam & Rate Limiting Guardrails
**Goal**: Legitimate visitors can dispatch messages to the General Secretariat while blocking spam bots and preventing abusive request flooding.
- **Criteria 2.1**: Server-side validation using Zod for full name, valid email, department categorization, subject line, and detailed message.
- **Criteria 2.2**: Invisible honeypot field (`website_url`) silently catches and drops automated spam submissions.
- **Criteria 2.3**: Sliding-window rate limiter restricts submissions to 3 attempts per 15 minutes per IP address.
- **Criteria 2.4**: Form includes WCAG AA accessible labels, clear inline validation errors, keyboard navigation, and disabled states during transit.

### User Story 3 (P1): Honest Delivery States & Private Storage
**Goal**: Transparency in message handling; messages are stored securely without false claims of email dispatch.
- **Criteria 3.1**: Submissions generate an institutional Reference ID (e.g. `INQ-2026-XXXX`).
- **Criteria 3.2**: Check server environment for configured SMTP credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- **Criteria 3.3**: If SMTP credentials are missing, securely persist the message to the database with `deliveryStatus: "stored_locally"`, and display an honest status message to the user that the inquiry was recorded in the Secretariat database and awaiting staff review.
- **Criteria 3.4**: If SMTP is configured, attempt relay. Only report message as delivered via email if provider confirms dispatch.
- **Criteria 3.5**: Never expose private inquiry content publicly or in client bundles.

### User Story 4 (P2): Administrative Inquiry Queue & Processing
**Goal**: Authorized administrators and secretaries can review, organize, and reply to incoming inquiries.
- **Criteria 4.1**: Access to `/admin/inquiries` guarded by authentication and RBAC (`settings:manage` or `dashboard:view`).
- **Criteria 4.2**: Allows filtering by status (`unread`, `read`, `replied`, `archived`) and departmental portfolio.
- **Criteria 4.3**: Reviewer can mark inquiry status and append administrative notes.

## Security & Compliance Rules (Strix-Supabase & Human Vibe)
- Strictly zero AI emojis; only authentic academic design, refined typography, and Lucide SVG icons.
- Complete JSDoc developer headers on all files.
- Rate limiting and honeypot protection enforced on server actions.
- 100% automated test verification before completion.
