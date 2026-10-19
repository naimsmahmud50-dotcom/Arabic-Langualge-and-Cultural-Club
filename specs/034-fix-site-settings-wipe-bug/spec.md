# Feature Specification: 034-fix-site-settings-wipe-bug

## Overview
Fix the critical data-wipe bug in the administrative Site Settings module (`src/app/admin/settings/SettingsManagerClient.tsx` and `src/lib/actions/governance.ts`). Ensure tabbed settings preservation, client-side unified form state with hidden mounting, defensive server-side partial updates (`formData.has(key)`), Zod schema validation, toast notifications, unsaved-changes warnings, and automated verification.

---

## User Stories

### User Story 1 (P1) - Non-Destructive Tabbed Settings Persistence
**As an** Administrator or Executive Officer,
**I want to** switch between settings tabs (Brand & Identity, Contact Coordinates, Social Media, Search & Metadata, System Defaults) and save changes made on any active tab,
**So that** existing values in all other tabs remain intact in the database and are never overwritten with blank values.

#### Acceptance Criteria
- Given the administrator navigates to `/admin/settings` and selects the "Search & Metadata" (SEO) tab,
- When they enter or edit the Meta Description, Canonical URL, or Keywords and click "Save Settings",
- Then the server persists the updated SEO fields while preserving all existing values for Brand Nomenclature, Contact Email, Phone, Headquarters Address, Social Media URLs, and System Defaults.

---

### User Story 2 (P1) - Defensive Server Action & Zod Validation
**As a** System Steward,
**I want** `saveSiteSettingsAction` to validate submitted fields using Zod and only update keys that are explicitly present in `FormData`,
**So that** missing fields from partial submissions cannot wipe database records, and invalid email or URL formats are caught before database writes.

#### Acceptance Criteria
- Given a FormData submission to `saveSiteSettingsAction`,
- When a key is missing from FormData (`formData.has(key) === false`),
- Then that key is completely ignored and excluded from the database update operation.
- Given invalid email format, phone format, or malformed URL,
- When the form is submitted,
- Then the action returns `{ success: false, message: ... }` with a human-readable validation error, and no database records are altered.

---

### User Story 3 (P2) - Unsaved Changes Protection & UI Feedback
**As an** Administrator,
**I want** visible loading states on the save button, toast feedback upon success or failure, and an unsaved-changes prompt if I attempt to close or navigate away from dirty form state,
**So that** I receive clear confirmation of my action and don't accidentally lose unsaved inputs.

#### Acceptance Criteria
- Given uncommitted edits in any input field,
- When the user attempts to close the window or reload,
- Then a browser confirmation warning is triggered.
- Given a save operation is in flight,
- When the user clicks "Save Settings",
- Then the button shows an active loading spinner and is disabled until completion, followed by an immediate toast notification.

---

### User Story 4 (P2) - Automated Regression & Verification Test
**As a** Developer,
**I want** an automated test script that simulates saving a single tab and asserts that all other tabs' database values remain unchanged,
**So that** future regressions are prevented.

---

## Out of Scope
- Introducing external CMS engines or changing database schemas.
- Modifying working domain modules (`events`, `announcements`, `gallery`, `resources`, `publications`, `founders`, `committee`).
