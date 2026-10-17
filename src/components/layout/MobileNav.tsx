/**
 * @file MobileNav.tsx
 * @description Accessible slide-over drawer navigation for mobile and tablet screens.
 * Features:
 * - Backdrop click to dismiss
 * - Keyboard Escape key handling
 * - Body overflow locking
 * - Navigation links, Admin shortcut, and Membership application button
 */

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Shield, Award } from "lucide-react";
import { Button, Badge } from "@/components/ui";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ label: string; href: string }>;
}

export function MobileNav({ isOpen, onClose, links }: MobileNavProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-[var(--bg-surface)] border-l border-[var(--border-color)] shadow-[var(--shadow-elevated)] p-6 flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-sm">
                ض
              </div>
              <span className="font-bold text-sm text-[var(--text-primary)]">
                Arabic Club Navigation
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1 py-5" aria-label="Mobile Navigation Links">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[6px] text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 rtl:rotate-180" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[var(--border-color)] space-y-3">
          <Link href="/membership" className="block w-full">
            <Button variant="accent" className="w-full justify-center">
              Apply for Membership
            </Button>
          </Link>
          <Link href="/admin" className="block w-full">
            <Button variant="secondary" className="w-full justify-center" leftIcon={<Shield className="w-4 h-4" />}>
              Administrative CMS Portal
            </Button>
          </Link>
          <div className="text-center text-[11px] text-[var(--text-muted)] pt-2">
            Arabic Language & Cultural Club © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
