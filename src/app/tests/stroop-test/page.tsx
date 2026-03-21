'use client';

import { useI18n } from '@/lib/i18n';
import StroopTest from '@/components/StroopTest';
import Head from 'next/head';

export default function StroopTestPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Stroop Test - Cognitive Flexibility | ReflexX</title>
        <meta name="description" content="Test your cognitive flexibility and inhibitory control with the Stroop test." />
        <meta name="keywords" content="stroop test, cognitive flexibility, inhibitory control" />
        <link rel="canonical" href="https://reflexx.uk/tests/stroop-test" />
      </Head>
      <div className="container mx-auto min-h-[600px] px-4 py-4">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
            {t.stroopTestTitle}
          </h1>
          <p className="text-lg text-white">
            {t.stroopTestDesc}
          </p>
        </div>

        <StroopTest />
      </div>
    </>
  );
}
