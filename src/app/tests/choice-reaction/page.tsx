import { Metadata } from 'next';
import ChoiceReactionTest from '@/components/ChoiceReactionTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Choice Reaction Test - Decision Speed | ReflexX',
  description: 'Test your decision-making reaction speed with multiple options. Free online choice reaction test. Compare globally. Try now!',
  keywords: ['choice reaction test', 'reaction time test', 'decision speed test', 'reflex test', 'choice reaction time'],
  openGraph: {
    title: 'Choice Reaction Test - Decision Speed | ReflexX',
    description: 'Test your decision-making reaction speed with multiple options. Free online choice reaction test.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/choice-reaction',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Choice Reaction Test',
  description: 'Test your decision-making reaction speed with multiple options. Wait for a target arrow to appear and press the corresponding arrow key as fast as you can. Professional-grade tool for measuring choice reaction time.',
  url: 'https://reflexx.uk/tests/choice-reaction',
  rating: 4.8,
  ratingCount: 1040,
});

export default function ChoiceReactionPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <ChoiceReactionTest />
    </>
  );
}
