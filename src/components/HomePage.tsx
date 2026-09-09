'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import SimpleReactionTest from '@/components/SimpleReactionTest';
import { getTests, type TestCategory } from '@/lib/testCatalog';
import { ratingBucket, ratingColor, ratingLabelKey, type RatingBucket } from '@/lib/ratings';

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

// 英文优先的编辑/SEO 文案(沿用旧版 seo 的做法:主市场英文,中/西后续按需补齐)
const copy = {
  kicker: 'Human benchmark · simple reaction time',
  titleA: 'How fast is your ',
  titleEm: 'reaction?',
  subtitle:
    'Wait for green. Click. One number in milliseconds — measured the way sports scientists measure it, then benchmarked against published norms for your age.',
  cta: 'Measure now',
  browse: 'Browse all 10 tests',
  instrumentLabel: 'Simple reaction time',
  instrumentStatus: 'ready',
  pctPlaceholder: 'run a round to place yourself',
  best: 'Best',
  runs: 'Runs',
  rating: 'Rating',
  start: 'Start measurement',
  measureAgain: 'Measure again',
  scaleTitle: 'What your number means',
  scaleBody:
    'Most healthy adults land between 230 and 310 ms (average). Below 190 ms is exceptional — typical of esports players and athletes who train reaction speed. Above 350 ms is worth working on.',
  scaleTicks: [
    { label: 'Exceptional', val: '< 190 ms' },
    { label: 'Above average', val: '190–230 ms' },
    { label: 'Average', val: '230–310 ms' },
    { label: 'Below average', val: '310–350 ms' },
    { label: 'Needs attention', val: '> 350 ms' }
  ],
  testsKicker: '10 tests · 4 categories',
  testsTitle: 'The full battery',
  tryKicker: 'Try it now',
  tryTitle: 'Try the reaction time test',
  ageTitle: 'Average reaction time by age',
  ageRows: [
    ['18–25', '220–260 ms'],
    ['26–35', '240–290 ms'],
    ['36–45', '260–310 ms'],
    ['46–60', '280–350 ms'],
    ['60+', '300–400 ms']
  ],
  ageNote:
    'Reaction time peaks in early adulthood and declines gradually as nerve conduction slows. Run the test several times and read your average — not a single lucky click — as your real baseline.',
  improveTitle: 'How to get faster',
  improveItems: [
    ['Sleep 7–9 hours.', 'Deprivation is the single biggest drag on reaction speed.'],
    ['Stay hydrated, skip alcohol.', 'Both slow nerve signalling.'],
    ['Practice daily.', 'Even five minutes of a reaction or aim test strengthens the pathway.'],
    ['Move.', 'Aerobic exercise improves alertness and conduction.'],
    ['Cut distractions.', 'Quiet room, wired mouse, high polling rate.'],
    ['Train the specific skill.', 'Click speed and aim trainer transfer straight to gaming.']
  ]
};

const metricByTest: Record<string, string> = {
  'simple-reaction': 'ms',
  'auditory-reaction': 'ms',
  'choice-reaction': 'ms',
  'click-speed': 'cps',
  'aim-trainer': 'ms',
  typing: 'wpm',
  'sequence-memory': 'level',
  'chimp-test': 'level',
  'number-memory': 'digits',
  'stroop-test': 'pts'
};

// —— 真实数据:从 localStorage 读取个人反应时间历史 ——
const HISTORY_KEY = 'simple-reaction-results';

type ReactionStats = { avg: number; best: number; count: number; rating: RatingBucket };

function readSimpleReactionHistory(): number[] {
  try {
    const raw: { average?: number; times?: number[] }[] = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || '[]'
    );
    return raw
      .map((r) => (typeof r.average === 'number' ? r.average : r.times?.[0]))
      .filter((n): n is number => typeof n === 'number' && n > 0);
  } catch {
    return [];
  }
}

// 与年龄基准表对照(诚实对比,无虚假百分位)
function ageCompare(ms: number): string {
  if (ms < 220) return 'faster than a typical 18–25 year-old';
  if (ms <= 260) return 'on par with a typical 18–25 year-old';
  if (ms <= 290) return 'on par with a typical 26–35 year-old';
  if (ms <= 310) return 'on par with a typical 36–45 year-old';
  if (ms <= 350) return 'on par with a typical 46–60 year-old';
  return 'on par with a typical 60+ year-old';
}

export default function HomePage() {
  const { t } = useI18n();
  const tests = getTests(t);
  const [stats, setStats] = useState<ReactionStats | null>(null);

  useEffect(() => {
    const times = readSimpleReactionHistory();
    if (times.length === 0) return;
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    setStats({ avg, best: Math.min(...times), count: times.length, rating: ratingBucket('simple-reaction', avg) });
  }, []);

  const categoryLabels: { key: TestCategory; label: string }[] = [
    { key: 'reaction', label: t.catReaction },
    { key: 'speed', label: t.catSpeed },
    { key: 'memory', label: t.catMemory },
    { key: 'cognitive', label: t.catCognitive }
  ];

  const groups = categoryLabels.map((cat) => ({
    label: cat.label,
    items: tests
      .map((test, idx) => ({ test, idx }))
      .filter(({ test }) => test.category === cat.key)
  }));

  return (
    <div className="min-h-screen">
      {/* HERO —— 左标题 / 右仪器 */}
      <section className="px-4 pt-16 pb-10 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="kicker">{copy.kicker}</p>
            <h1 className="display-serif mt-5">
              {copy.titleA}
              <em>{copy.titleEm}</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl">
              {copy.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="#play"
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                {copy.cta} <span className="mono">→</span>
              </a>
              <a
                href="#tests"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text"
              >
                {copy.browse} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="instrument-panel">
            <div className="instrument-head">
              <span>{copy.instrumentLabel}</span>
              <span className="instrument-led">{copy.instrumentStatus}</span>
            </div>
            <div className="instrument-num">
              {stats ? <span>{stats.avg}</span> : <span className="dim">—</span>}
              <span className="unit">ms</span>
            </div>
            <div className="pct-block">
              <div className="pct-line">
                {stats ? ageCompare(stats.avg) : copy.pctPlaceholder}
              </div>
              <div className="meter">
                {stats && (
                  <span
                    className="meter-marker"
                    style={{
                      left: `${Math.min(100, Math.max(0, ((stats.avg - 190) / 160) * 100))}%`
                    }}
                  />
                )}
              </div>
              <div className="meter-labels">
                <span>elite</span>
                <span>average</span>
                <span>slow</span>
              </div>
            </div>
            <div className="instrument-stats">
              <div>
                <div className="k">{copy.best}</div>
                <div className="v">{stats ? stats.best : '—'}</div>
              </div>
              <div>
                <div className="k">{copy.runs}</div>
                <div className="v">{stats ? stats.count : '—'}</div>
              </div>
              <div>
                <div className="k">{copy.rating}</div>
                <div className="v" style={{ color: stats ? ratingColor(stats.rating) : undefined }}>
                  {stats ? t[ratingLabelKey(stats.rating)] : '—'}
                </div>
              </div>
            </div>
            <a href="#play" className="btn btn-primary w-full text-center">
              {stats ? copy.measureAgain : copy.start}
            </a>
          </div>
        </div>
      </section>

      {/* 可玩测试 */}
      <section id="play" className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="kicker">{copy.tryKicker}</p>
          <h2 className="serif mt-3 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            {copy.tryTitle}
          </h2>
          <div className="mt-6">
            <SimpleReactionTest showHeader={false} showFAQ={false} />
          </div>
        </div>
      </section>

      {/* 数字的意义 —— 刻度 */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="border-t border-white/10 pt-12">
            <h2 className="serif text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              {copy.scaleTitle}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">
              {copy.scaleBody}
            </p>
            <div className="mt-8">
              <div className="scale-bar" />
              <div className="scale-ticks">
                {copy.scaleTicks.map((tick) => (
                  <div key={tick.label} className="scale-tick">
                    <div className="lbl">{tick.label}</div>
                    <div className="val">{tick.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 全部测试 —— 编号目录(按类别分组) */}
      <section id="tests" className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="border-t border-white/10 pt-12">
            <p className="kicker">{copy.testsKicker}</p>
            <h2 className="serif mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              {copy.testsTitle}
            </h2>
            {groups.map((group) => (
              <div key={group.label} className="mt-10">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {group.label}
                </p>
                {group.items.map(({ test, idx }) => (
                  <Link key={test.id} href={test.href} className="index-item group">
                    <span className="index-num">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-text transition-colors group-hover:text-brand sm:text-xl">
                        {test.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary sm:text-base">
                        {test.description}
                      </p>
                    </div>
                    <span className="mono text-xs text-text-tertiary">{metricByTest[test.id]}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 按年龄平均 */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="border-t border-white/10 pt-12">
            <h2 className="serif text-3xl font-semibold tracking-tight text-text">
              {copy.ageTitle}
            </h2>
            <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium">Age</th>
                    <th className="px-4 py-3 font-medium">Average reaction time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {copy.ageRows.map(([age, ms]) => (
                    <tr key={age}>
                      <td className="px-4 py-3 text-text">{age}</td>
                      <td className="tabular-nums px-4 py-3 text-text-secondary">{ms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-5 leading-relaxed text-text-secondary">{copy.ageNote}</p>
          </div>
        </div>
      </section>

      {/* 如何提升 */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="border-t border-white/10 pt-12">
            <h2 className="serif text-3xl font-semibold tracking-tight text-text">
              {copy.improveTitle}
            </h2>
            <div className="mt-8 grid gap-x-12 sm:grid-cols-2">
              {copy.improveItems.map(([lead, rest], i) => (
                <div key={lead} className="flex gap-4 border-b border-white/10 py-4">
                  <span className="mono text-xs text-text-tertiary">{String(i + 1).padStart(2, '0')}</span>
                  <p className="leading-relaxed text-text-secondary">
                    <strong className="font-semibold text-text">{lead} </strong>
                    {rest}
                  </p>
                </div>
              ))}
            </div>
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
