# MASTER PROJECT SPECIFICATION
## Arabic Language & Cultural Club — Premium Institutional Platform

### 1. Executive Summary & Vision
The Arabic Language & Cultural Club web platform is not a standard student project, generic template, or startup landing page. It is conceived and engineered as an enduring **digital institution, cultural archive, and operational center**. 

The platform fulfills three core missions:
1. **Public Cultural & Academic Voice:** Inspiring, scholarly, and dignified representation of Arabic language, literature, calligraphy, and cultural heritage.
2. **Institutional Memory & Living Archive:** Indestructible preservation of the club's history—from its original founders through every former executive committee term to current leadership.
3. **Operational Hub (Dynamic CMS):** A comprehensive, secure administrative portal empowering club leaders to manage annual planning, events, memberships, educational materials, media albums, and notices without modifying code.

---

### 2. Core Pillars of the Master Specification

#### A. Premium Institutional Design
- **Color Architecture:**
  - `Primary Brand / Heritage Forest`: `#173D32`
  - `Light Surface / Warm Ivory`: `#F5F0E5`
  - `Luxury Accent / Antique Brass`: `#B18A4A`
  - `Dark Surface / Midnight Evergreen`: `#17211D`
  - `Supporting Surface / Soft White`: `#FFFFFF`
  - `Muted Supporting / Sage`: `#829487`
  - `Dark Text / Deep Forest Charcoal`: `#202720`
  - `Light Mode Borders`: `#DDD8CC` | `Dark Mode Borders`: `#344139`
- **Typography:**
  - English Headings: Manrope (or refined editorial serif/sans)
  - English Body: Inter
  - Arabic Display & Body: Noto Naskh Arabic / Amiri with complete glyph shaping and proper line-height
- **Aesthetic Principles:**
  - Absolute avoidance of generic AI aesthetics (no neon gradients, no random floating particles, no heavy glassmorphism, no rainbow glows).
  - Subtle geometric motifs inspired by Islamic & Arabic patterns.
  - Generous whitespace, refined borders, restrained shadows, authentic editorial composition.
  - Complete, contrast-tested Light and Dark themes.
  - Purposeful motion respecting `prefers-reduced-motion`.

#### B. Public Website Structure (14 Comprehensive Routes)
1. **Home (`/`):** Flagship narrative featuring the Institutional Hero, Introduction, Founders/History spotlight, Current Leadership spotlight, Upcoming Events, Year-at-a-Glance timeline, Recent Gallery Moments, Arabic Resources preview, and Membership CTA.
2. **About the Club (`/about`):** Mission, vision, core values, objectives, constitution, and institutional identity.
3. **Founders & Founding History (`/founders`):** Founding story, verified founder profiles, historical origin, founding documents.
4. **Institutional History & Timeline (`/history`):** Chronological milestone archive, achievements, and historical records.
5. **Leadership & Committees Archive (`/leadership`):**
   - Current Executive Committee & Advisory Board.
   - Former Committees Archive filtered by academic term/year (Founding, 2023-24, 2024-25, etc.).
6. **Member Directory (`/members`):** Privacy-controlled directory of verified members, achievements, and roles.
7. **Events & Annual Calendar (`/events`):** Full 12-month master plan, calendar and list views, upcoming/past events, registration status, reports.
8. **Event Details & Registration (`/events/[slug]`):** Date, venue, categories, speakers, agenda, capacity-controlled registration form.
9. **Photo & Media Gallery (`/gallery`):** Albums categorized by year, activity, and event; responsive grid with fullscreen lightbox.
10. **Arabic Learning & Resources (`/resources`):** Grammar (Nahw/Sarf), vocabulary, literature, reading lists, downloadable guides.
11. **Achievements & Publications (`/publications`):** Awards, competition standings, annual magazines, newsletters, official research.
12. **Membership Application & Status (`/membership`):** Eligibility criteria, code of conduct, multi-step application form, reference ID tracker.
13. **News & Official Announcements (`/news`):** Official notices, press statements, event calls, categorized archive.
14. **Partners & Contact (`/contact`):** Verified official contact channels, location, institutional partnerships, feedback form.
15. **Policies & Legal (`/policies`):** Privacy policy, data retention, photo consent, takedown requests, accessibility statement (WCAG 2.2 AA).

#### C. Complete Administrative Dashboard (CMS)
The admin panel is a private, role-governed operational environment providing full CRUD:
- **Dashboard Overview:** Real-time metrics (published events, pending applications, active members, recent audit logs; strictly zero fake counters).
- **Page & Content CMS:** Manage dynamic page text, announcements, and banners.
- **Founders & History Management:** Manage founding narratives and milestone records.
- **Committee Terms & Position Assignment:** Create academic years/terms and assign officeholders; preserve former terms permanently upon leadership transition.
- **Member Records & Verification:** View, search, edit, approve, suspend, and archive member profiles.
- **Membership Application Review:** Multi-state review workflow (Pending, Under Review, Approved, Rejected) with reviewer notes.
- **Annual Plans & Events Management:** Manage 12-month calendars, schedules, event logistics, and attendance records.
- **Media Asset & Album Management:** Upload high-resolution event photos, assign captions/credits, set cover photos, manage album visibility.
- **Arabic Learning Resources CMS:** Manage educational files, articles, and downloadable assets.
- **Publications & Achievements CMS:** Record official accolades, awards, and upload digital publications.
- **User & Role Permissions:** Manage admin accounts and granular permissions.
- **Audit Logs:** Immutable audit log tracking sensitive actions (deletions, role changes, publications).
- **Site Settings & SEO:** Manage site metadata, branding assets, social links, contact info, and theme defaults.
- **Backup & Disaster Recovery:** Documented database backup/restore procedures.

#### D. Data & Engineering Discipline
- **Relational Data Integrity:** Normalized PostgreSQL / SQLite relational schema with foreign key constraints, explicit status enums, indexes, and automated migrations.
- **Historical Data Rule:** New leadership elections create a *new* committee term and assignments. Past committees are permanently preserved as historical archive records.
- **Server-Side Authorization:** Every mutation and privileged read must enforce server-side role checks. Never rely on client-side UI hiding.
- **Data Privacy:** Member contact details (phone, email, student identifier) and application motivations are strictly internal and inaccessible via public queries.
- **Safe Media Storage:** Media files are stored in object storage (or dedicated file storage); database records store only metadata, URLs, and dimensions.

#### E. Bilingual & Localization Architecture
- **First-Class Languages:** English and Arabic.
- **Right-to-Left (RTL) Layout:** Full RTL mirroring for Arabic layouts without breaking universal iconography or media players.
- **Proper Font Rendering:** Arabic typography with complete diacritics, ligature support, and calibrated baseline heights.
- **Extensibility:** Foundation structured to allow Bangla or additional languages without schema rewrites.

#### F. Quality & Verification Standards
- **Zero Fabrication Rule:** Never invent fake people, dates, historical claims, or false statistics. Use clearly identified placeholders (`[Pending Verification]`) until confirmed data is supplied.
- **Acceptance Criteria:** Every feature must be verified through real execution and browser/automated tests before being declared complete.
