# DESIGN SYSTEM SPECIFICATION
## Arabic Language & Cultural Club — Heritage Edition

### 1. Visual Identity Philosophy: Pure Scholarly & Cultural Heritage
This design system rejects generic AI-generated aesthetics (such as neon blue gradients, random glowing particles, repetitive rounded cards, and cartoon emojis). Instead, it adopts a **refined editorial, scholarly, and cultural design language** inspired by classical Arabic manuscripts, traditional Islamic geometry, and respected university publications.

---

### 2. Semantic Color Architecture

#### Core Brand Tokens
| Token Name | CSS Variable | Hex Value | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Heritage Forest Green** | `--brand-primary` | `#173D32` | Primary brand accent, navigation headers, primary buttons |
| **Warm Ivory** | `--bg-primary` (Light) | `#F5F0E5` | Calibrated light mode background (mimicking parchment/ivory) |
| **Antique Brass Gold** | `--brand-accent` | `#B18A4A` | Prestige accent, badges, highlight rules, active borders |
| **Midnight Evergreen** | `--bg-primary` (Dark) | `#17211D` | Deep, serene dark mode background |
| **Soft White** | `--bg-surface` (Light) | `#FFFFFF` | Elevated card surfaces and reading panels |
| **Deep Evergreen Surface**| `--bg-surface` (Dark) | `#1E2B26` | Dark mode elevated card background |
| **Deep Forest Charcoal** | `--text-primary` (Light) | `#202720` | High-contrast editorial body and heading text |
| **Warm Ivory Text** | `--text-primary` (Dark) | `#F5F0E5` | High-contrast dark mode reading text |
| **Muted Sage** | `--text-secondary` | `#4A564F` / `#C3C9C2` | Subtitles, helper text, and secondary navigation |
| **Warm Gray** | `--text-muted` | `#77766F` / `#8E9C92` | Metadata timestamps, table column labels |
| **Fine Borders** | `--border-color` | `#DDD8CC` / `#344139` | Subtle structural grid separation lines |

#### State Colors (Restrained, Contrast-Verified)
- **Success:** `#1F6B45` (Light) / `#3BA56C` (Dark)
- **Warning:** `#A66E1E` (Light) / `#DE9B35` (Dark)
- **Error:** `#962829` (Light) / `#CF4446` (Dark)

---

### 3. Bilingual Typography System

```
English Headings (Manrope / Editorial Serif):
  - H1: 36px - 44px, Semi-Bold / Bold, letter-spacing -0.02em
  - H2: 24px - 30px, Semi-Bold, letter-spacing -0.015em
  - H3: 18px - 22px, Semi-Bold

English Body (Inter):
  - Body Regular: 15px - 16px, line-height 1.6, weight 400
  - Body Small: 13px - 14px, line-height 1.5, weight 500
  - Micro / Meta: 11px - 12px, line-height 1.4, weight 600

Arabic Headings & Content (Noto Naskh Arabic / Amiri):
  - [dir="rtl"] applied dynamically
  - Diacritic mark preservation
  - Line-height calibrated to 1.8 - 2.0 to eliminate glyph clipping
```

---

### 4. Component Inventory & API Reference

All reusable components live in `@/components/ui`:

1. **`Button`**:
   - `variant`: `primary` (Forest Green), `accent` (Antique Brass), `secondary` (Surface stroke), `outline`, `ghost`, `destructive`.
   - `size`: `sm`, `md`, `lg`.
   - Features: `isLoading` with SVG spinner, `leftIcon`, `rightIcon`, full keyboard focus outline.
2. **`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`**:
   - Structural container with subtle border (`--border-color`) and soft box-shadows.
   - Variants: `default`, `elevated`, `accent`.
3. **`Badge`**:
   - Status indicators: `neutral`, `primary`, `accent`, `success`, `warning`, `destructive`, `outline`.
4. **`Input`, `Textarea`, `Select`, `Label`**:
   - Standardized form controls with visible focus rings (`--focus-ring`), helper text, error states, and icon slots.
5. **`Alert`**:
   - Institutional notices with SVG Lucide icons (`Info`, `CheckCircle2`, `AlertTriangle`, `XCircle`). Strictly zero emojis.
6. **`Modal`**:
   - Accessible dialog with dark backdrop blur, Escape key dismissal, body scroll lock, and title.
7. **`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableWrapper`**:
   - Responsive horizontal scrolling wrapper, clean editorial borders, alternating row hover.
8. **`Breadcrumbs`**:
   - Hierarchical trail with `Home` icon, chevron dividers, and aria-current="page".
9. **`Pagination`**:
   - Accessible page switcher with active term highlight and previous/next navigation.
10. **`LoadingSpinner` & `Skeleton`**:
    - Institutional loader animation and content placeholder pulse.
11. **`EmptyState`**:
    - Scholarly empty state with SVG icon, title, description, and action button.
12. **`ThemeToggle`**:
    - Zero-flash dark/light theme switch with persistent `localStorage` preference.
13. **`GeometricPattern` & `HeritageDivider`**:
    - Classical 8-point Islamic star tile SVG watermark and antique brass diamond divider.

---

### 5. Accessibility & Responsive Verification
- **Contrast Ratios:** Checked with WCAG AA standard (Minimum 4.5:1 for normal text, 3:1 for large text and UI components).
- **Reduced Motion:** Automatic fallback to instantaneous transitions for users with `prefers-reduced-motion: reduce`.
- **Responsive Breakpoints:** Tested across Mobile (375px), Tablet (768px), and Desktop (1280px+).
- **Interactive Verification Route:** `http://localhost:3000/design-system`
