'use client';

import { useI18n } from '@/lib/i18n';
import SequenceMemoryTest from '@/components/SequenceMemoryTest';
import Head from 'next/head';

export default function SequenceMemoryPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Sequence Memory Test - Pattern Memory | ReflexX</title>
        <meta name="description" content="Test your sequence memory by remembering patterns. Measure your spatial memory and cognitive ability." />
        <meta name="keywords" content="sequence memory, pattern memory, spatial memory" />
        <link rel="canonical" href="https://reflexx.uk/tests/sequence-memory" />
      </Head>
      <div className="container mx-auto min-h-[600px] px-4 py-4">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
            {t.sequenceMemoryTitle}
          </h1>
          <p className="text-lg text-white">
            {t.sequenceMemoryDesc}
          </p>
        </div>

        <SequenceMemoryTest />
      </div>
    </>
  );
}
