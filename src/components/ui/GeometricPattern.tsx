import React from "react";
import { cn } from "@/lib/utils/cn";

export interface GeometricPatternProps extends React.SVGProps<SVGSVGElement> {
  opacity?: number;
}

/**
 * Classical 8-fold Islamic Geometric Star Tile
 * Refined SVG motif suitable for subtle borders, watermarks, and editorial dividers.
 */
export function GeometricPattern({ className, opacity = 0.08, ...props }: GeometricPatternProps) {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none text-[var(--brand-primary)] dark:text-[var(--brand-accent)]", className)}
      style={{ opacity }}
      {...props}
    >
      <defs>
        <pattern
          id="alc-islamic-star"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* Central 8-Point Star Interlace */}
          <polygon
            points="30,10 36,24 50,30 36,36 30,50 24,36 10,30 24,24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          {/* Surrounding Geometric Diamonds */}
          <rect
            x="20"
            y="20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            transform="rotate(45 30 30)"
          />
          {/* Subtle Octagonal Corner Bounds */}
          <circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="60" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="0" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="60" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#alc-islamic-star)" />
    </svg>
  );
}

/**
 * Editorial Decorative Divider with Arabic Calligraphic Star Accent
 */
export function HeritageDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center my-6 gap-3", className)}>
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-[var(--brand-accent)] flex-1" />
      <div className="w-2.5 h-2.5 rotate-45 border border-[var(--brand-accent)] bg-[var(--bg-surface)] shrink-0" />
      <div className="h-px bg-gradient-to-l from-transparent via-[var(--border-color)] to-[var(--brand-accent)] flex-1" />
    </div>
  );
}
