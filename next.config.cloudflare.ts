import type { NextConfig } from 'next';

// Cloudflare Pages 静态导出配置
// 注意：静态导出不支持 API Routes（如 /api/contact）

const nextConfig: NextConfig = {
  output: 'export', // 启用静态导出
  images: {
    unoptimized: true, // Cloudflare Pages 需要
  },
  trailingSlash: true, // URL 添加尾部斜杠
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
