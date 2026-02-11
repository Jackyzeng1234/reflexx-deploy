import { Metadata } from 'next';
import ClickSpeedTest from '@/components/ClickSpeedTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Click Speed Test - Measure CPS (1s-100s) | ReflexX',
  description: 'Test your CPS (clicks per second) in multiple durations. Free online click speed test. Compare globally. Try now!',
  keywords: ['click speed test', 'cps test', 'clicks per second', 'click test', 'mouse click speed', 'kahoot click speed'],
  openGraph: {
    title: 'Click Speed Test - Measure CPS (1s-100s) | ReflexX',
    description: 'Test your CPS (clicks per second) in multiple durations. Free online click speed test.',
    type: 'website',
  },
};

// 结构化数据
const structuredData = createTestAppStructuredData({
  name: 'Click Speed Test (CPS Test)',
  description: 'Test your clicking speed with our CPS test. Measure your clicks per second in multiple durations: 1s, 5s, 10s, 30s, 60s, and 100s. Professional-grade tool for gamers and professionals.',
  url: 'https://yourdomain.com/tests/click-speed',
  rating: 4.9,
  ratingCount: 2150,
});

export default function ClickSpeedPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <ClickSpeedTest />
    </>
  );
}
