# CONTENT INVENTORY & ASSET REGISTRY
## Arabic Language & Cultural Club Platform

### 1. Institutional Integrity & Zero-Fabrication Rule
Per the Master Directive, we **never invent** real individuals, historical dates, statistics, official contact addresses, or academic affiliations. Unverified items remain clearly tagged or use neutral, clearly identified development fixtures that can be edited directly through the Admin CMS without code changes.

---

### 2. Comprehensive Route & Content Inventory

#### 2.1 Public Website Routes (16 Routes)

| Route Path | View / Module | Dynamic Content Source | Implementation Status |
| :--- | :--- | :--- | :--- |
| `/` | Institutional Homepage | `editable_pages`, `announcements`, `events`, `gallery_albums` | Completed & Tested |
| `/about` | Mission, Vision, Values, Constitution | `editable_pages`, `page_sections` | Completed & Tested |
| `/history` | Institutional Timeline & Milestones | `editable_pages`, `page_sections` | Completed & Tested |
| `/founders` | Founding Conveners & Origin Story | `founders` | Completed & Tested |
| `/leadership` | Term-by-Term Committees Archive | `committee_terms`, `committee_assignments`, `members` | Completed & Tested |
| `/members` | Verified Public Member Directory | `members` (filtered: `is_public = true`, PII masked) | Completed & Tested |
| `/events` | Annual Calendar & Master Schedule | `events`, `annual_plans` | Completed & Tested |
| `/events/[slug]` | Event Dossier & Registration Card | `events`, `event_registrations` | Completed & Tested |
| `/gallery` | Archival Photo & Video Catalog | `gallery_albums` | Completed & Tested |
| `/gallery/[slug]` | Album Dossier & Accessible Lightbox | `gallery_albums`, `media_assets` | Completed & Tested |
| `/resources` | Arabic Learning Hub (Nahw/Sarf) | `learning_resources` | Completed & Tested |
| `/publications` | Periodicals & Roll of Honor | `publications`, `achievements` | Completed & Tested |
| `/membership` | Admissions Portal & Status Tracker | `membership_applications` | Completed & Tested |
| `/news` | Announcements & Official Notices | `announcements` | Completed & Tested |
| `/news/[slug]` | News Article Dossier | `announcements` | Completed & Tested |
| `/contact` | Correspondence & Inquiry Portal | `site_settings`, `contact_inquiries` | Completed & Tested |
| `/policies` | Governance Charters & Accessibility | Static Markdown & Regulatory Copy | Completed & Tested |
| `/*` (404) | Custom Bilingual Not-Found Handler | Error boundary component | Completed & Tested |

#### 2.2 Administrative CMS Consoles (15 Modules)

| Console Path | Administrative Function | Target Tables | Primary Roles |
| :--- | :--- | :--- | :--- |
| `/admin` | Master Command Center & Metrics | Aggregated counts & `audit_logs` | All authenticated roles |
| `/admin/login` | Secure Scrypt Login & Rate Limiter | `users`, `sessions` | Public / Operators |
| `/admin/forgot-password` | Password Recovery Request | `password_resets` | Public / Operators |
| `/admin/reset-password` | Password Reset Token Execution | `password_resets`, `users` | Public / Operators |
| `/admin/pages` | Website Pages & JSON Content CMS | `editable_pages`, `page_sections` | Super Admin, Admin, Editor |
| `/admin/founders` | Founder Records & Biographies | `founders` | Super Admin, Admin, Editor |
| `/admin/committees` | Committee Terms & Officeholders | `committee_terms`, `committee_assignments` | Super Admin, Admin, Membership |
| `/admin/members` | Member Records & Privacy Console | `members` | Super Admin, Admin, Membership |
| `/admin/events` | Events Management & Annual Plans | `events`, `annual_plans` | Super Admin, Admin, Events |
| `/admin/gallery` | Photo Albums & Media Assets | `gallery_albums`, `media_assets` | Super Admin, Admin, Editor, Events |
| `/admin/news` | Announcements & Notices CMS | `announcements` | Super Admin, Admin, Editor, Events |
| `/admin/resources` | Arabic Learning Resources CMS | `learning_resources` | Super Admin, Admin, Editor |
| `/admin/publications` | Publications & Roll of Honor | `publications`, `achievements` | Super Admin, Admin, Editor |
| `/admin/applications` | Admissions Application Queue | `membership_applications`, `audit_logs` | Super Admin, Admin, Membership |
| `/admin/inquiries` | Correspondence Inbox | `contact_inquiries`, `audit_logs` | Super Admin, Admin, Membership |
| `/admin/users` | Admin Accounts & Role Permissions | `users`, `audit_logs` | Super Admin |
| `/admin/settings` | Site Settings, SEO & DB Backups | `site_settings`, database snapshot | Super Admin |
| `/admin/audit-logs` | Immutable Audit Trail & JSON Export | `audit_logs` | Super Admin, Admin |
| `/admin/profile` | Operator Profile & Password Change | `users`, `audit_logs` | All authenticated roles |

---

### 3. Required Owner Content Prior to Production Launch

To transition from the demonstration fixture state to official institutional production, the club leadership must furnish or update the following assets via the Admin CMS:

1. **Official Vector Logo:** Vector SVG emblem to replace the current calligraphic typography badge.
2. **Verified Founders Roster:** Real names, Arabic transliterations, high-resolution portraits, and biographical notes for the original founding conveners (editable via `/admin/founders`).
3. **Current Executive Committee:** Real names, roles, academic emails, and photos for the active session officers (editable via `/admin/committees`).
4. **Official Contact Coordinates:** Permanent campus room/office number, official institutional email, and telephone numbers (editable via `/admin/settings`).
5. **Verified Social Media Handles:** Real URLs for Facebook, YouTube, LinkedIn, X, and Telegram channels (editable via `/admin/settings`).
6. **Confirmed Academic Calendar:** Real dates and descriptions for workshops, seminars, and oratory competitions (editable via `/admin/events`).
7. **Production SMTP Credentials:** API key or SMTP host/port/credentials for transactional email notifications (configured via `.env.production`).
