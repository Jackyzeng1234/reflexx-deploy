'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore, getBestScore } from '@/lib/scores';

type TestState = 'idle' | 'playing' | 'finished';

interface Target {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
}

export default function AimTrainerTest() {
  const { t } = useI18n();
  const [testState, setTestState] = useState<TestState>('idle');
  const [target, setTarget] = useState<Target | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [avgReaction, setAvgReaction] = useState(0);
  const [bestReaction, setBestReaction] = useState(0);
  const [bestOverallReaction, setBestOverallReaction] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false);
  const targetIdCounter = useRef(0);
  const processingClickRef = useRef(false);

  const GAME_DURATION = 20;
  const TARGET_RADIUS = 25;
  const MIN_TARGET_LIFETIME = 100;

  // 加载最佳成绩
  useEffect(() => {
    async function loadBestScore() {
      const scoreData = await getBestScore('aim-trainer');
      setBestOverallReaction(scoreData);
    }
    loadBestScore();
  }, []);

  // 生成随机目标位置
  const generateRandomPosition = useCallback(() => {
    if (!gameAreaRef.current) return { x: 50, y: 50 };

    const rect = gameAreaRef.current.getBoundingClientRect();
    const padding = TARGET_RADIUS + 15;
    const topPadding = 80; // 顶部留出空间给倒计时显示

    const maxX = rect.width - padding * 2;
    const maxY = rect.height - padding - topPadding;

    const x = padding + Math.random() * maxX;
    const y = topPadding + Math.random() * maxY;

    return {
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    };
  }, []);

  // 生成新目标
  const spawnTarget = useCallback(() => {
    const position = generateRandomPosition();
    const newTarget: Target = {
      id: targetIdCounter.current++,
      ...position,
      spawnTime: Date.now(),
    };
    setTarget(newTarget);
  }, [generateRandomPosition]);

  // 开始游戏
  const startGame = useCallback(() => {
    setTestState('playing');
    setTarget(null);
    setTimeLeft(GAME_DURATION);
    setAvgReaction(0);
    setBestReaction(0);
    setReactionTimes([]);
    hasSavedRef.current = false;
    targetIdCounter.current = 0;
    processingClickRef.current = false;

    setTimeout(() => spawnTarget(), 200);
  }, [spawnTarget]);

  // 处理点击
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (testState === 'idle' || testState === 'finished') {
      startGame();
      return;
    }

    if (testState !== 'playing' || processingClickRef.current) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect || !target) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const clickTime = Date.now();

    const targetX = (target.x / 100) * rect.width;
    const targetY = (target.y / 100) * rect.height;
    const distance = Math.sqrt((clickX - targetX) ** 2 + (clickY - targetY) ** 2);

    processingClickRef.current = true;

    if (distance <= TARGET_RADIUS) {
      const reactionTime = clickTime - target.spawnTime;

      if (reactionTime >= MIN_TARGET_LIFETIME) {
        setReactionTimes((prev) => {
          const newTimes = [...prev, reactionTime];
          const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
          const best = Math.min(...newTimes);
          setAvgReaction(avg);
          setBestReaction(best);
          return newTimes;
        });

        setTarget(null);
        setTimeout(() => spawnTarget(), 50 + Math.random() * 100);
      }
    }

    processingClickRef.current = false;
  }, [testState, target, spawnTarget, startGame]);

  // 游戏计时器
  useEffect(() => {
    if (testState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testState]);

  // 结束游戏
  const endGame = useCallback(() => {
    setTestState('finished');

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (hasSavedRef.current) {
      return;
    }
    hasSavedRef.current = true;

    // 只有在有有效点击时才提交分数
    if (reactionTimes.length > 0 && avgReaction > 0) {
      submitScore({
        test_type: 'aim-trainer',
        score: avgReaction,
        details: {
          bestReaction,
          duration: GAME_DURATION,
        },
      }).then(async (submittedToDb) => {
        if (!submittedToDb) {
          const savedResults = JSON.parse(localStorage.getItem('aim-trainer-results') || '[]');
          savedResults.push({
            avgReaction,
            bestReaction,
            timestamp: Date.now(),
          });
          localStorage.setItem('aim-trainer-results', JSON.stringify(savedResults.slice(-100)));
        }
      }).catch(console.error);
    }
  }, [avgReaction, bestReaction, reactionTimes]);

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getRating = (reactionTime: number) => {
    if (reactionTime < 200) return t.ratingSuper || 'Super';
    if (reactionTime < 250) return t.ratingExcellent || 'Excellent';
    if (reactionTime < 300) return t.ratingGreat || 'Great';
    if (reactionTime < 350) return t.ratingGood || 'Good';
    if (reactionTime < 400) return t.ratingAverage || 'Average';
    return t.ratingNeedsPractice || 'Needs Practice';
  };

  const getRatingColor = (reactionTime: number) => {
    if (reactionTime < 200) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    if (reactionTime < 250) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (reactionTime < 300) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (reactionTime < 350) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    if (reactionTime < 400) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {t.aimTrainerTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t.aimTrainerDesc}
          </p>
        </div>

        {/* 游戏区域 */}
        <div className="mb-6">
          {/* 游戏画布 */}
          <div
            ref={gameAreaRef}
            onClick={handleClick}
            className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 shadow-xl ${
              testState === 'idle'
                ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900'
                : testState === 'playing'
                ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
            }`}
            style={{ height: '500px' }}
          >
            {/* 游戏进行中的时间显示 */}
            {testState === 'playing' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {timeLeft}
                </div>
              </div>
            )}
            {/* 空闲状态 */}
            {testState === 'idle' && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🎯</div>
                  <div className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {t.aimTrainerTitle}
                  </div>
                  <div className="mb-4 text-lg text-gray-600 dark:text-gray-300">
                    {t.aimTrainerClickToStart}
                  </div>
                </div>
              </div>
            )}

            {/* 游戏进行中 - 单个目标 */}
            {testState === 'playing' && target && (
              <div
                key={target.id}
                className="absolute animate-pulse"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* 最外圈 - 白色 */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-xl"
                  style={{
                    width: TARGET_RADIUS * 2.2,
                    height: TARGET_RADIUS * 2.2,
                  }}
                />
                {/* 第二圈 - 红色 */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg"
                  style={{
                    width: TARGET_RADIUS * 2,
                    height: TARGET_RADIUS * 2,
                  }}
                />
                {/* 第三圈 - 白色 */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md"
                  style={{
                    width: TARGET_RADIUS * 1.4,
                    height: TARGET_RADIUS * 1.4,
                  }}
                />
                {/* 第四圈 - 红色 */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-500 to-red-700"
                  style={{
                    width: TARGET_RADIUS * 0.9,
                    height: TARGET_RADIUS * 0.9,
                  }}
                />
                {/* 靶心 - 白色 */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm"
                  style={{
                    width: TARGET_RADIUS * 0.4,
                    height: TARGET_RADIUS * 0.4,
                  }}
                />
              </div>
            )}

            {/* 结束状态 */}
            {testState === 'finished' && (
              <div className="w-full px-8 py-6">
                <div className="mb-6 text-center">
                  <div className="mb-3 text-5xl">📊</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t.aimTrainerResults}
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center">
                    <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.aimTrainerAvgReaction || 'Average Reaction'}</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{avgReaction}<span className="text-2xl">ms</span></div>
                    <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white ${
                      avgReaction < 200 ? 'bg-purple-500' :
                      avgReaction < 250 ? 'bg-green-500' :
                      avgReaction < 300 ? 'bg-blue-500' :
                      avgReaction < 350 ? 'bg-yellow-500' :
                      avgReaction < 400 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {getRating(avgReaction)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.srtBest}</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{bestReaction}<span className="text-2xl">ms</span></div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={startGame}
                    className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
                  >
                    {t.aimTrainerTryAgain}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 说明、益处和提升方法 */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* 游戏说明 */}
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white/60 backdrop-blur-md p-5 dark:border-gray-700/50 dark:bg-gray-800/60">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white text-center">
              📖 {t.howToPlay}
            </h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• {t.aimTrainerInstruction1}</li>
              <li>• {t.aimTrainerInstruction2}</li>
              <li>• {t.aimTrainerInstruction3}</li>
              <li>• {t.aimTrainerInstruction4}</li>
            </ol>
          </div>

          {/* 测量能力 */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300 text-center">
              🧠 {t.testBenefitsTitle}
            </h3>
            <div
              className="text-sm leading-relaxed text-blue-800 dark:text-blue-200"
              dangerouslySetInnerHTML={{ __html: t.aimTrainerBenefits }}
            />
          </div>

          {/* 提升方法 */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300 text-center">
              📈 {t.testHowToImproveTitle}
            </h3>
            <div
              className="text-sm leading-relaxed text-green-800 dark:text-green-200"
              dangerouslySetInnerHTML={{ __html: t.aimTrainerImprovements }}
            />
          </div>
        </div>

        {/* 最佳成绩 */}
        {bestOverallReaction !== null && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.aimTrainerBestScore || 'Best'}: {bestOverallReaction}ms
          </div>
        )}
      </div>
    </div>
  );
}
