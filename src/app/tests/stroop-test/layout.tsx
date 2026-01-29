import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Stroop Test - Measure Cognitive Flexibility | ReactionTest',
  description: 'Test your cognitive flexibility and inhibitory control with the Stroop Test. Challenge your brain processing speed.',
  keywords: ['stroop test', 'cognitive flexibility test', 'inhibitory control test', 'color word test', 'brain processing test'],
  openGraph: {
    title: 'Stroop Test - Measure Your Cognitive Abilities',
    description: 'Test your cognitive flexibility and inhibitory control.',
    type: 'website',
  },
};

const structuredData = createTestAppStructuredData({
  name: 'Stroop Test',
  description: 'Test your cognitive flexibility and inhibitory control with the Stroop Test. Challenge your brain processing speed and ability to suppress automatic responses. Evaluates executive function.',
  url: 'https://yourdomain.com/tests/stroop-test',
  rating: 4.7,
  ratingCount: 1100,
});

export default function StroopTestLayout({
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
