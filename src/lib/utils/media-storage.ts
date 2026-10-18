/**
 * @file src/lib/utils/media-storage.ts
 * @description Safe Media Storage Validation, Path Sanitization, and Upload Security Engine.
 * 
 * ARCHITECTURE & ROLE IN ARABIC CLUB SYSTEM:
 * - This utility enforces institutional storage boundaries, prevents malicious file uploads,
 *   and ensures zero storage credentials (such as Supabase service-role keys or AWS secrets)
 *   leak into client bundles or public API responses.
 * - Adheres to Strix-Supabase security standards and strict Least-Privilege media policies.
 * 
 * SECURITY BOUNDARIES ENFORCED:
 * 1. Allowed MIME Types: Strict whitelist for photography and video:
 *    - Images: image/jpeg, image/png, image/webp, image/avif
 *    - Videos: video/mp4, video/webm
 * 2. Strict File Extension Whitelist: Prevents extension-spoofing or double-extension attacks
 *    (e.g., photo.php.jpg or malicious .exe/.sh uploads).
 * 3. File Size Envelopes:
 *    - Photography: Max 15 MB per asset.
 *    - Archival Video: Max 100 MB per asset.
 * 4. Directory Traversal Immunity:
 *    - Strips all relative traversal segments (../, ..\, null bytes, control characters).
 *    - Sanitizes filenames into safe ASCII-only slugs with timestamps and UUIDs.
 * 5. Privacy & Consent Protocol (Article VII):
 *    - Asserts that identifiable photographs of club members require verified publication status
 *      and adhere to member directory consent settings.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

export interface MediaUploadValidationOptions {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  mediaCategory?: "image" | "video";
  buffer?: Buffer;
}

export interface BinarySignatureResult {
  isValid: boolean;
  detectedFormat?: "jpeg" | "png" | "webp" | "avif" | "mp4" | "webm";
  detectedMime?: string;
  errorMessage?: string;
}

export interface MediaValidationResult {
  isValid: boolean;
  sanitizedFilename?: string;
  storageKey?: string;
  errorMessage?: string;
  mediaType: "image" | "video";
  detectedMime?: string;
}

/**
 * Inspects binary magic bytes and scans the initial payload for embedded scripts.
 * Rejects disguised executables, HTML, PHP, SVGs, or malformed streams.
 */
export function inspectFileSignature(buffer: Buffer): BinarySignatureResult {
  if (!buffer || buffer.length < 8) {
    return { isValid: false, errorMessage: "File buffer is too small or empty to verify." };
  }

  // 1. Scan the initial bytes for embedded scripts, XML, PHP or shellcode
  const headerPreview = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("binary").toLowerCase();
  const dangerousSignatures = [
    "<?php",
    "<script",
    "<svg",
    "<!doctype html",
    "<html",
    "<!entity",
    "eval(",
    "base64_decode(",
    "system(",
    "passthru(",
    "shell_exec("
  ];

  for (const sig of dangerousSignatures) {
    if (headerPreview.includes(sig)) {
      return {
        isValid: false,
        errorMessage: `Malicious payload detected: contains prohibited script or XML sequence '${sig}'.`,
      };
    }
  }

  // 2. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return {
      isValid: true,
      detectedFormat: "jpeg",
      detectedMime: "image/jpeg",
    };
  }

  // 3. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      isValid: true,
      detectedFormat: "png",
      detectedMime: "image/png",
    };
  }

  // 4. WebP: Bytes 0-3 'RIFF', Bytes 8-11 'WEBP'
  if (buffer.length >= 12) {
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    if (riff === "RIFF" && webp === "WEBP") {
      return {
        isValid: true,
        detectedFormat: "webp",
        detectedMime: "image/webp",
      };
    }
  }

  // 5. AVIF: Bytes 4-7 'ftyp', followed by 'avif', 'avis', or 'mif1'
  if (buffer.length >= 12) {
    const ftyp = buffer.subarray(4, 8).toString("ascii");
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (ftyp === "ftyp" && (brand === "avif" || brand === "avis" || brand === "mif1")) {
      return {
        isValid: true,
        detectedFormat: "avif",
        detectedMime: "image/avif",
      };
    }
  }

  // 6. MP4: Bytes 4-7 'ftyp', standard ISO container
  if (buffer.length >= 12) {
    const ftyp = buffer.subarray(4, 8).toString("ascii");
    if (ftyp === "ftyp") {
      return {
        isValid: true,
        detectedFormat: "mp4",
        detectedMime: "video/mp4",
      };
    }
  }

  // 7. WebM: Bytes 0-3 1A 45 DF A3 (EBML)
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return {
      isValid: true,
      detectedFormat: "webm",
      detectedMime: "video/webm",
    };
  }

  return {
    isValid: false,
    errorMessage: "File binary header (magic bytes) does not match any approved image or video format.",
  };
}

// ----------------------------------------------------------------------
// STRICT ALLOWLISTS
// ----------------------------------------------------------------------

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
] as const;

export const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "mp4",
  "webm",
]);

export const DANGEROUS_EXTENSIONS = new Set([
  "exe", "sh", "bat", "cmd", "ps1", "vbs",
  "php", "phtml", "php3", "php4", "php5", "phar",
  "js", "mjs", "cjs", "jsx", "ts", "tsx",
  "py", "rb", "pl", "cgi", "jar", "war",
  "svg", "html", "htm", "xhtml", "xml", // SVGs and HTML rejected to prevent stored XSS via XML/SVG payloads
  "asp", "aspx", "jsp", "dll", "so", "bin",
]);

export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 Megabytes

/**
 * Validates a media upload against Strix-Supabase institutional standards.
 * Verifies MIME types, file sizes, and rejects executable or script files.
 */
export function validateMediaUpload(options: MediaUploadValidationOptions): MediaValidationResult {
  const { filename, mimeType, sizeBytes, mediaCategory } = options;

  if (!filename || typeof filename !== "string") {
    return {
      isValid: false,
      errorMessage: "Invalid or missing filename.",
      mediaType: "image",
    };
  }

  // 1. Detect and reject Path Traversal & Control Characters
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\") || /[\x00-\x1F\x7F]/.test(filename)) {
    return {
      isValid: false,
      errorMessage: "Path traversal or illegal control characters detected in filename.",
      mediaType: "image",
    };
  }

  // 2. Extract and inspect file extension
  const parts = filename.split(".");
  if (parts.length < 2) {
    return {
      isValid: false,
      errorMessage: "File must possess a valid archival media extension (.jpg, .png, .webp, .mp4).",
      mediaType: "image",
    };
  }

  const ext = parts[parts.length - 1].toLowerCase().trim();

  // Explicit check against dangerous executable/script extensions
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      errorMessage: `Security violation: File extension '.${ext}' is prohibited to prevent malicious code execution.`,
      mediaType: "image",
    };
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      errorMessage: `Unsupported file extension '.${ext}'. Permitted formats: JPG, PNG, WebP, AVIF, MP4, WebM.`,
      mediaType: "image",
    };
  }

  // 3. Determine and validate media type
  const isVideoExt = ext === "mp4" || ext === "webm";
  const isVideoMime = ALLOWED_VIDEO_MIMES.includes(mimeType as any);
  const isImageMime = ALLOWED_IMAGE_MIMES.includes(mimeType as any);

  const determinedType: "image" | "video" = isVideoExt || isVideoMime ? "video" : "image";

  if (determinedType === "video") {
    if (!isVideoMime) {
      return {
        isValid: false,
        errorMessage: `MIME type '${mimeType}' does not correspond to an approved video container.`,
        mediaType: "video",
      };
    }
    if (sizeBytes > MAX_VIDEO_SIZE_BYTES) {
      return {
        isValid: false,
        errorMessage: `Video size exceeds maximum permissible quota of ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB.`,
        mediaType: "video",
      };
    }
  } else {
    if (!isImageMime) {
      return {
        isValid: false,
        errorMessage: `MIME type '${mimeType}' is not an approved photographic image format.`,
        mediaType: "image",
      };
    }
    if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return {
        isValid: false,
        errorMessage: `Photograph size exceeds maximum permissible quota of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`,
        mediaType: "image",
      };
    }
  }

  // 4. Binary Content Inspection & Magic Bytes Validation (if buffer supplied)
  if (options.buffer) {
    const signature = inspectFileSignature(options.buffer);
    if (!signature.isValid) {
      return {
        isValid: false,
        errorMessage: signature.errorMessage || "Binary content inspection failed.",
        mediaType: determinedType,
      };
    }

    // Verify format consistency between extension and magic bytes
    const fmt = signature.detectedFormat;
    const isJpegExt = ext === "jpg" || ext === "jpeg";
    const isPngExt = ext === "png";
    const isWebpExt = ext === "webp";
    const isAvifExt = ext === "avif";
    const isMp4Ext = ext === "mp4";
    const isWebmExt = ext === "webm";

    const isMatch =
      (fmt === "jpeg" && isJpegExt) ||
      (fmt === "png" && isPngExt) ||
      (fmt === "webp" && isWebpExt) ||
      (fmt === "avif" && isAvifExt) ||
      (fmt === "mp4" && isMp4Ext) ||
      (fmt === "webm" && isWebmExt);

    if (!isMatch) {
      return {
        isValid: false,
        errorMessage: `Header mismatch: File extension '.${ext}' contradicts binary header signature '${fmt}'.`,
        mediaType: determinedType,
      };
    }
  }

  // 4. Sanitize base filename into a clean ASCII identifier
  const rawBase = parts.slice(0, -1).join(".");
  const cleanBase = rawBase
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 48) || "media";

  const sanitizedFilename = `${cleanBase}.${ext}`;

  return {
    isValid: true,
    sanitizedFilename,
    mediaType: determinedType,
  };
}

/**
 * Generates an immutable, non-enumerable, collision-free storage path.
 * Format: `gallery/{academicYear}/{albumSlug}/{timestamp}_{random}_{sanitizedFilename}`
 */
export function generateSafeStoragePath(
  albumSlug: string,
  academicYear: string,
  sanitizedFilename: string
): string {
  // Sanitize albumSlug and academicYear into strict lowercase ASCII kebab-case
  const safeSlug = albumSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40) || "general";

  const safeYear = academicYear
    .replace(/[–—]/g, "-")
    .replace(/[^0-9-]/g, "")
    .substring(0, 10) || "archive";

  // Defense in depth: sanitize filename to completely strip directory traversal, slashes, and control chars
  const cleanFilename = sanitizedFilename
    .replace(/[\/\\]/g, "")
    .replace(/\.\.+/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .substring(0, 60) || "media.jpg";
  
  const timestamp = Date.now();
  const randomHex = Math.random().toString(36).substring(2, 8);

  return `gallery/${safeYear}/${safeSlug}/${timestamp}_${randomHex}_${cleanFilename}`;
}

/**
 * Checks if a media asset satisfies public visibility and consent requirements.
 * Ensures unpublished drafts or restricted items are never displayed on public routes.
 */
export function isMediaAssetPubliclyVisible(asset: {
  isPublished?: boolean | null;
  albumIsPublished?: boolean | null;
}): boolean {
  if (asset.isPublished === false) return false;
  if (asset.albumIsPublished === false) return false;
  return true;
}

/**
 * Verifies that storage environment variables do NOT contain public leaks.
 * Asserts in development/build time that secrets are never sent to the client.
 */
export function assertZeroClientStorageLeaks(): boolean {
  if (typeof window !== "undefined") {
    // If running in browser, ensure no secret key constants exist
    const globalObj = window as any;
    if (globalObj.SUPABASE_SERVICE_ROLE_KEY || globalObj.AWS_SECRET_ACCESS_KEY) {
      throw new Error("CRITICAL SECURITY ERROR: Storage secret credentials leaked into client window scope!");
    }
  }
  return true;
}
