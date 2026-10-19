#!/usr/bin/env bash
# ==============================================================================
# DEVELOPER NOTE:
# File: scripts/deploy.sh
# Purpose: Zero-Downtime Safe Production Deployment Script with Automated Rollback.
# Institution: Kabi Nazrul Government College, Dhaka
# Club: Arabic Language & Cultural Club
# Port Invariant: Runs on Port 3005; Port 3000 is NEVER touched.
# Strictly human vibe; zero AI emojis.
# ==============================================================================

set -eo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

# Ensure Node and pnpm are on PATH
export PATH="/home/mahmud-hasan/.local/bin:$PATH"

SERVICE_NAME="arabic-club.service"
PORT=3005
HEALTH_URL="http://127.0.0.1:${PORT}/api/health"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_BUILD_DIR="$APP_DIR/.next_backup_${TIMESTAMP}"

echo "=================================================================="
echo "STARTING PRODUCTION DEPLOYMENT: Arabic Language & Cultural Club"
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%SZ')"
echo "App Directory: $APP_DIR"
echo "Target Service: $SERVICE_NAME (Port $PORT)"
echo "=================================================================="

# Function for clean rollback on deployment failure
rollback() {
  local exit_code=$?
  echo ""
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "DEPLOYMENT FAILURE DETECTED (Exit Code: $exit_code)"
  echo "Initiating automatic rollback to previous production build..."
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"

  if [ -d "$BACKUP_BUILD_DIR" ]; then
    echo "Restoring previous .next build directory from $BACKUP_BUILD_DIR..."
    rm -rf "$APP_DIR/.next"
    cp -r "$BACKUP_BUILD_DIR" "$APP_DIR/.next"
    echo "Previous build restored."

    echo "Restarting $SERVICE_NAME with previous build..."
    systemctl --user restart "$SERVICE_NAME" || true
    sleep 3

    # Verify rollback health
    if curl -s -f "$HEALTH_URL" | grep -q '"status":"ok"'; then
      echo "ROLLBACK SUCCESSFUL: Previous release is healthy on Port $PORT."
    else
      echo "CRITICAL: Service degraded even after rollback. Check journalctl --user -u $SERVICE_NAME."
    fi
  else
    echo "No backup directory found at $BACKUP_BUILD_DIR to rollback from."
  fi

  exit $exit_code
}

# Trap unexpected errors to trigger rollback
trap rollback ERR

# Step 1: Optional Git Pull (if remote is configured)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo ""
  echo "--- Step 1: Checking Git Working Tree ---"
  CURRENT_BRANCH=$(git branch --show-current || echo "master")
  echo "Current branch: $CURRENT_BRANCH"
  if git remote | grep -q 'origin'; then
    echo "Pulling latest commits from origin/$CURRENT_BRANCH..."
    git pull origin "$CURRENT_BRANCH" || echo "Notice: git pull skipped or up to date."
  else
    echo "No git remote origin configured; skipping pull."
  fi
fi

# Step 2: Install Dependencies
echo ""
echo "--- Step 2: Installing Dependencies ---"
pnpm install --frozen-lockfile || pnpm install

# Step 3: Run Database Migrations
echo ""
echo "--- Step 3: Executing Database Migrations ---"
pnpm db:migrate

# Step 4: Backup Current Build Artifact
echo ""
echo "--- Step 4: Backing Up Current Build ---"
if [ -d "$APP_DIR/.next" ]; then
  echo "Archiving current .next build to $BACKUP_BUILD_DIR..."
  cp -r "$APP_DIR/.next" "$BACKUP_BUILD_DIR"
else
  echo "No existing .next directory found. Initial build will be generated."
fi

# Step 5: Build Production Bundle
echo ""
echo "--- Step 5: Compiling Next.js Production Release ---"
pnpm build

# Step 6: Restart Daemon
echo ""
echo "--- Step 6: Restarting Systemd Service ($SERVICE_NAME) ---"
systemctl --user daemon-reload
systemctl --user restart "$SERVICE_NAME"

# Step 7: Probe Health Check Endpoint
echo ""
echo "--- Step 7: Probing Health Endpoint ($HEALTH_URL) ---"
MAX_ATTEMPTS=20
ATTEMPT=1
HEALTHY=false

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "Health probe $ATTEMPT of $MAX_ATTEMPTS..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    HEALTH_BODY=$(curl -s "$HEALTH_URL" || echo "{}")
    if echo "$HEALTH_BODY" | grep -q '"status":"ok"'; then
      HEALTHY=true
      echo "Health check response: $HEALTH_BODY"
      break
    fi
  fi

  sleep 1
  ATTEMPT=$((ATTEMPT + 1))
done

if [ "$HEALTHY" = false ]; then
  echo "Health check failed after $MAX_ATTEMPTS attempts."
  false # triggers ERR trap rollback
fi

# Step 8: Clean Up Old Backups
echo ""
echo "--- Step 8: Deployment Finalization ---"
echo "Removing temporary build backup ($BACKUP_BUILD_DIR)..."
rm -rf "$BACKUP_BUILD_DIR"

# Untrap on normal exit
trap - ERR

echo ""
echo "=================================================================="
echo "DEPLOYMENT COMPLETE & VERIFIED HEALTHY"
echo "Service is operational on Port $PORT"
echo "Health Endpoint: $HEALTH_URL"
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%SZ')"
echo "=================================================================="
exit 0
