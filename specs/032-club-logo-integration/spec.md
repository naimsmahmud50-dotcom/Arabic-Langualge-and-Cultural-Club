<!--
  DEVELOPER NOTE:
  File: specs/032-club-logo-integration/spec.md
  Purpose: Specification for authentic club logo extraction and website-wide integration
  Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
  Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
  Strictly human vibe; zero AI emojis.
-->

# SPECIFICATION: 032 - Official Club Logo Integration

**Institution:** Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)  
**Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)  
**Feature:** Official Club Logo Preparation, Asset Generation, and Site-Wide Integration  
**Status:** In Progress  

---

## 1. Executive Summary & Problem Statement

The Arabic Language & Cultural Club has established an official visual emblem featuring:
- A golden heraldic shield crest with a deep navy center.
- A glowing Arabic letter Alif ("ا") modeled as a literary candle/torch.
- Bold golden 3D typography: "ARABIC".
- A crimson banner with white lettering: "CLUB".
- Institutional collegiate affiliation subscript: "KABI NAZRUL GOVT. COLLEGE".

Previously, the website utilized temporary placeholder glyphs (a green square tile with the Arabic letter Dad "ض") across headers, footers, and administrative portals. 

The objective of this feature is to:
1. Extract and optimize the authentic club logo artwork into high-fidelity, web-optimized formats without redrawing, recoloring, distorting, or replacing it with AI-generated art.
2. Integrate the official logo seamlessly throughout the public website, administrative consoles, and application icons.
3. Preserve the existing collegiate brand palette (Deep Forest `#173D32`, Warm Ivory `#F5F0E5`, Antique Brass `#B18A4A`), layout, RTL directionality, and responsive behavior.
4. Guarantee zero broken images, zero TypeScript/build regressions, and strict WCAG AA accessibility compliance.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Public Brand Recognition (P1)
**As a** student, faculty member, or visitor to the club website,  
**I want** to see the authentic Arabic Language & Cultural Club crest in the header, footer, and hero section,  
**So that** I immediately recognize the official collegiate authority of Kabi Nazrul Government College, Dhaka.

- **Acceptance Criteria 1.1:** Header displays the authentic club crest aligned with the bilingual title.
- **Acceptance Criteria 1.2:** Mobile drawer navigation renders the official crest alongside college branding.
- **Acceptance Criteria 1.3:** Footer displays the crest prominently in the institutional identity column.
- **Acceptance Criteria 1.4:** Hero section displays the crest in the scholarly emblem card.

### User Story 2: Administrative Console Identity (P1)
**As an** administrator or executive officer,  
**I want** the admin login screen and dashboard navigation to feature the official club logo,  
**So that** administrative workflows feel cohesive, authoritative, and professional.

- **Acceptance Criteria 2.1:** `/admin/login` renders the official crest atop the authentication card.
- **Acceptance Criteria 2.2:** `/admin/forgot-password` and `/admin/forbidden` display the official crest.
- **Acceptance Criteria 2.3:** Admin desktop sidebar (`AdminSidebar.tsx`) and mobile drawer (`AdminMobileNav.tsx`) display the official crest in the masthead tile.

### User Story 3: Browser Tab & Application Iconography (P2)
**As a** user bookmarking or visiting the website,  
**I want** the browser tab to render the club emblem as a favicon,  
**So that** the site is clearly distinguishable among browser tabs.

- **Acceptance Criteria 3.1:** `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, and `apple-touch-icon.png` are generated from the authentic shield crest.
- **Acceptance Criteria 3.2:** Metadata in `src/app/layout.tsx` references the authentic favicon icons cleanly.

### User Story 4: Institutional & Content Pages (P2)
**As a** reader on the About, History, Contact, and Membership pages,  
**I want** the club crest or full emblem to appear in context without overpowering page content,  
**So that** the visual identity remains dignified and restrained.

- **Acceptance Criteria 4.1:** About page (`/about`) and Membership Portal (`/membership`) render the official crest in key heraldic contexts.
- **Acceptance Criteria 4.2:** Contact page (`/contact`) and Gallery (`/gallery`) incorporate the logo where appropriate.

---

## 3. Asset Specification & Storage Conventions

All extracted assets must be stored under `public/images/logo/` and root `public/`:
- `public/images/logo/club-logo-original.png`: Full original artwork on authentic ivory canvas.
- `public/images/logo/club-logo-full.png`: Tightly cropped full logo (shield + college subscript).
- `public/images/logo/club-crest.png`: Tightly cropped shield crest (on warm ivory canvas).
- `public/images/logo/club-crest-transparent.png`: Transparent shield crest with clean alpha matting and zero edge-fringe.
- `public/favicon.ico`: Multi-resolution favicon icon.
- `public/favicon-32x32.png`: 32x32 pixel favicon.
- `public/favicon-16x16.png`: 16x16 pixel favicon.
- `public/apple-touch-icon.png`: 180x180 pixel Apple touch icon.

---

## 4. Design & Usability Constraints

1. **Aspect Ratio Preservation:** The logo must maintain its native aspect ratio in all viewports; stretching or squishing is strictly forbidden.
2. **Accessible Sizing:** Header logo dimensions: 44px to 48px height/width; Footer logo: 44px; Hero card: 96px to 112px; Admin sidebar: 36px to 40px.
3. **Contrast & Theme Support:** The crest must be clearly legible in both Light and Dark modes. A subtle border or tile container should be provided when placed on variable backgrounds.
4. **Alternative Text:** All logo image instances must provide meaningful `alt` text: e.g., `"Arabic Language & Cultural Club Crest, Kabi Nazrul Government College, Dhaka"`.
5. **Zero AI Emojis:** Strictly maintain zero AI emojis across UI, code comments, and documentation.
