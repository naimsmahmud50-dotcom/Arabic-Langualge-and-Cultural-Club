# ==============================================================================
# DEVELOPER NOTE:
# File: Dockerfile
# Purpose: Production Multi-Stage Container Image for Arabic Language & Cultural Club
# Platform: Next.js 16 Standalone + SQLite WAL + Debian Bookworm Slim
# Optimization: Minimal footprint, native better-sqlite3 compilation, non-root user.
# Zero AI emojis.
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependencies & Native Build Tools
# ------------------------------------------------------------------------------
FROM node:22-slim AS deps
WORKDIR /app

# Install native compilation dependencies required by better-sqlite3 and sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm via npm so native platform executables (@pnpm/exe) are properly fetched
RUN npm install -g pnpm@12.14.0

# Copy package and pnpm configuration descriptors
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

# Invariant: Force development mode in deps so devDependencies (TypeScript, Tailwind, etc.) are installed
ENV NODE_ENV=development

# Configure pnpm to allow build scripts for native packages in non-interactive Docker environments
RUN pnpm config set dangerously-allow-all-builds true

# Install dependencies cleanly without failing on lockfile mismatches or build script gates
RUN pnpm install --no-frozen-lockfile

# ------------------------------------------------------------------------------
# Stage 2: Application Builder
# ------------------------------------------------------------------------------
FROM node:22-slim AS builder
WORKDIR /app

# Install pnpm for builder stage
RUN npm install -g pnpm@12.14.0

# Copy node_modules and configuration from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js in standalone mode
RUN pnpm build

# ------------------------------------------------------------------------------
# Stage 3: Production Minimal Runner
# ------------------------------------------------------------------------------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Production storage invariants
ENV DATABASE_URL=/app/data/arabic_club.db
ENV STORAGE_DIR=/app/storage/uploads

# Create unprivileged production user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create required volume mount directories with appropriate permissions
RUN mkdir -p /app/data /app/storage/uploads /app/public /app/.next /app/scripts /app/src/lib/db/migrations && \
    chown -R nextjs:nodejs /app/data /app/storage/uploads /app/public /app/.next

# Copy public static assets
COPY --from=builder /app/public ./public

# Copy Next.js standalone server and static bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database migrations and initialization scripts
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db/migrations ./src/lib/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-migrate.mjs ./scripts/docker-migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Ensure executable permissions for container entrypoint
RUN chmod +x ./docker-entrypoint.sh

# Set non-root execution context
USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
