import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: 'ReflexX — Reaction Time Test & Cognitive Training | Free Online',
  description:
    'Test and improve your reaction time with scientifically designed tests. Measure your reaction speed in milliseconds, benchmark against the human average, and train your brain with aim trainer, click speed, memory and focus tests. Free, no signup.',
  keywords: [
    'reaction time test',
    'reaction speed test',
    'human benchmark reaction time',
    'click speed test',
    'aim trainer',
    'cognitive training',
    'brain training',
    'number memory test',
    'typing speed test'
  ],
  alternates: { canonical: 'https://reflexx.uk' },
  openGraph: {
    title: 'ReflexX — Reaction Time Test & Cognitive Training',
    description:
      'Measure your reaction time in milliseconds and train your brain with free, scientifically designed cognitive tests.',
    url: 'https://reflexx.uk',
    siteName: 'ReflexX',
    type: 'website'
  }
};

export default function Page() {
  return <HomePage />;
}
