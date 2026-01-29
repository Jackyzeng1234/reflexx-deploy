'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

export default function HomePage() {
  const { t } = useI18n();

  const tests = [
    {
      id: 'simple-reaction',
      title: t.simpleReaction,
      description: t.simpleReactionDesc,
      icon: '⚡',
      color: 'from-blue-500 to-blue-600',
      href: '/tests/simple-reaction',
      difficulty: t.difficultyEasy,
    },
    {
      id: 'auditory-reaction',
      title: t.auditoryReactionTitle,
      description: t.auditoryReactionDesc,
      icon: '🔊',
      color: 'from-cyan-500 to-cyan-600',
      href: '/tests/auditory-reaction',
      difficulty: t.difficultyEasy,
    },
    {
      id: 'click-speed',
      title: t.clickSpeed,
      description: t.clickSpeedDesc,
      icon: '🖱️',
      color: 'from-green-500 to-green-600',
      href: '/tests/click-speed',
      difficulty: t.difficultyEasy,
    },
    {
      id: 'typing',
      title: t.typingTitle,
      description: t.typingDesc,
      icon: '⌨️',
      color: 'from-teal-500 to-teal-600',
      href: '/tests/typing',
      difficulty: t.difficultyMedium,
    },
    {
      id: 'choice-reaction',
      title: t.choiceReaction,
      description: t.choiceReactionDesc,
      icon: '🎮',
      color: 'from-purple-500 to-purple-600',
      href: '/tests/choice-reaction',
      difficulty: t.difficultyMedium,
    },
    {
      id: 'sequence-memory',
      title: t.sequenceMemoryTitle,
      description: t.sequenceMemoryDesc,
      icon: '🧠',
      color: 'from-pink-500 to-pink-600',
      href: '/tests/sequence-memory',
      difficulty: t.difficultyMedium,
    },
    {
      id: 'chimp-test',
      title: t.chimpTestTitle,
      description: t.chimpTestDesc,
      icon: '🐵',
      color: 'from-amber-500 to-amber-600',
      href: '/tests/chimp-test',
      difficulty: t.difficultyHard,
    },
    {
      id: 'stroop-test',
      title: t.stroopTestTitle,
      description: t.stroopTestDesc,
      icon: '🎨',
      color: 'from-violet-500 to-violet-600',
      href: '/tests/stroop-test',
      difficulty: t.difficultyHard,
    },
    {
      id: 'number-memory',
      title: t.numberMemoryTitle,
      description: t.numberMemoryDesc,
      icon: '🔢',
      color: 'from-rose-500 to-rose-600',
      href: '/tests/number-memory',
      difficulty: t.difficultyHard,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative mx-auto px-4 pt-16 pb-8 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/tests"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                {t.getStarted}
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tests Section */}
      <section className="pt-4 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
              {t.chooseTest}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={test.href}
                className="group relative overflow-hidden rounded-xl border-2 border-white/40 bg-white/60 backdrop-blur-md p-5 shadow-sm transition-all hover:border-primary-300 hover:bg-white/70 hover:shadow-lg hover:-translate-y-1 dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40 dark:hover:border-primary-600"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${test.color} text-2xl shadow-md`}>
                    {test.icon}
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                    {test.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {test.description}
                  </p>
                  <span className={`mt-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    test.difficulty === t.difficultyEasy
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : test.difficulty === t.difficultyMedium
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {test.difficulty}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-4xl font-bold text-gray-900 dark:text-white">
              {t.whyChooseUs}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t.professionalGrade}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/60 backdrop-blur-md p-6 shadow-lg dark:bg-black/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-7 w-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{t.highPrecision}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.highPrecisionDesc}
              </p>
            </div>

            <div className="rounded-2xl bg-white/60 backdrop-blur-md p-6 shadow-lg dark:bg-black/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-7 w-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{t.globalLeaderboards}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.globalLeaderboardsDesc}
              </p>
            </div>

            <div className="rounded-2xl bg-white/60 backdrop-blur-md p-6 shadow-lg dark:bg-black/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-7 w-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{t.progressTracking}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.progressTrackingDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
