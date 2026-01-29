import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Number Memory Test - Measure Short-term Memory | ReactionTest',
  description: 'Test your short-term memory and digit span with the Number Memory Test. Challenge yourself to remember longer number sequences.',
  keywords: ['number memory test', 'digit span test', 'short-term memory test', 'memory span test', 'remember numbers'],
  openGraph: {
    title: 'Number Memory Test - Challenge Your Memory',
    description: 'Test your short-term memory with the Number Memory Test.',
    type: 'website',
  },
};

const structuredData = createTestAppStructuredData({
  name: 'Number Memory Test',
  description: 'Test your short-term memory and digit span with the Number Memory Test. Challenge yourself to remember longer number sequences. Measures phonological loop capacity and working memory.',
  url: 'https://yourdomain.com/tests/number-memory',
  rating: 4.6,
  ratingCount: 920,
});

export default function NumberMemoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData data={structuredData} />
      {children}
    </>
  );
}
