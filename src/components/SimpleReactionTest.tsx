'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';

type GameState = 'idle' | 'waiting' | 'ready' | 'too-early' | 'finished';

interface SimpleReactionTestProps {
  showHeader?: boolean;
  showFAQ?: boolean;
}

const HISTORY_KEY = 'simple-reaction-results';

/** 读取本机历史成绩(ms),按时间升序 */
function readLocalHistory(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((r: any) => (typeof r.average === 'number' ? r.average : r.times?.[0]))
      .filter((n: any) => typeof n === 'number');
  } catch {
    return [];
  }
}

export default function SimpleReactionTest({ showHeader = true, showFAQ = true }: SimpleReactionTestProps) {
  const { t } = useI18n();
  const { setTimeout, clearTimeout } = useTimeout();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [scores, setScores] = useState<number[]>([]);
  const hasSavedRef = useRef(false);
  const [history, setHistory] = useState<number[]>([]);

  // 单轮:每次点击测一次,结果即当前成绩;会话内累积 best / avg
  const arm = useCallback(() => {
    setGameState('waiting');
    hasSavedRef.current = false;
    const delay = Math.random() * 3000 + 2000; // 2-5 秒随机延迟
    setTimeout(() => {
      setStartTime(performance.now());
      setGameState('ready');
    }, delay);
  }, [setTimeout]);

  const handleClick = useCallback(() => {
    if (gameState === 'idle' || gameState === 'finished') {
      arm();
      return;
    }

    if (gameState === 'waiting') {
      clearTimeout();
      setGameState('too-early');
      setTimeout(() => arm(), 900); // 提前点击:短暂提示后自动重新等待
      return;
    }

    if (gameState === 'too-early') {
      return;
    }

    if (gameState === 'ready') {
      const time = Math.round(performance.now() - startTime);
      const newScores = [...scores, time];
      setScores(newScores);
      setGameState('finished');

      // 防止重复保存
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      // 始终写入本机历史(用于进度曲线 + 访客最佳),登录用户也保留
      try {
        const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        raw.push({ times: [time], average: time, timestamp: Date.now() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
        setHistory(readLocalHistory());
      } catch (e) {
        console.error(e);
      }

      submitScore({
        test_type: 'simple-reaction',
        score: time,
        details: { times: newScores, rounds: 1 },
      }).catch(console.error);
    }
  }, [gameState, startTime, scores, arm, setTimeout, clearTimeout]);

  const getRating = (ms: number) => {
    if (ms < 200) return t.ratingSuper;
    if (ms < 250) return t.ratingExcellent;
    if (ms < 300) return t.ratingGreat;
    if (ms < 350) return t.ratingGood;
    if (ms < 400) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const getVerdictColor = (ms: number) => {
    if (ms < 200) return 'var(--color-success-400)';
    if (ms < 250) return 'var(--color-success-300)';
    if (ms < 300) return 'var(--color-brand)';
    if (ms < 350) return 'var(--color-warning-400)';
    if (ms < 400) return 'var(--color-warning-500)';
    return 'var(--color-danger-400)';
  };

  const lastTime = scores.length ? scores[scores.length - 1] : 0;
  const bestTime = scores.length ? Math.min(...scores) : 0;
  const avgTime = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const runCount = scores.length;

  const surfaceLabel =
    gameState === 'idle' ? t.srtClickOrSpace
    : gameState === 'waiting' ? t.srtWait
    : gameState === 'ready' ? t.srtClick
    : gameState === 'too-early' ? t.srtTooEarly
    : t.srtTryAgain;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleClick]);

  useEffect(() => {
    setHistory(readLocalHistory());
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title —— 编辑排版 */}
        {showHeader && (
          <div className="mb-10">
            <h1 className="display-title">{t.simpleReaction}</h1>
          </div>
        )}

        {/* 游戏区 —— display 变体:左结果 + 右方形靶 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {gameState === 'finished' ? lastTime : <span className="dim">000</span>}
              <span className="unit">ms</span>
            </div>
            <div
              className="game-verdict"
              style={{ color: gameState === 'finished' ? getVerdictColor(lastTime) : 'transparent' }}
            >
              {gameState === 'finished' ? getRating(lastTime) : ''}
            </div>
            <div className="game-stats">
              {runCount > 0
                ? runCount > 1
                  ? `${t.srtBest} ${bestTime} ms · ${t.srtAverage} ${avgTime} ms`
                  : `${t.srtBest} ${bestTime} ms`
                : ''}
            </div>
            {gameState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={() => arm()}>
                  ↻ {t.srtTryAgain}
                </button>
              </div>
            )}
          </div>

          <button
            className="game-surface"
            data-state={gameState}
            onClick={handleClick}
            aria-label={surfaceLabel}
          >
            <span className="game-label">{surfaceLabel}</span>
          </button>
        </div>

        {/* 成绩曲线:本机历史(≥2 次后显示) */}
        {showFAQ && history.length >= 2 && (
          <div className="mx-auto mt-20 max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.simpleReactionTrend}
            </h2>
            <div className="mt-6">
              <ReactionChart data={history} />
            </div>
          </div>
        )}

        {/* FAQ + SEO 正文 */}
        {showFAQ && (
        <div className="mt-20 max-w-4xl mx-auto">
          {/* SEO 正文:测量内容 + 如何提升 */}
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testBenefitsTitle}
            </h2>
            <p
              className="mt-4 leading-relaxed text-text-secondary"
              dangerouslySetInnerHTML={{ __html: t.srtBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.srtImprovements.split('<br>').map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-brand" aria-hidden>→</span>
                  <span className="leading-relaxed text-text-secondary">
                    {item.replace(/^[•\s]+/, '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <h2 className="mb-8 mt-20 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Reaction Time Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the reaction time test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>This reaction time test measures how quickly you respond to visual stimuli. It's a simple reflex test that evaluates your processing speed and motor response time.</p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-300">
                    <li><strong>Wait for the green signal</strong> - The test starts with a red box. Wait for it to randomly turn green. Clicking too early will trigger a too-early penalty!</li>
                    <li><strong>Click or press any key</strong> - As soon as you see the box turn green, click anywhere in the test area or press any key on your keyboard (spacebar works well)</li>
                    <li><strong>Complete 5 rounds</strong> - The test measures 5 reaction attempts to calculate your average reaction time in milliseconds (ms)</li>
                    <li><strong>View your results</strong> - See your average reaction time, best score, and how you compare to others worldwide</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Reaction time varies throughout the day. For the most accurate results, take the test multiple times at different times and average your scores. Avoid testing when tired or distracted.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good reaction time? Average scores by age and gender"
              icon="⚡"
              answer={
                <div className="space-y-4">
                  <p>A good reaction time depends on your age, gender, and activity level. Here are the average reaction times based on scientific research:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average reaction time by age (in milliseconds):</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🏃 <strong>18-24 years:</strong> ~200ms (men: ~190ms, women: ~210ms)</li>
                      <li>👨 <strong>25-35 years:</strong> ~215ms (men: ~205ms, women: ~225ms)</li>
                      <li>👴 <strong>36-45 years:</strong> ~230ms (men: ~220ms, women: ~240ms)</li>
                      <li>👵 <strong>46-55 years:</strong> ~245ms (men: ~235ms, women: ~255ms)</li>
                      <li>👴 <strong>56+ years:</strong> ~260ms+ (men: ~250ms+, women: ~270ms+)</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🔥 Elite (Top 5%)</p>
                      <p className="text-sm text-gray-300">Below 180ms - Professional athlete level, exceptional human reaction speed</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above Average (Top 25%)</p>
                      <p className="text-sm text-gray-300">180-220ms - Better than most people, competitive gamer level</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Normal Average</p>
                      <p className="text-sm text-gray-300">220-280ms - Typical reaction time for healthy adults</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Below Average</p>
                      <p className="text-sm text-gray-300">280-320ms - Slower than average, may need practice or better focus</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Poor</p>
                      <p className="text-sm text-gray-300">320ms+ - Significantly slower, could indicate fatigue, health issues, or need for improvement</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: These are general guidelines. Individual results can vary significantly based on genetics, fitness level, and training.</p>
                </div>
              }
            />
            <FAQItem
              question="What does reaction time test measure? Neural processing and cognitive function"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>This reaction time test measures your <strong>simple reaction time</strong> - the interval between a stimulus presentation and your voluntary response. It evaluates how fast your brain processes visual information and initiates movement.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Visual processing speed</strong> - How fast your eyes and visual cortex detect the color change (red to green)</li>
                      <li><strong>Neural transmission time</strong> - How quickly signals travel from your brain to your fingers</li>
                      <li><strong>Motor response time</strong> - How fast your muscles contract after receiving the neural signal</li>
                      <li><strong>Neural pathway efficiency</strong> - How well-established the connections between neurons are</li>
                      <li><strong>Sensorimotor integration</strong> - The coordination between sensory input and motor output</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your reaction time score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Age</strong> - Reaction time increases by ~1-2ms per year after age 20 due to natural neural decline</li>
                      <li><strong>Fatigue and sleep</strong> - Sleep deprivation can slow reaction time by 20-30%</li>
                      <li><strong>Focus and attention</strong> - Distractions can add 50-150ms to your reaction time</li>
                      <li><strong>Physical fitness</strong> - Athletes typically have faster reactions due to better neural efficiency</li>
                      <li><strong>Alcohol and drugs</strong> - Even small amounts can significantly impair reaction speed</li>
                      <li><strong>Practice and training</strong> - Regular practice can improve reaction time by 10-20%</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Why reaction time matters:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li>Important for driving safety and accident prevention</li>
                      <li>Critical for sports performance (especially racing, tennis, boxing)</li>
                      <li>Indicator of overall cognitive health and brain function</li>
                      <li>Predicts athletic ability and gaming performance potential</li>
                      <li>Can decline with neurological conditions (early warning sign)</li>
                    </ul>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve reaction time? Training exercises and optimization tips"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>You can improve your reaction time through targeted training, lifestyle changes, and proper preparation. Here's what science says works best:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Reaction Time Training Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Daily practice</strong> - Practice 10-15 minutes daily for 2-4 weeks to see 10-20% improvement in reaction speed</li>
                      <li><strong>Action video games</strong> - FPS games (CS:GO, Valorant, Call of Duty) train rapid visual processing and decision-making</li>
                      <li><strong>Ball sports</strong> - Tennis, ping pong, badminton improve hand-eye coordination and anticipatory skills</li>
                      <li><strong>Reaction training apps</strong> - Use tools like Aim Lab, Human Benchmark, or this test regularly</li>
                      <li><strong>Catching drills</strong> - Have someone drop a ruler and catch it between your fingers (classic reflex test)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🏃 Physical Optimization for Faster Reactions</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Aerobic exercise</strong> - Regular cardio (3-5 times weekly) increases cerebral blood flow and neural transmission speed</li>
                      <li><strong>Strength training</strong> - Improves neuromuscular efficiency and motor unit recruitment speed</li>
                      <li><strong>Proper nutrition</strong> - Omega-3 fatty acids, B vitamins, and antioxidants support neural health</li>
                      <li><strong>Hydration</strong> - Dehydration of just 2% body weight can slow reaction time by 10-15%</li>
                      <li><strong>Quality sleep</strong> - 7-9 hours is essential; sleep deprivation severely impairs reaction speed</li>
                      <li><strong>Warm-up exercises</strong> - Light physical activity before testing can improve performance by 5-10%</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🧠 Mental Preparation and Focus Techniques</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Test in optimal conditions</strong> - Quiet environment, good lighting, comfortable position</li>
                      <li><strong>Best time of day</strong> - Morning (after breakfast) typically yields best reaction times</li>
                      <li><strong>Stay relaxed but alert</strong> - Muscle tension slows signal transmission, stay loose</li>
                      <li><strong>Use peripheral vision</strong> - Don't stare at one point; keep your eyes relaxed and take in the whole screen</li>
                      <li><strong>Moderate caffeine</strong> - 100-200mg can improve alertness, but avoid excessive amounts</li>
                      <li><strong>Minimize distractions</strong> - Close other tabs, silence your phone, focus only on the test</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With consistent practice over 3-4 weeks, most people improve reaction time by 20-40ms (10-20%). Professional athletes can achieve sub-200ms consistently, with elite performers reaching 150-170ms range.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my reaction time slow? Common causes and how to fix them"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If your reaction time is slower than 300ms, there might be specific reasons. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for slow reaction time:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Lack of sleep</strong> - Even one night of poor sleep can slow reactions by 50-100ms. Aim for 7-9 hours.</li>
                      <li><strong>Fatigue and tiredness</strong> - Being exhausted severely impacts neural processing speed.</li>
                      <li><strong>Distractions</strong> - Multi-tasking, background noise, or phone notifications divide your attention.</li>
                      <li><strong>Alcohol or medications</strong> - Even small amounts of alcohol can impair reaction speed significantly.</li>
                      <li><strong>Stress and anxiety</strong> - High cortisol levels impair cognitive function and response time.</li>
                      <li><strong>Dehydration</strong> - Even mild dehydration slows neural transmission speed.</li>
                      <li><strong>Sedentary lifestyle</strong> - Lack of physical activity leads to slower neural responses.</li>
                      <li><strong>Age</strong> - Natural decline, but can be mitigated with training and healthy lifestyle.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to fix slow reaction time:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Get better sleep</strong> - Prioritize sleep hygiene; it's the #1 performance factor.</li>
                      <li><strong>Exercise regularly</strong> - Both cardio and strength training improve neural efficiency.</li>
                      <li><strong>Stay hydrated</strong> - Drink water throughout the day, especially before testing.</li>
                      <li><strong>Practice reaction tests</strong> - Use this test daily for 2 weeks to build muscle memory.</li>
                      <li><strong>Reduce alcohol and drugs</strong> - Avoid these for at least 24 hours before important activities.</li>
                      <li><strong>Manage stress</strong> - Meditation and mindfulness can improve focus and reaction time.</li>
                      <li><strong>Eat brain-healthy foods</strong> - Fatty fish, nuts, berries, and dark chocolate support cognitive function.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Medical Note:</strong> If your reaction time is consistently over 350ms and you're under 40, consider consulting a healthcare provider. Extremely slow reactions can indicate neurological conditions, vitamin deficiencies, or other health issues.</p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
