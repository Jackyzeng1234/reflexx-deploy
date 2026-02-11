import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Choice Reaction Test - Decision Speed | ReflexX',
  description: 'Test your decision-making speed with multiple choice reactions. Measure cognitive processing speed. Free online, global comparison.',
  keywords: ['choice reaction test', 'decision making test', 'cognitive reaction test', 'multiple choice reaction', 'decision speed'],
  openGraph: {
    title: 'Choice Reaction Test - Decision Speed | ReflexX',
    description: 'Test your decision-making speed with multiple choice reactions. Measure cognitive processing speed.',
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
