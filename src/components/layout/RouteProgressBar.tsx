/**
 * DEVELOPER NOTE:
 * File: src/components/layout/RouteProgressBar.tsx
 * Module: Instant Route Navigation Visual Indicator
 * Purpose: Provides a sleek, non-blocking 2.5px collegiate gold/emerald top progress bar
 *          on client-side page transitions, replacing jarring full-page screen wipes.
 * Strictly human vibe; zero AI emojis.
 */

"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress and smoothly fade out upon route arrival
  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const hideTimeout = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(hideTimeout);
    }
  }, [pathname, searchParams]);

  // Intercept client navigation clicks
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore hash anchors, external links, email/tel, file downloads, or new-tab clicks
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return;
      }

      // Verify same-origin internal destination
      try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(href, window.location.href);

        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
        ) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

          setIsVisible(true);
          setProgress(25);

          // Simulate organic incremental progress
          timerRef.current = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 88) {
                if (timerRef.current) clearInterval(timerRef.current);
                return 88;
              }
              const step = prev < 50 ? 16 : prev < 75 ? 8 : 3;
              return Math.min(88, prev + step);
            });
          }, 120);

          // Safety reset: if navigation is aborted or takes too long, auto-dismiss after 6 seconds
          resetTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            setProgress(0);
            if (timerRef.current) clearInterval(timerRef.current);
          }, 6000);
        }
      } catch {
        // Safe fall-through on invalid URLs
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none select-none"
      role="progressbar"
      aria-label="Page navigation progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-accent)] to-[#D4AF37] shadow-[0_0_8px_rgba(177,138,74,0.6)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionDuration: progress === 100 ? "200ms" : progress === 25 ? "80ms" : "180ms",
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  );
}

export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
