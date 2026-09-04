'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getTests } from '@/lib/testCatalog';

export default function TestsPage() {
  const { t } = useI18n();
  const tests = getTests(t);

  const highlights = [
    t.millisecondAccuracy,
    t.progressTracking,
    t.globalLeaderboards,
    t.multiLanguageSupport
  ];

  return (
    <div className="min-h-screen px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header —— 左对齐 */}
        <p className="kicker">{t.heroKicker}</p>
        <h1 className="display-title mt-5 max-w-3xl">{t.allTests}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-secondary">
          {t.chooseTest}
        </p>

        {/* 编号索引 */}
        <div className="mt-12">
          {tests.map((test, i) => (
            <Link key={test.id} href={test.href} className="index-item group">
              <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-text transition-colors group-hover:text-brand sm:text-2xl">
                    {test.title}
                  </h2>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary sm:text-base">
                  {test.description}
                </p>
              </div>
              <ArrowRight className="index-arrow h-5 w-5" />
            </Link>
          ))}
        </div>

        {/* SEO 正文 —— 关于测试 */}
        <div className="mt-20 max-w-3xl border-t border-border pt-10">
          <h2 className="text-3xl font-bold tracking-tight text-text">{t.aboutTests}</h2>
          <div className="mt-5 space-y-4">
            <p className="leading-relaxed text-text-secondary">{t.aboutTestsDesc1}</p>
            <p className="leading-relaxed text-text-secondary">{t.aboutTestsDesc2}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm text-emerald-300">
                  ✓
                </div>
                <span className="text-sm font-medium text-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
