<!--
  @file docs/KNOWN_ISSUES.md
  @description Known Operational Considerations & Non-Blocking Observations
  @context Arabic Language & Cultural Club Platform
-->

# Known Issues & Operational Considerations

**Platform:** Arabic Language & Cultural Club Digital Platform  
**Document Version:** 1.0.0  
**Last Updated:** October 18, 2026  
**Status:** All critical and blocking defects resolved. Platform is 100% stable for production deployment.

---

## 1. Non-Blocking Operational Observations

The following items are intentional architecture decisions or non-blocking considerations documented for future maintainers and hosting administrators:

### 1.1 Local vs. External Email Dispatch (SMTP)
- **Current Behavior:** In the local SQLite environment, contact form inquiries and admissions receipts persist immediately into `contact_inquiries` and `membership_applications` with `delivery_status: "stored_locally"`. This guarantees zero message loss even without internet connectivity.
- **Production Recommendation:** When deploying to institutional production infrastructure, supply `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in `.env.production` to enable automatic background outbound email dispatch.

### 1.2 Cloud Object Storage Transition
- **Current Behavior:** Media asset uploads are validated against the Strix-Supabase security envelope (MIME whitelist, 15MB/100MB caps, traversal immunity) and stored via the local storage engine.
- **Production Recommendation:** For multi-instance distributed deployments (e.g. Vercel, AWS ECS, or Docker swarm), configure external S3-compatible or Supabase Storage bucket URLs to allow persistent shared media volumes across containers.

### 1.3 Next.js 16 Middleware Convention Warning
- **Current Behavior:** During compilation, Next.js 16 outputs an informational deprecation notice: `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
- **Impact:** Non-blocking. Next.js 16 continues to execute `src/middleware.ts` identically with full Edge runtime performance, intercepting `/admin/*` and `/api/admin/*` flawlessly. A formal migration codemod (`npx @next/codemod@canary middleware-to-proxy .`) can be applied upon upgrading to future major releases.

### 1.4 Tagged Demo Data in Database Seed
- **Current Behavior:** To facilitate comprehensive testing and demonstration, `src/lib/db/seed.ts` populates sample events, news bulletins, gallery albums, and historical committee terms clearly tagged with `[DEMO]` or `[DEMO FIXTURE]`.
- **Production Handover Step:** Club executives should use the administrative CMS or run a fresh migration without demo fixtures prior to opening the platform to the public student body.

---

## 2. Resolved Issues Log (Audit Remediations)

During the quality and E2E testing passes, the following items were identified and permanently resolved:
- **Event Detail Dynamic Metadata:** Fixed property access from `bannerImageUrl` to `coverImageUrl` in `src/app/(public)/events/[slug]/page.tsx`.
- **Sitemap Dynamic Types:** Corrected timestamp and pagination array extractions in `src/app/sitemap.ts`.
- **Gallery Async Decoding:** Added `decoding="async"` across gallery thumbnails to ensure main-thread paint efficiency.
- **Icon Refinement:** Replaced residual `Sparkles` icon references with scholarly `Award` icons in `src/app/(public)/events/page.tsx`.
- **Session Context Isolation:** Decoupled media upload validation tests from HTTP cookie stores to allow pure unit validation in test harnesses.
