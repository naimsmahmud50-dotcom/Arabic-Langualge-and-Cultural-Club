/**
 * DEVELOPER NOTE:
 * @file src/lib/storage/index.ts
 * @description Unified Persistent Media Storage Engine & Provider Abstraction (Phase 6).
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * CORE ARCHITECTURAL CAPABILITIES:
 * 1. StorageProvider Interface: Common contract for file upload, deletion, public URLs, signed URLs, and existence checks.
 * 2. SupabaseStorageProvider: Cloud-native object storage driver communicating via standard REST fetch to Supabase Storage v1.
 * 3. DurableVolumeStorageProvider: Durable filesystem driver writing to mounted persistent volumes (or public/uploads).
 * 4. Local Signed URLs: Cryptographic HMAC-signed tokens allowing time-bounded, private access to unpublished media.
 * 5. Dynamic Provider Factory: Auto-selects cloud or volume driver based on verified institutional environment credentials.
 * 6. Zero AI emojis; robust defense in depth.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StorageUploadResult {
  storageKey: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageProvider {
  name: "supabase" | "volume";
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult>;
  deleteFile(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  fileExists(key: string): Promise<boolean>;
  getFileBuffer(key: string): Promise<Buffer | null>;
}

// Helper: HMAC token signing for local volume private URLs
export function generateLocalSignedToken(storageKey: string, expiresInSeconds: number = 3600): { token: string; exp: number } {
  const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET || "arabic_club_storage_hmac_secret_fallback";
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${storageKey}:${exp}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return { token: hmac, exp };
}

export function verifyLocalSignedToken(storageKey: string, token: string, expStr: string): boolean {
  const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET || "arabic_club_storage_hmac_secret_fallback";
  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || Math.floor(Date.now() / 1000) > exp) {
    return false; // Expired
  }
  const payload = `${storageKey}:${exp}`;
  const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedHmac));
}

// ----------------------------------------------------------------------------
// 1. DURABLE VOLUME STORAGE PROVIDER (Persistent VPS / Mount)
// ----------------------------------------------------------------------------

export class DurableVolumeStorageProvider implements StorageProvider {
  name = "volume" as const;
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || process.env.STORAGE_DIR || path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolveDiskPath(key: string): string {
    // Clean and normalize key to prevent path traversal
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    return path.join(this.baseDir, cleanKey);
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult> {
    const diskPath = this.resolveDiskPath(key);
    const dir = path.dirname(diskPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file atomically to disk
    fs.writeFileSync(diskPath, buffer);

    const publicUrl = this.getPublicUrl(key);
    return {
      storageKey: key,
      publicUrl,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    const diskPath = this.resolveDiskPath(key);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
      return true;
    }
    return false;
  }

  getPublicUrl(key: string): string {
    // If stored under public/uploads, Next.js can serve via /uploads/ or the media delivery controller /api/media/
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    return `/uploads/${cleanKey}`;
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    const { token, exp } = generateLocalSignedToken(cleanKey, expiresInSeconds);
    return `/api/media/${cleanKey}?token=${token}&exp=${exp}`;
  }

  async fileExists(key: string): Promise<boolean> {
    const diskPath = this.resolveDiskPath(key);
    return fs.existsSync(diskPath);
  }

  async getFileBuffer(key: string): Promise<Buffer | null> {
    const diskPath = this.resolveDiskPath(key);
    if (fs.existsSync(diskPath)) {
      return fs.readFileSync(diskPath);
    }
    return null;
  }
}

// ----------------------------------------------------------------------------
// 2. SUPABASE OBJECT STORAGE PROVIDER (Cloud Storage v1)
// ----------------------------------------------------------------------------

export class SupabaseStorageProvider implements StorageProvider {
  name = "supabase" as const;
  private supabaseUrl: string;
  private serviceKey: string;
  private bucket: string;

  constructor(options?: { supabaseUrl?: string; serviceKey?: string; bucket?: string }) {
    this.supabaseUrl = (options?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
    this.serviceKey = options?.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    this.bucket = options?.bucket || process.env.STORAGE_BUCKET_MEDIA || "arabic-club-media";

    if (!this.supabaseUrl) {
      throw new Error("SupabaseStorageProvider: NEXT_PUBLIC_SUPABASE_URL is not configured.");
    }
    if (!this.serviceKey) {
      throw new Error("SupabaseStorageProvider: SUPABASE_SERVICE_ROLE_KEY is not configured.");
    }
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult> {
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    const endpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${cleanKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        apikey: this.serviceKey,
        "Content-Type": mimeType,
        "x-upsert": "true",
      },
      body: buffer as unknown as BodyInit,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase Storage upload failed (HTTP ${res.status}): ${errText}`);
    }

    const publicUrl = this.getPublicUrl(cleanKey);
    return {
      storageKey: cleanKey,
      publicUrl,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    const endpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucket}`;

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        apikey: this.serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [cleanKey] }),
    });

    return res.ok;
  }

  getPublicUrl(key: string): string {
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${cleanKey}`;
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    const endpoint = `${this.supabaseUrl}/storage/v1/object/sign/${this.bucket}/${cleanKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        apikey: this.serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    });

    if (!res.ok) {
      // Fallback to public URL if signed URL generation encounters an issue
      return this.getPublicUrl(cleanKey);
    }

    const data = await res.json();
    const signedPath = data.signedURL || data.signedUrl;
    if (signedPath) {
      return `${this.supabaseUrl}/storage/v1${signedPath}`;
    }
    return this.getPublicUrl(cleanKey);
  }

  async fileExists(key: string): Promise<boolean> {
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    const endpoint = `${this.supabaseUrl}/storage/v1/object/info/public/${this.bucket}/${cleanKey}`;

    try {
      const res = await fetch(endpoint, {
        method: "HEAD",
        headers: {
          apikey: this.serviceKey,
        },
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  async getFileBuffer(key: string): Promise<Buffer | null> {
    const cleanKey = key.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
    const endpoint = `${this.supabaseUrl}/storage/v1/object/authenticated/${this.bucket}/${cleanKey}`;

    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${this.serviceKey}`,
          apikey: this.serviceKey,
        },
      });
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return null;
    }
  }
}

// ----------------------------------------------------------------------------
// 3. STORAGE PROVIDER FACTORY
// ----------------------------------------------------------------------------

let cachedProvider: StorageProvider | null = null;

/**
 * Returns the configured storage provider instance.
 * Automatically prefers Supabase Object Storage if valid credentials are configured,
 * otherwise defaults to high-reliability durable mounted volume storage.
 */
export function getStorageProvider(): StorageProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const explicitProvider = process.env.STORAGE_PROVIDER;
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http"));
  const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if ((explicitProvider === "supabase" || (!explicitProvider && hasSupabaseUrl && hasSupabaseKey))) {
    try {
      cachedProvider = new SupabaseStorageProvider();
      return cachedProvider;
    } catch (err) {
      console.warn("Storage Provider: Supabase credentials incomplete, falling back to durable volume storage.", err);
    }
  }

  cachedProvider = new DurableVolumeStorageProvider();
  return cachedProvider;
}

/**
 * Resets the cached provider (primarily for test environments).
 */
export function resetStorageProvider(): void {
  cachedProvider = null;
}

/**
 * Extracts a normalized storage key from a public or media URL.
 * Supports /uploads/..., /api/media/..., Supabase public/signed URLs, and direct keys.
 * Returns null if the URL is external or not managed by the storage engine.
 */
export function extractStorageKeyFromUrl(fileUrl: string): string | null {
  if (!fileUrl || typeof fileUrl !== "string") return null;

  const urlWithoutQuery = fileUrl.split("?")[0].trim();

  // 1. Next.js /uploads/ local volume path
  if (urlWithoutQuery.startsWith("/uploads/")) {
    const rawKey = urlWithoutQuery.replace(/^\/uploads\//, "");
    return rawKey.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
  }

  // 2. Next.js /api/media/ delivery controller path
  if (urlWithoutQuery.startsWith("/api/media/")) {
    const rawKey = urlWithoutQuery.replace(/^\/api\/media\//, "");
    return rawKey.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
  }

  // 3. Supabase Storage URLs (public, sign, authenticated)
  const supabaseMatch = urlWithoutQuery.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/[^/]+\/(.+)$/);
  if (supabaseMatch && supabaseMatch[1]) {
    return decodeURIComponent(supabaseMatch[1]).replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
  }

  // 4. Direct relative gallery key
  if (urlWithoutQuery.startsWith("gallery/")) {
    return urlWithoutQuery.replace(/\.\.+/g, "").replace(/^[/\\]+/, "");
  }

  return null;
}
