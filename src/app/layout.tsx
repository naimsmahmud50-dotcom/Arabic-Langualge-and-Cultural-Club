/**
 * @file src/app/layout.tsx
 * @description Master Root Layout wrapping all public and administrative routes.
 * 
 * DEVELOPER USAGE NOTE:
 * - Integrates `<LanguageProvider>` for full English-Arabic-Bengali bilingual context.
 * - Injects a synchronous anti-FOUC inline script in `<head>` so the browser renders
 *   with correct `lang` and `dir="rtl"` attributes before the first frame paint.
 * - Emits Schema.org JSON-LD structured data graph via `<JsonLd />`.
 * - Provides accessible skip-to-content anchor link (#main-content) for keyboard navigation.
 * - Preconnects Google Fonts loading Inter, Manrope, Noto Naskh Arabic, and Amiri.
 * - Human-crafted: strictly zero AI emojis; clean semantic tokens.
 */

import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { JsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arabicclub.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arabic Language & Cultural Club | نادي اللغة والثقافة العربية",
    template: "%s | Arabic Language & Cultural Club",
  },
  description: "Preserving Classical Arabic Heritage, Advancing Eloquence, Cultivating Scholarly Leadership.",
  keywords: [
    "Arabic Language",
    "Cultural Club",
    "Arabic Literature",
    "Calligraphy",
    "Classical Arabic",
    "Scholarly Club",
    "Islamic Heritage",
    "Arabic Learning",
    "Arabic Eloquence",
  ],
  authors: [{ name: "Arabic Language & Cultural Club" }],
  creator: "Arabic Language & Cultural Club",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Arabic Language & Cultural Club",
    title: "Arabic Language & Cultural Club | نادي اللغة والثقافة العربية",
    description: "Preserving Classical Arabic Heritage, Advancing Eloquence, Cultivating Scholarly Leadership.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Arabic Language & Cultural Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arabic Language & Cultural Club | نادي اللغة والثقافة العربية",
    description: "Preserving Classical Arabic Heritage, Advancing Eloquence, Cultivating Scholarly Leadership.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        {/* Schema.org Structured Data Graph */}
        <JsonLd />
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
        {/* WCAG 2.2 AA Keyboard Skip-to-Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--brand-primary)] focus:text-[var(--brand-primary-fg)] focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] transition-all"
        >
          Skip to main content
        </a>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
