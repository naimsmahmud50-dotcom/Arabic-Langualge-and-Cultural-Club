# Coolify Deployment and Production Runbook

**Institution:** Kabi Nazrul Government College, Dhaka  
**Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)  
**Platform:** Next.js 16 Standalone + SQLite WAL + Docker  

---

## 1. Executive Summary & Why Coolify is the Optimal Choice

Deploying this platform to Coolify on your own machine or private VPS provides distinct structural advantages over multi-tenant serverless/ephemeral cloud providers (such as Vercel or Render Free Tier):

1. **Persistent Local SQLite Storage:**
   - Serverless platforms like Vercel use read-only ephemeral file systems where local SQLite files and disk uploads are destroyed after each function execution.
   - Coolify runs actual Docker containers backed by host volume mounts (`Persistent Storage`), giving SQLite and media files permanent durability.
2. **Zero Inactivity Sleep (No Cold Starts):**
   - Render's free tier spins down to sleep after 15 minutes of inactivity, resulting in 50+ second cold-start delays.
   - On Coolify, your application container runs continuously 24/7 with zero spin-down latency.
3. **Automated SSL & Reverse Proxy (Traefik):**
   - Coolify includes built-in Traefik with automatic Let's Encrypt certificate issuance and renewal for both root domains and subdomains (e.g. `arabicclub.org` and `admin.arabicclub.org`).
4. **Zero Hosting Costs & Data Sovereignty:**
   - Complete ownership of data, no subscription fees, and no row-count or egress bandwidth quotas.
5. **Automated Git Push-to-Deploy:**
   - Whenever you push new commits to GitHub (`master` or `main`), Coolify can automatically trigger a zero-downtime rebuild and rollout.

---

## 2. Technical Analysis: Root Cause of the Initial Build Failure

### The Error
```
Railpack execution failed: docker exec ... bash /artifacts/build.sh (exit code 1)
```

### Why it Occurred
1. **Missing Dockerfile Fallback:** When a repository lacks a `Dockerfile`, Coolify defaults to `Railpack` (or `Nixpacks`).
2. **Missing C++ Compilers in Buildpack:** The application utilizes `better-sqlite3` and `sharp`. Native Node.js addons require C/C++ compilation toolchains (`python3`, `make`, `g++`, `gcc`, and `libc6-dev`) during `pnpm install`.
3. The minimal Railpack builder environment lacks these system libraries, causing the postinstall compilation of `better-sqlite3` to fail with exit code 1.

### The Resolution
We have added a production-grade multi-stage `Dockerfile`:
- **Stage 1 (deps):** Based on Debian (`node:22-slim`), installs native compilers (`python3 make g++ gcc libc6-dev`) and executes `pnpm install`.
- **Stage 2 (builder):** Compiles Next.js in `output: "standalone"` mode.
- **Stage 3 (runner):** Minimal runtime (~160MB) running as an unprivileged non-root user (`nextjs:nodejs`), incorporating automated SQLite migrations (`docker-entrypoint.sh`).

---

## 3. Step-by-Step Deployment Configuration in Coolify

### Step A: Configure Build Pack
1. Open your project in the **Coolify Dashboard**.
2. Under **General Settings** -> **Build Pack**, ensure **Dockerfile** is selected (Coolify automatically detects this now that `Dockerfile` exists at the root of the repository).
3. Set **Docker Compose Location** / **Dockerfile Location** to `/Dockerfile` (default).
4. Under **Ports Exposes**, verify container port is set to `3000`.

---

### Step B: Configure Persistent Storage (Crucial for SQLite & Uploads)
On the left sidebar menu of your application in Coolify, click **Persistent Storage** (or **Storages**) and add the following two volume mounts:

| Name | Mount Path (Inside Container) | Host / Volume Path | Purpose |
| :--- | :--- | :--- | :--- |
| **sqlite_db** | `/app/data` | `arabic_club_data` | Persists `arabic_club.db`, WAL, and SHM files across restarts. |
| **media_uploads** | `/app/storage/uploads` | `arabic_club_uploads` | Persists uploaded photos, PDFs, and media assets. |

---

### Step C: Configure Environment Variables
Under the **Environment Variables** tab in Coolify, specify:

```ini
NODE_ENV=production
PORT=3000
DATABASE_URL=/app/data/arabic_club.db
STORAGE_DIR=/app/storage/uploads
AUTH_SECRET=generate_a_random_32_character_string_here
INITIAL_ADMIN_EMAIL=arabicclubkngc2025@gmail.com
INITIAL_ADMIN_PASSWORD=YourStrongPassword2026!
```

> **Note:** If `INITIAL_ADMIN_PASSWORD` is omitted, the automated migration script will default to `Admin@ArabicClub2026!`.

---

### Step D: Health Check Configuration
Under the **Health Check** settings in Coolify:
- **Health Check Path:** `/api/health`
- **Port:** `3000`
- **Expected Status Code:** `200`
- **Interval:** `30s`
- **Timeout:** `5s`
- **Retries:** `3`

---

### Step E: Redeploy
1. Click **Redeploy** on the top right.
2. Coolify will fetch the latest commit, execute Docker BuildKit, run `docker-entrypoint.sh` to initialize the database schema, and launch the application.
3. Access the health check: `https://your-domain.com/api/health` — it will respond with `{"status":"ok","database":"connected"}`.
