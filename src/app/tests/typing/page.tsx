import { Metadata } from 'next';
import TypingTest from '@/components/TypingTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Typing Speed Test - WPM & Accuracy | ReflexX',
  description: 'Test your typing speed in WPM and accuracy — type the given text as fast as you can. See your words per minute and errors. Free.',
  keywords: ['typing speed test', 'wpm test', 'typing test', 'words per minute', 'keyboard speed test', 'typing accuracy'],
  openGraph: {
    title: 'Typing Speed Test - WPM & Accuracy | ReflexX',
    description: 'Test your typing speed in WPM and accuracy. Type the given text as fast as you can. Free.',
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
