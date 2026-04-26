import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "**/*": [
      "node_modules/@swc/core-linux-x64-gnu",
      "node_modules/@swc/core-linux-x64-musl",
      "node_modules/@swc/core-darwin-arm64",
      "node_modules/@swc/core-darwin-x64",
      "node_modules/@prisma/client/libquery_engine-darwin*.dylib.node",
      "node_modules/@prisma/client/libquery_engine-windows*.node",
      "node_modules/@prisma/client/query_engine-*"
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
