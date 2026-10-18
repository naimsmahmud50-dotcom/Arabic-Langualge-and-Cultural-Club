# PRODUCTION DEPLOYMENT & HOSTING GUIDE
## Arabic Language & Cultural Club Platform

This guide documents the procedures for deploying the Arabic Language & Cultural Club platform to production environments.

---

### 1. System Requirements & Prerequisites

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 24.04 LTS |
| **Node.js Runtime** | Node.js v20.12.0 LTS | Node.js v22.x LTS |
| **Package Manager** | pnpm v9.0+ / v12.14+ | pnpm v12.14.0 |
| **Memory (RAM)** | 1 GB | 2 GB+ (for Turbopack build optimization) |
| **Storage** | 10 GB SSD | 25 GB SSD (with backup retention) |
| **Database Engine** | SQLite 3.40+ (embedded) | Embedded SQLite with WAL mode enabled |

---

### 2. Hosting Architecture Options

The application supports three production hosting architectures:

#### Architecture A: Standalone VPS with PM2 & Nginx (Recommended)
- **Best for:** Low operational cost, zero external database latency, full data sovereignty.
- **Components:** Next.js Node.js server managed by PM2, local SQLite database (`./arabic_club.db`) running with Write-Ahead Logging (WAL), Nginx reverse proxy terminating TLS with Let's Encrypt certificates.

#### Architecture B: Docker Containerized Deployment
- **Best for:** Portable orchestration (Kubernetes, AWS ECS, GCP Cloud Run, Docker Swarm).
- **Components:** Multi-stage Containerfile building the standalone Next.js artifact with persistent volume mount for `./arabic_club.db` and `/public/uploads`.

#### Architecture C: Cloud PaaS (Vercel / Railway / Render)
- **Best for:** Serverless infrastructure.
- **Requirement:** Must use an external cloud database (such as Supabase PostgreSQL or Turso SQLite) since serverless file systems are ephemeral.

---

### 3. Step-by-Step VPS Deployment Runbook (Architecture A)

#### Step 3.1: Server Provisioning & Node.js Setup
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# 2. Install Node.js v22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Enable pnpm and install PM2 globally
sudo corepack enable
sudo corepack prepare pnpm@12.14.0 --activate
sudo npm install -g pm2
```

#### Step 3.2: Application Setup & Permissions
```bash
# 1. Create deployment user and directory
sudo useradd -m -s /bin/bash appuser
sudo mkdir -p /var/www/arabicclub
sudo chown -R appuser:appuser /var/www/arabicclub

# 2. Clone repository as appuser
sudo -u appuser git clone https://github.com/organization/arabic-club.git /var/www/arabicclub
cd /var/www/arabicclub

# 3. Configure production environment
sudo -u appuser cp .env.example .env.production
sudo -u appuser nano .env.production
# Generate high-entropy secrets for AUTH_SECRET and SESSION_SECRET:
# openssl rand -base64 32
```

#### Step 3.3: Database Setup & Migration
```bash
# 1. Install dependencies
sudo -u appuser pnpm install --frozen-lockfile

# 2. Run database migrations to construct all 26 relational tables
sudo -u appuser pnpm db:migrate

# 3. Populate initial verified data and super administrator account
sudo -u appuser pnpm db:seed
```

#### Step 3.4: Build & PM2 Process Configuration
```bash
# 1. Compile Next.js production bundle with Turbopack
sudo -u appuser pnpm build

# 2. Create PM2 ecosystem file (/var/www/arabicclub/ecosystem.config.cjs)
cat << 'EOF' > ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "arabic-club",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/arabicclub",
      instances: 1, // Single instance required when using embedded SQLite
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
EOF

# 3. Start application via PM2 and register systemd service
sudo -u appuser pm2 start ecosystem.config.cjs --env production
sudo -u appuser pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u appuser --hp /home/appuser
```

#### Step 3.5: Nginx Reverse Proxy & SSL Configuration
Create `/etc/nginx/sites-available/arabicclub.conf`:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name arabicclub.edu www.arabicclub.edu;

    # Maximum file upload size for gallery and documents (100MB)
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_bypass 1;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable site and acquire SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/arabicclub.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Acquire Let's Encrypt Certificate
sudo certbot --nginx -d arabicclub.edu -d www.arabicclub.edu
```

---

### 4. Docker Deployment (Architecture B)

#### Containerfile (Multi-stage Build)
```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/arabic_club.db ./arabic_club.db
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

### 5. Production Health Monitoring & Log Rotation

#### Health Check Probe
- **Endpoint:** `GET /api/health`
- **Expected Status:** HTTP 200 `{ "status": "ok", "database": { "status": "connected" } }`
- **Uptime Monitor Configuration:** Configure ping intervals at 60 seconds with 5-second timeout.

#### PM2 Log Rotation
```bash
sudo pm2 install pm2-logrotate
sudo pm2 set pm2-logrotate:max_size 10M
sudo pm2 set pm2-logrotate:retain 14
sudo pm2 set pm2-logrotate:compress true
```

---

### 6. Zero-Downtime Update & Migration Runbook

To deploy updates to a live production server:
```bash
cd /var/www/arabicclub

# 1. Pull latest code
git pull origin master

# 2. Install any updated dependencies
pnpm install --frozen-lockfile

# 3. Apply schema migrations safely (WAL mode prevents read locks)
pnpm db:migrate

# 4. Compile production build
pnpm build

# 5. Reload PM2 process cluster with zero downtime
pm2 reload arabic-club
```

#### Migration Rollback & Recovery
In the event of an unexpected schema defect:
1. Stop the application: `pm2 stop arabic-club`.
2. Restore database from pre-deployment snapshot:
   ```bash
   cp backups/arabic_club_YYYYMMDD_HHMMSS.db arabic_club.db
   ```
3. Checkout previous release tag: `git checkout <previous-tag>`.
4. Rebuild and restart: `pnpm build && pm2 start arabic-club`.
