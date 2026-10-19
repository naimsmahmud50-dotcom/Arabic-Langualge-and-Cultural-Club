/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/ui/SectionHeader.tsx
 * Module: Design System Shared UI Primitives
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/ui/SectionHeader.tsx
 * @description Standardized, high-elegance in-page Section Header with bilingual typography and ornamental divider.
 */

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "./Badge";
import { OrnamentalDivider } from "./OrnamentalDivider";

export interface SectionHeaderProps {
  title: string;
  titleAr?: string;
  subtitle?: string;
  badge?: string;
  align?: "center" | "start";
  showDivider?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  titleAr,
  subtitle,
  badge,
  align = "center",
  showDivider = true,
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "space-y-3 mb-10",
        isCenter ? "text-center max-w-3xl mx-auto" : "text-start max-w-3xl",
        className
      )}
    >
      {badge && (
        <div className={cn("flex", isCenter ? "justify-center" : "justify-start")}>
          <Badge variant="accent" size="sm" className="tracking-wider uppercase font-mono">
            {badge}
          </Badge>
        </div>
      )}

      {titleAr && (
        <p
          className="font-arabic text-xl sm:text-2xl text-[var(--brand-accent-text)] font-semibold leading-relaxed"
          dir="rtl"
        >
          {titleAr}
        </p>
      )}

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
        {title}
      </h2>

      {subtitle && (
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          {subtitle}
        </p>
      )}

      {showDivider && (
        <OrnamentalDivider
          variant="gold"
          size="md"
          className={cn("mt-4", isCenter ? "max-w-xs mx-auto" : "max-w-xs")}
        />
      )}
    </div>
  );
}
