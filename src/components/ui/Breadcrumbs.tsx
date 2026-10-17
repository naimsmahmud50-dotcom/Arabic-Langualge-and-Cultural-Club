import React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs text-[var(--text-muted)] select-none", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <a
            href="/"
            className="flex items-center gap-1 hover:text-[var(--brand-accent)] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </a>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-[var(--border-color)] shrink-0 rtl:rotate-180" />
            {item.isCurrent || !item.href ? (
              <span className="font-medium text-[var(--text-primary)]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="hover:text-[var(--brand-accent)] transition-colors"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
