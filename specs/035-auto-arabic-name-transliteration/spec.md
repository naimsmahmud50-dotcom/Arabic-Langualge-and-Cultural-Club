# Feature Specification: Automatic English-to-Arabic Name Transliteration in Membership Application

## 1. Background & Business Value
On the public Membership Application form (`/membership` - "Join Club"), applicants are requested to submit both:
1. `applicantName` (Full Legal Name in English, mandatory)
2. `applicantNameAr` (Arabic Name, optional but historically requires manual typing)

Many collegiate applicants at Kabi Nazrul Government College do not have an Arabic keyboard installed or struggle to type Arabic characters accurately on mobile devices.
By automatically generating an authentic Arabic transliteration/translation when the applicant inputs their English name, application friction is significantly reduced while maintaining database integrity and student satisfaction.

---

## 2. User Stories

### User Story 1 (P1): Instant Auto-Fill from English Name
**As an** applicant filling out the membership application,  
**I want** the Arabic Name field to automatically populate with the correct Arabic spelling when I type my English name,  
**So that** I don't need an Arabic keyboard or manual translation to complete the dossier.

### User Story 2 (P1): Applicant Override & Preservation
**As an** applicant with a specific family or scholarly spelling preference in Arabic,  
**I want** to be able to edit or replace the auto-filled Arabic name at any time,  
**So that** my custom input is preserved and not overwritten by subsequent edits to the English name.

### User Story 3 (P2): Zero Disruption to Existing Data & Submission Flow
**As an** administrative system and existing database,  
**I want** the application submission payload to preserve the exact same schema and validations,  
**So that** no existing features, server actions, or admin review dashboards are broken.

---

## 3. Acceptance Criteria (Given / When / Then)

### Scenario 1: Common Muslim / Arabic / Bengali Names
- **Given** an applicant types "Abdullah Bin Salem" in `applicantName`
- **When** the input triggers or on blur
- **Then** `applicantNameAr` is populated with "عبد الله بن سالم" (if not manually modified)

### Scenario 2: Compound Names & Transliteration
- **Given** an applicant types "Muhammad Mahmud Hasan" in `applicantName`
- **When** transliterated
- **Then** `applicantNameAr` is populated with "محمد محمود حسن"

### Scenario 3: Manual Override
- **Given** the system auto-populates `applicantNameAr`
- **When** the user manually types or edits the Arabic name field
- **Then** a flag `isManualArEdit` is set to `true`, preventing subsequent English typing from clobbering the user's custom Arabic name.

### Scenario 4: Emptying English Name
- **Given** the user clears the English name field
- **When** the Arabic field was purely auto-generated (not manually locked)
- **Then** the Arabic field clears gracefully.

---

## 4. Edge Cases & Constraints
- Must handle case insensitivity ("muhammad", "MUHAMMAD", "Muhammad").
- Must normalize multiple spaces and trim whitespace.
- Must preserve non-Latin characters if pasted.
- Must run completely offline / client-side with zero external API calls or network latency.
- Must pass all existing unit tests and Next.js production build without regressions.
