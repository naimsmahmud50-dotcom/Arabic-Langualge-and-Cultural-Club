# Arabic Language & Cultural Club Platform
## نادي اللغة العربية والثقافة

An institutional web platform and content management system engineered for the Arabic Language & Cultural Club. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Drizzle ORM.

---

### Key Features & Subsystems

- **Institutional Public Website:** 16 responsive, accessible routes including About, History, Founders, Leadership, Member Directory, Events, Photo Gallery with Lightbox, Learning Resources Hub, Publications, Membership Application, and Contact.
- **Bi-Directional Localization (LTR & RTL):** Native English and Classical Arabic support with real-time language switching, `dir="rtl"` layout mirroring, Amiri & Noto Naskh typography, and BiDi code isolation.
- **Administrative CMS Console:** 15 modular consoles for managing website pages, founders, historical committee terms, member records, events, annual plans, news, study resources, publications, photo albums, and user permissions.
- **Strict Role-Based Access Control (RBAC):** 5 institutional roles (Super Admin, Administrator, Content Editor, Membership Manager, Event Manager) backed by Scrypt password hashing, HMAC-SHA256 session tokens, and Next.js Edge Middleware route guards.
- **Admissions & Inquiry Workflows:** Server-validated membership application pipeline with duplicate prevention, dual-factor reference lookup, and administrative adjudication with immutable audit logging.
- **Security & Data Hardening:** Parameterized queries via Drizzle ORM, strict file upload MIME/extension whitelist, sliding-window IP rate limiting, zero PII leakage, and production HTTP security headers.
- **Zero-External-Dependency Engine:** Default embedded SQLite 3 engine with Write-Ahead Logging (WAL) for instant local setup, with support for PostgreSQL / Supabase for cloud deployment.

---

### Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js v16.4 (App Router & Server Actions) |
| **UI Library** | React v19.3 |
| **Language** | TypeScript v7.0 (Strict mode enabled) |
| **Styling** | Tailwind CSS v4.3 with custom Heritage design tokens |
| **Database ORM** | Drizzle ORM v0.45 |
| **Database Engine** | SQLite (better-sqlite3) with PostgreSQL compatibility |
| **Icons** | Lucide React |
| **Validation** | Zod v4.6 |

---

### Getting Started

#### Prerequisites
- Node.js v20.12+ LTS or v22.x LTS
- pnpm v9.0+ or v12.14+

#### 1. Clone & Install Dependencies
```bash
git clone https://github.com/organization/arabic-club.git
cd arabic-club
pnpm install
```

#### 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env.local
```
Review `.env.local`. The default configuration uses the local embedded SQLite database and requires zero third-party cloud accounts to run immediately.

#### 3. Database Migration & Initial Seed
```bash
# Execute schema migration across all 26 relational tables
pnpm db:migrate

# Seed verified institutional content and default administrator accounts
pnpm db:seed
```

#### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Available Scripts

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts Next.js development server on port 3000 |
| `pnpm build` | Compiles production bundle with Turbopack |
| `pnpm start` | Starts Next.js production server on port 3000 |
| `pnpm typecheck` | Validates TypeScript types across the entire project (`tsc --noEmit`) |
| `pnpm db:migrate` | Runs Drizzle migrations against SQLite database |
| `pnpm db:seed` | Populates database with verified institutional fixtures and default admin accounts |
| `pnpm test` | Executes the comprehensive 6-track automated E2E test suite |
| `pnpm test:all` | Runs cumulative test suites across all 18 test files |

---

### Default Test Accounts (Development & Staging)

> Note: For production deployments, change these passwords immediately or seed using custom values in `.env.production`.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@arabicclub.edu` | `Admin@123456` |
| **Content Editor** | `editor@arabicclub.edu` | `Editor@123456` |
| **Event Manager** | `events@arabicclub.edu` | `Event@123456` |
| **Membership Manager** | `membership@arabicclub.edu` | `Member@123456` |

---

### Project Documentation Index

Detailed engineering, operational, and governance specifications are maintained in the `docs/` directory:

- [docs/MASTER_PROJECT_SPEC.md](docs/MASTER_PROJECT_SPEC.md) - Master project charter and system architecture.
- [docs/REQUIREMENTS_CHECKLIST.md](docs/REQUIREMENTS_CHECKLIST.md) - Requirement-by-requirement verification status.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical architecture, entity relationships, and module breakdown.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production hosting guide (VPS, PM2, Nginx, Docker, SSL/TLS).
- [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) - Complete administrator manual for all 15 CMS modules.
- [docs/DATABASE_AND_MIGRATIONS.md](docs/DATABASE_AND_MIGRATIONS.md) - 26-table relational schema and migration runbook.
- [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md) - Security architecture, authentication, PII, and headers.
- [docs/BACKUP_AND_RESTORE.md](docs/BACKUP_AND_RESTORE.md) - Point-in-time backups, cryptographic snapshots, and recovery.
- [docs/TESTING.md](docs/TESTING.md) - Test methodologies, 18 automated suites, and regression matrix.
- [docs/CONTENT_INVENTORY.md](docs/CONTENT_INVENTORY.md) - Public route inventory, admin consoles, and content models.
- [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) - Operational observations and owner-required action items.
- [docs/PHASE_STATUS.md](docs/PHASE_STATUS.md) - Phase-by-phase execution tracker.
- [docs/FINAL_ACCEPTANCE_REPORT.md](docs/FINAL_ACCEPTANCE_REPORT.md) - Formal handover acceptance report.

---

### License

This project is proprietary software belonging to the Arabic Language & Cultural Club. All rights reserved.
