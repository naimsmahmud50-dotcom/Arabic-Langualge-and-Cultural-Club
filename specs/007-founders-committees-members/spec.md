# SPECIFICATION: 007 - Founders, Committee & Member Directory System

## 1. Executive Summary
Establish the complete, permanent public registry for the Arabic Language & Cultural Club:
- **Founders Archive (`/founders`):** Honoring founding conveners and patron scholars with verified biographies and contributions.
- **Leadership & Committees Archive (`/leadership`):** Current Executive Council and all former committee terms, with a dynamic term selector that preserves historical terms permanently.
- **Member Directory (`/members`):** Public directory of active, verified fellows with strict privacy safeguards (zero exposure of phone, email, or student IDs).
- **Administrative Data Operations:** Type-safe database operations for creating terms, assigning officeholders across terms, managing member visibility, and validating term dates.

---

## 2. Core User Stories & Roles
- **US-01 (Public Visitor & Researcher):** As a visitor or scholar, I want to explore the founders and their contributions on `/founders` to understand the origin and academic lineage of the society.
- **US-02 (Alumni & Institutional Historian):** As an alumnus or officer, I want to view both the current governing committee and past executive committees term-by-term on `/leadership` so that institutional memory is never erased or overwritten.
- **US-03 (Member & Prospective Employer):** As an active club fellow, I want my verified membership status and public profile to appear on `/members`, while having my private phone number, student ID, and personal email strictly protected.
- **US-04 (Club Administrator):** As a club secretary or administrator, I want to create new committee terms with validated start/end dates, assign members to multiple terms without data conflicts, and manage member directory visibility flags.

---

## 3. Acceptance Criteria & Integrity Gates

### Gate 1: Historical Committee Term Preservation
- **Given** an existing active committee term (e.g., 2023–2024),
- **When** a new committee term (e.g., 2024–2025) is appointed as current,
- **Then** the previous term is preserved in the database as an archival former term, and all former officeholders and their assignments remain intact and queryable.

### Gate 2: Multi-Term Officeholder Support
- **Given** a dedicated member (e.g., Zaid Al-Mahmoud),
- **When** they serve as Cultural Secretary in 2023–2024 and then as President in 2024–2025,
- **Then** both assignments are preserved with distinct positions, ranks, and terms, and their profile indicates service in both terms.

### Gate 3: Strict Privacy Projection (Zero Data Leakage)
- **Given** all members in the database (including internal email, phone number, and student ID),
- **When** queried through the public member directory (`getPublicMembers`),
- **Then** only members with `is_public: true` and `status: 'active'` are returned, and private fields (phone, email, student ID) are completely excluded from the SQL projection.

### Gate 4: Elegant Neutral Avatar Fallbacks
- **Given** a founder, committee officer, or member without an uploaded portrait,
- **When** their card renders on `/founders`, `/leadership`, or `/members`,
- **Then** the card displays a dignified, academic fallback (e.g., initials or calligraphic monogram with subtle geometric styling) without broken image icons or generic AI placeholders.

### Gate 5: Verified Date Ranges & Term Status Validation
- **Given** committee term creation or updates,
- **When** `startDate` is after `endDate` or multiple terms are marked `isCurrent: true`,
- **Then** validation fails with a clear, descriptive error, and transitioning a term automatically unsets `isCurrent` on existing terms.

---

## 4. Non-Functional Requirements
- **Performance:** 1-minute ISR on `/founders`, dynamic SSR with URL parameterization on `/leadership?term=[id]`, and fast paginated search on `/members?search=[query]&page=[n]`.
- **Accessibility:** High contrast (>= 4.5:1), keyboard-navigable term selector tabs and search inputs, clear screen-reader labels.
- **Documentation:** JSDoc headers on every component describing route, role, design tokens, and database query bindings.
