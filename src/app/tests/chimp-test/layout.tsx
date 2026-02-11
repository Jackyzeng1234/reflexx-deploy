import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Chimp Test - Memory Game with Strategy Tips | ReflexX',
  description: 'Test your working memory with the Chimp Test. Includes strategy tips for higher levels. Free online, global leaderboard. Try now!',
  keywords: ['chimp test', 'spatial memory test', 'working memory test', 'chimpanzee test', 'number memory game'],
  openGraph: {
    title: 'Chimp Test - Memory Game with Strategy Tips | ReflexX',
    description: 'Test your working memory with the Chimp Test. Includes strategy tips for higher levels.',
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
