# Nginx Reverse Proxy, Let's Encrypt TLS & Cloudflare CDN Deployment Guide

**Institution:** Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)  
**Society:** Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)  
**Target Local Upstream:** `http://127.0.0.1:3005` (managed by `arabic-club.service`)  
**Status:** Production Ready  

---

## 1. Architecture Overview

```
[ Visitor / Browser ]
         │ (HTTPS / HTTP/2)
         ▼
[ Cloudflare Global Edge CDN ]  <── DDoS protection, WAF, Edge SSL, Gzip/Brotli caching
         │ (Encrypted Origin Pool)
         ▼
[ Host Nginx Reverse Proxy (:443) ]  <── Let's Encrypt TLS termination, static asset cache
         │ (Local IPC proxy_pass)
         ▼
[ Next.js Daemon (:3005) ]  <── systemd: arabic-club.service (Node.js / Turbopack)
         │ (WAL Mode)
         ▼
[ SQLite Database: arabic_club.db ]
```

---

## 2. Server Installation & Ingress Setup

### Step 1: Install Nginx and Certbot
```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### Step 2: Deploy Nginx Configuration
Symlink the repository configuration to Nginx's `sites-available`:
```bash
sudo cp "/home/mahmud-hasan/Naims Project/Arabic Club/nginx/arabic-club.conf" /etc/nginx/sites-available/arabic-club.conf
sudo ln -sf /etc/nginx/sites-available/arabic-club.conf /etc/nginx/sites-enabled/arabic-club.conf

# Test syntax validity
sudo nginx -t
```

### Step 3: Obtain Automated Free SSL Certificates with Let's Encrypt
```bash
sudo certbot --nginx -d arabicclub.org -d www.arabicclub.org --non-interactive --agree-tos --email arabicclubkngc2025@gmail.com
```

Certbot automatically schedules systemd renewal timers at `/etc/cron.d/certbot` or `certbot.timer`.

---

## 3. Cloudflare Configuration (Recommended)

When routing through Cloudflare DNS and WAF:

1. **DNS Records**:
   - `A` record: `arabicclub.org` -> `YOUR_SERVER_PUBLIC_IP` (Proxy status: **Proxied** / Orange Cloud)
   - `CNAME` record: `www` -> `arabicclub.org` (Proxy status: **Proxied**)

2. **SSL/TLS Encryption Mode**:
   - Set to **Full (Strict)** in the Cloudflare SSL/TLS dashboard.
   - This ensures full end-to-end cryptographic transit between the visitor, Cloudflare Edge, and your host Nginx instance.

3. **Edge Optimization Settings**:
   - **Always Use HTTPS**: Enabled
   - **Automatic HTTPS Rewrites**: Enabled
   - **Brotli Compression**: Enabled
   - **Early Hints**: Enabled
   - **HTTP/3 (with QUIC)**: Enabled

4. **Real Visitor IP Restoration in Nginx**:
   Add Cloudflare's IP ranges to `/etc/nginx/conf.d/cloudflare.conf` so Nginx extracts the real visitor IP from the `CF-Connecting-IP` header:
   ```nginx
   # Cloudflare IP Ranges (IPv4)
   set_real_ip_from 173.245.48.0/20;
   set_real_ip_from 103.21.244.0/22;
   set_real_ip_from 103.22.200.0/22;
   set_real_ip_from 103.31.4.0/22;
   set_real_ip_from 141.101.64.0/18;
   set_real_ip_from 108.162.192.0/18;
   set_real_ip_from 190.93.240.0/20;
   set_real_ip_from 188.114.96.0/20;
   set_real_ip_from 197.234.240.0/22;
   set_real_ip_from 198.41.128.0/17;
   set_real_ip_from 162.158.0.0/15;
   set_real_ip_from 104.16.0.0/13;
   set_real_ip_from 104.24.0.0/14;
   set_real_ip_from 172.64.0.0/13;
   set_real_ip_from 131.0.72.0/22;

   real_ip_header CF-Connecting-IP;
   ```

---

## 4. Operational Ingress Verification

Execute the verification check against your public domain:
```bash
curl -I https://arabicclub.org/api/health
```

Expected output:
```http
HTTP/2 200 
server: cloudflare
content-type: application/json; charset=utf-8
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
```
Body:
```json
{"status":"ok","timestamp":"2026-10-19T...","database":{"status":"connected","engine":"sqlite"}}
```
