import type { Metadata } from 'next';
import TestsPage from '@/components/TestsPage';

export const metadata: Metadata = {
  title: 'All Cognitive Tests — Reaction, Memory, Aim & Typing | ReflexX',
  description:
    'Explore 10 free cognitive tests: reaction time, click speed, aim trainer, memory, typing speed, Stroop and number memory. Benchmark your brain against the human average — no signup needed.',
  keywords: [
    'cognitive tests',
    'reaction time test',
    'memory test',
    'aim trainer',
    'typing test',
    'click speed test',
    'brain training'
  ],
  alternates: { canonical: 'https://reflexx.uk/tests' }
};

export default function Page() {
  return <TestsPage />;
}
