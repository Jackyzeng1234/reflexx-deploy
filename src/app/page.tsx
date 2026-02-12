'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import {
  SimpleReactionIcon,
  AuditoryReactionIcon,
  ClickSpeedIcon,
  AimTrainerIcon,
  TypingIcon,
  ChoiceReactionIcon,
  SequenceMemoryIcon,
  ChimpTestIcon,
  StroopTestIcon,
  NumberMemoryIcon,
} from '@/components/TestIcons';

export default function HomePage() {
  const { t } = useI18n();

  const tests = [
    {
      id: 'simple-reaction',
      title: t.simpleReaction,
      description: t.simpleReactionDesc,
      icon: SimpleReactionIcon,
      href: '/tests/simple-reaction',
      difficulty: t.difficultyEasy,
    },
    {
      id: 'auditory-reaction',
      title: t.auditoryReactionTitle,
      description: t.auditoryReactionDesc,
      icon: AuditoryReactionIcon,
      href: '/tests/auditory-reaction',
      difficulty: t.difficultyEasy,
    },
    {
      id: 'click-speed',
      title: t.clickSpeed,
      description: t.clickSpeedDesc,
      icon: ClickSpeedIcon,
      href: '/tests/click-speed',
      difficulty: t.difficultyEasy,
    },
    {
      id: 'aim-trainer',
      title: t.aimTrainer,
      description: t.aimTrainerDesc,
      icon: AimTrainerIcon,
      href: '/tests/aim-trainer',
      difficulty: t.difficultyEasy,
    },
    {
      id: 'typing',
      title: t.typingTitle,
      description: t.typingDesc,
      icon: TypingIcon,
      href: '/tests/typing',
      difficulty: t.difficultyMedium,
    },
    {
      id: 'choice-reaction',
      title: t.choiceReaction,
      description: t.choiceReactionDesc,
      icon: ChoiceReactionIcon,
      href: '/tests/choice-reaction',
      difficulty: t.difficultyMedium,
    },
    {
      id: 'sequence-memory',
      title: t.sequenceMemoryTitle,
      description: t.sequenceMemoryDesc,
      icon: SequenceMemoryIcon,
      href: '/tests/sequence-memory',
      difficulty: t.difficultyMedium,
    },
    {
      id: 'chimp-test',
      title: t.chimpTestTitle,
      description: t.chimpTestDesc,
      icon: ChimpTestIcon,
      href: '/tests/chimp-test',
      difficulty: t.difficultyHard,
    },
    {
      id: 'stroop-test',
      title: t.stroopTestTitle,
      description: t.stroopTestDesc,
      icon: StroopTestIcon,
      href: '/tests/stroop-test',
      difficulty: t.difficultyHard,
    },
    {
      id: 'number-memory',
      title: t.numberMemoryTitle,
      description: t.numberMemoryDesc,
      icon: NumberMemoryIcon,
      href: '/tests/number-memory',
      difficulty: t.difficultyHard,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-12 text-center">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl" style={{ letterSpacing: '-0.02em' }}>
            {t.heroTitle}
          </h1>
          <p className="mb-8 text-xl text-[var(--color-text-secondary)] sm:text-2xl">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/tests"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#0077ed] hover:shadow-lg"
            >
              {t.getStarted}
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Tests Section - Bento Grid */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-2xl font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              {t.chooseTest}
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="bento-grid">
            {tests.map((test) => {
              const IconComponent = test.icon;
              return (
                <Link
                  key={test.id}
                  href={test.href}
                  className="bento-card group relative flex flex-col items-center text-center text-[var(--color-text)] transition-all hover:text-[var(--color-text)]"
                >
                  {/* Icon */}
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-[var(--color-accent)] shadow-sm group-hover:scale-110 transition-transform">
                    <IconComponent />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-xl font-bold leading-tight">
                    {test.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
                    {test.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Bento Cards */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-4xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              {t.whyChooseUs}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              {t.professionalGrade}
            </p>
          </div>

          <div className="bento-grid">
            {/* Feature 1 */}
            <div className="bento-card flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <svg className="h-7 w-7 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">{t.highPrecision}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t.highPrecisionDesc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bento-card flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <svg className="h-7 w-7 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">{t.globalLeaderboards}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t.globalLeaderboardsDesc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bento-card flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <svg className="h-7 w-7 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">{t.progressTracking}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t.progressTrackingDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
