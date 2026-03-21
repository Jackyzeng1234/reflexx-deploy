/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用压缩
  compress: true,
  
  // 图片优化
  images: {
    domains: [
      'reflexx.uk',
      'axertwlypazfplajfwjt.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  
  // 生产环境优化
  swcMinify: true,
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
