import { Metadata } from 'next';
import SequenceMemoryTest from '@/components/SequenceMemoryTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Sequence Memory Test - Remember Patterns | ReflexX',
  description: 'Test your visual memory by repeating tile sequences. Free online sequence memory test. Compare globally. Try now!',
  keywords: ['sequence memory test', 'memory test', 'visual memory test', 'pattern memory', 'short term memory'],
  openGraph: {
    title: 'Sequence Memory Test - Remember Patterns | ReflexX',
    description: 'Test your visual memory by repeating tile sequences. Free online sequence memory test.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/sequence-memory',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Sequence Memory Test',
  description: 'Test your visual memory by remembering and repeating the sequence of tiles that light up. Each round adds one more tile to the sequence. Professional-grade tool for measuring short-term visual memory.',
  url: 'https://reflexx.uk/tests/sequence-memory',
  rating: 4.8,
  ratingCount: 890,
});

export default function SequenceMemoryPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <SequenceMemoryTest />
    </>
  );
}
