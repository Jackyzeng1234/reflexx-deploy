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

export default function TestsPage() {
  const { t } = useI18n();

  const tests = [
    {
      id: 'simple-reaction',
      title: t.simpleReaction,
      description: t.simpleReactionDesc,
      icon: SimpleReactionIcon,
      href: '/tests/simple-reaction',
      status: 'available',
      difficulty: 'easy',
      category: 'reaction',
    },
    {
      id: 'auditory-reaction',
      title: t.auditoryReactionTitle,
      description: t.auditoryReactionDesc,
      icon: AuditoryReactionIcon,
      href: '/tests/auditory-reaction',
      status: 'available',
      difficulty: 'easy',
      category: 'reaction',
    },
    {
      id: 'click-speed',
      title: t.clickSpeed,
      description: t.clickSpeedDesc,
      icon: ClickSpeedIcon,
      href: '/tests/click-speed',
      status: 'available',
      difficulty: 'easy',
      category: 'speed',
    },
    {
      id: 'aim-trainer',
      title: t.aimTrainer,
      description: t.aimTrainerDesc,
      icon: AimTrainerIcon,
      href: '/tests/aim-trainer',
      status: 'available',
      difficulty: 'easy',
      category: 'speed',
    },
    {
      id: 'typing',
      title: t.typingTitle,
      description: t.typingDesc,
      icon: TypingIcon,
      href: '/tests/typing',
      status: 'available',
      difficulty: 'medium',
      category: 'speed',
    },
    {
      id: 'choice-reaction',
      title: t.choiceReaction,
      description: t.choiceReactionDesc,
      icon: ChoiceReactionIcon,
      href: '/tests/choice-reaction',
      status: 'available',
      difficulty: 'medium',
      category: 'reaction',
    },
    {
      id: 'sequence-memory',
      title: t.sequenceMemoryTitle,
      description: t.sequenceMemoryDesc,
      icon: SequenceMemoryIcon,
      href: '/tests/sequence-memory',
      status: 'available',
      difficulty: 'medium',
      category: 'memory',
    },
    {
      id: 'chimp-test',
      title: t.chimpTestTitle,
      description: t.chimpTestDesc,
      icon: ChimpTestIcon,
      href: '/tests/chimp-test',
      status: 'available',
      difficulty: 'hard',
      category: 'memory',
    },
    {
      id: 'stroop-test',
      title: t.stroopTestTitle,
      description: t.stroopTestDesc,
      icon: StroopTestIcon,
      href: '/tests/stroop-test',
      status: 'available',
      difficulty: 'hard',
      category: 'cognitive',
    },
    {
      id: 'number-memory',
      title: t.numberMemoryTitle,
      description: t.numberMemoryDesc,
      icon: NumberMemoryIcon,
      href: '/tests/number-memory',
      status: 'available',
      difficulty: 'hard',
      category: 'memory',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            {t.navTests}
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            {t.chooseTest}
          </p>
        </div>

        {/* Tests Grid */}
        <div className="bento-grid">
          {tests.map((test) => {
            const IconComponent = test.icon;
            return (
              <Link
                key={test.id}
                href={test.href}
                className="bento-card group relative flex flex-col items-center text-center text-[var(--color-text)] transition-all hover:text-[var(--color-text)]"
              >
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-[var(--color-accent)] shadow-sm group-hover:scale-110 transition-transform">
                  <IconComponent />
                </div>
                <h3 className="mb-2 text-xl font-bold leading-tight">
                  {test.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
                  {test.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Info Section - Bento Card */}
        <div className="mt-16 bento-card bg-blue-50">
          <h2 className="mb-4 text-2xl font-bold">
            {t.aboutTests}
          </h2>
          <div className="space-y-4 text-[var(--color-text)]">
            <p className="text-[var(--color-text-secondary)]">
              {t.aboutTestsDesc1}
            </p>
            <p className="text-[var(--color-text-secondary)]">
              {t.aboutTestsDesc2}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm">
                  ✓
                </div>
                <span className="text-sm font-medium">{t.millisecondAccuracy}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm">
                  ✓
                </div>
                <span className="text-sm font-medium">{t.progressTracking}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm">
                  ✓
                </div>
                <span className="text-sm font-medium">{t.globalLeaderboards}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm">
                  ✓
                </div>
                <span className="text-sm font-medium">{t.multiLanguageSupport}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
