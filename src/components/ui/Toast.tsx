/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/ui/Toast.tsx
 * Module: Design System Shared UI Primitives
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/ui/Toast.tsx
 * @description Accessible universal Toast notification system and hook for admin and public feedback.
 */

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 5000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = {
    success: (message: string, title?: string) =>
      addToast({ type: "success", title: title || "Operation Succeeded", message }),
    error: (message: string, title?: string) =>
      addToast({ type: "error", title: title || "Action Failed", message }),
    info: (message: string, title?: string) =>
      addToast({ type: "info", title: title || "Notice", message }),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        toast: toastHelpers,
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 end-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto p-4 rounded-[6px] shadow-lg border flex items-start gap-3 transition-all animate-fade-in-up",
              t.type === "success" &&
                "bg-[var(--bg-surface)] border-[var(--state-success)] text-[var(--text-primary)]",
              t.type === "error" &&
                "bg-[var(--bg-surface)] border-[var(--state-error)] text-[var(--text-primary)]",
              t.type === "info" &&
                "bg-[var(--bg-surface)] border-[var(--brand-accent)] text-[var(--text-primary)]"
            )}
          >
            {t.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-[var(--state-success)] shrink-0 mt-0.5" />
            )}
            {t.type === "error" && (
              <AlertCircle className="w-5 h-5 text-[var(--state-error)] shrink-0 mt-0.5" />
            )}
            {t.type === "info" && (
              <Info className="w-5 h-5 text-[var(--brand-accent)] shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-0.5">
              {t.title && (
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {t.title}
                </p>
              )}
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
