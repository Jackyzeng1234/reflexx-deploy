import { Metadata } from 'next';
import SimpleReactionTest from '@/components/SimpleReactionTest';

export const metadata: Metadata = {
  title: 'Simple Reaction Test - Measure Your Reflexes | ReactionTest',
  description: 'Test your visual reaction time with this simple test. Click when the screen turns green and measure your reflexes in milliseconds.',
  keywords: ['simple reaction test', 'reaction time', 'reflex test', 'visual reaction test'],
  openGraph: {
    title: 'Simple Reaction Test - Measure Your Reflexes',
    description: 'Test your visual reaction time with this simple test.',
    type: 'website',
  },
};

export default function SimpleReactionPage() {
  return <SimpleReactionTest />;
}
