import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Typing Speed Test - Measure WPM & Accuracy | ReflexX',
  description: 'Test your typing speed in WPM and accuracy. Free online typing test with real-time feedback. Track improvement. Try now!',
  keywords: ['typing speed test', 'wpm test', 'typing test', 'words per minute test', 'typing speed test online free'],
  openGraph: {
    title: 'Typing Speed Test - Measure WPM & Accuracy | ReflexX',
    description: 'Test your typing speed in WPM and accuracy. Free online typing test with real-time feedback.',
    type: 'website',
  },
};

const structuredData = createTestAppStructuredData({
  name: 'Typing Speed Test',
  description: 'Free online typing speed test. Measure your words per minute (WPM), accuracy, and typing performance. Professional tool for improving typing skills and motor memory efficiency.',
  url: 'https://yourdomain.com/tests/typing',
  rating: 4.8,
  ratingCount: 1560,
});

export default function TypingTestLayout({
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
