import { Metadata } from 'next';
import AimTrainerTest from '@/components/AimTrainerTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Aim Trainer - Improve Mouse Accuracy & FPS Skills | ReflexX',
  description: 'Improve your FPS aim with this free 60-second aim trainer. Hit randomly appearing targets, then review your accuracy, average reaction time and KPS.',
  keywords: [
    'aim trainer',
    'aim training',
    'mouse accuracy',
    'FPS aim practice',
    'hand-eye coordination',
    'aim test',
    'click accuracy'
  ],
  openGraph: {
    title: 'Aim Trainer - Improve Mouse Accuracy & FPS Skills | ReflexX',
    description: 'Improve your FPS aim with this free 60-second aim trainer. Track accuracy, reaction time and KPS.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/aim-trainer',
  },
};

// 结构化数据 - 用于SEO优化
const structuredData = createTestAppStructuredData({
  name: 'Aim Trainer',
  description: 'Professional aim trainer to improve mouse accuracy, hand-eye coordination, and reaction speed for FPS gaming. Test your aiming skills with randomly appearing targets in a 60-second challenge. Track your accuracy, average reaction time, and KPS (kills per second).',
  url: 'https://reflexx.uk/tests/aim-trainer',
  rating: 4.9,
  ratingCount: 2340,
});

export default function AimTrainerPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <AimTrainerTest />
    </>
  );
}
