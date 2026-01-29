import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Chimp Test - Measure Spatial Memory | ReactionTest',
  description: 'Test your spatial working memory with the Chimp Test. Remember number locations and challenge your memory skills.',
  keywords: ['chimp test', 'spatial memory test', 'working memory test', 'chimpanzee test', 'number memory game'],
  openGraph: {
    title: 'Chimp Test - Measure Your Spatial Memory',
    description: 'Test your spatial working memory with the Chimp Test.',
    type: 'website',
  },
};

const structuredData = createTestAppStructuredData({
  name: 'Chimp Test',
  description: 'Test your spatial working memory with the Chimp Test. Remember number locations and challenge your cognitive abilities. Measures visuospatial working memory and numerical-visual association.',
  url: 'https://yourdomain.com/tests/chimp-test',
  rating: 4.5,
  ratingCount: 780,
});

export default function ChimpTestLayout({
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
