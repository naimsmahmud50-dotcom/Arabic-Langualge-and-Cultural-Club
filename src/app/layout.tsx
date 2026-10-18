/**
 * @file src/app/layout.tsx
 * @description Master Root Layout wrapping all public and administrative routes.
 * 
 * DEVELOPER USAGE NOTE:
 * - Integrates `<LanguageProvider>` for full English-Arabic-Bengali bilingual context.
 * - Injects a synchronous anti-FOUC inline script in `<head>` so the browser renders
 *   with correct `lang` and `dir="rtl"` attributes before the first frame paint.
 * - Preconnects Google Fonts loading Inter, Manrope, Noto Naskh Arabic, and Amiri.
 * - Human-crafted: strict zero AI emojis; clean semantic tokens.
 */

import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";

export const metadata: Metadata = {
  title: "Arabic Language & Cultural Club | نادي اللغة والثقافة العربية",
  description: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Synchronous Anti-FOUC script for Theme and Locale before initial paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Resolve Theme
                  var theme = localStorage.getItem('alc_theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Resolve Locale & Direction
                  var locale = localStorage.getItem('alc_locale');
                  if (!locale) {
                    var match = document.cookie.match(/(^| )alc_locale=([^;]+)/);
                    if (match) locale = match[2];
                  }
                  if (locale === 'ar') {
                    document.documentElement.lang = 'ar';
                    document.documentElement.dir = 'rtl';
                    document.documentElement.classList.add('rtl');
                  } else if (locale === 'bn') {
                    document.documentElement.lang = 'bn';
                    document.documentElement.dir = 'ltr';
                    document.documentElement.classList.remove('rtl');
                  } else {
                    document.documentElement.lang = 'en';
                    document.documentElement.dir = 'ltr';
                    document.documentElement.classList.remove('rtl');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
