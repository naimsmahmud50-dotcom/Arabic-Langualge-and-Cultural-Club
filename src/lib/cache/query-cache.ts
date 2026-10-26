/**
 * DEVELOPER NOTE:
 * File: src/lib/cache/query-cache.ts
 * Module: Resilient Query Caching Layer
 * Purpose: Wraps database queries with Next.js `unstable_cache` for sub-10ms response times
 *          in production, while gracefully falling back to direct queries in CLI scripts and test runners.
 * Strictly human vibe; zero AI emojis.
 */

import { unstable_cache } from "next/cache";

export function createCachedQuery<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options?: { revalidate?: number | false; tags?: string[] }
): T {
  let cached: ReturnType<typeof unstable_cache> | null = null;
  try {
    cached = unstable_cache(fn, keyParts, options);
  } catch {
    return fn;
  }

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (cached) {
      try {
        return await cached(...args);
      } catch {
        // Fallback for CLI/unit test execution outside Next.js server context
        return await fn(...args);
      }
    }
    return await fn(...args);
  }) as T;
}
