# MEDIA REPOSITORY INVENTORY AND MIGRATION MANIFEST
**Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka**
**Generated at:** 2026-10-18T14:34:47.710Z
**Classification:** Archival Data Governance Documentation

---

## 1. Executive Summary

This document registers all media assets discovered within the repository filesystem and reconciles them against registered database entities in `gallery_albums` and `media_assets`. In compliance with institutional archival policies:
- No files were deleted, moved, published, or overwritten during this inventory.
- Dates, descriptions, and identities are recorded strictly from verifiable file properties; unconfirmed facts remain unassigned.
- Any automated migration requires explicit administrator sign-off prior to execution.

### Inventory Metrics
- **Physical Media Files Discovered on Disk:** 11
- **Database Media References Registered:** 21
- **Unreferenced Local Media Assets:** 9
- **Duplicate Checksum Clones Detected:** 1

---

## 2. Discovered Physical Files on Disk

| Relative Path | Size | Detected MIME | SHA-256 (First 12 chars) | DB Status |
| :--- | :--- | :--- | :--- | :--- |
| `Website Master Plan_files/mh.png` | 1.2 KB | `image/png` | `15941c822f0f...` | Unreferenced / Discovered |
| `public/apple-touch-icon.png` | 31.1 KB | `image/png` | `0ba984953eb3...` | Unreferenced / Discovered |
| `public/favicon-16x16.png` | 0.9 KB | `image/png` | `7ec6da1cc001...` | Unreferenced / Discovered |
| `public/favicon-32x32.png` | 2.6 KB | `image/png` | `600d7936d7b5...` | Unreferenced / Discovered |
| `public/images/logo/club-crest-transparent.png` | 282.6 KB | `image/png` | `2655f578b025...` | Unreferenced / Discovered |
| `public/images/logo/club-crest.png` | 291.5 KB | `image/png` | `99623409a1f9...` | Unreferenced / Discovered |
| `public/images/logo/club-logo-full.png` | 354.7 KB | `image/png` | `3611da972406...` | Unreferenced / Discovered |
| `public/images/logo/club-logo-original.png` | 392.6 KB | `image/png` | `6eacfb5347d7...` | Unreferenced / Discovered |
| `public/logo.png` | 354.7 KB | `image/png` | `3611da972406...` | Unreferenced / Discovered |
| `public/uploads/gallery/2023-2024/historical-exhibition-test-1792334087684/1792334087688_c77j8r_historical_calligraphy_stage_01.jpg` | 0.0 KB | `image/jpeg` | `538ec8cfcbf4...` | Referenced (2) |
| `public/uploads/gallery/2023-2024/historical-exhibition-test-1792334087684/1792334087689_egp3jv_historical_calligraphy_stage_02.png` | 0.0 KB | `image/png` | `bf2f0ca3935e...` | Referenced (1) |

---

## 3. Database Media References & Placeholder Catalog

The following database references represent active or staged media assets in `media_assets` and `gallery_albums`:

| Reference ID | Album Association | File URL / Object Key | Context |
| :--- | :--- | :--- | :--- |
| `med_01_01` | `alb_01` | `/assets/placeholders/debate-stage.webp` | Varsity debating delegation addressing the grand adjudication council during the final championship round. |
| `med_01_02` | `alb_01` | `/assets/placeholders/debate-trophy.webp` | Delegation captain receiving the national championship shield from the university chancellor. |
| `med_01_03` | `alb_01` | `/assets/placeholders/debate-team.webp` | Official team commemorative portrait with faculty coaches and dialectical mentors. |
| `med_01_04` | `alb_01` | `/assets/placeholders/debate-verdict.mp4` | Archival recording: Concluding rebuttal argument and formal adjudication announcement. |
| `med_02_01` | `alb_02` | `/assets/placeholders/calligraphy-thuluth.webp` | Monumental Thuluth script composition displaying classical poetic couplets in genuine gold leaf. |
| `med_02_02` | `alb_02` | `/assets/placeholders/calligraphy-pens.webp` | Hand-cut Jawi and bamboo reed pens beside traditional iron-gall archival inks. |
| `med_02_03` | `alb_02` | `/assets/placeholders/calligraphy-students.webp` | Fellows measuring proportional rhombic dots under the direction of master calligraphers. |
| `med_03_01` | `alb_03` | `/assets/placeholders/symposium-keynote.webp` | Keynote presentation on comparative Semitic lexicography by visiting department chair. |
| `med_03_02` | `alb_03` | `/assets/placeholders/symposium-audience.webp` | Audience of university deans, literary faculty, and student scholars filling the auditorium. |
| `med_04_01` | `alb_04` | `/assets/placeholders/codicology-microscope.webp` | Microscopic analysis of laid and chain line paper watermarks in a 14th-century grammatical codex. |
| `med_04_02` | `alb_04` | `/assets/placeholders/codicology-binding.webp` | Traditional goatskin leather flap restoration demonstration using wheat starch paste. |
| `med_05_01` | `alb_05` | `/assets/placeholders/gala-stage.webp` | The incoming Executive Committee receiving official leadership credentials during handover ceremony. |
| `med_draft_01` | `alb_06_draft` | `/assets/placeholders/secret-draft-photo.webp` | Unpublished confidential photo for testing security boundary isolation. |
| `med_1792334087688_3y85y` | `alb_1792334087684_1spzi` | `/uploads/gallery/2023-2024/historical-exhibition-test-1792334087684/1792334087688_c77j8r_historical_calligraphy_stage_01.jpg` | Master calligrapher demonstrating monumental Thuluth script |
| `med_1792334087689_d5rcj` | `alb_1792334087684_1spzi` | `/uploads/gallery/2023-2024/historical-exhibition-test-1792334087684/1792334087689_egp3jv_historical_calligraphy_stage_02.png` | Students practicing reed pen cutting and proportion measurement |
| `cover_alb_01` | `alb_01` | `/assets/placeholders/gallery-debate-cover.webp` | Cover for National Arabic Debate Championship 2024 [DEMO] |
| `cover_alb_02` | `alb_02` | `/assets/placeholders/gallery-calligraphy-cover.webp` | Cover for Classical Arabic Calligraphy Vernissage & Exhibition [DEMO] |
| `cover_alb_03` | `alb_03` | `/assets/placeholders/gallery-symposium-cover.webp` | Cover for International Arabic Language Day Colloquium [DEMO] |
| `cover_alb_04` | `alb_04` | `/assets/placeholders/gallery-codicology-cover.webp` | Cover for Codicology & Rare Manuscript Restoration Masterclass [DEMO] |
| `cover_alb_05` | `alb_05` | `/assets/placeholders/gallery-gala-cover.webp` | Cover for Annual Honors Gala & Executive Induction 2023 [DEMO] |
| `cover_alb_1792334087684_1spzi` | `alb_1792334087684_1spzi` | `/uploads/gallery/2023-2024/historical-exhibition-test-1792334087684/1792334087688_c77j8r_historical_calligraphy_stage_01.jpg` | Cover for Foundational Arabic Calligraphy Exhibition 2023 |

---

## 4. Unmigrated Discovered Files & Proposed Target Albums

The following files were located on disk but are not yet formally registered in any gallery album:

| Discovered Source File | Proposed Target Album | Recommended Status | Notes |
| :--- | :--- | :--- | :--- |
| `Website Master Plan_files/mh.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/apple-touch-icon.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/favicon-16x16.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/favicon-32x32.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/images/logo/club-crest-transparent.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/images/logo/club-crest.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/images/logo/club-logo-full.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/images/logo/club-logo-original.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |
| `public/logo.png` | Internal Archival / Historical Records | Staged as Draft | Requires administrator metadata review prior to publishing |

---

## 5. Duplicate Checksum & Conflict Analysis

| Primary File | Duplicate File | Checksum SHA-256 | Action |
| :--- | :--- | :--- | :--- |
| `public/images/logo/club-logo-full.png` | `public/logo.png` | `3611da972406cffc...` | Deduplicate / Reuse Single Storage Reference |

---

## 6. Administrator Confirmation & Sign-Off Gate

In adherence to institutional governance standards, executing any bulk migration from this manifest requires formal authorization.

```text
ADMINISTRATIVE AUTHORIZATION CHECKLIST:
[ ] 1. Verified that proposed target albums align with authentic historical college events.
[ ] 2. Confirmed that approximate date notes and locations are documented accurately.
[ ] 3. Approved batch import as Draft records for curation prior to public release.
[ ] 4. Authorized administrator signature: arabicclubkngc2025@gmail.com
```