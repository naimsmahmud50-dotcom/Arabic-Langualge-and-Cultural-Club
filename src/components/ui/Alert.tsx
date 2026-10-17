import React from "react";
import { cn } from "@/lib/utils/cn";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    error: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
  };

  const variantStyles = {
    info: "bg-[var(--bg-surface-elevated)] border-[var(--border-color)] text-[var(--text-primary)]",
    success: "bg-emerald-500/10 border-emerald-500/25 text-emerald-950 dark:text-emerald-200",
    warning: "bg-amber-500/10 border-amber-500/25 text-amber-950 dark:text-amber-200",
    error: "bg-rose-500/10 border-rose-500/25 text-rose-950 dark:text-rose-200",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3.5 p-4 rounded-[6px] border text-sm leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 leading-snug">{title}</h5>}
        <div className="text-[var(--text-secondary)] opacity-95">{children}</div>
      </div>
    </div>
  );
}
