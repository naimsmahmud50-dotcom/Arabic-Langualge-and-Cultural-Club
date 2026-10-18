# PERSISTENT MEDIA STORAGE ARCHITECTURE AND DISASTER RECOVERY GUIDE
**Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka**
**Document Reference: ALCC-KNGC-OPS-028-V1**
**Classification: Institutional Technical Documentation**

---

## 1. Executive Summary

This document specifies the technical architecture, security policies, backup runbooks, and disaster recovery procedures for persistent media storage and content delivery for the Arabic Language & Cultural Club website at Kabi Nazrul Government College, Dhaka.

The media subsystem guarantees data durability across host restarts, container redeployments, and environment transitions, while enforcing defense-in-depth security against unauthorized file execution, mime-spoofing, data leakage, and orphaned assets.

---

## 2. Storage Subsystem Architecture

### 2.1 Dual-Driver Storage Model

The media storage engine implements a unified `StorageProvider` abstraction supporting two interchange-ready storage drivers:

1. **Cloud Object Storage (Supabase Storage v1 REST Driver)**
   - Employs the REST API of Supabase Storage (`/storage/v1/object/...`) with service role authorization.
   - Requires zero external native heavy SDKs, eliminating dependency drift and vendor lock-in.
   - Stores assets in private or protected buckets (`STORAGE_BUCKET_MEDIA`).
   - Automatically selected when valid `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are detected.

2. **Durable Mounted Volume Storage (Filesystem Driver)**
   - Writes directly to durable host volumes configured via `STORAGE_DIR` (with fallback to `public/uploads`).
   - Atomic disk writes with directory auto-provisioning.
   - Generates cryptographically signed HMAC tokens for private asset preview without external network dependencies.
   - Automatically selected during local development or when cloud credentials are not supplied.

```
+-------------------------------------------------------------------------+
|                         APPLICATION CLIENT / ADMIN                      |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|               GET STORAGE PROVIDER FACTORY (getStorageProvider)         |
+-------------------------------------------------------------------------+
           |                                             |
           | [Cloud Credentials Active]                  | [Default / Volume Mode]
           v                                             v
+--------------------------------------+   +------------------------------+
|     SupabaseStorageProvider          |   | DurableVolumeStorageProvider |
|  - Direct REST v1 API Uploads        |   | - Atomic Filesystem Writes   |
|  - Service Role Server Auth          |   | - Volume Mount Compatibility |
|  - Dynamic Cloud Signed URLs         |   | - HMAC-SHA256 Signed Tokens  |
+--------------------------------------+   +------------------------------+
```

---

## 3. Media Security & Upload Pipeline

### 3.1 Binary Magic Byte Inspection

Client-supplied file extensions and MIME headers (`Content-Type`) are untrusted. The upload processor (`src/lib/utils/media-storage.ts`) inspects the initial binary buffer signatures (magic bytes) before persisting files:

| Format | Detected Magic Bytes / Headers | Allowed MIME Types |
| :--- | :--- | :--- |
| **JPEG** | `FF D8 FF` | `image/jpeg` |
| **PNG** | `89 50 4E 47 0D 0A 1A 0A` | `image/png` |
| **WebP** | `52 49 46 46` ... `57 45 42 50` (RIFF...WEBP) | `image/webp` |
| **AVIF** | `ftypavif` or `ftypavis` at offset 4 | `image/avif` |
| **MP4** | `ftyp` (isom, mp42, etc.) at offset 4 | `video/mp4` |
| **WebM** | `1A 45 DF A3` (EBML Header) | `video/webm` |

Any file whose magic bytes do not match the declared extension or supported signatures is immediately rejected with HTTP 400.

### 3.2 Anti-Malware and Script Payload Scanning

To prevent Cross-Site Scripting (XSS), Local File Inclusion (LFI), and Server-Side Code Execution, all uploaded file buffers undergo signature scanning:
- HTML/SVG executable tags (`<script`, `<svg`, `<html`, `<?xml`, `onload=`, `onerror=`) are strictly prohibited in uploaded media.
- Server-side script markers (`<?php`, `eval(`, `<%`, `base64_decode`) are rejected.
- Direct execution protection: Files are never saved as `.php`, `.js`, `.sh`, `.exe`, or `.svg`.

### 3.3 Path Traversal Sanitization

Storage keys are deterministically generated through `generateSafeStoragePath(albumSlug, academicYear, filename)`:
- All directory path components are stripped of `..`, leading slashes, and control characters.
- Non-alphanumeric characters in filenames are sanitized to safe underscores and dashes.
- Storage paths adhere to the standard schema: `gallery/{academicYear}/{albumSlug}/{timestamp}_{random}_{filename}`.

---

## 4. Secure Media Delivery Controller

The endpoint `/api/media/[...path]` acts as an authoritative institutional media delivery controller.

### 4.1 Access Control Matrix

| Asset State | Requester Principal | Delivery Behavior | Cache Header |
| :--- | :--- | :--- | :--- |
| **Published** | Public Anonymous User | HTTP 200 OK | `public, max-age=31536000, immutable` |
| **Published (Video)** | Public Anonymous User | HTTP 206 Partial Content | `public, max-age=31536000, immutable` |
| **Draft / Unpublished** | Public Anonymous User | HTTP 403 Forbidden | `no-store, max-age=0` |
| **Draft / Unpublished** | Authenticated Admin | HTTP 200 OK | `private, no-cache, no-store` |
| **Draft / Unpublished** | Valid Signed Token | HTTP 200 OK | `private, max-age=3600` |
| **Draft / Unpublished** | Expired Signed Token | HTTP 403 Forbidden | `no-store, max-age=0` |

### 4.2 Cryptographic Signed URLs

For draft preview links without active administrative sessions, the system issues HMAC-SHA256 signed tokens:
```
GET /api/media/gallery/2026-2027/symposium/photo.jpg?token=a1b2c3...&exp=1776510000
```
- Token payload: `${storageKey}:${exp}` signed with server secret (`AUTH_SECRET`).
- Validation uses `crypto.timingSafeEqual` to prevent timing attack enumeration.

---

## 5. Storage Integrity & Lifecycle Management

### 5.1 Compensating Cleanup on Database Failures

When an administrative user uploads photos:
1. The file is uploaded to the physical storage engine (Supabase bucket or volume disk).
2. The database transaction attempts to insert the `media_assets` record.
3. If the database insertion fails, a **compensating transaction** immediately purges the uploaded storage object:
   ```ts
   try {
     await db.insert(mediaAssets).values(...);
   } catch (dbErr) {
     await storageProvider.deleteFile(relativeStoragePath);
     throw dbErr;
   }
   ```
4. This guarantees that no orphaned storage objects accumulate on the storage layer.

### 5.2 Shared Media Deletion Protection

A single physical photo may be referenced as:
- An entry in `media_assets`.
- The cover photo in `gallery_albums.coverImageUrl`.
- Reused across multiple historical collections.

When an administrative user deletes an asset via `deleteMediaAssetAction` or `bulkUpdateMediaAssetsAction`:
1. The database records are unlinked or deleted.
2. A safety query inspects the database to check if any remaining records reference the same `fileUrl`.
3. If shared references exist, the physical storage file is **preserved**.
4. Only when zero remaining database references exist is the physical file purged from storage.

---

## 6. Disaster Recovery & Backup Runbooks

### 6.1 Database Backup Procedures

#### SQLite (Local / VPS Mount Mode)
Execute atomic online backup using the SQLite online backup API:
```bash
# Set backup directory with timestamp
BACKUP_DIR="/var/backups/arabic-club/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Perform non-blocking online backup
sqlite3 /home/mahmud-hasan/Naims\ Project/Arabic\ Club/data/arabic_club.db \
  ".backup '$BACKUP_DIR/arabic_club_$TIMESTAMP.db'"

# Verify backup integrity
sqlite3 "$BACKUP_DIR/arabic_club_$TIMESTAMP.db" "PRAGMA integrity_check;"

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -name "*.db" -mtime +30 -delete
```

#### PostgreSQL (Supabase / Managed PostgreSQL)
```bash
# Dump database schema and data
pg_dump -h "$SUPABASE_DB_HOST" -U "$SUPABASE_DB_USER" -d postgres -F c \
  -f "/var/backups/arabic-club/db/postgres_$TIMESTAMP.dump"
```

### 6.2 Media Storage Backup Procedures

#### Durable Volume Backup
Synchronize the local persistent volume to off-site archival storage:
```bash
# Synchronize persistent uploads volume to backup mirror
rsync -avz --delete \
  /home/mahmud-hasan/Naims\ Project/Arabic\ Club/public/uploads/ \
  /var/backups/arabic-club/media/uploads/

# Create dated archive bundle
tar -czf "/var/backups/arabic-club/media/media_archive_$TIMESTAMP.tar.gz" \
  -C /home/mahmud-hasan/Naims\ Project/Arabic\ Club/public uploads
```

#### Supabase Storage Bucket Synchronization
```bash
# Using Supabase CLI or S3-compatible utility
supabase storage download arabic-club-media \
  "/var/backups/arabic-club/media/supabase_$TIMESTAMP"
```

### 6.3 Restoration & Recovery Runbook

In the event of hardware failure, storage corruption, or accidental deletion:

1. **Stop Application Daemon**:
   ```bash
   pnpm pm2 stop arabic-club || kill -15 <PID>
   ```

2. **Restore Database**:
   ```bash
   cp "$BACKUP_DIR/arabic_club_YYYYMMDD_HHMMSS.db" \
      /home/mahmud-hasan/Naims\ Project/Arabic\ Club/data/arabic_club.db
   sqlite3 /home/mahmud-hasan/Naims\ Project/Arabic\ Club/data/arabic_club.db "PRAGMA integrity_check;"
   ```

3. **Restore Media Files**:
   ```bash
   tar -xzf "$BACKUP_DIR/media_archive_YYYYMMDD_HHMMSS.tar.gz" \
       -C /home/mahmud-hasan/Naims\ Project/Arabic\ Club/public/
   ```

4. **Verify File Permissions**:
   ```bash
   chmod -R 755 /home/mahmud-hasan/Naims\ Project/Arabic\ Club/public/uploads
   ```

5. **Execute Integrity Test Suite**:
   ```bash
   pnpm test:storage
   ```

6. **Start Application Server**:
   ```bash
   pnpm start -p 3005
   ```

---

## 7. Environment Variables Reference (Zero-Secret Model)

The following environment variables configure the media storage subsystem. Sensitive production credentials must be set exclusively via secure runtime configuration and never committed to source control.

```bash
# -----------------------------------------------------------------------------
# APPLICATION RUNTIME ENVIRONMENT CONFIGURATION
# -----------------------------------------------------------------------------
PORT=3005
NODE_ENV=production

# -----------------------------------------------------------------------------
# AUTHENTICATION & TOKEN CRYPTOGRAPHY SECRETS
# -----------------------------------------------------------------------------
# 32+ character high-entropy cryptographic secret for HMAC signatures and sessions
AUTH_SECRET="your-high-entropy-64-character-hex-secret-here"
SESSION_SECRET="your-high-entropy-64-character-hex-secret-here"

# -----------------------------------------------------------------------------
# STORAGE DRIVER SELECTION & VOLUME CONFIGURATION
# -----------------------------------------------------------------------------
# Options: "supabase" | "volume" (Defaults to "supabase" if credentials exist, else "volume")
STORAGE_PROVIDER="volume"

# Path to durable mounted volume (used when STORAGE_PROVIDER="volume")
# Defaults to path.join(process.cwd(), "public", "uploads")
STORAGE_DIR="/var/data/arabic-club/uploads"

# -----------------------------------------------------------------------------
# SUPABASE STORAGE CONFIGURATION (Cloud-Native Mode)
# -----------------------------------------------------------------------------
# Public API gateway URL for Supabase instance
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"

# Anonymous key for public operations
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# PRIVILEGED SERVER-SIDE ONLY KEY: Never expose to browser bundles!
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Target storage bucket name for club media
STORAGE_BUCKET_MEDIA="arabic-club-media"
```

---

## 8. Strix-Supabase Security Compliance Checklist

- [x] **Service Role Secrecy**: `SUPABASE_SERVICE_ROLE_KEY` is referenced solely on the Node.js server runtime, never prefixed with `NEXT_PUBLIC_`, and excluded from client bundles.
- [x] **Content-Type Validation**: Direct inspection of binary headers prevents executable MIME masquerading.
- [x] **Least-Privilege RBAC**: Administrative mutation endpoints require verified `gallery:manage` or `media:manage` server session claims.
- [x] **Compensating Cleanup**: Failed database operations trigger storage rollbacks to eliminate orphaned files.
- [x] **Shared File Preservation**: Multi-referenced assets are safeguarded from unintended deletion.
- [x] **Delivery Edge Caching**: Immutable headers maximize CDN caching while private headers protect drafts.
- [x] **Zero AI Emojis**: Documentation and source code strictly adhere to academic human scholarship tone.
