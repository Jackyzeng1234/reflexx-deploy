'use client';

import { useI18n } from '@/lib/i18n';
import AuditoryReactionTest from '@/components/AuditoryReactionTest';
import Head from 'next/head';

export default function AuditoryReactionPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Auditory Reaction Test - Sound Reflex Speed | ReflexX</title>
        <meta name="description" content="Test your auditory reaction time to sound. Measure how fast you react to audio cues. Compare with global rankings." />
        <meta name="keywords" content="auditory reaction test, sound reflex, audio reaction time, hearing test" />
        <link rel="canonical" href="https://reflexx.uk/tests/auditory-reaction" />
      </Head>
      <div className="container mx-auto min-h-[600px] px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
          {t.auditoryReactionTitle}
        </h1>
        <p className="text-lg text-white">
          {t.auditoryReactionDesc}
        </p>
      </div>

      <AuditoryReactionTest />
    </div>
    </>
  );
}
