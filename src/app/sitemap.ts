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

    // ===== 博客页面 =====
    {
      url: `${BASE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // 博客文章列表
    {
      url: `${BASE_URL}/blog/reaction-time-test-what-is-and-why-it-matters`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/average-reaction-time-by-age-global-data-study`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/how-to-improve-aim-accuracy-fps-games-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/chimp-test-working-memory-brain-training`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/number-memory-test-techniques-brain-training`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/sequence-memory-test-brain-plasticity-neuroscience`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/stroop-test-cognitive-flexibility-inhibitory-control`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/click-speed-test-cps-mouse-dpi-settings`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/typing-speed-test-wpm-accuracy-improvement-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/choice-reaction-time-test-decision-making-speed`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/auditory-vs-visual-reaction-time-comparison`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/reaction-time-training-30-day-improvement-program`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/esports-pro-vs-casual-gamer-reaction-time-study`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/factors-affecting-reaction-time-age-genetics-caffeine`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/brain-training-games-effective-or-waste-time`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // 测试列表页（已隐藏，但保留在sitemap中）
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

    {
      url: `${BASE_URL}/tests/aim-trainer`,
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

    {
      url: `${BASE_URL}/tests/sbti`,
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
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    {
      url: `${BASE_URL}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },

    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },

    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },

    {
      url: `${BASE_URL}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
