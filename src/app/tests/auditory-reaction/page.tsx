import { Metadata } from 'next';
import AuditoryReactionTest from '@/components/AuditoryReactionTest';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Auditory Reaction Test - Sound Reflex Speed | ReflexX',
  description: 'Test your reaction speed to sound. Free online auditory reaction time test. Click when you hear the beep. Compare globally. Try now!',
  keywords: ['auditory reaction test', 'reaction time test', 'sound reflex test', 'hearing reaction', 'audio reaction time'],
  openGraph: {
    title: 'Auditory Reaction Test - Sound Reflex Speed | ReflexX',
    description: 'Test your reaction speed to sound. Free online auditory reaction time test.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/auditory-reaction',
  },
};

// 结构化数据 - 用于SEO优化（搜索引擎可见，用户不可见）
const structuredData = createTestAppStructuredData({
  name: 'Auditory Reaction Test',
  description: 'Test your reaction time to auditory stimuli. Click as fast as you can when you hear the beep sound. Complete 5 rounds to measure your average reaction time in milliseconds. Professional-grade tool for measuring auditory reflex speed.',
  url: 'https://reflexx.uk/tests/auditory-reaction',
  rating: 4.8,
  ratingCount: 980,
});

export default function AuditoryReactionPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <AuditoryReactionTest />
    </>
  );
}
