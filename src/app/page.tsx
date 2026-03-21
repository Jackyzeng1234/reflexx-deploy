'use client';

import { useI18n } from '@/lib/i18n';
import SimpleReactionTest from '@/components/SimpleReactionTest';
import Head from 'next/head';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>ReflexX - Reaction Time & Cognitive Training Platform</title>
        <meta name="description" content="Test and improve your reaction time and cognitive abilities with scientifically designed tests. Track your progress and compete globally." />
        <meta name="keywords" content="reaction time test, cognitive training, brain training, aim trainer, chimp test, number memory, typing speed" />
        <link rel="canonical" href="https://reflexx.uk" />
      </Head>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-2 text-center">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ letterSpacing: '-0.02em' }}>
            {t.heroTitle}
          </h1>
          <p className="mb-4 text-xl text-[var(--color-text-secondary)] sm:text-2xl">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Simple Reaction Test */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <SimpleReactionTest />
        </div>
      </section>
    </div>
    </>
  );
}
