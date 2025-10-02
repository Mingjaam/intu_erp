import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 배포를 위한 standalone 모드 (프로덕션에서만)
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  serverExternalPackages: [],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['localhost', 'nuvio.kr'],
  },
};

export default nextConfig;
