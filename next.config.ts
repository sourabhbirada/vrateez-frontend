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
  async redirects() {
    return [
      { source: "/raksha-bandhan", destination: "/diwali", permanent: true },
      { source: "/product/raksha-bandhan-gift-hamper", destination: "/product/diwali-gift-hamper", permanent: true },
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
