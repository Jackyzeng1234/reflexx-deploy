import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Sequence Memory Test - Train Your Memory | ReactionTest',
  description: 'Test and improve your spatial memory with this sequence memory test. Remember tile patterns and challenge your brain.',
  keywords: ['sequence memory test', 'spatial memory test', 'memory game', 'pattern memory test', 'brain training'],
  openGraph: {
    title: 'Sequence Memory Test - Train Your Memory',
    description: 'Test and improve your spatial memory with this sequence memory test.',
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
