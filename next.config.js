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

  // 添加重定向配置
  async redirects() {
    return [
      // www 重定向到非 www (301 永久重定向)
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'www.reflexx.uk',
          },
        ],
        destination: 'https://reflexx.uk/:path*',
        statusCode: 301,
      },
    ]
  },
}

module.exports = nextConfig
