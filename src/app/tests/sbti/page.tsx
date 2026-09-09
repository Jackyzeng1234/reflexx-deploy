import { Metadata } from 'next';
import StructuredData, { createTestAppStructuredData } from '@/components/StructuredData';
import SBTIEmbed from '@/components/SBTIEmbed';

export const metadata: Metadata = {
  title: 'SBTI Test Online - Free Personality Assessment | ReflexX',
  description: 'Take the free SBTI personality test to discover your type, strengths and workplace preferences. Get detailed results in minutes — no signup required.',
  keywords: ['SBTI Test online', 'personality test', 'MBTI alternative', 'free personality test', 'personality assessment', 'workplace personality'],
  openGraph: {
    title: 'SBTI Test Online - Free Personality Assessment | ReflexX',
    description: 'Take the free SBTI personality test to discover your type and get detailed results in minutes.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reflexx.uk/tests/sbti',
  },
};

// 结构化数据 - 用于SEO优化
const structuredData = createTestAppStructuredData({
  name: 'SBTI Personality Test',
  description: 'Discover your personality type with this comprehensive SBTI test. Based on Jungian psychology, this assessment helps you understand your strengths, weaknesses, and ideal work environment. Get detailed results including personality type, traits analysis, and career suggestions.',
  url: 'https://reflexx.uk/tests/sbti',
  rating: 4.7,
  ratingCount: 890,
});

export default function SBTIPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <SBTIEmbed />
    </>
  );
}
