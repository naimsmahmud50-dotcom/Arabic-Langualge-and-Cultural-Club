# ARCHITECTURAL DECISION RECORDS (ADR)
## Arabic Language & Cultural Club Platform

### ADR 001: Framework Selection — Next.js (App Router) with TypeScript
- **Status:** Approved
- **Context:** The platform requires server-side rendering for public SEO and metadata, robust server actions for CMS mutations, dynamic internationalized routing, and type safety across complex relational entities.
- **Decision:** Use Next.js (App Router) with TypeScript.
- **Consequences:** Provides built-in SSR/SSG, seamless API/Server Actions, unified React 19 ecosystem, and first-class SEO optimization.

---

### ADR 002: Styling Architecture & Design Token Engine — Tailwind CSS + Semantic CSS Variables
- **Status:** Approved
- **Context:** The site requires a distinct, scholarly visual identity (Forest Green `#173D32`, Warm Ivory `#F5F0E5`, Antique Brass `#B18A4A`, Midnight Evergreen `#17211D`) with flawless Light and Dark theme adaptation.
- **Decision:** Implement three-tier semantic design tokens using CSS Custom Properties integrated into Tailwind CSS.
- **Consequences:** Eliminates hardcoded arbitrary hex values in components, enables instantaneous theme switching without flash, and guarantees WCAG contrast compliance.

---

### ADR 003: Historical Committee Preservation Architecture
- **Status:** Approved
- **Context:** Club leadership changes annually. Standard websites often overwrite committee records, erasing founders and past leaders.
- **Decision:** Decouple `committee_terms` from individual `members` using a relational junction table (`committee_assignments`). When an election occurs, a new term is created. Previous terms are flagged as historical and remain permanently browsable.
- **Consequences:** Guaranteed preservation of institutional memory; members can hold different positions across different years without data collisions.

---

### ADR 004: Relational Persistence Layer (Drizzle / SQLite / PostgreSQL)
- **Status:** Approved
- **Context:** Development must be fast, self-contained, reproducible, and zero-friction locally, while cleanly migrating to managed PostgreSQL (such as Supabase) in production.
- **Decision:** Use a clean relational data layer with SQL migrations and type-safe schema definitions compatible with SQLite locally and PostgreSQL in production.
- **Consequences:** Zero external database dependency required for local development; migrations are deterministic and version-controlled.

---

### ADR 005: Security & Role-Based Access Control (RBAC)
- **Status:** Approved
- **Context:** Multiple officers (President, Secretary, Event Manager, Media Manager) need administrative access with least privilege.
- **Decision:** Enforce server-side authorization checks on every Server Action and API route. UI menus adapt based on roles, but backend never relies on client-side state.
- **Consequences:** Eliminates privilege escalation; unauthorized API requests are strictly rejected with 403 Forbidden.

---

### ADR 006: Bilingual Layout Engine & Right-to-Left (RTL) Strategy
- **Status:** Approved
- **Context:** Arabic is a primary language of the club, requiring authentic Right-to-Left layout, appropriate typographic scaling, and proper ligature shaping.
- **Decision:** Dynamic `dir="rtl"` applied to document root with logical Tailwind utility classes (`ms-`, `me-`, `ps-`, `pe-`). High-quality web fonts (Noto Naskh Arabic) loaded with calibrated baselines.
- **Consequences:** Seamless switching between English and Arabic without layout breakage or overflowing containers.
