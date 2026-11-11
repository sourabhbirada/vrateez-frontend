import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*"],
    "/sitemap.xml": ["./content/blog/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
  async headers() {
    // Baseline security headers. The CSP only sets directives that cannot break
    // Razorpay, analytics or images: no framing by other sites, no plugins, no <base> hijack.
    const security = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests" },
    ];
    return [{ source: "/:path*", headers: security }];
  },
  async redirects() {
    return [
      // Seasonal pages that are over send visitors to the upcoming fasts and festivals.
      { source: "/diwali", destination: "/occasions", permanent: false },
      { source: "/product/diwali-gift-hamper", destination: "/occasions", permanent: false },
      { source: "/raksha-bandhan", destination: "/occasions", permanent: false },
      { source: "/product/raksha-bandhan-gift-hamper", destination: "/occasions", permanent: false },
      { source: "/order-tracking", destination: "/track-order", permanent: false },
    ];
  },
  async rewrites() {
    // Use environment variable for backend URL
    // Production (Render): https://vrateez-backend-v1.onrender.com
    // In Docker: http://backend:3301
    // In local dev: http://localhost:3301
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NEXT_PUBLIC_API_BASE_URL || "https://vrateez-backend-v1.onrender.com/api");
    const backendBaseUrl = backendUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    
    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
