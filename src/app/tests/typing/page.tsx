import { Metadata } from 'next';
import TypingTest from '@/components/TypingTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Typing Speed Test - WPM & Accuracy | ReflexX',
  description: 'Test your typing speed in WPM and accuracy. Free online typing test with detailed stats. Compare globally. Try now!',
  keywords: ['typing speed test', 'wpm test', 'typing test', 'words per minute', 'keyboard speed test', 'typing accuracy'],
  openGraph: {
    title: 'Typing Speed Test - WPM & Accuracy | ReflexX',
    description: 'Test your typing speed in WPM and accuracy. Free online typing test.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/typing',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Typing Speed Test',
  description: 'Test your typing speed and accuracy in words per minute (WPM). Type the given text as fast and accurately as possible. Professional-grade tool for measuring keyboard speed and accuracy for programmers, writers, and professionals.',
  url: 'https://reflexx.uk/tests/typing',
  rating: 4.8,
  ratingCount: 1120,
});

export default function TypingTestPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <TypingTest />
    </>
  );
}
