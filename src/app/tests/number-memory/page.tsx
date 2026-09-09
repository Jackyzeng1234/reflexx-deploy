import { Metadata } from 'next';
import NumberMemoryTest from '@/components/NumberMemoryTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Number Memory Test - Digit Span | ReflexX',
  description: 'Test your digit span — remember a number that flashes on screen, then type it back. It grows longer each round. Free, no signup.',
  keywords: ['number memory test', 'digit span test', 'memory test', 'short term memory', 'number recall'],
  openGraph: {
    title: 'Number Memory Test - Digit Span | ReflexX',
    description: 'Test your digit span — remember a number and type it back. It grows longer each round. Free.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/number-memory',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Number Memory Test',
  description: 'Test your short-term digit memory capacity. A number flashes on screen and you must remember it, then type it back. The number grows longer with each correct answer. Professional-grade tool for measuring digit span and short-term memory.',
  url: 'https://reflexx.uk/tests/number-memory',
  rating: 4.8,
  ratingCount: 1320,
});

export default function NumberMemoryTestPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <NumberMemoryTest />
    </>
  );
}
