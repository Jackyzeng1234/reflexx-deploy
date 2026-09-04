'use client';

import Link from 'next/link';
import { Zap, ArrowRight, Timer, Trophy, TrendingUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import SimpleReactionTest from '@/components/SimpleReactionTest';
import { getTests } from '@/lib/testCatalog';

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
  },
  {
    name: 'Toolpilot',
    href: 'https://www.toolpilot.ai',
    imgSrc: 'https://www.toolpilot.ai/cdn/shop/files/f-w_690x151_crop_center.png',
    alt: 'Listed on Toolpilot.ai'
  }
];

// 英文优先的 SEO 正文(主市场英文,中/西后续按需补齐)
const seo = {
  whatIs: {
    title: 'What is a reaction time test?',
    body: [
      'A reaction time test measures how quickly you respond to a visual stimulus — usually a color change on screen. It is the standard way to benchmark how fast your brain\'s processing pipeline runs: your eyes detect the change, your brain decides to act, and your hand executes the click. On ReflexX, the simple reaction time test records the milliseconds between the screen turning green and your click, then averages five rounds into a single score.',
      'Most healthy adults average between 200 and 300 milliseconds. Faster times — under 200 ms — are typical of younger people, esports players and athletes who actively train reaction speed. Use it as a free human benchmark reaction time test: take a few runs, ignore your best single click, and read your average as your true baseline.'
    ]
  },
  byAge: {
    title: 'Average reaction time by age',
    rows: [
      ['18–25', '220–260 ms'],
      ['26–35', '240–290 ms'],
      ['36–45', '260–310 ms'],
      ['46–60', '280–350 ms'],
      ['60+', '300–400 ms']
    ],
    note: 'Reaction time peaks in early adulthood and declines gradually with age as nerve conduction slows. The exact average depends on whether the test is simple or choice-based, plus your sleep, caffeine intake and alertness. Take the test several times to establish a stable personal baseline rather than judging yourself on a single run.'
  },
  improve: {
    title: 'How to improve your reaction time',
    items: [
      'Sleep 7–9 hours — sleep deprivation is the single biggest drag on reaction speed.',
      'Stay hydrated and avoid alcohol, which slows nerve signaling.',
      'Practice daily — even five minutes of a reaction or aim test strengthens sensorimotor pathways.',
      'Exercise regularly — aerobic activity improves alertness and nerve conduction.',
      'Cut distractions — test in a quiet room with a wired mouse or high-polling-rate setup.',
      'Train the specific skill — click speed and aim trainer games transfer directly to gaming.'
    ]
  }
};

export default function HomePage() {
  const { t } = useI18n();

  const tests = getTests(t);

  const difficultyLabel = {
    easy: t.difficultyEasy,
    medium: t.difficultyMedium,
    hard: t.difficultyHard
  };

  const trustStats = [
    { value: '1M+', label: t.testsCompleted },
    { value: '100K+', label: t.activeUsers },
    { value: '120+', label: t.countries }
  ];

  const features = [
    { icon: Timer, title: t.highPrecision, desc: t.highPrecisionDesc },
    { icon: Trophy, title: t.globalLeaderboards, desc: t.globalLeaderboardsDesc },
    { icon: TrendingUp, title: t.progressTracking, desc: t.progressTrackingDesc }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero —— 左对齐编辑排版 */}
      <section className="px-4 pt-16 pb-10 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <p className="kicker">{t.heroKicker}</p>
          <h1 className="display-title mt-5 max-w-3xl">{t.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl">
            {t.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#play"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-gray-950 shadow-[0_0_28px_rgba(34,211,238,0.35)] transition-colors hover:bg-primary-400"
            >
              <Zap className="h-4 w-4" fill="currentColor" />
              {t.heroCTA}
            </a>
            <a
              href="#tests"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text"
            >
              {t.allTests} <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* 数据条 */}
          <div className="mt-14 flex flex-wrap items-center gap-x-12 gap-y-6">
            {trustStats.map((stat) => (
              <div key={stat.label}>
                <div className="tabular-nums text-3xl font-bold text-brand sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-text-tertiary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 可玩测试 */}
      <section id="play" className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="kicker">Try it now</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Try the reaction time test
          </h2>
          <div className="mt-6">
            <SimpleReactionTest showHeader={false} showFAQ={false} />
          </div>
          <div className="mt-6">
            <Link
              href="/tests/simple-reaction"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-primary-300"
            >
              {t.viewFullTest} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 全部测试 —— 编号索引 */}
      <section id="tests" className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="kicker">{t.allTests}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {t.chooseTest}
          </h2>
          <div className="mt-8">
            {tests.map((test, i) => (
              <Link key={test.id} href={test.href} className="index-item group">
                <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-text transition-colors group-hover:text-brand sm:text-2xl">
                      {test.title}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-text-tertiary">
                      {difficultyLabel[test.difficulty]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary sm:text-base">
                    {test.description}
                  </p>
                </div>
                <ArrowRight className="index-arrow h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO 正文 —— What is / By age / How to improve */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="kicker">Learn</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text">{seo.whatIs.title}</h2>
          {seo.whatIs.body.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 leading-relaxed text-text-secondary">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-text">{seo.byAge.title}</h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3 font-medium">Average reaction time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {seo.byAge.rows.map(([age, ms]) => (
                  <tr key={age}>
                    <td className="px-4 py-3 text-text">{age}</td>
                    <td className="tabular-nums px-4 py-3 text-text-secondary">{ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 leading-relaxed text-text-secondary">{seo.byAge.note}</p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-text">{seo.improve.title}</h2>
          <ul className="mt-6 space-y-3">
            {seo.improve.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-brand" aria-hidden>
                  →
                </span>
                <span className="leading-relaxed text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 特性 —— 编号而非卡片 */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="kicker">Why ReflexX</p>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title}>
                  <div className="flex items-center gap-3">
                    <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
                    <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
                    <h3 className="text-lg font-semibold text-text">{feature.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-white/10 bg-surface/40 p-6 backdrop-blur-md">
            <h3 className="mb-4 text-sm font-semibold text-text-tertiary">Partners &amp; Friends</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {partners.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center opacity-50 transition-opacity hover:opacity-100"
                  style={{ height: '24px', width: partner.name === 'CodeMarket' ? '100px' : 'auto' }}
                  title={partner.alt}
                >
                  {partner.name === 'CodeMarket' ? (
                    <div
                      data-codemarket-widget="reflexx-free-reaction-memory-tests"
                      data-theme-bg="#0a0e17"
                      data-theme-text="slate-300"
                      data-layout="grid"
                      data-show-branding="false"
                      className="flex h-full items-center justify-center"
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
  );
}
