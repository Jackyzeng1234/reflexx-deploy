import { Metadata } from 'next';
import ClickSpeedTest from '@/components/ClickSpeedTest';

export const metadata: Metadata = {
  title: 'Click Speed Test - CPS Test | ReactionTest',
  description: 'Test your clicking speed with our CPS test. Measure your clicks per second in 1s, 5s, 10s, 30s, 60s, and 100s durations.',
  keywords: ['click speed test', 'cps test', 'clicks per second', 'click test', 'mouse click speed'],
  openGraph: {
    title: 'Click Speed Test - Measure Your Clicking Speed',
    description: 'Test your clicking speed with our CPS test. Measure your clicks per second.',
    type: 'website',
  },
};

export default function ClickSpeedPage() {
  return <ClickSpeedTest />;
}
