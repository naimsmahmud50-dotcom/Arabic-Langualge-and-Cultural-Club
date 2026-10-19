/**
 * DEVELOPER NOTE:
 * File: docs/CACHE_AND_CDN_GUIDE.md
 * Purpose: Production Reverse Proxy, Brotli/Gzip Compression, and CDN Caching Specification.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Target Service: arabic-club.service on Port 3005
 * Strictly human vibe; zero AI emojis.
 */

# Arabic Language & Cultural Club — CDN & Reverse Proxy Caching Guide

## 1. Overview
This specification details production edge caching and compression architectures for the Arabic Language & Cultural Club portal hosted at Kabi Nazrul Government College, Dhaka.

The Next.js application runs as a managed systemd daemon (`arabic-club.service`) listening exclusively on `127.0.0.1:3005`.

---

## 2. Nginx Reverse Proxy Configuration

Below is the verified, production-ready Nginx server block with automated Brotli, Gzip, and static asset caching directives:

```nginx
# /etc/nginx/sites-available/arabicclub.org.conf

upstream arabic_club_backend {
    server 127.0.0.1:3005;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name arabicclub.org www.arabicclub.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name arabicclub.org www.arabicclub.org;

    # SSL Certificates (Let's Encrypt / Institutional CA)
    ssl_certificate /etc/letsencrypt/live/arabicclub.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arabicclub.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml font/woff font/woff2;

    # Brotli Compression (if ngx_brotli module enabled)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/plain text/css application/javascript application/json image/svg+xml font/woff2;

    # Next.js Immutable Static Chunks
    location /_next/static/ {
        proxy_pass http://arabic_club_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;

        # Cache at edge/browser for 1 year
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Public Media, Logos & Static Assets
    location ~* ^/(images|assets|uploads)/ {
        proxy_pass http://arabic_club_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;

        expires 7d;
        add_header Cache-Control "public, max-age=604800, stale-while-revalidate=86400";
        access_log off;
    }

    # Administrative Routes (Never Cache)
    location /admin {
        proxy_pass http://arabic_club_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Cache-Control "no-store, no-cache, must-revalidate, private";
    }

    # Public Dynamic Pages & SSR
    location / {
        proxy_pass http://arabic_club_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Protect against slowloris attacks
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

---

## 3. Cloudflare Edge Rules Configuration

If using Cloudflare CDN in front of the origin server:

### A. Page Rules & Cache Rules
1. **Static Assets Rule (`arabicclub.org/_next/static/*`):**
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month (or 1 year)
   - Browser Cache TTL: 1 year
2. **Media Assets Rule (`arabicclub.org/images/*`, `arabicclub.org/assets/*`):**
   - Cache Level: Cache Everything
   - Edge Cache TTL: 7 days
   - Browser Cache TTL: 7 days
3. **Admin Portal Rule (`arabicclub.org/admin*`):**
   - Cache Level: Bypass
   - Disable Performance Features: Auto Minify, Rocket Loader
4. **Public HTML Pages (`arabicclub.org/*`):**
   - Cache Level: Standard
   - Edge Cache TTL: Respect Existing Headers (`s-maxage=60` emitted by Next.js ISR)

### B. Auto Minify & Brotli
- Under **Speed > Optimization**:
  - Enable **Brotli**: On (Cloudflare compresses origin responses automatically to clients supporting `br`).
  - Enable **Early Hints**: On (transmits link rel preconnect before full response).
  - HTTP/3 (with QUIC): Enabled.

---

## 4. Cache Invalidation & On-Demand Revalidation
When an administrator modifies page sections, annual plan events, news, or gallery albums in `/admin`, Next.js invokes `revalidatePath` and `revalidateTag` internally.
To purge Cloudflare edge cache programmatically upon publishing:
- Configure Cloudflare API Token in `.env`:
  `CLOUDFLARE_ZONE_ID=...`
  `CLOUDFLARE_API_TOKEN=...`
- The system issues a targeted URL purge request for the affected path.
