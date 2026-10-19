#!/usr/bin/env sh
set -e

# ==============================================================================
# DEVELOPER NOTE:
# File: docker-entrypoint.sh
# Purpose: Container Entrypoint for Arabic Language & Cultural Club Web Platform.
# Institution: Kabi Nazrul Government College, Dhaka
# Strictly zero AI emojis.
# ==============================================================================

echo "=================================================================="
echo "Starting Arabic Language & Cultural Club Web Platform (Docker)"
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%SZ')"
echo "Node Environment: ${NODE_ENV:-production}"
echo "Port: ${PORT:-3000}"
echo "Database URL: ${DATABASE_URL:-/app/data/arabic_club.db}"
echo "Storage Directory: ${STORAGE_DIR:-/app/storage/uploads}"
echo "=================================================================="

# Ensure data and storage directories exist
mkdir -p /app/data /app/storage/uploads 2>/dev/null || true

# Run automatic database migration and schema verification
if [ -f "scripts/docker-migrate.mjs" ]; then
  echo "Executing database migration and initialization..."
  node scripts/docker-migrate.mjs
fi

# Hand over execution to the main container command
exec "$@"
