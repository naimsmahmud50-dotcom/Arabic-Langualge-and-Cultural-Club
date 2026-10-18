<!--
  DEVELOPER NOTE:
  File: specs/032-club-logo-integration/plan.md
  Purpose: Implementation plan for authentic club logo extraction and website integration
  Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
  Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
  Strictly human vibe; zero AI emojis.
-->

# IMPLEMENTATION PLAN: 032 - Official Club Logo Integration

**Institution:** Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)  
**Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)  
**Status:** In Progress  

---

## 1. Architectural Strategy & Design System Alignment

In alignment with the collegiate design system (Deep Forest `#173D32`, Warm Ivory `#F5F0E5`, Antique Brass `#B18A4A`), the logo must be integrated as an authentic, high-resolution vector/bitmap asset rather than hardcoded SVG recreations or AI-generated variations.

### Core Architectural Decisions:
1. **Asset Pipeline:** Extract web-ready PNGs and ICO files from the source digital artwork (`media_1792332599451_685cf29b.jpg`) using Python Pillow with perimeter flood-fill alpha matting and defringing.
2. **Reusable Component (`<ClubLogo />`):** Implement `src/components/ui/ClubLogo.tsx` providing standard variants (`crest`, `full`, `badge`) and sizes (`sm`, `md`, `lg`, `xl`, `2xl`) to avoid fragmented markup across pages.
3. **Responsive & RTL Layout:** Ensure all logo instances align cleanly in both Left-to-Right (English/Bengali) and Right-to-Left (Arabic) layouts.
4. **Zero AI Emojis & Dignified Notes:** Maintain developer notes on every touched file with zero AI emojis.

---

## 2. File Modification & Creation Inventory

### New Files:
- `public/images/logo/club-logo-original.png` (Full authentic artwork, 1024x1024)
- `public/images/logo/club-logo-full.png` (Tightly cropped full logo with college subscript)
- `public/images/logo/club-crest.png` (Shield crest on ivory canvas)
- `public/images/logo/club-crest-transparent.png` (Transparent shield crest)
- `public/favicon.ico`
- `public/favicon-32x32.png`
- `public/favicon-16x16.png`
- `public/apple-touch-icon.png`
- `src/components/ui/ClubLogo.tsx` (Reusable logo component)

### Modified Files:
- `src/components/ui/index.ts` (Export `ClubLogo`)
- `src/components/layout/Header.tsx` (Public desktop header)
- `src/components/layout/MobileNav.tsx` (Public mobile drawer)
- `src/components/layout/Footer.tsx` (Public institutional footer)
- `src/components/home/HeroSection.tsx` (Homepage calligraphic crest card)
- `src/components/layout/AdminSidebar.tsx` (Admin dashboard sidebar)
- `src/components/layout/AdminMobileNav.tsx` (Admin mobile navigation)
- `src/app/admin/login/page.tsx` (Admin authentication portal)
- `src/app/admin/forgot-password/page.tsx` (Admin recovery page)
- `src/app/admin/forbidden/page.tsx` (Access denied page)
- `src/app/(public)/about/page.tsx` (About club heraldic header)
- `src/app/(public)/membership/MembershipPortalView.tsx` (Membership portal crest)
- `src/app/layout.tsx` (Favicon and application metadata)

---

## 3. Step-by-Step Execution Sequence

### Phase 1: Asset Extraction & Optimization
- Execute Python script to generate clean PNG and ICO assets in `public/images/logo/` and `public/`.
- Verify pixel dimensions, alpha matting, and visual clarity across backgrounds.

### Phase 2: Reusable Component Engineering
- Build `src/components/ui/ClubLogo.tsx` with typed props: `variant`, `size`, `className`, `priority`, `alt`.
- Export from `src/components/ui/index.ts`.

### Phase 3: Public Website Integration
- Update `Header.tsx` and `MobileNav.tsx` to replace placeholder "ض" tile with `<ClubLogo variant="crest" size="md" />`.
- Update `Footer.tsx` with `<ClubLogo variant="crest" size="md" />`.
- Update `HeroSection.tsx` with `<ClubLogo variant="crest" size="xl" />`.
- Update `/about` and `/membership` pages with institutional crest.

### Phase 4: Administrative Portal Integration
- Update `AdminSidebar.tsx` and `AdminMobileNav.tsx` with `<ClubLogo variant="crest" size="sm" />`.
- Update `/admin/login`, `/admin/forgot-password`, `/admin/forbidden` with `<ClubLogo variant="crest" size="lg" />`.

### Phase 5: Favicon & Metadata
- Update `src/app/layout.tsx` metadata with icons: `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`.

### Phase 6: Testing & Quality Assurance
- Run `pnpm typecheck` to verify 0 errors.
- Run `pnpm build` to verify Next.js production compilation.
- Run automated test battery (`pnpm test:admin`, `pnpm test:gallery`, `pnpm test`).
- Verify HTTP status and live rendering on `http://localhost:3005`.
