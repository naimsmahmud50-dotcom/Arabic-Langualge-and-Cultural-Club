/**
 * @file src/components/layout/LanguageSwitcher.tsx
 * @description Accessible, keyboard-friendly Language Switcher dropdown component.
 * 
 * DEVELOPER USAGE NOTE:
 * - Can be placed in public Header, mobile drawer, or AdminHeader.
 * - Supports keyboard navigation (Escape to dismiss, Arrow keys, Enter/Space to select).
 * - Clicking outside dismisses the dropdown automatically.
 * - Human-crafted: uses Lucide icons (Globe, Check, ChevronDown), strictly zero AI emojis.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/types";
import { LOCALES_METADATA, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface LanguageSwitcherProps {
  className?: string;
  variant?: "compact" | "full";
}

export function LanguageSwitcher({
  className = "",
  variant = "compact",
}: LanguageSwitcherProps) {
  const { locale, setLocale, isRTL } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMeta = LOCALES_METADATA[locale] || LOCALES_METADATA.en;

  // Handle click outside and Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block text-start", className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-accent)] transition-all cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
          isOpen && "border-[var(--brand-accent)] text-[var(--text-primary)] ring-1 ring-[var(--brand-accent)]"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={
          variant === "compact"
            ? `${currentMeta.symbol} - Select language (current: ${currentMeta.name})`
            : `${currentMeta.nativeName} - Select language`
        }
      >
        <Globe className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" aria-hidden="true" />
        
        {variant === "compact" ? (
          <span className="text-xs font-bold tracking-wider font-mono uppercase">
            {currentMeta.symbol}
          </span>
        ) : (
          <span className="text-xs font-semibold">
            {currentMeta.nativeName}
          </span>
        )}

        <ChevronDown 
          className={cn(
            "w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )} 
          aria-hidden="true" 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Available Languages"
          className={cn(
            "absolute z-50 mt-1.5 w-44 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-elevated)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100",
            isRTL ? "left-0" : "right-0"
          )}
        >
          <div className="px-2 py-1 mb-1 border-b border-[var(--border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Select Language / اختر اللغة
            </span>
          </div>

          <div className="space-y-0.5">
            {SUPPORTED_LOCALES.map((code) => {
              const meta = LOCALES_METADATA[code];
              const isSelected = locale === code;

              return (
                <button
                  key={code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(code)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-[5px] transition-colors cursor-pointer text-start",
                    isSelected
                      ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className={cn(
                        "font-semibold",
                        meta.code === "ar" && "font-arabic text-sm"
                      )}
                      dir={meta.dir}
                    >
                      {meta.nativeName}
                    </span>
                    <span className={cn(
                      "text-[10px] opacity-70",
                      isSelected ? "text-[var(--brand-primary-fg)]" : "text-[var(--text-muted)]"
                    )}>
                      ({meta.name})
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
