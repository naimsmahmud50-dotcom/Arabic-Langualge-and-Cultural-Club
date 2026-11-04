# Implementation Plan: Arabic Club Presentation & PDF Manual

## 1. Design & Typography Tokens
- **Palette:**
  - Deep Emerald: `#173D32` (Primary brand)
  - Rich Nocturnal Surface: `#0D1F1A` / `#0A1814`
  - Royal Warm Gold: `#B18A4A` and `#E5BE6A` (Accent highlights)
  - Card & Container Surface: `#132B24` with gold border `#B18A4A33`
  - Text Primary: `#FFFFFF`
  - Text Secondary: `#C3C9C2` / `#E3D9C4`
- **Typography:**
  - Latin Display: `Inter`, `system-ui`, sans-serif
  - Arabic Calligraphy & Display: `Amiri`, `Noto Naskh Arabic`, serif
  - Bengali Display: `Noto Sans Bengali`
  - Code & Mono: `JetBrains Mono`, `monospace`

## 2. Interactive HTML Deck Architecture
- File: `presentation.html`
- Contains:
  - Slide container locked to 16:9 widescreen presentation ratio.
  - Keyboard navigation (Left/Right arrow keys, PageUp/PageDown, Space).
  - Floating slide controls with Previous/Next buttons, slide indicators, and Fullscreen toggle.
  - Clean `@media print` rules with `page-break-after: always;` on `.slide-page` so that PDF rendering creates distinct, sharp pages without cutoffs.

## 3. PDF Generation Architecture
- Tool: Headless Playwright script `scripts/generate-presentation-pdf.ts` or inline node script.
- Output path: `/home/mahmud-hasan/Downloads/Arabic_Club_Project_Presentation.pdf`.
- Configuration:
  - Margin: 0
  - Print Backgrounds: true
  - Format: A4 Landscape or 16:9 widescreen PDF.
  - PreferCSSPageSize: true.

## 4. Verification
- Verify file exists in `/home/mahmud-hasan/Downloads/Arabic_Club_Project_Presentation.pdf`.
- Verify file size > 50KB with valid PDF header (`%PDF-`).
- Verify all slides render correctly and contain both language breakdown and button mappings.
