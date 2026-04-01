'use client';

import { useI18n } from '@/lib/i18n';
import SimpleReactionTest from '@/components/SimpleReactionTest';
import Head from 'next/head';

const partners = [
  {
    name: 'CodeMarket',
    href: 'https://code.market?code.market=verified',
    imgSrc: 'https://code.market/assets/manage-product/featured-logo-bright.svg',
    alt: 'ai tools code.market'
  },
  {
    name: 'ShowMeBestAI',
    href: 'https://showmebest.ai',
    imgSrc: 'https://showmebest.ai/badge/feature-badge-white.webp',
    alt: 'Featured on ShowMeBestAI'
  },
  {
    name: 'Twelve Tools',
    href: 'https://twelve.tools',
    imgSrc: 'https://twelve.tools/badge0-white.svg',
    alt: 'Featured on Twelve Tools'
  },
  {
    name: 'Wired Business',
    href: 'https://wired.business',
    imgSrc: 'https://wired.business/badge0-white.svg',
    alt: 'Featured on Wired Business'
  },
  {
    name: 'Startup Fast',
    href: 'https://startupfa.st',
    imgSrc: 'https://startupfa.st/images/badges/powered-by-light.svg',
    alt: 'Powered by Startup Fast'
  }
];

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

      {/* Partners Section */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Partners & Friends</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {partners.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                  style={{ height: '24px', width: partner.name === 'CodeMarket' ? '100px' : 'auto' }}
                  title={partner.alt}
                >
                  {partner.name === 'CodeMarket' ? (
                    <div
                      data-codemarket-widget="reflexx-free-reaction-memory-tests"
                      data-theme-bg="#1a1a2e"
                      data-theme-text="slate-300"
                      data-layout="grid"
                      data-show-branding="false"
                      className="flex items-center justify-center h-full"
                      style={{ width: '100%', height: '100%' }}
                    >
                      <img
                        src={partner.imgSrc}
                        alt={partner.alt}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <img
                      src={partner.imgSrc}
                      alt={partner.alt}
                      className="max-h-full max-w-full"
                    />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
