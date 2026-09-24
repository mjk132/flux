import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep serverless/runtime-only packages external so native & ws modules
  // load correctly in the Node (Vercel) runtime instead of being bundled.
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
    "@vercel/blob",
  ],
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
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
