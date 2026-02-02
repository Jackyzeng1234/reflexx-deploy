import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Pages 需要
  output: 'standalone', // 生成独立的构建
  reactStrictMode: true,
  images: {
    // Cloudflare 需要禁用优化或使用特定配置
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'axertwlypazfplajfwjt.supabase.co',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
