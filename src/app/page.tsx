import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';

export const metadata: Metadata = {
  title: 'Reaction Time Test — Free Cognitive Training | ReflexX',
  description:
    'Measure your reaction time in milliseconds and train your brain with 10 free cognitive tests — reaction, aim, memory, typing and more. No signup needed.',
  keywords: [
    'reaction time test',
    'reaction speed test',
    'click speed test',
    'aim trainer',
    'cognitive test',
    'brain training',
    'memory test',
    'typing speed test'
  ],
  alternates: { canonical: 'https://reflexx.uk' },
  openGraph: {
    title: 'Reaction Time Test — Free Cognitive Training | ReflexX',
    description:
      'Measure your reaction time in milliseconds and train your brain with 10 free cognitive tests. No signup.',
    url: 'https://reflexx.uk',
    siteName: 'ReflexX',
    type: 'website'
  }
};

export default function Page() {
  return <HomePage />;
}
