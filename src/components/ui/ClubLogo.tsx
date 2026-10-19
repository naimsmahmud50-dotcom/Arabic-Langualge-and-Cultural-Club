/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/ui/ClubLogo.tsx
 * Purpose: Reusable official brand emblem and logo component for the Arabic Language & Cultural Club.
 * Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
 * Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
 * 
 * DESIGN INVARIANTS:
 * - Employs authentic club crest (golden heraldic shield, Alif torch flame, "ARABIC CLUB").
 * - Supports variants: 'crest' (transparent shield), 'full' (with collegiate subscript), 'badge' (framed crest), and 'original'.
 * - Uses next/image for automatic WebP/AVIF compression, responsive srcset, and zero layout shift.
 * - Explicit width/height prevent CLS and satisfy Core Web Vitals.
 * - Respects Arabic RTL layout and light/dark theme contrast.
 * - Strictly human vibe; zero AI emojis.
 */

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export interface ClubLogoProps {
  variant?: "crest" | "full" | "original" | "badge";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "custom";
  alt?: string;
  className?: string;
  showText?: boolean;
  src?: string;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-11 h-11",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
  "2xl": "w-32 h-32",
  custom: "",
};

const DIMENSION_MAP: Record<string, { width: number; height: number }> = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 44, height: 44 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
  "2xl": { width: 128, height: 128 },
  custom: { width: 44, height: 44 },
};

const SRC_MAP = {
  crest: "/images/logo/club-crest-transparent.png",
  full: "/images/logo/club-logo-full.png",
  original: "/images/logo/club-logo-original.png",
  badge: "/images/logo/club-crest-transparent.png",
};

export const ClubLogo: React.FC<ClubLogoProps> = ({
  variant = "crest",
  size = "md",
  alt = "Arabic Language & Cultural Club Crest - Kabi Nazrul Government College, Dhaka",
  className,
  showText = false,
  src,
  priority = false,
}) => {
  const imgSrc = src || SRC_MAP[variant] || SRC_MAP.crest;
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const dim = DIMENSION_MAP[size] || DIMENSION_MAP.md;

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-[8px] bg-[var(--bg-surface)] border border-[var(--brand-accent)]/30 shadow-xs p-1 select-none shrink-0 transition-transform hover:scale-[1.02]",
          sizeClasses,
          className
        )}
      >
        <Image
          src={imgSrc}
          alt={alt}
          width={dim.width}
          height={dim.height}
          priority={priority}
          className="w-full h-full object-contain filter drop-shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-3 shrink-0 select-none", className)}>
      <Image
        src={imgSrc}
        alt={alt}
        width={dim.width}
        height={dim.height}
        priority={priority}
        className={cn("object-contain shrink-0", sizeClasses)}
      />
      {showText && (
        <div className="flex flex-col text-start">
          <span className="font-bold text-sm sm:text-base leading-tight tracking-tight text-[var(--text-primary)]">
            Arabic Language & Cultural Club
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] leading-tight mt-0.5">
            Kabi Nazrul Government College, Dhaka
          </span>
          <span className="font-arabic text-[11px] sm:text-xs text-[var(--brand-accent)] font-medium leading-none mt-1" dir="rtl">
            نادي اللغة والثقافة العربية - كلية كابي نذرول الحكومية
          </span>
        </div>
      )}
    </div>
  );
};
