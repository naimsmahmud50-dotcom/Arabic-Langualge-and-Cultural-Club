# PROJECT CONSTITUTION & CORE ENGINEERING PRINCIPLES

## 1. Tech Stack & Architectural Baseline
- **Framework:** Next.js (App Router, Turbopack, React 19).
- **Language:** Strict TypeScript with `strict: true`.
- **Database:** SQLite / PostgreSQL with Drizzle ORM.
- **Styling:** Tailwind CSS with semantic CSS variables and design tokens (`var(--brand-primary)`, `var(--brand-accent)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`, `var(--text-secondary)`).
- **Icons:** `lucide-react`. Absolute avoidance of cheesy AI emojis or filler graphics.
- **Package Manager:** Strictly `pnpm` (version 12.14.0).

## 2. Institutional Heritage & Editorial Tone
- **Human Scholar Vibe:** Clean, authoritative, dignified academic tone.
- **Zero Fabrication:** Never invent dates, founders, awards, or statistics. Development fixtures must be explicitly tagged as `[DEMO FIXTURE]`.
- **Bilingual English & Arabic:** Noto Naskh Arabic font, RTL readiness, proper baseline alignment.

## 3. Code Documentation & Onboarding
- Every page and component MUST include a prominent top JSDoc block explaining:
  - `@file`: Full file path.
  - `@route`: Public or administrative route.
  - `@description`: What the component does.
  - Architecture, design tokens used, and database queries.
