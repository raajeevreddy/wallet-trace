/** @type {import('next').NextConfig} */

// ─── Security Headers ─────────────────────────────────────────────────────────

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js requires unsafe-eval in dev; inline scripts needed for hydration
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // All external calls are server-side; browser only talks to our own origin
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  // Enforce HTTPS for 2 years (including sub-domains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Stop MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Restrict referrer info sent to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Content Security Policy
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  // DNS prefetch
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// ─── Next.js Config ───────────────────────────────────────────────────────────

const nextConfig = {
  serverExternalPackages: ["alchemy-sdk"],

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
