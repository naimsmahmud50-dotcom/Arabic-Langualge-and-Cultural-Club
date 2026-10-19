# Final QA, Monitoring & Safe Deployment Assessment (Phase 8)
**Project:** Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka  
**Scope:** Automated Testing (Vitest + Playwright), CI/CD Verification (`pnpm check`), Production Systemd Optimization, Structured Error Monitoring, Zero-Downtime Deployment with Rollback, Nginx/Cloudflare Ingress, Multilingual Admin Guide, and Complete Pre-Delivery Audit.  
**Date:** October 19, 2026  

---

## 1. Executive Summary
With all previous development phases (Phases 1 through 7) implemented and verified, Phase 8 establishes institutional reliability, maintainability, disaster resilience, and operator autonomy. The objective is to verify that the entire application operates predictably, can be tested with a single automated CI pipeline, can be deployed or rolled back in one command with zero downtime, and is thoroughly documented for non-technical administrators in both English and Bengali.

---

## 2. Requirements & Deliverables

### A. Testing Automation (Unit + E2E)
1. **Unit Testing (Vitest):**
   - Zod schemas: `SectionContentDataSchema`, `SiteSettingsSchema`, `ContactInquirySchema`, and admin schemas.
   - `parseSectionJson` / `safeParseSectionJson`: valid structured JSON, plain text backward-compatibility wrapping (`{ body: text }`), malformed JSON resilience.
   - Settings actions & queries: `getSiteSettings`, `saveSiteSettingsAction` deep merge, key preservation.
2. **End-to-End Testing (Playwright):**
   - Administrative authentication flow (`/admin/login`).
   - Settings management across tabs (`/admin/settings`).
   - Page section structured editor (`/admin/pages`).
   - Media upload pipeline (`/admin/gallery` & `/api/upload`).
   - Event creation and lifecycle (`/admin/events`).

### B. CI Script (`pnpm check` / `npm run check`)
- Pipeline chaining:
  1. `typecheck` (`tsc --noEmit`)
  2. `test` (Unit test suite via Vitest)
  3. `build` (Next.js production Turbopack compilation)

### C. Hardened Systemd Service & Health Probing
- Service configuration at `~/.config/systemd/user/arabic-club.service` and repository template `systemd/arabic-club.service`:
  - `Restart=always` with `RestartSec=5`
  - Explicit `EnvironmentFile` referencing `.env`
  - `StandardOutput=journal` / `StandardError=journal`
  - Uptime and connectivity probe at `/api/health` checking active SQLite reads with latency tracking.
  - Log rotation configuration (`systemd/arabic-club.logrotate`).

### D. Structured Error Monitoring & Uptime Integration
- Dedicated error logging utility (`src/lib/logger.ts`) writing structured JSON records to `logs/app-error.log` and `logs/app.log`.
- Redaction of sensitive fields (passwords, tokens, cookies, PII).
- Uptime monitoring guide and endpoint recommendations.

### E. Safe One-Command Deploy Script with Rollback (`scripts/deploy.sh`)
- Automated workflow:
  1. Stash/pull updates from repository
  2. Dependency installation (`pnpm install --frozen-lockfile`)
  3. Database migrations (`pnpm db:migrate`)
  4. Backup current build artifact (`.next`)
  5. Build new production release (`pnpm build`)
  6. Restart systemd daemon (`systemctl --user restart arabic-club.service`)
  7. Health check probe (`http://localhost:3005/api/health`)
  8. Automatic rollback to previous `.next` and restart if health check fails.

### F. Production Ingress & Reverse Proxy (Nginx + Cloudflare)
- Production-ready Nginx reverse proxy configuration (`nginx/arabic-club.conf`):
  - SSL/TLS Let's Encrypt termination
  - HTTP to HTTPS 301 redirection
  - Reverse proxy to `http://127.0.0.1:3005`
  - Gzip and Brotli compression
  - Static asset cache headers (`/static/`, `/_next/static/`)
  - Cloudflare proxy guide and IP forwarding headers (`CF-Connecting-IP`).
- Documented in `docs/NGINX_AND_CLOUDFLARE_GUIDE.md`.

### G. Comprehensive Documentation (README.md & ADMIN_GUIDE.md)
- Complete, easy-to-follow guide in both English and Bengali (বাংলা) detailing how non-technical club officers manage:
  - Header & Navigation
  - Hero, Mission, Vision
  - Events & Calendar
  - News & Bulletins
  - Photo Gallery
  - Digital Learning Resources
  - Publications & Periodicals
  - Leadership & Founders
  - Backups & Disaster Recovery

### H. Comprehensive Multi-Phase Final Audit
- Re-evaluating all requirements from Phases 1 through 7 with concrete test evidence and zero open critical defects.
