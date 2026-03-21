'use client';

import { useI18n } from '@/lib/i18n';
import ChimpTest from '@/components/ChimpTest';
import Head from 'next/head';

export default function ChimpTestPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Chimp Test - Working Memory Assessment | ReflexX</title>
        <meta name="description" content="Test your working memory with the Chimp Test. Remember number locations and measure your cognitive ability." />
        <meta name="keywords" content="chimp test, working memory, memory test, cognitive assessment" />
        <link rel="canonical" href="https://reflexx.uk/tests/chimp-test" />
      </Head>
      <div className="container mx-auto min-h-[600px] px-4 py-4">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
            {t.chimpTestTitle}
          </h1>
          <p className="text-lg text-white">
            {t.chimpTestDesc}
          </p>
        </div>

        <ChimpTest />
      </div>
    </>
  );
}
