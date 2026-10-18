# IMPLEMENTATION PLAN: 021 - Quality Pass, Accessibility Audit, SEO & Performance

## 1. Technical Strategy
- **Framework Features**: Next.js 15 native Metadata API, `MetadataRoute.Sitemap`, `MetadataRoute.Robots`.
- **Accessibility**: WCAG 2.2 AA compliant skip links, landmark labeling (`<main id="main-content">`), ARIA attributes, semantic form labels.
- **SEO Architecture**: Dynamic sitemap querying published entities from SQLite, strict robots disallow for administrative paths, Schema.org JSON-LD graph.
- **Performance**: Native lazy loading (`loading="lazy"`), async image decoding (`decoding="async"`), aspect-ratio containers preventing CLS.
- **Verification**: Dedicated automated HTTP & DOM quality test suite querying live Next.js production server on `http://localhost:3000`.

---

## 2. File Operations Matrix

| Module | File Path | Action | Description |
|---|---|---|---|
| **Robots Rules** | `src/app/robots.ts` | Create | Next.js dynamic robots.txt route |
| **XML Sitemap** | `src/app/sitemap.ts` | Create | Next.js dynamic sitemap generator indexing published content |
| **Structured Data**| `src/components/seo/JsonLd.tsx` | Create | Schema.org JSON-LD component for Organization & WebSite |
| **Root Layout** | `src/app/layout.tsx` | Modify | Add metadataBase, rich OpenGraph/Twitter, Skip Link, and JsonLd |
| **Admin Layout** | `src/app/admin/layout.tsx` | Modify | Add `robots: { index: false, follow: false }` |
| **Public Layout**| `src/app/(public)/layout.tsx` | Modify | Add `id="main-content"` and `tabIndex={-1}` to `<main>` |
| **Admin Shell** | `src/components/layout/AdminShell.tsx` | Modify | Add semantic `<main id="main-content">` landmark |
| **Events Page** | `src/app/(public)/events/page.tsx` | Modify | Add comprehensive page metadata |
| **Event Slug** | `src/app/(public)/events/[slug]/page.tsx` | Modify | Add dynamic `generateMetadata` function |
| **Gallery Page**| `src/app/(public)/gallery/page.tsx` | Modify | Add comprehensive page metadata |
| **News Page** | `src/app/(public)/news/page.tsx` | Modify | Add comprehensive page metadata |
| **Publications**| `src/app/(public)/publications/page.tsx`| Modify | Add comprehensive page metadata |
| **Resources** | `src/app/(public)/resources/page.tsx` | Modify | Add comprehensive page metadata |
| **Policies** | `src/app/(public)/policies/page.tsx` | Modify | Add comprehensive page metadata |
| **Image Lazy** | `src/components/home/GalleryPreviewSection.tsx` | Modify | Add `loading="lazy"` and `decoding="async"` |
| **Image Lazy** | `src/app/(public)/members/page.tsx` | Modify | Add `loading="lazy"` and `decoding="async"` |
| **Image Lazy** | `src/app/(public)/leadership/page.tsx` | Modify | Add `loading="lazy"` and `decoding="async"` |
| **Image Lazy** | `src/app/(public)/founders/page.tsx` | Modify | Add `loading="lazy"` and `decoding="async"` |
| **Quality Suite**| `src/lib/db/test-quality-pass.ts` | Create | Automated live HTTP testing suite verifying endpoints, headers, SEO, and accessibility |
| **Audit Report** | `docs/QUALITY_AUDIT.md` | Create | Comprehensive audit report documenting WCAG AA, SEO, Performance, Visual QA |
| **Checklist** | `docs/REQUIREMENTS_CHECKLIST.md` | Modify | Update QA, Accessibility, and SEO items |
| **Phase Status**| `docs/PHASE_STATUS.md` | Modify | Update milestone tracker |
