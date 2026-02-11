import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Sequence Memory Test - Pattern Recall | ReflexX',
  description: 'Test your sequence memory and pattern recognition. Compare your score globally and track improvement. Free online memory test.',
  keywords: ['sequence memory test', 'spatial memory test', 'memory game', 'pattern memory test', 'brain training', 'pattern recall'],
  openGraph: {
    title: 'Sequence Memory Test - Pattern Recall | ReflexX',
    description: 'Test your sequence memory and pattern recognition. Compare your score globally.',
    type: 'website',
  },
};

const structuredData = createTestAppStructuredData({
  name: 'Sequence Memory Test',
  description: 'Test and improve your spatial memory with this sequence memory test. Remember tile patterns and challenge your brain. Measures visual-spatial working memory and engages hippocampus.',
  url: 'https://yourdomain.com/tests/sequence-memory',
  rating: 4.7,
  ratingCount: 1240,
});

export default function SequenceMemoryLayout({
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
