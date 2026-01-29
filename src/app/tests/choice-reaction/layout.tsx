import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Choice Reaction Test - Measure Decision Speed | ReactionTest',
  description: 'Test your choice reaction time and decision-making speed. Measure cognitive processing with multiple choice options.',
  keywords: ['choice reaction test', 'decision making test', 'cognitive reaction test', 'multiple choice reaction'],
  openGraph: {
    title: 'Choice Reaction Test - Measure Decision Speed',
    description: 'Test your choice reaction time and decision-making speed.',
    type: 'website',
  },
};

const structuredData = createTestAppStructuredData({
  name: 'Choice Reaction Test',
  description: 'Test your choice reaction time and decision-making speed. Measure cognitive processing speed with multiple choice options. Involves stimulus discrimination and response selection.',
  url: 'https://yourdomain.com/tests/choice-reaction',
  rating: 4.6,
  ratingCount: 890,
});

export default function ChoiceReactionLayout({
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
