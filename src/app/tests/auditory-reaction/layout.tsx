import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Auditory Reaction Test - Sound Reflex Speed | ReflexX',
  description: 'Test your reaction to sound stimuli. Compare auditory vs visual reflexes. Free online test with accurate timing. Try now!',
  keywords: ['auditory reaction test', 'sound reaction test', 'audio reflex test', 'hearing reaction time', 'sound reflex speed'],
  openGraph: {
    title: 'Auditory Reaction Test - Sound Reflex Speed | ReflexX',
    description: 'Test your reaction to sound stimuli. Compare auditory vs visual reflexes.',
    type: 'website',
  },
};

// 结构化数据
const structuredData = createTestAppStructuredData({
  name: 'Auditory Reaction Test',
  description: 'Test your auditory reaction time with sound cues. Measure how fast you respond to audio stimuli with professional accuracy. Evaluates auditory cortex efficiency and audio-motor connections.',
  url: 'https://yourdomain.com/tests/auditory-reaction',
  rating: 4.7,
  ratingCount: 980,
});

export default function AuditoryReactionLayout({
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
