'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore, getBestScore } from '@/lib/scores';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { Crosshair, BarChart3 } from 'lucide-react';

type TestState = 'idle' | 'playing' | 'finished';

interface Target {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
}

const HISTORY_KEY = 'aim-trainer-results';

/** 读取本机历史成绩(平均反应 ms),按时间升序 */
function readLocalHistory(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((r: any) => (typeof r.avgReaction === 'number' ? r.avgReaction : r.score))
      .filter((n: any) => typeof n === 'number');
  } catch {
    return [];
  }
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
  const [history, setHistory] = useState<number[]>([]);

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

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
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
      // 始终写入本机历史(进度曲线),登录用户也保留
      try {
        const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        raw.push({ avgReaction, bestReaction, timestamp: Date.now() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
        setHistory(readLocalHistory());
      } catch (e) {
        console.error(e);
      }

      submitScore({
        test_type: 'aim-trainer',
        score: avgReaction,
        details: {
          bestReaction,
          duration: GAME_DURATION,
        },
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

  const getVerdictColor = (ms: number) => {
    if (ms < 200) return 'var(--color-success-400)';
    if (ms < 250) return 'var(--color-success-300)';
    if (ms < 300) return 'var(--color-brand)';
    if (ms < 350) return 'var(--color-warning-400)';
    if (ms < 400) return 'var(--color-warning-500)';
    return 'var(--color-danger-400)';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="display-title">{t.aimTrainerTitle}</h1>
        </div>

        {/* 游戏区 —— display 变体:左结果 + 右瞄准靶 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {testState === 'finished' && reactionTimes.length > 0 ? avgReaction : <span className="dim">000</span>}
              <span className="unit">ms</span>
            </div>
            <div
              className="game-verdict"
              style={{
                color:
                  testState === 'finished' && reactionTimes.length > 0
                    ? getVerdictColor(avgReaction)
                    : 'transparent',
              }}
            >
              {testState === 'finished' && reactionTimes.length > 0 ? getRating(avgReaction) : ''}
            </div>
            <div className="game-stats">
              {testState === 'finished'
                ? reactionTimes.length > 0
                  ? `${t.srtBest} ${bestReaction} ms`
                  : t.statsNeedMoreData
                : testState === 'playing'
                ? `${timeLeft}s`
                : ''}
            </div>
            {testState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={startGame}>
                  ↻ {t.aimTrainerTryAgain}
                </button>
              </div>
            )}
          </div>

          {/* 瞄准画布 */}
          <div
            ref={gameAreaRef}
            onClick={handleClick}
            className="relative w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface"
            style={{ aspectRatio: '4 / 3' }}
          >
            {testState === 'playing' && (
              <div className="absolute top-3 left-1/2 z-10 -translate-x-1/2">
                <div className="tabular-nums text-4xl font-bold text-text">{timeLeft}</div>
              </div>
            )}

            {testState === 'idle' && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 flex justify-center"><Crosshair className="h-14 w-14 text-cyan-300" /></div>
                  <div className="text-lg font-bold text-text">{t.aimTrainerClickToStart}</div>
                </div>
              </div>
            )}

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
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-xl"
                  style={{ width: TARGET_RADIUS * 2.2, height: TARGET_RADIUS * 2.2 }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg"
                  style={{ width: TARGET_RADIUS * 2, height: TARGET_RADIUS * 2 }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md"
                  style={{ width: TARGET_RADIUS * 1.4, height: TARGET_RADIUS * 1.4 }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-500 to-red-700"
                  style={{ width: TARGET_RADIUS * 0.9, height: TARGET_RADIUS * 0.9 }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm"
                  style={{ width: TARGET_RADIUS * 0.4, height: TARGET_RADIUS * 0.4 }}
                />
              </div>
            )}

            {testState === 'finished' && (
              <div className="flex h-full items-center justify-center">
                <span className="game-label text-text-tertiary">{t.aimTrainerResults}</span>
              </div>
            )}
          </div>
        </div>

        {/* 成绩曲线:本机历史(≥2 次后显示) */}
        {history.length >= 2 && (
          <div className="mx-auto mt-20 max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.progressChartTitle}
            </h2>
            <div className="mt-6">
              <ReactionChart data={history} />
            </div>
          </div>
        )}

        {/* SEO 正文:测量内容 + 如何提升 */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testBenefitsTitle}
            </h2>
            <p
              className="mt-4 leading-relaxed text-text-secondary"
              dangerouslySetInnerHTML={{ __html: t.aimBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.aimImprovements.split('<br>').map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-brand" aria-hidden>→</span>
                  <span className="leading-relaxed text-text-secondary">
                    {item.replace(/^[•\s]+/, '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Aim Trainer</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the aim trainer test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>This aim trainer test measures your reaction time and accuracy when targeting visual objects. It evaluates hand-eye coordination, visual processing speed, and motor precision - skills essential for gaming and sports performance.</p>
                  <ol className="space-y-2 list-decimal list-inside text-gray-300">
                    <li><strong>Start the test</strong> - Click anywhere in the game area to begin a 20-second aiming session</li>
                    <li><strong>Click the targets</strong> - Red and white bullseye targets will appear at random positions. Click them as fast as possible</li>
                    <li><strong>Track your reaction time</strong> - Each target's lifetime is measured from appearance to your click. Faster clicks = better score</li>
                    <li><strong>View your results</strong> - See your average reaction time, best click, and rating. Lower times are better!</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Aim for the center of the target. The test measures reaction to target appearance, not just clicking accuracy. Focus on speed while maintaining reasonable accuracy - don't sacrifice speed for perfect precision.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good aim trainer score? Average reaction times by skill level"
              icon="⚡"
              answer={
                <div className="space-y-4">
                  <p>A good aim trainer score depends on your experience, gaming background, and practice level. Here are average reaction time benchmarks for target acquisition:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average reaction times by experience level:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🎮 <strong>Professional gamers:</strong> 180-220ms - Elite level, years of competitive gaming experience</li>
                      <li>👾 <strong>Regular gamers:</strong> 220-280ms - Above average, frequent gaming (10+ hours/week)</li>
                      <li>🖱️ <strong>Casual gamers:</strong> 280-350ms - Moderate gaming experience, plays occasionally</li>
                      <li>💼 <strong>Non-gamers:</strong> 350-450ms - Little gaming experience, relies on natural reflexes</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Elite (Top 5%)</p>
                      <p className="text-sm text-gray-300">Below 200ms - Professional esports level, exceptional aiming ability</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above Average (Top 25%)</p>
                      <p className="text-sm text-gray-300">200-250ms - Competitive gamer level, excellent hand-eye coordination</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Normal Average</p>
                      <p className="text-sm text-gray-300">250-350ms - Typical reaction time for healthy adults with some gaming experience</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Below Average</p>
                      <p className="text-sm text-gray-300">350-400ms - Slower than average, may need practice or better focus</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Poor</p>
                      <p className="text-sm text-gray-300">400ms+ - Significantly slower, could indicate fatigue, lack of practice, or need for improvement</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: Aim trainer scores typically improve 20-30% with consistent practice over 2-3 weeks. Professional players can reach sub-180ms consistently with intense training.</p>
                </div>
              }
            />
            <FAQItem
              question="What does aim trainer measure? Hand-eye coordination and visual processing"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The aim trainer test measures your <strong>visual-motor reaction time</strong>, <strong>spatial awareness</strong>, and <strong>target acquisition speed</strong>. It evaluates how quickly your brain processes visual information and coordinates precise motor responses.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Visual processing speed</strong> - How fast you detect and recognize targets in your visual field</li>
                      <li><strong>Peripheral vision awareness</strong> - Your ability to spot targets appearing anywhere on screen</li>
                      <li><strong>Eye-hand coordination</strong> - The synchronization between visual detection and mouse movement</li>
                      <li><strong>Motor precision</strong> - Your ability to accurately click on specific targets quickly</li>
                      <li><strong>Reaction consistency</strong> - How stable your performance remains across multiple targets</li>
                      <li><strong>Decision speed</strong> - Time between seeing a target and initiating movement</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your aim trainer score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Gaming experience</strong> - FPS and MOBA players typically score 50-100ms faster than non-gamers</li>
                      <li><strong>Mouse sensitivity and DPI</strong> - Proper settings improve precision and speed by 10-15%</li>
                      <li><strong>Monitor refresh rate</strong> - 144Hz+ monitors can improve reaction time by 10-20ms vs 60Hz</li>
                      <li><strong>Fatigue and focus</strong> - Tiredness can slow reactions by 30-50ms</li>
                      <li><strong>Hand position and ergonomics</strong> - Comfortable setup improves consistency and reduces fatigue</li>
                      <li><strong>Practice and training</strong> - Regular aim training can improve scores by 15-25% over time</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>🎮 Gaming Applications:</strong> Aim trainer skills directly transfer to FPS games (CS:GO, Valorant, Overwatch), battle royales, and even sports performance. Professional esports teams use aim trainers daily as part of their training routine.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve aim trainer score? Training routines and optimization"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Improving your aim trainer score requires dedicated practice, proper setup optimization, and targeted training routines. Here's a comprehensive guide to boosting your aiming performance:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🖱️ Hardware and Settings Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Use a gaming mouse</strong> - Sensors with lower latency and higher DPI (800-1600) improve precision</li>
                      <li><strong>Optimize mouse sensitivity</strong> - Lower sensitivity (400-800 eDPI) allows for more precise aiming</li>
                      <li><strong>High refresh rate monitor</strong> - 144Hz, 240Hz, or higher reduces input lag and improves target tracking</li>
                      <li><strong>Adjust in-game sensitivity</strong> - Find your perfect sensitivity through experimentation and consistency</li>
                      <li><strong>Reduce input lag</strong> - Use wired connections, disable V-Sync, enable game mode</li>
                      <li><strong>Proper mousepad</strong> - Large, smooth pad provides consistent surface for arm aiming</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Training Routines and Drills</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Daily aim practice</strong> - 15-30 minutes of aim training builds consistency and muscle memory</li>
                      <li><strong>Warm-up routine</strong> - 5-10 minutes before gaming sessions improves in-game performance</li>
                      <li><strong>Vary target sizes</strong> - Practice with different target sizes to improve versatility</li>
                      <li><strong>Focus mode</strong> - Practice tracking, flicking, and switching targets separately</li>
                      <li><strong>Timed challenges</strong> - Set goals for reaction times (e.g., maintain sub-250ms for 20 targets)</li>
                      <li><strong>Rest intervals</strong> - Take 1-2 minute breaks every 10-15 minutes to prevent fatigue</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">👆 Aiming Techniques to Master</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Flick shooting</strong> - Quick, sharp movements to snap onto targets. Essential for fast-paced games</li>
                      <li><strong>Tracking</strong> - Smoothly following moving targets. Important for projectile weapons and tracking enemies</li>
                      <li><strong>Target switching</strong> - Rapidly moving between multiple targets. Improves reaction flexibility</li>
                      <li><strong>Click timing</strong> - Developing rhythm and consistency in click execution</li>
                      <li><strong>Peripheral awareness</strong> - Using entire screen, not just center focus point</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🏃 Physical and Mental Preparation</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Proper posture</strong> - Sit upright, monitor at eye level, arm at 90-degree angle</li>
                      <li><strong>Arm vs wrist aiming</strong> - Find your style: arm for precision, wrist for speed, hybrid for balance</li>
                      <li><strong>Hand exercises</strong> - Stretch and strengthen fingers, wrists, and forearms</li>
                      <li><strong>Stay hydrated and rested</strong> - Dehydration and fatigue significantly impair reaction time</li>
                      <li><strong>Minimize distractions</strong> - Quiet environment improves focus and consistency</li>
                      <li><strong>Mental warm-up</strong> - Start with slower targets and progressively increase difficulty</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With 15-20 minutes of daily practice, most people improve by 30-50ms (10-15% improvement) in 2-3 weeks. Consistent practice over 2-3 months can yield 50-80ms improvement, moving you from average to above-average performance levels.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my aim trainer score low? Common causes and how to improve"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If your aim trainer score is above 350ms, there might be specific reasons affecting your performance. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for low aim trainer scores:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Lack of gaming experience</strong> - Non-gamers typically score 50-100ms slower than regular gamers</li>
                      <li><strong>Improper mouse settings</strong> - Sensitivity too high or low affects precision and reaction speed</li>
                      <li><strong>Slow monitor refresh rate</strong> - 60Hz monitors add 10-20ms of input delay compared to 144Hz+</li>
                      <li><strong>Poor ergonomics</strong> - Awkward hand position, bad posture, or uncomfortable setup reduces efficiency</li>
                      <li><strong>Fatigue and tiredness</strong> - Being exhausted slows visual processing and motor responses significantly</li>
                      <li><strong>Lack of focus</strong> - Distractions, multitasking, or not taking the test seriously adds 30-50ms</li>
                      <li><strong>Physical limitations</strong> - Age, vision problems, or medical conditions can affect performance</li>
                      <li><strong>Wrong technique</strong> - Using whole arm movements instead of wrist, or vice versa, can slow reactions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to improve your aim trainer score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Practice daily</strong> - Consistent 15-20 minute sessions build muscle memory faster than occasional marathon sessions</li>
                      <li><strong>Optimize your setup</strong> - Adjust mouse DPI, get a 144Hz+ monitor, use proper gaming mouse and mousepad</li>
                      <li><strong>Experiment with sensitivity</strong> - Try different settings to find what allows both speed and precision</li>
                      <li><strong>Improve ergonomics</strong> - Position monitor at eye level, keep arm comfortable, maintain good posture</li>
                      <li><strong>Learn proper technique</strong> - Watch pro players and aim training tutorials for best practices</li>
                      <li><strong>Warm up properly</strong> - Start with easier targets and gradually increase difficulty</li>
                      <li><strong>Stay rested and focused</strong> - Practice when alert, take breaks when fatigued</li>
                      <li><strong>Use structured training</strong> - Follow specific aim training routines rather than random practice</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Important Note:</strong> Aim trainer scores improve significantly with practice but have natural limits. Don't obsess over achieving pro-level times if you're a casual gamer. Focus on gradual improvement and consistency rather than comparing to elite players. Most importantly, have fun while training!</p>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* 最佳成绩 */}
        {bestOverallReaction !== null && (
          <div className="mt-6 text-center text-sm text-gray-400">
            {t.aimTrainerBestScore || 'Best'}: {bestOverallReaction}ms
          </div>
        )}
      </div>
    </div>
  );
}
