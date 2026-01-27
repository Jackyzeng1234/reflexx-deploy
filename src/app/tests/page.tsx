'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

export default function TestsPage() {
  const { t } = useI18n();

  const tests = [
    {
      id: 'simple-reaction',
      title: t.simpleReaction,
      description: t.simpleReactionDesc,
      icon: '⚡',
      color: 'from-blue-500 to-blue-600',
      href: '/tests/simple-reaction',
      status: 'available',
      difficulty: 'easy',
      category: 'reaction',
    },
    {
      id: 'auditory-reaction',
      title: t.auditoryReactionTitle,
      description: t.auditoryReactionDesc,
      icon: '🔊',
      color: 'from-cyan-500 to-cyan-600',
      href: '/tests/auditory-reaction',
      status: 'available',
      difficulty: 'easy',
      category: 'reaction',
    },
    {
      id: 'click-speed',
      title: t.clickSpeed,
      description: t.clickSpeedDesc,
      icon: '🖱️',
      color: 'from-green-500 to-green-600',
      href: '/tests/click-speed',
      status: 'available',
      difficulty: 'easy',
      category: 'speed',
    },
    {
      id: 'typing',
      title: t.typingTitle,
      description: t.typingDesc,
      icon: '⌨️',
      color: 'from-teal-500 to-teal-600',
      href: '/tests/typing',
      status: 'available',
      difficulty: 'medium',
      category: 'speed',
    },
    {
      id: 'choice-reaction',
      title: t.choiceReaction,
      description: t.choiceReactionDesc,
      icon: '🎮',
      color: 'from-purple-500 to-purple-600',
      href: '/tests/choice-reaction',
      status: 'available',
      difficulty: 'medium',
      category: 'reaction',
    },
    {
      id: 'aim-trainer',
      title: t.aimTrainer,
      description: t.aimTrainerDesc,
      icon: '🎯',
      color: 'from-orange-500 to-orange-600',
      href: '/tests/aim-trainer',
      status: 'available',
      difficulty: 'medium',
      category: 'speed',
    },
    {
      id: 'sequence-memory',
      title: t.sequenceMemoryTitle,
      description: t.sequenceMemoryDesc,
      icon: '🧠',
      color: 'from-pink-500 to-pink-600',
      href: '/tests/sequence-memory',
      status: 'available',
      difficulty: 'medium',
      category: 'memory',
    },
    {
      id: 'chimp-test',
      title: t.chimpTestTitle,
      description: t.chimpTestDesc,
      icon: '🐵',
      color: 'from-amber-500 to-amber-600',
      href: '/tests/chimp-test',
      status: 'available',
      difficulty: 'hard',
      category: 'memory',
    },
    {
      id: 'stroop-test',
      title: t.stroopTestTitle,
      description: t.stroopTestDesc,
      icon: '🎨',
      color: 'from-violet-500 to-violet-600',
      href: '/tests/stroop-test',
      status: 'available',
      difficulty: 'hard',
      category: 'cognitive',
    },
    {
      id: 'number-memory',
      title: t.numberMemoryTitle,
      description: t.numberMemoryDesc,
      icon: '🔢',
      color: 'from-rose-500 to-rose-600',
      href: '/tests/number-memory',
      status: 'available',
      difficulty: 'hard',
      category: 'memory',
    },
  ];

  const difficultyConfig = {
    easy: {
      label: t.difficultyEasy,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
    },
    medium: {
      label: t.difficultyMedium,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-400',
    },
    hard: {
      label: t.difficultyHard,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-400',
    },
  };

  const easyTests = tests.filter((test) => test.difficulty === 'easy');
  const mediumTests = tests.filter((test) => test.difficulty === 'medium');
  const hardTests = tests.filter((test) => test.difficulty === 'hard');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {t.navTests}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t.chooseTest}
          </p>
        </div>

        {/* Tests Grid - Grouped by Difficulty */}
        <div className="space-y-12">
          {/* Easy Tests */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <span className="text-xl">🌱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {difficultyConfig.easy.label}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {easyTests.map((test) => (
                <Link
                  key={test.id}
                  href={test.href}
                  className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${test.color} text-3xl shadow-lg`}>
                      {test.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      {test.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                      {test.description}
                    </p>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyConfig.easy.bgColor} ${difficultyConfig.easy.textColor}`}>
                      {difficultyConfig.easy.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Medium Tests */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <span className="text-xl">🌿</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {difficultyConfig.medium.label}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mediumTests.map((test) => (
                <Link
                  key={test.id}
                  href={test.href}
                  className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-yellow-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-yellow-600"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${test.color} text-3xl shadow-lg`}>
                      {test.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      {test.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                      {test.description}
                    </p>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyConfig.medium.bgColor} ${difficultyConfig.medium.textColor}`}>
                      {difficultyConfig.medium.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Hard Tests */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <span className="text-xl">🌳</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {difficultyConfig.hard.label}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hardTests.map((test) => (
                <Link
                  key={test.id}
                  href={test.href}
                  className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-red-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-red-600"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${test.color} text-3xl shadow-lg`}>
                      {test.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      {test.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                      {test.description}
                    </p>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyConfig.hard.bgColor} ${difficultyConfig.hard.textColor}`}>
                      {difficultyConfig.hard.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            {t.aboutTests}
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              {t.aboutTestsDesc1}
            </p>
            <p>
              {t.aboutTestsDesc2}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm dark:bg-green-900/30">
                  ✓
                </div>
                <span className="text-sm font-medium">{t.millisecondAccuracy}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm dark:bg-green-900/30">
                  ✓
                </div>
                <span className="text-sm font-medium">{t.progressTracking}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm dark:bg-green-900/30">
                  ✓
                </div>
                <span className="text-sm font-medium">{t.globalLeaderboards}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm dark:bg-green-900/30">
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
