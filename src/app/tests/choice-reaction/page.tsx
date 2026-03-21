'use client';

import { useI18n } from '@/lib/i18n';
import ChoiceReactionTest from '@/components/ChoiceReactionTest';
import Head from 'next/head';

export default function ChoiceReactionPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Choice Reaction Time - Decision Speed Test | ReflexX</title>
        <meta name="description" content="Test your choice reaction time and decision-making speed. Measure cognitive processing speed." />
        <meta name="keywords" content="choice reaction, decision making, cognitive speed" />
        <link rel="canonical" href="https://reflexx.uk/tests/choice-reaction" />
      </Head>
      <div className="container mx-auto min-h-[600px] px-4 py-4">
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
            {t.choiceReaction}
          </h1>
          <p className="text-lg text-white">
            {t.choiceReactionDesc}
          </p>
        </div>

        <ChoiceReactionTest />
      </div>
    </>
  );
}
