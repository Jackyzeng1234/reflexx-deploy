'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { getUserBestScores } from '@/lib/scores';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BestScore {
  test_type: string;
  score: number;
  details?: Record<string, any>;
  created_at: string;
}

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bestScores, setBestScores] = useState<Record<string, BestScore>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const testTypes = [
    { id: 'simple-reaction', title: t.simpleReaction, unit: 'ms', icon: '⚡', lowerIsBetter: true },
    { id: 'auditory-reaction', title: t.auditoryReactionTitle, unit: 'ms', icon: '🔊', lowerIsBetter: true },
    { id: 'choice-reaction', title: t.choiceReaction, unit: 'ms', icon: '🎮', lowerIsBetter: true },
    { id: 'click-speed', title: t.clickSpeed, unit: 'CPS', icon: '🖱️', lowerIsBetter: false },
    { id: 'sequence-memory', title: t.sequenceMemoryTitle, unit: t.statsLevel, icon: '🧠', lowerIsBetter: false },
    { id: 'typing', title: t.typingTitle, unit: 'Net WPM', icon: '⌨️', lowerIsBetter: false },
    { id: 'chimp', title: t.chimpTestTitle, unit: t.statsLevel, icon: '🐒', lowerIsBetter: false },
    { id: 'aim-trainer', title: t.aimTrainer, unit: t.statsScore, icon: '🎯', lowerIsBetter: false },
    { id: 'stroop', title: t.stroopTestTitle, unit: t.stroopTestScore, icon: '🎨', lowerIsBetter: false },
    { id: 'number-memory', title: t.numberMemoryTitle, unit: t.statsDigits, icon: '🔢', lowerIsBetter: false },
  ];

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadUserScores();
  }, [user]);

  const loadUserScores = async () => {
    setLoading(true);
    try {
      const { scores, error } = await getUserBestScores();

      if (!error && scores.length > 0) {
        // Get best score for each test type
        const bestByType: Record<string, BestScore> = {};

        scores.forEach((score: any) => {
          const testType = score.test_type;
          if (!bestByType[testType] ||
              (shouldCompareHigher(testType) && score.score > bestByType[testType].score) ||
              (!shouldCompareHigher(testType) && score.score < bestByType[testType].score)) {
            bestByType[testType] = score;
          }
        });

        setBestScores(bestByType);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user scores:', error);
      setLoading(false);
    }
  };

  const shouldCompareHigher = (testType: string) => {
    const test = testTypes.find(t => t.id === testType);
    return test ? !test.lowerIsBetter : false;
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setUpdateMessage('用户名不能为空');
      return;
    }

    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      setNewUsername('');
      setUpdateMessage('用户名更新成功！');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating username:', error);
      setUpdateMessage('更新失败：' + error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            加载中...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            个人中心
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            查看您的测试成绩和统计信息
          </p>
        </div>

        {/* User Info Card */}
        <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white shadow-lg">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder={profile.username}
                        className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-lg font-bold text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        maxLength={20}
                      />
                      <button
                        onClick={handleUpdateUsername}
                        disabled={updateLoading}
                        className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        {updateLoading ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setNewUsername('');
                          setUpdateMessage('');
                        }}
                        className="rounded-lg bg-gray-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.username}
                    </h2>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>

              {updateMessage && (
                <div className={`mb-2 text-sm font-semibold ${
                  updateMessage.includes('成功') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {updateMessage}
                </div>
              )}

              <div className="flex space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setNewUsername(profile.username);
                      setUpdateMessage('');
                    }}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    修改用户名
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Best Scores Grid */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            历史最佳成绩
          </h2>

          {loading ? (
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-6xl">⏳</div>
              <p className="text-gray-600 dark:text-gray-300">加载成绩中...</p>
            </div>
          ) : Object.keys(bestScores).length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-6xl">📊</div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                暂无成绩
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                完成测试后，您的最佳成绩将显示在这里
              </p>
              <Link
                href="/tests"
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                开始测试
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testTypes.map((test) => {
                const bestScore = bestScores[test.id];
                if (!bestScore) return null;

                return (
                  <Link
                    key={test.id}
                    href={`/leaderboard?test=${test.id}`}
                    className="group rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-primary-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-4xl">{test.icon}</div>
                      <div className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        最佳
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {test.title}
                    </h3>
                    <div className="mb-1 text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {test.id === 'typing'
                        ? bestScore.details?.wpm || bestScore.score
                        : bestScore.score}
                      {test.unit}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(bestScore.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        {Object.keys(bestScores).length > 0 && (
          <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 text-center dark:border-primary-800 dark:bg-primary-900/20">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              想要打破纪录？
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              挑战自己，在全球排行榜上争取更好的排名！
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/tests"
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                继续测试
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center rounded-lg border-2 border-primary-600 px-6 py-3 font-semibold text-primary-600 transition-all hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20"
              >
                查看排行榜
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
