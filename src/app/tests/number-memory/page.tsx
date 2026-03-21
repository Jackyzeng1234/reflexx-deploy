'use client';

import { useI18n } from '@/lib/i18n';
import NumberMemoryTest from '@/components/NumberMemoryTest';
import Head from 'next/head';

export default function NumberMemoryTestPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Number Memory Test - Short-Term Memory | ReflexX</title>
        <meta name="description" content="Test your short-term memory by remembering number sequences. Compare with global rankings." />
        <meta name="keywords" content="number memory, memory test, short-term memory" />
        <link rel="canonical" href="https://reflexx.uk/tests/number-memory" />
      </Head>
      <div className="container mx-auto min-h-[600px] px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
          {t.numberMemoryTitle}
        </h1>
        <p className="text-lg text-white">
          {t.numberMemoryDesc}
        </p>
      </div>

      <NumberMemoryTest />
    </div>
    </>
  );
}
