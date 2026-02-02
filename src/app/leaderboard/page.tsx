'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getLeaderboard } from '@/lib/scores';

interface LeaderboardEntry {
  rank: number;
  score: number;
  timestamp: number;
  details?: string;
  username?: string;
  isUser?: boolean;
}

export default function LeaderboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [testType, setTestType] = useState<string>('simple-reaction');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userBest, setUserBest] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const testTypes = [
    { id: 'simple-reaction', title: t.simpleReaction, unit: 'ms', lowerIsBetter: true },
    { id: 'auditory-reaction', title: t.auditoryReactionTitle, unit: 'ms', lowerIsBetter: true },
    { id: 'choice-reaction', title: t.choiceReaction, unit: 'ms', lowerIsBetter: true },
    { id: 'click-speed', title: t.clickSpeed, unit: 'CPS', lowerIsBetter: false },
    { id: 'sequence-memory', title: t.sequenceMemoryTitle, unit: t.statsLevel, lowerIsBetter: false },
    { id: 'typing', title: t.typingTitle, unit: 'WPM', lowerIsBetter: false },
    { id: 'chimp', title: t.chimpTestTitle, unit: t.statsLevel, lowerIsBetter: false },
    { id: 'stroop', title: t.stroopTestTitle, unit: t.stroopTestScore, lowerIsBetter: false },
    { id: 'number-memory', title: t.numberMemoryTitle, unit: t.statsDigits, lowerIsBetter: false },
  ];

  const storageKeys: Record<string, string> = {
    'simple-reaction': 'simple-reaction-results',
    'auditory-reaction': 'auditory-reaction-results',
    'choice-reaction': 'choice-reaction-results',
    'click-speed': 'click-speed-results',
    'sequence-memory': 'sequence-memory-results',
    'typing': 'typing-results',
    'chimp': 'chimp-results',
    'stroop': 'stroop-results',
    'number-memory': 'number-memory-results',
  };

  // test_type 到实际路由的映射
  const testTypeToRoute: Record<string, string> = {
    'simple-reaction': 'simple-reaction',
    'auditory-reaction': 'auditory-reaction',
    'choice-reaction': 'choice-reaction',
    'click-speed': 'click-speed',
    'sequence-memory': 'sequence-memory',
    'typing': 'typing',
    'chimp': 'chimp-test',
    'stroop': 'stroop-test',
    'number-memory': 'number-memory',
  };

  useEffect(() => {
    loadLeaderboard();
  }, [testType, user]); // 添加 user 作为依赖，登录状态改变时重新加载

  const loadLeaderboard = async () => {
    setLoading(true);

    try {
      // 已登录：从数据库加载全局排行榜
      if (user) {
        await loadFromDatabase();
      } else {
        // 未登录：从 localStorage 加载本地数据
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('加载排行榜失败:', error);
      loadFromLocalStorage(); // 降级到本地数据
    } finally {
      setLoading(false);
    }
  };

  // 从数据库加载全局排行榜
  const loadFromDatabase = async () => {
    const startTime = performance.now();
    console.log(`🏆 [性能] 开始从数据库加载排行榜 (${testType})...`);

    const { scores, error } = await getLeaderboard(testType, 100);

    const queryTime = performance.now() - startTime;
    console.log(`🏆 [性能] 排行榜查询完成，耗时: ${queryTime.toFixed(2)}ms，结果数量: ${scores?.length || 0}`);

    if (error || scores.length === 0) {
      // 如果数据库没有数据，显示空状态
      setLeaderboard([]);
      setUserBest(null);
      return;
    }

    // 处理数据库结果 - 先按用户分组，取每个用户的最佳成绩
    const userBestScores = new Map<string, any>();

    scores.forEach((score: any) => {
      const userId = score.user_id;

      let details = '';
      let displayScore = score.score;

      // Extract details based on test type
      switch (testType) {
        case 'simple-reaction':
        case 'auditory-reaction':
        case 'choice-reaction':
          details = score.details?.rounds ? `${score.details.rounds} ${t.statsRounds}` : '';
          break;
        case 'click-speed':
          details = score.details?.clicks && score.details?.duration
            ? `${score.details.clicks} ${t.statsClicksIn} ${score.details.duration}s`
            : '';
          break;
        case 'sequence-memory':
          details = score.details?.tiles ? `${score.details.tiles} ${t.statsTiles}` : '';
          break;
        case 'typing':
          details = score.details?.accuracy
            ? `${t.typingAccuracy}: ${score.details.accuracy.toFixed(1)}%`
            : '';
          displayScore = score.details?.wpm || score.score;
          break;
        case 'chimp':
          details = '';
          break;
        case 'stroop':
          details = score.details?.averageReactionTime
            ? `${t.stroopTestAvgReaction}: ${Math.round(score.details.averageReactionTime)}ms`
            : '';
          break;
        case 'number-memory':
          details = '';
          break;
      }

      const entry = {
        score: displayScore,
        timestamp: new Date(score.created_at).getTime(),
        details,
        username: (score as any).profiles?.username || 'Anonymous',
        userId: userId,
        isUser: user ? score.user_id === user.id : false,
      };

      // 如果该用户还没有记录，或者新成绩更好
      const currentBest = userBestScores.get(userId);
      const currentTest = testTypes.find((t) => t.id === testType);
      const lowerIsBetter = currentTest?.lowerIsBetter || false;

      if (!currentBest) {
        userBestScores.set(userId, entry);
      } else {
        // 根据测试类型判断是否为更好的成绩
        const isNewBest = lowerIsBetter
          ? displayScore < currentBest.score
          : displayScore > currentBest.score;

        if (isNewBest) {
          userBestScores.set(userId, entry);
        }
      }
    });

    // 转换为数组并排序
    let processedResults = Array.from(userBestScores.values());

    // Sort and assign ranks
    const currentTest = testTypes.find((t) => t.id === testType);
    const lowerIsBetter = currentTest?.lowerIsBetter || false;

    processedResults.sort((a, b) =>
      lowerIsBetter ? a.score - b.score : b.score - a.score
    );

    const rankedResults = processedResults.map((r, index) => ({
      ...r,
      rank: index + 1,
    }));

    // Get top 10
    let top10 = rankedResults.slice(0, 10);

    // Get user's best score
    const userEntry = rankedResults.find((r) => r.isUser);

    // If user is not in top 10, add them to the display list
    if (userEntry && !top10.some((entry) => entry.isUser)) {
      top10 = [...top10, userEntry];
    }

    setLeaderboard(top10);
    setUserBest(userEntry || null);

    const totalTime = performance.now() - startTime;
    console.log(`🏆 [性能] 排行榜数据处理完成，总耗时: ${totalTime.toFixed(2)}ms`);
  };

  // 从 localStorage 加载本地数据
  const loadFromLocalStorage = () => {
    const key = storageKeys[testType];
    if (!key) {
      setLeaderboard([]);
      setUserBest(null);
      return;
    }

    const results = JSON.parse(localStorage.getItem(key) || '[]');
    if (results.length === 0) {
      setLeaderboard([]);
      setUserBest(null);
      return;
    }

    // Process results based on test type
    let processedResults: LeaderboardEntry[] = [];

    switch (testType) {
      case 'simple-reaction':
      case 'auditory-reaction':
      case 'choice-reaction':
        processedResults = results.map((r: any) => ({
          score: r.average,
          timestamp: r.timestamp,
          details: `${r.times.length} ${t.statsRounds}`,
        }));
        break;
      case 'click-speed':
        processedResults = results.map((r: any) => ({
          score: r.cps,
          timestamp: r.timestamp,
          details: `${r.clicks} ${t.statsClicksIn} ${r.duration}s`,
        }));
        break;
      case 'sequence-memory':
        processedResults = results.map((r: any) => ({
          score: r.level,
          timestamp: r.timestamp,
          details: '',
        }));
        break;
      case 'typing':
        processedResults = results.map((r: any) => ({
          score: r.wpm,
          timestamp: r.timestamp,
          details: `${t.typingAccuracy}: ${r.accuracy.toFixed(1)}%`,
        }));
        break;
      case 'chimp':
        processedResults = results.map((r: any) => ({
          score: r.level,
          timestamp: r.timestamp,
          details: `${r.numbers} ${t.statsNumbers}`,
        }));
        break;
      case 'stroop':
        processedResults = results.map((r: any) => ({
          score: r.score,
          timestamp: r.timestamp,
          details: `${t.stroopTestAvgReaction}: ${Math.round(r.averageReactionTime || 0)}ms`,
        }));
        break;
      case 'number-memory':
        processedResults = results.map((r: any) => ({
          score: r.digits,
          timestamp: r.timestamp,
          details: '',
        }));
        break;
    }

    // Sort and assign ranks
    const currentTest = testTypes.find((t) => t.id === testType);
    const lowerIsBetter = currentTest?.lowerIsBetter || false;

    processedResults.sort((a, b) =>
      lowerIsBetter ? a.score - b.score : b.score - a.score
    );

    const rankedResults = processedResults.map((r, index) => ({
      ...r,
      rank: index + 1,
    }));

    // Get top 10
    let top10 = rankedResults.slice(0, 10);

    // Get user's best score (first in sorted list for local storage)
    const userEntry = rankedResults.length > 0 ? rankedResults[0] : null;

    setLeaderboard(top10);
    setUserBest(userEntry);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const currentTest = testTypes.find((t) => t.id === testType);
  const unit = currentTest?.unit || '';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {user ? t.leaderboardTitle : t.lbLocalScores}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {user ? t.lbCompareScores : t.lbGuestMode}
          </p>
        </div>

        {/* Test Type Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {testTypes.map((test) => (
              <button
                key={test.id}
                onClick={() => setTestType(test.id)}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                  testType === test.id
                    ? 'border-primary-500 bg-primary-600 text-white'
                    : 'border-gray-200/50 bg-white/80 text-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700/50 dark:bg-gray-800/80 dark:text-gray-300'
                }`}
              >
                {test.title}
              </button>
            ))}
          </div>
        </div>

        {/* User's Best Score */}
        {userBest && (
          <div className="mb-8 rounded-2xl border-2 border-primary-200/50 bg-primary-50/80 backdrop-blur-sm p-6 dark:border-primary-800/50 dark:bg-primary-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                  {t.statsBestScore}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentTest?.title} - {userBest.score}{unit} {userBest.details && `(${userBest.details})`}
                </p>
              </div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                #{userBest.rank}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8 rounded-2xl border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm p-12 text-center dark:border-gray-700/50 dark:bg-gray-800/80">
            <div className="mb-4 text-6xl">⏳</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {t.lbLoading || 'Loading...'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t.lbLoadingDesc || 'Fetching leaderboard data...'}
            </p>
          </div>
        )}

        {/* No Data State */}
        {!loading && leaderboard.length === 0 && (
          <div className="mb-8 rounded-2xl border-2 border-dashed border-gray-300/50 bg-gray-50/80 backdrop-blur-sm p-12 text-center dark:border-gray-700/50 dark:bg-gray-800/80">
            <div className="mb-4 text-6xl">🏆</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {t.statsNoDataTitle}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t.lbNoRecordsForTest.replace('{test}', currentTest?.title || '')}
            </p>
            <Link
              href={`/tests/${testTypeToRoute[testType]}`}
              className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              {t.statsStartTesting}
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && leaderboard.length > 0 && (
          <div className="overflow-hidden rounded-2xl border-2 border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-lg dark:border-gray-700/50 dark:bg-gray-800/80">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t.lbRank}
                    </th>
                    {user && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        {t.lbUser || 'User'}
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t.lbScore}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {t.lbDate}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {t.lbDetails}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className={`transition-colors ${
                        entry.isUser
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : entry.rank === 1
                          ? 'bg-yellow-50 dark:bg-yellow-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                              entry.rank === 1
                                ? 'bg-yellow-100 text-yellow-600'
                                : entry.rank === 2
                                ? 'bg-gray-200 text-gray-600'
                                : entry.rank === 3
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                          </span>
                        </div>
                      </td>
                      {user && (
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {entry.username || (entry.isUser ? t.lbYou : t.lbAnonymous)}
                            {entry.isUser && (
                              <span className="ml-2 rounded bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                {t.lbYou.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {entry.score}{unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(entry.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{entry.details || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CTA */}
        {leaderboard.length > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-primary-200/50 bg-primary-50/80 backdrop-blur-sm p-8 text-center dark:border-primary-800/50 dark:bg-primary-900/20">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {t.lbWantToBeOnLeaderboard}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t.lbWantToBeOnLeaderboardDesc}
            </p>
            <Link
              href={`/tests/${testTypeToRoute[testType]}`}
              className="inline-flex items-center rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              {t.statsStartTesting}
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
