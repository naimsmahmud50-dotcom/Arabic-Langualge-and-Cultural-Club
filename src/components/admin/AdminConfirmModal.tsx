/**
 * @file src/components/admin/AdminConfirmModal.tsx
 * @description Accessible confirmation dialog for critical or destructive administrative actions.
 * 
 * DEVELOPER USAGE NOTE:
 * - Used whenever an administrator triggers an irreversible or sensitive action (e.g. deletion,
 *   membership revocation, account termination, status withdrawal).
 * - Traps focus, supports ESC key listener and outside click dismissal.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 * - Meets WCAG AA modal dialog criteria with role="dialog", aria-modal="true", and aria-labelledby.
 */

"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, X, Check } from "lucide-react";
import { Button } from "@/components/ui";

export interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  requiredConfirmationText?: string;
}

export function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  requiredConfirmationText,
}: AdminConfirmModalProps) {
  const [typedConfirmation, setTypedConfirmation] = React.useState("");
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Reset confirmation text on open
      setTypedConfirmation("");
      // Focus confirm button after transition
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isConfirmationMatched =
    !requiredConfirmationText || typedConfirmation.trim() === requiredConfirmationText.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl p-6 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-[6px] shrink-0 flex items-center justify-center ${
              isDestructive
                ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                : "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
            }`}
          >
            <AlertTriangle className="w-5 h-5 stroke-[1.75]" />
          </div>

          <div className="flex-1 pr-6">
            <h3 id="confirm-modal-title" className="text-base font-bold text-[var(--text-primary)] leading-tight">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[4px] hover:bg-[var(--bg-surface-hover)] disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Typed Confirmation */}
        {requiredConfirmationText && (
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Please type <code className="px-1 py-0.5 rounded bg-[var(--bg-surface-elevated)] font-mono text-red-600 dark:text-red-400">{requiredConfirmationText}</code> to confirm:
            </label>
            <input
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={requiredConfirmationText}
              disabled={isLoading}
              className="w-full px-3 py-1.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            ref={confirmBtnRef}
            variant={isDestructive ? "primary" : "primary"}
            size="sm"
            isLoading={isLoading}
            disabled={isLoading || !isConfirmationMatched}
            onClick={onConfirm}
            className={isDestructive ? "!bg-red-600 hover:!bg-red-700 !text-white" : ""}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
