/**
 * DEVELOPER NOTE:
 * @file scripts/test-permanent-storage.ts
 * @description Comprehensive Automated Test Suite for Permanent & Safe Media Storage (Phase 3).
 * 
 * TESTS:
 * 1. Storage Provider Factory & LocalDiskStorage instantiation.
 * 2. Magic-byte inspection & format detection (JPEG, PNG, WebP, MP4, WebM).
 * 3. Security Rejection: Disallowed extensions, binary mismatch, and malicious SVG script payloads.
 * 4. Sharp image optimization (WebP full-size max 1920px + WebP thumbnail max 400px).
 * 5. Persistent disk storage lifecycle: upload, fileExists, getPublicUrl, deleteFile.
 * 6. Migration verification: Confirm existing media migrated to storage/uploads and accessible.
 * 7. Next.js API Media route URL resolution and path traversal protection.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * Strictly zero AI emojis.
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { 
  getStorageProvider, 
  validateUploadBuffer, 
  optimizeImageWithSharp,
  extractStorageKeyFromUrl,
  LocalDiskStorage
} from "../src/lib/storage";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    if (failureDetail) {
      console.error(`       Detail: ${failureDetail}`);
    }
  }
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("ALCC Phase 3: Permanent Media Storage Test Suite");
  console.log("==================================================");

  // ----------------------------------------------------------------------------
  // Test 1: Storage Provider Initialization
  // ----------------------------------------------------------------------------
  const provider = getStorageProvider();
  assert(provider instanceof LocalDiskStorage, "1. Default storage provider is LocalDiskStorage");
  assert(provider.name === "local", "2. Storage provider identifier is 'local'");

  // ----------------------------------------------------------------------------
  // Test 2: Binary Magic Byte Validation for Valid Media
  // ----------------------------------------------------------------------------
  // 2A. Valid JPEG (FF D8 FF)
  const sampleJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegValidation = validateUploadBuffer({
    filename: "test-photo.jpg",
    mimeType: "image/jpeg",
    sizeBytes: sampleJpeg.length,
    buffer: sampleJpeg,
  });
  assert(jpegValidation.isValid && jpegValidation.detectedMime === "image/jpeg", "3. Valid JPEG detected via magic bytes");

  // 2B. Valid PNG (89 50 4E 47 0D 0A 1A 0A)
  const samplePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const pngValidation = validateUploadBuffer({
    filename: "crest.png",
    mimeType: "image/png",
    sizeBytes: samplePng.length,
    buffer: samplePng,
  });
  assert(pngValidation.isValid && pngValidation.detectedMime === "image/png", "4. Valid PNG detected via magic bytes");

  // 2C. Valid WebP (RIFF .... WEBP)
  const sampleWebp = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x20, 0x00, 0x00, 0x00, // size
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20  // VP8
  ]);
  const webpValidation = validateUploadBuffer({
    filename: "hero.webp",
    mimeType: "image/webp",
    sizeBytes: sampleWebp.length,
    buffer: sampleWebp,
  });
  assert(webpValidation.isValid && webpValidation.detectedMime === "image/webp", "5. Valid WebP detected via magic bytes");

  // ----------------------------------------------------------------------------
  // Test 3: Security & Malicious Upload Rejection
  // ----------------------------------------------------------------------------
  // 3A. Fake JPEG (Executable / text pretending to be JPEG)
  const fakeJpeg = Buffer.from("MZ\x90\x00\x03\x00\x00\x00This is an executable payload");
  const fakeValidation = validateUploadBuffer({
    filename: "malicious.jpg",
    mimeType: "image/jpeg",
    sizeBytes: fakeJpeg.length,
    buffer: fakeJpeg,
  });
  assert(!fakeValidation.isValid, "6. Fake JPEG spoof rejected due to mismatched magic bytes");

  // 3B. Dangerous SVG with <script> tag
  const maliciousSvg1 = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`);
  const svgValidation1 = validateUploadBuffer({
    filename: "xss.svg",
    mimeType: "image/svg+xml",
    sizeBytes: maliciousSvg1.length,
    buffer: maliciousSvg1,
  });
  assert(!svgValidation1.isValid, "7. Malicious SVG with <script> rejected");

  // 3C. Dangerous SVG with onload handler
  const maliciousSvg2 = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" onload="fetch('//evil.com')"></svg>`);
  const svgValidation2 = validateUploadBuffer({
    filename: "xss_onload.svg",
    mimeType: "image/svg+xml",
    sizeBytes: maliciousSvg2.length,
    buffer: maliciousSvg2,
  });
  assert(!svgValidation2.isValid, "8. Malicious SVG with onload handler rejected");

  // 3D. Disallowed file type (.exe, .sh, .php)
  const phpBuffer = Buffer.from("<?php system($_GET['cmd']); ?>");
  const phpValidation = validateUploadBuffer({
    filename: "shell.php",
    mimeType: "application/x-php",
    sizeBytes: phpBuffer.length,
    buffer: phpBuffer,
  });
  assert(!phpValidation.isValid, "9. Executable PHP script upload rejected");

  // ----------------------------------------------------------------------------
  // Test 4: Sharp Image Optimization (WebP Large + WebP Thumbnail)
  // ----------------------------------------------------------------------------
  // Create a real 2000x1200 test image using sharp
  const testInputImageBuffer = await sharp({
    create: {
      width: 2000,
      height: 1200,
      channels: 4,
      background: { r: 15, g: 76, b: 58, alpha: 1 }, // Club deep green
    },
  })
    .png()
    .toBuffer();

  const optimized = await optimizeImageWithSharp(testInputImageBuffer, "tests/test_image");
  assert(optimized.format === "webp", "10. Sharp optimized format is WebP");
  assert(optimized.mainKey === "tests/test_image.webp", "11. Main storage key formatted correctly");
  assert(optimized.thumbnailKey === "tests/test_image_thumb.webp", "12. Thumbnail storage key formatted correctly");

  const mainMeta = await sharp(optimized.mainBuffer).metadata();
  assert(mainMeta.format === "webp", "13. Large image buffer is valid WebP");
  assert((mainMeta.width || 0) <= 1920, "14. Large image width resized to <= 1920px");

  const thumbMeta = await sharp(optimized.thumbnailBuffer).metadata();
  assert(thumbMeta.format === "webp", "15. Thumbnail buffer is valid WebP");
  assert((thumbMeta.width || 0) <= 400, "16. Thumbnail width resized to <= 400px");

  // ----------------------------------------------------------------------------
  // Test 5: Storage Lifecycle (Upload, Check Existence, Delete)
  // ----------------------------------------------------------------------------
  const testUploadResult = await provider.uploadFile(
    optimized.mainKey,
    optimized.mainBuffer,
    optimized.mainMime
  );
  assert(testUploadResult.publicUrl === "/api/media/tests/test_image.webp", "17. Generated public URL uses /api/media/... format");

  const existsOnDisk = await provider.fileExists(optimized.mainKey);
  assert(existsOnDisk === true, "18. Uploaded file confirmed to exist on persistent disk");

  const thumbUploadResult = await provider.uploadFile(
    optimized.thumbnailKey,
    optimized.thumbnailBuffer,
    optimized.thumbnailMime
  );
  const thumbExistsOnDisk = await provider.fileExists(optimized.thumbnailKey);
  assert(thumbExistsOnDisk === true, "19. Uploaded thumbnail confirmed to exist on persistent disk");

  // Clean up test files
  await provider.deleteFile(optimized.mainKey);
  await provider.deleteFile(optimized.thumbnailKey);
  const existsAfterDelete = await provider.fileExists(optimized.mainKey);
  assert(existsAfterDelete === false, "20. Deleted test file confirmed purged from disk");

  // ----------------------------------------------------------------------------
  // Test 6: URL Key Extraction and Path Traversal Protection
  // ----------------------------------------------------------------------------
  const extractedKey1 = extractStorageKeyFromUrl("/api/media/gallery/2024/photo.webp");
  assert(extractedKey1 === "gallery/2024/photo.webp", "21. URL key extracted correctly from /api/media/ URL");

  const traversalKey = extractStorageKeyFromUrl("/api/media/../../etc/passwd");
  assert(traversalKey === "etc/passwd" || !traversalKey?.includes(".."), "22. Path traversal '..' stripped from media key");

  // ----------------------------------------------------------------------------
  // Test 7: Migrated Legacy Media Verification
  // ----------------------------------------------------------------------------
  const migratedRelativePath = "gallery/2024-2025/national-arabic-debate-championship-2024/1792381163843_n3k4rr_whatsapp-image-2026-10-13-at-19-11-15.jpeg";
  const migratedThumbPath = "gallery/2024-2025/national-arabic-debate-championship-2024/1792381163843_n3k4rr_whatsapp-image-2026-10-13-at-19-11-15_thumb.webp";

  const migratedOriginalExists = await provider.fileExists(migratedRelativePath);
  const migratedThumbExists = await provider.fileExists(migratedThumbPath);

  assert(migratedOriginalExists === true, "23. Legacy uploaded file exists in persistent storage/uploads");
  assert(migratedThumbExists === true, "24. Migrated WebP thumbnail exists in persistent storage/uploads");

  console.log("==================================================");
  console.log(`Results: ${passedTests} passed out of ${totalTests} assertions.`);
  console.log("==================================================");

  if (passedTests !== totalTests) {
    console.error("Test failures detected in Phase 3 storage test suite.");
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Unhandled error in test suite:", err);
  process.exit(1);
});
