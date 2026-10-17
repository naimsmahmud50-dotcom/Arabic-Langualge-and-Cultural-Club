# MASTER REQUIREMENTS CHECKLIST

This checklist tracks every functional, design, security, architectural, and quality requirement across the entire lifecycle of the Arabic Language & Cultural Club platform.

Status definitions:
- **[ ] Not Started**: Requirement defined, pending execution.
- **[-] In Progress**: Actively being implemented or tested.
- **[x] Completed**: Fully built and verified against acceptance test.
- **[!] Blocked**: Dependent on external input or credential.

---

### Section A: Design System & Visual Identity
| ID | Requirement Description | Priority | Responsible Phase | Acceptance Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-DS-01** | Heritage color tokens: `#173D32`, `#F5F0E5`, `#B18A4A`, `#17211D`, supporting sage and warm gray. | CRITICAL | Phase 1 | CSS variables/Tailwind tokens defined, checked with contrast ratio >= 4.5:1. | [x] Completed |
| **REQ-DS-02** | Refined bilingual typography: Manrope (EN heading), Inter (EN body), Noto Naskh Arabic (AR heading/body). | CRITICAL | Phase 1 | Fonts render cleanly without layout shift; Arabic diacritics and ligatures verified. | [x] Completed |
| **REQ-DS-03** | Light & Dark theme toggle with persistent user choice and zero white flash on reload. | HIGH | Phase 1 | Switching themes updates all components, cards, tables, and borders without visual artifacts. | [x] Completed |
| **REQ-DS-04** | Restrained motion primitives & `prefers-reduced-motion` compliance. | HIGH | Phase 1 | Animations gracefully disable when reduced-motion preference is active. | [x] Completed |
| **REQ-DS-05** | Subtle Arabic geometric pattern backgrounds and editorial borders. | MEDIUM | Phase 1 | Background SVGs/patterns are subtle, non-distracting, and accessible in both themes. | [x] Completed |
| **REQ-DS-06** | Reusable UI Component Library: Buttons, Badges, Modals, Cards, Tables, Forms, Breadcrumbs, Empty States. | CRITICAL | Phase 1 | All shared components tested across mobile (375px), tablet (768px), and desktop (1440px). | [x] Completed |

---

### Section B: Public Website Pages & User Journeys
| ID | Requirement Description | Priority | Responsible Phase | Acceptance Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-PUB-01** | Homepage with 14-part institutional sequence (Hero, Intro, Founders, Leadership, Events, Plan, Programs, Resources, Accolades, News, Gallery, Membership CTA, Contact, Footer). | CRITICAL | Phase 5 | Page dynamically loads real CMS models, all buttons route cleanly, zero fake stats, responsive bilingual layout. | [x] Completed |
| **REQ-PUB-02** | About the Club page with mission, vision, core values, objectives, and club constitution. | HIGH | Phase 5 | Editorial layout renders structured content from database; responsive and readable. | [ ] Not Started |
| **REQ-PUB-03** | Founders & Founding History page with verified founders, origin story, and founding documents. | HIGH | Phase 5 | Founder profiles display portrait, bio, contribution; unverified facts marked clearly. | [ ] Not Started |
| **REQ-PUB-04** | Institutional History & Milestone Timeline page. | HIGH | Phase 5 | Chronological timeline renders milestone dates, descriptions, and media. | [ ] Not Started |
| **REQ-PUB-05** | Former Committees Archive (term-by-term historical selector). | CRITICAL | Phase 5 | Selecting academic year (e.g. 2023-24) displays verified officeholders without overwriting history. | [ ] Not Started |
| **REQ-PUB-06** | Current Executive Committee & Advisory Board page. | HIGH | Phase 5 | Displays active committee members, designated roles, biographies, and contact links. | [ ] Not Started |
| **REQ-PUB-07** | Member Directory with privacy protection filters. | MEDIUM | Phase 5 | Only displays approved public member profiles; hides phone numbers, student IDs, and private emails. | [ ] Not Started |
| **REQ-PUB-08** | Annual Calendar & 12-Month Plan (Month-by-month list and calendar views). | CRITICAL | Phase 6 | Displays planned, confirmed, completed, and postponed activities with status indicators. | [ ] Not Started |
| **REQ-PUB-09** | Event Details & Interactive Registration. | CRITICAL | Phase 6 | Displays event logistics; validated registration form enforces capacity and prevents duplicate entries. | [ ] Not Started |
| **REQ-PUB-10** | Photo & Media Gallery with Albums, Categories, and Fullscreen Lightbox. | CRITICAL | Phase 6 | Responsive grid renders event albums; clicking open lightbox with keyboard navigation (Esc, Arrow keys). | [ ] Not Started |
| **REQ-PUB-11** | Arabic Learning & Educational Resources Hub. | HIGH | Phase 6 | Categorized by Nahw/Sarf/Vocabulary; downloadable PDFs and readable guides with proper Arabic shaping. | [ ] Not Started |
| **REQ-PUB-12** | Achievements & Official Publications page. | HIGH | Phase 6 | Showcases competition awards, achievements, newsletters, and annual magazine downloads. | [ ] Not Started |
| **REQ-PUB-13** | Membership Information & Multi-Step Online Application Form. | CRITICAL | Phase 7 | Form validates all inputs on server, persists application, generates unique Reference ID. | [ ] Not Started |
| **REQ-PUB-14** | News & Official Announcements Hub. | HIGH | Phase 6 | Filterable announcements by category; pagination and detail pages with SEO metadata. | [ ] Not Started |
| **REQ-PUB-15** | Partners & Contact Page with validated inquiry form. | HIGH | Phase 7 | Contact form validates server-side with rate limiting; verified contact info rendered. | [ ] Not Started |
| **REQ-PUB-16** | Policies, Privacy, Photo Consent, and Accessibility Statement. | HIGH | Phase 7 | Clear data handling terms, consent policy, takedown contact route, and WCAG AA statement. | [ ] Not Started |

---

### Section C: Administrative Dashboard & CMS
| ID | Requirement Description | Priority | Responsible Phase | Acceptance Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-ADM-01** | Secure Admin Shell: responsive sidebar, topbar, user profile, role badge, breadcrumbs, theme switcher. | CRITICAL | Phase 8 | Protected behind server-side authentication; unauthorized visitors redirected to `/admin/login`. | [ ] Not Started |
| **REQ-ADM-02** | Dashboard Metrics & Activity Feed: real counts from database (events, applications, members, albums). | HIGH | Phase 8 | Zero fake stats; shows accurate database count; displays recent audit log events. | [ ] Not Started |
| **REQ-ADM-03** | Founders & History CMS: CRUD for founder records, milestones, and archival notes. | HIGH | Phase 8 | Form persists records to DB; updates appear on public `/founders` and `/history` pages. | [ ] Not Started |
| **REQ-ADM-04** | Committee Terms & Officeholder Management (Preservation Rule). | CRITICAL | Phase 8 | Adding a new term (e.g. 2025-26) preserves previous terms (2024-25) intact without data loss. | [ ] Not Started |
| **REQ-ADM-05** | Member Management & Status Review: search, filter, status toggles (Active, Alumni, Suspended). | HIGH | Phase 8 | Edit member roles, assign committee terms, search by name or membership ID. | [ ] Not Started |
| **REQ-ADM-06** | Membership Applications Review Workflow (Pending, Approved, Rejected, Notes). | CRITICAL | Phase 8 | Reviewer can inspect application, approve/reject, add internal notes; updates status accurately. | [ ] Not Started |
| **REQ-ADM-07** | Annual Plan & Event Management CMS. | CRITICAL | Phase 8 | Create/edit events, set capacity, manage registration lists, mark completed/postponed. | [ ] Not Started |
| **REQ-ADM-08** | Photo Gallery & Media Asset CMS: bulk photo uploads, captions, credits, cover image selector. | CRITICAL | Phase 8 | Uploads validate size/mime-type; albums and photos persist with proper storage URLs. | [ ] Not Started |
| **REQ-ADM-09** | News & Announcements CMS: rich text editor, draft/published status, scheduled expiry. | HIGH | Phase 8 | Draft posts remain hidden from public; published posts appear immediately. | [ ] Not Started |
| **REQ-ADM-10** | Arabic Learning Resources & Publications CMS. | HIGH | Phase 8 | Upload resource files, assign categories, publish verified learning materials. | [ ] Not Started |
| **REQ-ADM-11** | User Accounts & Granular Role Permissions (RBAC). | CRITICAL | Phase 4 | Super Admin can assign roles; restricted roles (e.g. Media Manager, Content Editor) cannot access User Management. | [x] Completed |
| **REQ-ADM-12** | Immutable Audit Logs for sensitive operations. | HIGH | Phase 4 | Records actor, action type, target entity ID, and timestamp on login/failed login/reset/provisioning. | [x] Completed |
| **REQ-ADM-13** | Site Settings & Global SEO Configuration. | HIGH | Phase 9 | Update club title, contact email, social media links, and meta tags directly from dashboard. | [ ] Not Started |
| **REQ-ADM-14** | Database Backup & Disaster Recovery documentation/tools. | MEDIUM | Phase 9 | Backup script or export utility documented and tested for reproducible recovery. | [ ] Not Started |

---

### Section D: Architecture, Database & Security
| ID | Requirement Description | Priority | Responsible Phase | Acceptance Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-DAT-01** | Normalized relational schema with 18+ core entities, foreign keys, timestamps, and indexes. | CRITICAL | Phase 2 | Schema migration executes cleanly without circular dependencies; schema types verified. | [x] Completed |
| **REQ-DAT-02** | Reproducible migration and seeding pipeline (with fictional demo fixtures clearly tagged). | HIGH | Phase 2 | Running migration and seed scripts populates local development database reliably. | [x] Completed |
| **REQ-SEC-01** | Secure Authentication: session management, password hashing, protected cookie flags. | CRITICAL | Phase 4 | Scrypt hashing, HMAC session tokens, httpOnly/lax/secure cookies, 100% test pass. | [x] Completed |
| **REQ-SEC-02** | Server-Side Authorization: every API route and Server Action checks role permissions. | CRITICAL | Phase 4 | Edge middleware + assertPermission() checks. Direct URL requests return 403 Forbidden. | [x] Completed |
| **REQ-SEC-03** | Input Sanitization, SQL Injection prevention, XSS protection, CSRF mitigation. | CRITICAL | Phase 4 | Strict Zod validation, parameterized Drizzle queries, signed cookies. | [x] Completed |
| **REQ-SEC-04** | Rate Limiting on authentication & submission forms. | HIGH | Phase 4 | Sliding window rate limiter locks brute-force attempts after 5 failures. | [x] Completed |
| **REQ-SEC-05** | Media Upload Security: file type validation (JPEG/PNG/WebP/PDF), max size caps, safe storage keys. | HIGH | Phase 9 | Uploading executable or script files is rejected with safe validation error. | [ ] Not Started |

---

### Section E: Internationalization & Localization (English & Arabic)
| ID | Requirement Description | Priority | Responsible Phase | Acceptance Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-LANG-01** | Language Switcher with instantaneous state persistence. | CRITICAL | Phase 10 | Toggling between English and Arabic updates UI strings without breaking current path. | [ ] Not Started |
| **REQ-LANG-02** | Right-to-Left (RTL) Layout engine: `dir="rtl"` applied dynamically to `<html>`. | CRITICAL | Phase 10 | Page layout, grids, padding, and alignments mirror correctly in Arabic without overflowing. | [ ] Not Started |
| **REQ-LANG-03** | Arabic Typography rendering: correct diacritic placement, baseline consistency, no font clipping. | HIGH | Phase 10 | Headings and Quranic/literary quotes render with proper Arabic ligatures and font weights. | [ ] Not Started |
| **REQ-LANG-04** | Bilingual content models in database for key CMS items (title_en, title_ar, bio_en, bio_ar). | HIGH | Phase 10 | CMS supports entering both English and Arabic content for events, leadership, and announcements. | [ ] Not Started |

---

### Section F: Quality Assurance, Accessibility & Handover
| ID | Requirement Description | Priority | Responsible Phase | Acceptance Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-QA-01** | WCAG 2.2 AA Accessibility compliance (keyboard navigation, focus rings, contrast, aria-labels). | CRITICAL | Phase 10 | Lighthouse accessibility audit >= 95; interactive elements navigable via Tab/Enter/Space. | [ ] Not Started |
| **REQ-QA-02** | Responsive viewport testing across mobile (375px), tablet (768px), desktop (1280px+). | CRITICAL | Phase 11 | No horizontal scrollbars; mobile navigation drawer opens and closes reliably. | [ ] Not Started |
| **REQ-QA-03** | SEO metadata, OpenGraph cards, dynamic sitemap.xml, robots.txt. | HIGH | Phase 10 | Every route generates accurate `<title>`, `<meta description>`, OpenGraph images, and canonical URL. | [ ] Not Started |
| **REQ-QA-04** | Automated test suite: Unit tests for data logic, integration tests for server actions. | HIGH | Phase 11 | Test suite executes via automated test runner with 100% passing tests. | [ ] Not Started |
| **REQ-QA-05** | Production build succeeds without TypeScript or ESLint errors. | CRITICAL | Phase 11 | `next build` exits with code 0. | [ ] Not Started |
| **REQ-QA-06** | Complete Deployment & Handover Documentation. | HIGH | Phase 12 | Step-by-step documentation for environment setup, deployment, admin guide, and backups. | [ ] Not Started |
