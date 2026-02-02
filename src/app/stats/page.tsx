'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import ProgressChart from '@/components/ProgressChart';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

interface TestResult {
  timestamp: number;
  [key: string]: any;
}

// localStorage 键名到 test_type 的映射
const localStorageToTestType: Record<string, string> = {
  'simple-reaction-results': 'simple-reaction',
  'click-speed-results': 'click-speed',
  'auditory-reaction-results': 'auditory-reaction',
  'sequence-memory-results': 'sequence-memory',
  'typing-results': 'typing',
  'chimp-results': 'chimp',
  'choice-reaction-results': 'choice-reaction',
  'stroop-results': 'stroop',
  'number-memory-results': 'number-memory',
};

// 测试类型的固定顺序（与首页保持一致）
const TEST_ORDER = [
  'simple-reaction-results',
  'auditory-reaction-results',
  'click-speed-results',
  'typing-results',
  'choice-reaction-results',
  'sequence-memory-results',
  'chimp-results',
  'stroop-results',
  'number-memory-results',
];

export default function StatsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [allResults, setAllResults] = useState<Record<string, TestResult[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      if (user) {
        // 已登录：从数据库加载数据
        await loadFromDatabase();
      } else {
        // 未登录：从 localStorage 加载数据
        loadFromLocalStorage();
      }

      setLoading(false);
    }

    loadData();
  }, [user]);

  // 从 localStorage 加载数据
  function loadFromLocalStorage() {
    const testTypes = Object.keys(localStorageToTestType);
    const results: Record<string, TestResult[]> = {};

    testTypes.forEach((type) => {
      const data = JSON.parse(localStorage.getItem(type) || '[]');
      if (data.length > 0) {
        results[type] = data;
      }
    });

    setAllResults(results);
  }

  // 从数据库加载数据
  async function loadFromDatabase() {
    const startTime = performance.now();
    console.log('📊 [性能] 开始从数据库加载统计数据...');

    try {
      const queryStart = performance.now();
      // 只查询需要的字段，而不是 *
      const { data: scores, error } = await supabase
        .from('scores')
        .select('id, test_type, score, details, created_at') // 明确指定需要的字段
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const queryTime = performance.now() - queryStart;
      console.log(`📊 [性能] 数据库查询完成，耗时: ${queryTime.toFixed(2)}ms，结果数量: ${scores?.length || 0}`);

      if (error) throw error;

      // 将数据库数据转换为页面需要的格式
      const results: Record<string, TestResult[]> = {};

      scores?.forEach((score: any) => {
        const localStorageKey = `${score.test_type}-results`;

        if (!results[localStorageKey]) {
          results[localStorageKey] = [];
        }

        // 根据测试类型转换数据格式
        const convertedResult = convertDatabaseToLocalStorage(score);
        if (convertedResult) {
          results[localStorageKey].push(convertedResult);
        }
      });

      const totalTime = performance.now() - startTime;
      console.log(`📊 [性能] 统计数据加载完成，总耗时: ${totalTime.toFixed(2)}ms`);
      setAllResults(results);
    } catch (error) {
      const errorTime = performance.now() - startTime;
      console.error(`❌ [性能] 加载数据库数据失败，耗时: ${errorTime.toFixed(2)}ms`, error);
      // 如果加载失败，降级到 localStorage
      loadFromLocalStorage();
    }
  }

  // 将数据库记录转换为 localStorage 格式
  function convertDatabaseToLocalStorage(score: any): TestResult | null {
    const { test_type, score: value, details, created_at } = score;

    switch (test_type) {
      case 'simple-reaction':
      case 'auditory-reaction':
        return {
          times: details?.times || [],
          average: value,
          timestamp: new Date(created_at).getTime(),
        };

      case 'choice-reaction':
        return {
          times: details?.times || [],
          average: value,
          timestamp: new Date(created_at).getTime(),
        };

      case 'click-speed':
        return {
          cps: value,
          clicks: details?.clicks || 0,
          duration: details?.duration || 0,
          timestamp: new Date(created_at).getTime(),
        };

      case 'sequence-memory':
        return {
          level: value,
          timestamp: new Date(created_at).getTime(),
        };

      case 'typing':
        return {
          wpm: value,  // value 是 score 字段,已经是 net WPM
          accuracy: details?.accuracy || 100,
          timestamp: new Date(created_at).getTime(),
        };

      case 'chimp':
        return {
          level: value,
          timestamp: new Date(created_at).getTime(),
        };

      case 'stroop':
        return {
          score: value,
          averageReactionTime: details?.averageReactionTime || 0,
          timestamp: new Date(created_at).getTime(),
        };

      case 'number-memory':
        return {
          digits: value,
          timestamp: new Date(created_at).getTime(),
        };

      default:
        return null;
    }
  }

  const hasAnyData = Object.keys(allResults).length > 0;

  const testConfig: Record<string, {
    title: string;
    icon: string;
    color: string;
    unit: string;
    getValue: (result: TestResult) => number;
    getDisplay: (result: TestResult) => { label: string; value: string };
    getAverage: (results: TestResult[]) => number;
    getBest: (results: TestResult[]) => number;
  }> = {
    'simple-reaction-results': {
      title: t.statsSimpleReactionTitle,
      icon: '⚡',
      color: 'blue',
      unit: 'ms',
      getValue: (r) => r.average,
      getDisplay: (r) => ({ label: `${r.average}ms`, value: `${r.times.length} ${t.statsRounds}` }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.average, 0) / results.length),
      getBest: (results) => Math.min(...results.map((r) => r.average)),
    },
    'click-speed-results': {
      title: t.statsClickSpeedTitle,
      icon: '🖱️',
      color: 'green',
      unit: 'CPS',
      getValue: (r) => r.cps,
      getDisplay: (r) => ({ label: `${r.cps.toFixed(2)} CPS`, value: `${r.clicks} ${t.statsClicksIn} ${r.duration}s` }),
      getAverage: (results) => parseFloat((results.reduce((sum, r) => sum + r.cps, 0) / results.length).toFixed(2)),
      getBest: (results) => Math.max(...results.map((r) => r.cps)),
    },
    'auditory-reaction-results': {
      title: t.statsAuditoryReactionTitle,
      icon: '🔊',
      color: 'purple',
      unit: 'ms',
      getValue: (r) => r.average,
      getDisplay: (r) => ({ label: `${r.average}ms`, value: `${r.times.length} ${t.statsRounds}` }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.average, 0) / results.length),
      getBest: (results) => Math.min(...results.map((r) => r.average)),
    },
    'sequence-memory-results': {
      title: t.statsSequenceMemoryTitle,
      icon: '🧠',
      color: 'pink',
      unit: t.statsLevel,
      getValue: (r) => r.level,
      getDisplay: (r) => ({ label: `${t.statsLevel} ${r.level}`, value: new Date(r.timestamp).toLocaleString() }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.level, 0) / results.length),
      getBest: (results) => Math.max(...results.map((r) => r.level)),
    },
    'typing-results': {
      title: t.statsTypingTitle,
      icon: '⌨️',
      color: 'indigo',
      unit: 'WPM',
      getValue: (r) => r.wpm,
      getDisplay: (r) => ({ label: `${r.wpm} WPM`, value: `${t.typingAccuracy}: ${r.accuracy.toFixed(1)}%` }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / results.length),
      getBest: (results) => Math.max(...results.map((r) => r.wpm)),
    },
    'chimp-results': {
      title: t.statsChimpTitle,
      icon: '🐵',
      color: 'orange',
      unit: t.statsNumbers,
      getValue: (r) => r.level,
      getDisplay: (r) => ({ label: `${t.statsLevel} ${r.level}`, value: `${r.numbers} ${t.statsNumbers}` }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.level, 0) / results.length),
      getBest: (results) => Math.max(...results.map((r) => r.level)),
    },
    'choice-reaction-results': {
      title: t.statsChoiceReactionTitle,
      icon: '🎮',
      color: 'cyan',
      unit: 'ms',
      getValue: (r) => r.average,
      getDisplay: (r) => ({ label: `${r.average}ms`, value: `${r.times.length} ${t.statsRounds}` }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.average, 0) / results.length),
      getBest: (results) => Math.min(...results.map((r) => r.average)),
    },
    'stroop-results': {
      title: t.statsStroopTitle,
      icon: '🎨',
      color: 'yellow',
      unit: t.stroopTestScore,
      getValue: (r) => r.score,
      getDisplay: (r) => ({ label: `${t.stroopTestScore}: ${r.score}/${r.score || 20}`, value: `${t.stroopTestAvgReaction}: ${Math.round(r.averageReactionTime || 0)}ms` }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
      getBest: (results) => Math.max(...results.map((r) => r.score)),
    },
    'number-memory-results': {
      title: t.statsNumberMemoryTitle,
      icon: '🔢',
      color: 'teal',
      unit: t.statsDigits,
      getValue: (r) => r.digits,
      getDisplay: (r) => ({ label: `${r.digits} ${t.statsDigits}`, value: new Date(r.timestamp).toLocaleString() }),
      getAverage: (results) => Math.round(results.reduce((sum, r) => sum + r.digits, 0) / results.length),
      getBest: (results) => Math.max(...results.map((r) => r.digits)),
    },
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {t.statsTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t.statsTrackProgress}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-8 rounded-2xl border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm p-12 text-center dark:border-gray-700/50 dark:bg-gray-800/80">
            <div className="mb-4 text-6xl">📊</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{t.loading}</h3>
            <p className="text-gray-600 dark:text-gray-300">{t.statsLoadingData}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !hasAnyData && (
          <div className="mb-8 rounded-2xl border-2 border-dashed border-gray-300/50 bg-gray-50/80 backdrop-blur-sm p-12 text-center dark:border-gray-700/50 dark:bg-gray-800/80">
            <div className="mb-4 text-6xl">📊</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{t.statsNoDataTitle}</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">{t.statsNoData}</p>
            <Link
              href="/tests"
              className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              {t.statsStartTesting}
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Overview Stats */}
        {!loading && hasAnyData && (
          <>
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TEST_ORDER
                .filter((testType) => allResults[testType])
                .map((testType) => {
                  const results = allResults[testType];
                const config = testConfig[testType];
                if (!config) return null;

                const average = config.getAverage(results);
                const best = config.getBest(results);

                return (
                  <div
                    key={testType}
                    className={`rounded-2xl border-2 bg-${config.color}-50 p-6 dark:border-${config.color}-800 dark:bg-${config.color}-900/20`}
                    style={{ borderColor: config.color === 'blue' ? '#3b82f6' : config.color === 'green' ? '#22c55e' : config.color === 'purple' ? '#a855f7' : config.color === 'pink' ? '#ec4899' : config.color === 'indigo' ? '#6366f1' : config.color === 'orange' ? '#f97316' : config.color === 'cyan' ? '#06b6d4' : config.color === 'red' ? '#ef4444' : config.color === 'yellow' ? '#eab308' : '#14b8a6' }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{config.title}</h2>
                      <span className="text-3xl">{config.icon}</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                          {t.statsTotalTests}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: config.color === 'blue' ? '#2563eb' : config.color === 'green' ? '#16a34a' : config.color === 'purple' ? '#9333ea' : config.color === 'pink' ? '#db2777' : config.color === 'indigo' ? '#4f46e5' : config.color === 'orange' ? '#ea580c' : config.color === 'cyan' ? '#0891b2' : config.color === 'red' ? '#dc2626' : config.color === 'yellow' ? '#ca8a04' : '#0d9488' }}>
                          {results.length}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                            {t.statsAverageScore}
                          </div>
                          <div className="text-lg font-bold" style={{ color: config.color === 'blue' ? '#2563eb' : config.color === 'green' ? '#16a34a' : config.color === 'purple' ? '#9333ea' : config.color === 'pink' ? '#db2777' : config.color === 'indigo' ? '#4f46e5' : config.color === 'orange' ? '#ea580c' : config.color === 'cyan' ? '#0891b2' : config.color === 'red' ? '#dc2626' : config.color === 'yellow' ? '#ca8a04' : '#0d9488' }}>
                            {average}{config.unit}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                            {t.statsBestScore}
                          </div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {best}{config.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Charts */}
            <div className="mb-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.progressChartTitle}</h2>
              {TEST_ORDER
                .filter((testType) => allResults[testType])
                .map((testType) => {
                  const results = allResults[testType];
                const config = testConfig[testType];
                if (!config || results.length < 2) return null;

                const chartData = results
                  .map((r) => ({ date: new Date(r.timestamp).toISOString().split('T')[0], value: config.getValue(r) }))
                  .sort((a, b) => a.date.localeCompare(b.date));

                return (
                  <ProgressChart
                    key={testType}
                    data={chartData}
                    color={config.color === 'blue' ? '#2563eb' : config.color === 'green' ? '#16a34a' : config.color === 'purple' ? '#9333ea' : config.color === 'pink' ? '#db2777' : config.color === 'indigo' ? '#4f46e5' : config.color === 'orange' ? '#ea580c' : config.color === 'cyan' ? '#0891b2' : config.color === 'red' ? '#dc2626' : config.color === 'yellow' ? '#ca8a04' : '#0d9488'}
                    unit={config.unit}
                    title={`${config.title} ${t.simpleReactionTrend.split('(')[0].trim()}`}
                  />
                );
              })}
            </div>

            {/* Recent Tests */}
            <div className="mb-8 space-y-6">
              {TEST_ORDER
                .filter((testType) => allResults[testType])
                .map((testType) => {
                  const results = allResults[testType];
                const config = testConfig[testType];
                if (!config) return null;

                const titleKey = testType.replace('-results', '-tests');
                const recentResults = results.slice(-5).reverse();

                return (
                  <div key={testType} className="rounded-2xl border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm p-6 dark:border-gray-700/50 dark:bg-gray-800/80">
                    <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                      {config.title} - {t.statsRecentSimpleReactionTests.split('Simple')[1] || t.statsRecentSimpleReactionTests}
                    </h2>
                    <div className="space-y-3">
                      {recentResults.map((result, index) => {
                        const display = config.getDisplay(result);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-gray-50/80 backdrop-blur-sm p-4 dark:bg-gray-700/80"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-2xl">{config.icon}</div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {display.label}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(result.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {display.value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Testing CTA */}
            <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 text-center dark:border-primary-800 dark:bg-primary-900/20">
              <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                {t.statsKeepImproving}
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                {t.statsKeepImprovingDesc}
              </p>
              <Link
                href="/tests"
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                {t.statsStartTesting}
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
