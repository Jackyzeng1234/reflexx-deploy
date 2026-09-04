import { Metadata } from 'next';
import StroopTest from '@/components/StroopTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Stroop Test - Cognitive Flexibility | ReflexX',
  description: 'Test your cognitive flexibility and inhibition control. Free online stroop test. Compare globally. Try now!',
  keywords: ['stroop test', 'cognitive flexibility', 'inhibition control', 'attention test', 'cognitive test'],
  openGraph: {
    title: 'Stroop Test - Cognitive Flexibility | ReflexX',
    description: 'Test your cognitive flexibility and inhibition control. Free online stroop test.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/stroop-test',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Stroop Test',
  description: 'Test your cognitive flexibility and inhibition control with the classic Stroop effect. Name the color of the word, not the word itself. Professional-grade tool for measuring attention and cognitive control.',
  url: 'https://reflexx.uk/tests/stroop-test',
  rating: 4.8,
  ratingCount: 760,
});

export default function StroopTestPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <StroopTest />
    </>
  );
}
