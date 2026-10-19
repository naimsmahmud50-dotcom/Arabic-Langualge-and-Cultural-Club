/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/layout.tsx
 * Updated root SEO metadata, page title templates, and branding to Kabi Nazrul Government College, Dhaka.
 * Strictly human vibe; zero AI emojis.
 *
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
import { Inter, Manrope, Amiri, Noto_Naskh_Arabic, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettings } from "@/lib/settings";
import { ToastProvider } from "@/components/ui";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  preload: true,
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["700"],
  display: "swap",
  variable: "--font-amiri",
  preload: false,
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
  variable: "--font-noto-arabic",
  preload: false,
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-bengali",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteUrl = settings.canonical_url || process.env.NEXT_PUBLIC_SITE_URL || "https://arabicclub.org";
  const clubName = settings.club_name_en || "Arabic Language & Cultural Club, Kabi Nazrul Govt. College, Dhaka";
  const shortName = settings.club_short_name_en || "Arabic Language & Cultural Club";
  const collegeName = settings.college_name_en || "Kabi Nazrul Govt. College, Dhaka";
  const defaultTitle = `${shortName} | ${collegeName}`;
  const templateTitle = `%s | ${shortName}, ${collegeName}`;
  const description = settings.meta_description_en || settings.club_tagline_en || "Preserving Classical Arabic Heritage, Advancing Eloquence, Cultivating Scholarly Leadership at Kabi Nazrul Government College, Dhaka.";
  const ogImage = settings.og_image_url || "/og-image.jpg";

  const keywords = settings.meta_keywords
    ? settings.meta_keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
        "Arabic Language",
        "Cultural Club",
        "Arabic Literature",
        "Calligraphy",
        "Classical Arabic",
        "Scholarly Club",
        "Islamic Heritage",
        "Arabic Learning",
        "Arabic Eloquence",
        "Kabi Nazrul Government College",
        "KNGC Arabic Club",
      ];

  let metadataBaseUrl: URL;
  try {
    metadataBaseUrl = new URL(siteUrl);
  } catch {
    metadataBaseUrl = new URL("https://arabicclub.org");
  }

  return {
    metadataBase: metadataBaseUrl,
    title: {
      default: defaultTitle,
      template: templateTitle,
    },
    description,
    keywords,
    authors: [{ name: clubName }],
    creator: clubName,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      siteName: clubName,
      title: defaultTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: clubName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${amiri.variable} ${notoNaskhArabic.variable} ${notoBengali.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        {/* WCAG 2.2 AA Keyboard Skip-to-Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--brand-primary)] focus:text-[var(--brand-primary-fg)] focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] transition-all"
        >
          Skip to main content
        </a>
        <LanguageProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
