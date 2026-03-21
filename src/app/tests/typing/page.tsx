'use client';

import { useI18n } from '@/lib/i18n';
import TypingTest from '@/components/TypingTest';
import Head from 'next/head';

export default function TypingTestPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Typing Speed Test - WPM & Accuracy | ReflexX</title>
        <meta name="description" content="Test your typing speed in words per minute (WPM) and accuracy. Free online typing test." />
        <meta name="keywords" content="typing test, typing speed, wpm test, keyboard accuracy" />
        <link rel="canonical" href="https://reflexx.uk/tests/typing" />
      </Head>
      <div className="container mx-auto min-h-[600px] px-4 py-4">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
            {t.typingTitle}
          </h1>
          <p className="text-lg text-white">
            {t.typingDesc}
          </p>
        </div>

        <TypingTest />
      </div>
    </>
  );
}
