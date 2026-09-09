import { Metadata } from 'next';
import ChimpTest from '@/components/ChimpTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Chimp Test - Working Memory Challenge | ReflexX',
  description: 'Test your working memory by clicking numbers in ascending order, just like the famous chimp study. See how many you can remember. Free.',
  keywords: ['chimp test', 'working memory test', 'memory test', 'number memory', 'cognitive test'],
  openGraph: {
    title: 'Chimp Test - Working Memory Challenge | ReflexX',
    description: 'Test your working memory by clicking numbers in ascending order, just like the famous chimp study.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/chimp-test',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Chimp Test',
  description: 'Test your working memory by clicking numbers in ascending order. Numbers appear on screen and then hide. Your job is to remember their positions and click them from smallest to largest. Professional-grade tool for measuring working memory.',
  url: 'https://reflexx.uk/tests/chimp-test',
  rating: 4.9,
  ratingCount: 1560,
});

export default function ChimpTestPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <ChimpTest />
    </>
  );
}
