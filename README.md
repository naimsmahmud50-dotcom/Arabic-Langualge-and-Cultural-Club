# Arabic Language & Cultural Club Platform
## نادي اللغة والثقافة العربية
### Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)

An elite institutional web platform and Content Management System (CMS) engineered for the **Arabic Language & Cultural Club** at Kabi Nazrul Government College, Dhaka. Built on Next.js 16 (App Router with Turbopack), React 19, TypeScript strict mode, Tailwind CSS v4, and Drizzle ORM over an embedded Write-Ahead Logging (WAL) SQLite engine.

---

## Key Features & Subsystems

- **Flagship Multilingual Portal:** 16 responsive, accessible routes honoring Islamic geometry, classical calligraphy, and trilingual (Arabic, Bengali, English) typography (`Amiri`, `Noto Naskh Arabic`, `Noto Sans Bengali`, `Inter`, `Manrope`).
- **Comprehensive CMS Console (`/admin`):** 15 dedicated modules allowing non-technical executive officers to edit every aspect of the public website without editing source code (Header, Navigation, Hero, Pages & Sections, Events, Announcements, Photo Albums, Study Guides, Periodicals, Founders, Committees, and Contact Coordinates).
- **Persistent Media Storage:** Resilient storage layer outside build directories with MIME validation, magic-byte inspection, SVG script rejection, and automated Sharp WebP/AVIF generation.
- **Strict Role-Based Access Control (RBAC):** 5 institutional roles (`super_admin`, `administrator`, `content_editor`, `membership_manager`, `event_manager`) backed by Scrypt/Bcrypt password hashing, sliding HMAC-SHA256 authenticated cookies, and brute-force rate limiters.
- **Admissions & Correspondence Workflows:** Server-validated admissions pipeline with dual-factor tracking, invisible honeypot anti-spam protection, and sliding-window rate limiting.
- **Robust Security & Data Hardening:** Parameterized queries via Drizzle ORM, zero raw SQL concatenation, sanitized rich text output, production HTTP security headers (HSTS, CSP, XFO: SAMEORIGIN), and immutable audit logs.
- **Enterprise Disaster Recovery:** Automated zero-lock SQLite backups via systemd timers keeping the last 14 copies with an instant CLI restoration tool.
- **Production Ingress & Zero-Downtime Deployment:** Hardened Nginx reverse proxy configuration with Let's Encrypt TLS, Cloudflare edge integration, and a one-command deploy script with automatic rollback.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js v16.4.2 (App Router, Turbopack & Server Actions) |
| **UI Library** | React v19.3.1 |
| **Language** | TypeScript v7.0.2 (Strict mode enabled) |
| **Styling** | Tailwind CSS v4.3.3 with custom Heritage design tokens |
| **Database ORM** | Drizzle ORM v0.45.4 |
| **Database Engine** | SQLite (better-sqlite3 v13.0.3) with WAL Mode & 5000ms Busy Timeout |
| **Unit Testing** | Vitest v5.0.5 |
| **End-to-End Testing** | Playwright v1.64.1 (Headless Chromium/Chrome) |
| **Validation** | Zod v4.6 |
| **Icons** | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js v20.12+ LTS or v22.x LTS
- pnpm v9.0+ or v12.14+

### 1. Clone & Install
```bash
git clone https://github.com/organization/arabic-club.git
cd "Arabic Club"
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
The embedded SQLite database requires zero cloud configuration to run locally.

### 3. Database Migration & Seeding
```bash
# Execute schema migration across all 26 relational tables
pnpm db:migrate

# Seed verified institutional fixtures and default admin accounts
pnpm db:seed
```

### 4. Development & Production Run
```bash
# Development server (Port 3000)
pnpm dev

# Continuous Integration check (Typecheck + Unit tests + Build)
pnpm check

# Production daemon (Port 3005)
pnpm start -p 3005
```

---

## Automated Testing & CI/CD Pipeline

| Command | Action |
| :--- | :--- |
| `pnpm check` | **Master CI Pipeline**: runs `tsc --noEmit`, Vitest unit tests, and Next.js build |
| `pnpm test` / `pnpm test:unit` | Executes Vitest unit tests for Zod schemas, parser, and settings |
| `pnpm test:e2e` | Executes Playwright browser E2E tests (auth, settings, sections, media, events) |
| `pnpm typecheck` | Validates strict TypeScript compilation without emitting code |
| `pnpm db:migrate` | Applies schema migrations to SQLite `arabic_club.db` |
| `pnpm db:seed` | Seeds verified collegiate content and institutional user roles |

---

## One-Command Production Deployment

The platform includes an automated deployment script (`scripts/deploy.sh`) with built-in health probing and automatic rollback:

```bash
./scripts/deploy.sh
```

**Workflow executed:**
1. Pulls latest updates from Git.
2. Verifies dependencies via `pnpm install --frozen-lockfile`.
3. Runs database migrations (`pnpm db:migrate`).
4. Creates a backup snapshot of the existing production build (`.next`).
5. Compiles production assets (`pnpm build`).
6. Restarts the systemd daemon (`systemctl --user restart arabic-club.service`).
7. Probes the `/api/health` endpoint for database connectivity.
8. If the health check fails, **automatically rolls back** to the previous `.next` build and restarts the daemon!

---

## Systemd Service & Log Rotation

- **Service Unit:** `~/.config/systemd/user/arabic-club.service` (and `systemd/arabic-club.service`)
  ```bash
  systemctl --user status arabic-club.service
  systemctl --user restart arabic-club.service
  ```
- **Logrotate Configuration:** `systemd/arabic-club.logrotate` handles daily rotation and 14-day archival of `logs/app.log` and `logs/app-error.log`.
- **Automated Nightly Backups:** `systemd/arabic-club-backup.timer` triggers daily backups at 02:00 AM.

---

## Verified Administrative Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@arabicclub.org` | `AdminSecure2026!` |
| **Institutional Lead** | `arabicclubkngc2025@gmail.com` | `AdminSecure2026!` |
| **Administrator** | `operations@arabicclub.org` | `AdminSecure2026!` |
| **Content Editor** | `editor@arabicclub.org` | `AdminSecure2026!` |
| **Membership Officer**| `membership@arabicclub.org` | `AdminSecure2026!` |
| **Events Coordinator**| `events@arabicclub.org` | `AdminSecure2026!` |

---

## Documentation Index

- [Administrator Operating Manual (English & বাংলা)](docs/ADMIN_GUIDE.md)
- [Backup & Disaster Recovery Guide](docs/BACKUP_AND_RESTORE.md)
- [Nginx & Cloudflare Deployment Guide](docs/NGINX_AND_CLOUDFLARE_GUIDE.md)
- [System Architecture & Data Model](docs/ARCHITECTURE.md)
- [Security Audit & Threat Matrix](docs/SECURITY_AUDIT.md)
- [Quality Assurance & WCAG AA Audit](docs/QUALITY_AUDIT.md)

---

## বাংলা সংক্ষেপ (Bengali Overview)

কবি নজরুল সরকারি কলেজ, ঢাকা-এর আরবি ভাষা ও সংস্কৃতি সংসদের জন্য এই আধুনিক প্রাতিষ্ঠানিক ডিজিটাল প্ল্যাটফর্মটি তৈরি করা হয়েছে। প্ল্যাটফর্মটিতে সাধারণ শিক্ষার্থীদের জন্য সমৃদ্ধ আরবি ভাষা শিক্ষা কর্নার, সাহিত্য সাময়িকী, ফটো আর্কাইভ, ইভেন্ট ক্যালেন্ডার এবং অনলাইন সদস্যপদ আবেদনের সুবিধা রয়েছে।

একই সাথে কার্যনির্বাহী পরিষদের কর্মকর্তাদের জন্য রয়েছে একটি সম্পূর্ণ ডায়নামিক অ্যাডমিন প্যানেল (`/admin`), যার মাধ্যমে কোডিং ছাড়া যেকোনো তথ্য, ছবি, নোটিশ বা পেজের কন্টেন্ট পরিবর্তন করা সম্ভব। স্বয়ংক্রিয় এক-ক্লিকে ডেপ্লয় স্ক্রিপ্ট (`./scripts/deploy.sh`), স্বয়ংক্রিয় ব্যাকআপ ব্যবস্থা এবং সাইবার নিরাপত্তা নিশ্চিত করে প্ল্যাটফর্মটি প্রোডাকশনে পরিচালনার জন্য সম্পূর্ণ প্রস্তুত।
