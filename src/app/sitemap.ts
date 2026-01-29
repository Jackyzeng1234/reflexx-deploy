import { MetadataRoute } from 'next';

// 🔧 请将此URL替换为你的实际域名
// 开发环境：http://localhost:3000
// 生产环境：https://yourdomain.com
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return [
    // 首页 - 最高优先级
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },

    // 测试列表页
    {
      url: `${BASE_URL}/tests`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },

    // ===== 反应时间测试页面 =====
    {
      url: `${BASE_URL}/tests/simple-reaction`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    {
      url: `${BASE_URL}/tests/auditory-reaction`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    {
      url: `${BASE_URL}/tests/choice-reaction`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // ===== 速度测试页面 =====
    {
      url: `${BASE_URL}/tests/click-speed`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    {
      url: `${BASE_URL}/tests/typing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // ===== 记忆测试页面 =====
    {
      url: `${BASE_URL}/tests/sequence-memory`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    {
      url: `${BASE_URL}/tests/chimp-test`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    {
      url: `${BASE_URL}/tests/number-memory`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // ===== 认知测试页面 =====
    {
      url: `${BASE_URL}/tests/stroop-test`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // ===== 功能页面 =====
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },

    {
      url: `${BASE_URL}/stats`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },

    {
      url: `${BASE_URL}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },

    {
      url: `${BASE_URL}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
