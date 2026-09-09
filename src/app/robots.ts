import { MetadataRoute } from 'next';

// 生产默认域名；本地开发可用 NEXT_PUBLIC_SITE_URL 覆盖
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reflexx.uk';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*', // 适用于所有搜索引擎爬虫
        allow: '/',     // 允许爬取所有内容
        disallow: [
          // 禁止爬取API路由
          '/api/',

          // 禁止爬取认证相关页面
          '/auth/',

          // 禁止爬取个人资料页面（包含用户私密信息）
          '/profile',
        ],
      },
      // 特殊规则：Google爬虫
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/', '/profile'],
      },
    ],

    // 站点地图位置 - 告诉搜索引擎在哪里找到sitemap
    sitemap: `${BASE_URL}/sitemap.xml`,

    // 可选：设置爬取延迟（秒）
    // crawlDelay: 1,

    // 可选：网站首选版本
    // host: BASE_URL,
  };
}
