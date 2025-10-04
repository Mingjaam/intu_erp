import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
