import { Metadata } from 'next';
import AimTrainerTest from '@/components/AimTrainerTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Aim Trainer - Improve Mouse Accuracy & FPS Skills | ReflexX',
  description: 'Free online aim trainer to improve your mouse accuracy, hand-eye coordination, and reaction speed for FPS games. 60-second challenge with detailed stats.',
  keywords: [
    'aim trainer',
    'aim training',
    'mouse accuracy',
    'FPS aim practice',
    'aim test',
    'hand-eye coordination',
    'reflex training',
    'click accuracy',
    'aim booster',
    'target practice'
  ],
  openGraph: {
    title: 'Aim Trainer - Improve Mouse Accuracy & FPS Skills | ReflexX',
    description: 'Free online aim trainer to improve your mouse accuracy and hand-eye coordination. 60-second challenge with detailed stats.',
    type: 'website',
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
