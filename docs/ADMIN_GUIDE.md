# ADMINISTRATOR OPERATING MANUAL
## Arabic Language & Cultural Club Platform

This manual serves as the operational guide for club officers, editors, and system administrators managing the Arabic Language & Cultural Club web platform.

---

### 1. Administrative Access & Security

#### Login Portal
- **URL:** `/admin/login`
- **Session Duration:** 7 days (sliding HMAC-SHA256 authenticated cookie).
- **Brute-Force Protection:** IP rate limiting triggers temporary lockouts after 5 consecutive failed login attempts.

#### Role & Permission Matrix
The platform enforces granular Role-Based Access Control (RBAC) across 5 institutional roles:

| Module / Privilege | Super Admin | Administrator | Content Editor | Membership Manager | Event Manager |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Site Settings & SEO** | Full | View | No Access | No Access | No Access |
| **Admin User Management** | Full | View | No Access | No Access | No Access |
| **Audit Logs Inspection** | Full | View | No Access | No Access | No Access |
| **Database Backups** | Full | No Access | No Access | No Access | No Access |
| **Website Pages & Sections** | Full | Full | Full | No Access | No Access |
| **Founders & Milestones** | Full | Full | Full | No Access | No Access |
| **Committee Terms** | Full | Full | No Access | Full | No Access |
| **Member Records** | Full | Full | No Access | Full | No Access |
| **Admissions Applications** | Full | Full | No Access | Full | No Access |
| **Events & Annual Plans** | Full | Full | No Access | No Access | Full |
| **Attendee Rosters** | Full | Full | No Access | No Access | Full |
| **News & Announcements** | Full | Full | Full | No Access | Full |
| **Learning Resources** | Full | Full | Full | No Access | No Access |
| **Publications & Honors** | Full | Full | Full | No Access | No Access |
| **Gallery & Media Assets** | Full | Full | Full | No Access | Full |
| **Contact Inquiries** | Full | Full | No Access | Full | No Access |

---

### 2. Content Management Modules (CMS)

#### 2.1 Website Pages & Sections (`/admin/pages`)
Allows administrators to update core institutional pages without source code edits.
- **Select Page:** Choose between `/about` and `/history`.
- **Edit Page Metadata:** Update SEO title and description.
- **Manage Sections:** Edit JSON-structured content blocks (Mission, Vision, Values, Academic Pillars, Constitution, Milestones). Changes take effect immediately on public routes via Next.js on-demand cache revalidation.

#### 2.2 Founders & History (`/admin/founders`)
- **Add Founder:** Record founder name, Arabic name, role, biographical summary, and portrait.
- **Sort Order:** Set integer values to order founders chronologically.
- **Visibility:** Toggle between `published` and `draft`. Draft records are strictly isolated from the public `/founders` directory.

#### 2.3 Committee Terms & Historical Preservation (`/admin/committees`)
- **The Historical Preservation Rule:** When a new academic session begins, create the new term (e.g. `2026–2027`) and mark it `Active`. The platform automatically updates former terms to `Historical` status. Past records, officer titles, and member rosters are preserved permanently without data loss.
- **Assign Members:** Assign registered members to designated committee positions with specific term ranks.

#### 2.4 Member Directory & Privacy (`/admin/members`)
- **Search & Filter:** Search by name, email, or student ID.
- **Status Transitions:** Manage membership lifecycles (`active`, `alumni`, `honorary`, `suspended`).
- **Privacy Setting:** Toggle `Public Directory Visibility`. If disabled, or if the member did not grant public consent, their profile is filtered out of `/members`. Sensitive PII (email, phone, student ID) is never visible publicly.

---

### 3. Events & Annual Calendars

#### 3.1 Event Dossiers (`/admin/events`)
- **Create Event:** Specify English title, Arabic title, category (`academic`, `workshop`, `competition`, `seminar`, `cultural`, `social`), date, time, location, and seat capacity.
- **Status Management:** Transition events through `upcoming`, `ongoing`, `past`, `postponed`, or `cancelled`. When cancelled or postponed, provide a clear public reason banner.
- **Slug Generation:** Automatic URL-safe slug generated from the English title.

#### 3.2 Attendee Rosters & Attendance
- Click **"View Attendees"** on any event card to inspect real-time registration entries.
- Search participants by name, email, or registration reference (`REG-2026-XXXX`).
- One-click attendance check-in: mark participant as `attended` during event entry.

#### 3.3 Annual 12-Month Roadmaps
- Switch to the **"Annual Plans"** tab in `/admin/events`.
- Schedule club milestones across months 1 through 12 for the current academic session.
- Cross-link planned milestones to confirmed public event dossiers.

---

### 4. Communications, Media & Resources

#### 4.1 News & Announcements (`/admin/news`)
- **Authoring:** Create bilingual notices with rich paragraphs.
- **Priority Pinning:** Toggle `Pin Announcement` to feature urgent advisories at the top of `/news` and the homepage ticker.
- **Draft Mode:** Keep unverified or future announcements in `draft` mode until approved.

#### 4.2 Arabic Learning Resources (`/admin/resources`)
- Author study guides for Grammar (Nahw), Morphology (Sarf), and Rhetoric (Balaghah).
- Assign difficulty level: `Beginner`, `Intermediate`, `Advanced`.
- Attach downloadable PDFs. The system records atomic download counts whenever a learner retrieves the document.

#### 4.3 Publications & Honors (`/admin/publications`)
- **Periodicals:** Author records for club journals (e.g., Al-Bayan series) with volume numbers and download links.
- **Roll of Honor:** Record competitive debate awards, calligraphy accolades, and academic prizes.

#### 4.4 Gallery & Media Assets (`/admin/gallery`)
- Create institutional albums tagged by category (`debates`, `workshops`, `ceremonies`) and academic year.
- Upload photos (JPEG, PNG, WebP, AVIF up to 15MB) and videos (MP4, WebM up to 100MB).
- Select cover images, assign photographer credits, and write bilingual captions.

---

### 5. Inquiries & Admissions Pipelines

#### 5.1 Membership Applications (`/admin/applications`)
- Review submitted candidate profiles from `/membership`.
- Filter by status: `all`, `pending`, `under_review`, `approved`, `rejected`, `withdrawn`.
- Open candidate dossier modal to inspect academic level, Arabic proficiency, department, and motivation statement.
- Adjudicate status and append internal reviewer notes. The decision is recorded immutably in `audit_logs`.

#### 5.2 Contact Inquiries (`/admin/inquiries`)
- Review messages submitted through `/contact`.
- Filter by `unread`, `read`, `replied`, or `archived`.
- Add resolution notes when correspondence is completed.

---

### 6. System Governance & Disaster Recovery

#### 6.1 Administrator User Management (`/admin/users`)
- Only Super Admins can invite new administrators, reset passwords, or change roles.
- **Anti-Self-Lockout:** Administrators cannot delete or demote their own account.
- **Suspension:** Immediately revoke administrative access by setting status to `suspended`.

#### 6.2 Website Settings (`/admin/settings`)
- **General:** Club name, English/Arabic subtitles, founding year.
- **Contact Coordinates:** Verified office location, email, phone numbers.
- **Social Links:** Facebook, YouTube, LinkedIn, X, Telegram URLs.
- **Global SEO:** Default meta titles, keywords, OpenGraph fallback images.
- **System Defaults:** Default theme (`system`, `light`, `dark`), default language (`en`, `ar`), BiDi layout direction.

#### 6.3 Security Audit Trail (`/admin/audit-logs`)
- Real-time immutable record of all security-sensitive actions (logins, failures, password resets, admissions adjudication, content mutations).
- Filter by actor, action type, or target entity.
- Click **"View Details"** to inspect the full JSON payload.
- One-click **"Export Audit Trail"** downloads verified JSON logs for external compliance.

#### 6.4 Database Backups (`/admin/settings` -> Backups Tab)
- Click **"Create Database Backup"** to initiate an on-demand atomic snapshot of all 22 relational tables.
- System scrubs sensitive password hashes, calculates a SHA-256 integrity hash, and saves the backup archive to disk.
- Click **"Download"** to store offsite copies securely.
