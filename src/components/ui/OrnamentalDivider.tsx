/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/ui/OrnamentalDivider.tsx
 * Module: Design System Shared UI Primitives
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/ui/OrnamentalDivider.tsx
 * @description Scholarly Ornamental Divider featuring authentic Islamic geometric 8-point star rosette.
 */

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface OrnamentalDividerProps {
  className?: string;
  variant?: "gold" | "subtle" | "primary";
  size?: "sm" | "md" | "lg";
}

export function OrnamentalDivider({
  className,
  variant = "gold",
  size = "md",
}: OrnamentalDividerProps) {
  const colorMap = {
    gold: "text-[var(--brand-accent)]",
    subtle: "text-[var(--border-color)]",
    primary: "text-[var(--brand-primary)]",
  };

  const lineMap = {
    gold: "from-transparent via-[var(--brand-accent)] to-transparent",
    subtle: "from-transparent via-[var(--border-color)] to-transparent",
    primary: "from-transparent via-[var(--brand-primary)] to-transparent",
  };

  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-3 w-full my-4", className)}
    >
      <div className={cn("h-[1px] flex-1 bg-gradient-to-r", lineMap[variant])} />
      
      {/* Authentic 8-Point Geometric Star Rosette */}
      <svg
        className={cn(starSizes[size], colorMap[variant], "shrink-0 fill-current opacity-85")}
        viewBox="0 0 24 24"
      >
        <path d="M12 2L14.39 6.84L19.23 4.45L17.16 9.61L22 12L17.16 14.39L19.23 19.55L14.39 17.16L12 22L9.61 17.16L4.77 19.55L6.84 14.39L2 12L6.84 9.61L4.77 4.45L9.61 6.84L12 2Z" />
      </svg>

      <div className={cn("h-[1px] flex-1 bg-gradient-to-l", lineMap[variant])} />
    </div>
  );
}
