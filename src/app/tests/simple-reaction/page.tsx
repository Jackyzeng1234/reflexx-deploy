import { Metadata } from 'next';
import SimpleReactionTest from '@/components/SimpleReactionTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Simple Reaction Test - Visual Reflex Speed | ReflexX',
  description: 'Test your visual reaction time in milliseconds. Get your global ranking and percentile. Free, no signup. Average: 250-300ms.',
  keywords: ['simple reaction test', 'reaction time', 'reflex test', 'visual reaction test', 'visual reflex speed'],
  openGraph: {
    title: 'Simple Reaction Test - Visual Reflex Speed | ReflexX',
    description: 'Test your visual reaction time in milliseconds. Get your global ranking and percentile.',
    type: 'website',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Simple Reaction Test',
  description: 'Test your visual reaction time with this simple test. Click when the screen turns green and measure your reflexes in milliseconds. Professional-grade accuracy for measuring human reaction speed.',
  url: 'https://yourdomain.com/tests/simple-reaction',
  rating: 4.8,
  ratingCount: 1250,
});

export default function SimpleReactionPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <SimpleReactionTest />
    </>
  );
}
