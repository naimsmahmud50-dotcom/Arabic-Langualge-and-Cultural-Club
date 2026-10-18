/**
 * @file next.config.mjs
 * @description Next.js Production Configuration & HTTP Security Headers.
 * 
 * DEVELOPER NOTE:
 * Configures institutional security headers:
 * - Strict-Transport-Security (HSTS) with 2-year max-age, includeSubDomains, and preload.
 * - X-Frame-Options: DENY to prevent clickjacking in iframe embeds.
 * - X-Content-Type-Options: nosniff to stop MIME type confusion attacks.
 * - Referrer-Policy: strict-origin-when-cross-origin to protect user privacy.
 * - Permissions-Policy: Disables camera, microphone, geolocation, and browsing-topics.
 * - Content-Security-Policy: Baseline CSP restricting script execution and frame ancestors.
 */

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
