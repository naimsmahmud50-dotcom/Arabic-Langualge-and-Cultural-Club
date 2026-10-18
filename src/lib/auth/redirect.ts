/**
 * @file src/lib/auth/redirect.ts
 * @description Safe internal redirect validation utility to prevent Open Redirect attacks.
 * 
 * DEVELOPER NOTE:
 * Open Redirect vulnerabilities occur when user-controlled query parameters (e.g., `?next=...` or `?redirect=...`)
 * are blindly passed to redirect handlers, allowing attackers to trick users into navigating to external phishing sites.
 * 
 * This module enforces:
 * 1. Rejection of absolute URLs with schemes (`https://`, `http://`, `javascript:`, `data:`, etc.).
 * 2. Rejection of protocol-relative URLs (`//evil.com`).
 * 3. Rejection of backslash-based URL confusion (`\\evil.com` or `/\evil.com`).
 * 4. Requirement of a single leading slash (`/`) followed by allowed relative path characters.
 * 5. Safe fallback to default internal routes (e.g., `/admin`).
 */

/**
 * Validates whether a given URL is a strictly safe internal relative redirect path.
 * 
 * @param url The raw candidate URL string to evaluate
 * @returns boolean True if safe to redirect internally, false otherwise
 */
export function isSafeInternalRedirect(url: unknown): boolean {
  if (typeof url !== "string") {
    return false;
  }

  const trimmed = url.trim();

  // Empty string is not a valid destination
  if (!trimmed) {
    return false;
  }

  // Must begin with a single forward slash
  if (!trimmed.startsWith("/")) {
    return false;
  }

  // Protocol-relative URLs (`//example.com`) are forbidden
  if (trimmed.startsWith("//")) {
    return false;
  }

  // Windows/browser backslash normalization bypasses (`/\example.com` or `\\`) are forbidden
  if (trimmed.includes("\\")) {
    return false;
  }

  // Explicit URL schemes (`http:`, `https:`, `javascript:`, `data:`) are forbidden
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return false;
  }

  // Control characters and newlines are forbidden (header injection protection)
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return false;
  }

  try {
    // Parse against a dummy base origin to verify hostname/origin isolation
    const parsed = new URL(trimmed, "http://institutional-local.internal");
    
    // Ensure origin was not spoofed and hostname remains internal dummy
    if (parsed.origin !== "http://institutional-local.internal") {
      return false;
    }

    // Ensure pathname still starts with '/' and does not contain protocol-relative artifacts
    if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes and returns a safe internal redirect path.
 * If the provided candidate URL is invalid or unsafe, returns the fallback path.
 * 
 * @param candidate The user-supplied or query-derived redirect target
 * @param defaultPath The safe fallback route (default: "/admin")
 * @returns string Sanitized safe relative redirect path
 */
export function getSafeInternalRedirect(candidate: unknown, defaultPath: string = "/admin"): string {
  if (isSafeInternalRedirect(candidate)) {
    return (candidate as string).trim();
  }
  return defaultPath;
}
