'use client';

import { useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { Gamepad2, Timer, BarChart3 } from 'lucide-react';

type GameState = 'idle' | 'waiting' | 'ready' | 'finished';
type TargetKey = 'arrow-left' | 'arrow-up' | 'arrow-down' | 'arrow-right';

interface Target {
  key: TargetKey;
  icon: string;
  label: string;
}

const targets: Target[] = [
  { key: 'arrow-left', icon: '←', label: 'Left' },
  { key: 'arrow-up', icon: '↑', label: 'Up' },
  { key: 'arrow-down', icon: '↓', label: 'Down' },
  { key: 'arrow-right', icon: '→', label: 'Right' },
];

const keyMap: { [key: string]: TargetKey } = {
  'ArrowLeft': 'arrow-left',
  'ArrowUp': 'arrow-up',
  'ArrowDown': 'arrow-down',
  'ArrowRight': 'arrow-right',
};

const HISTORY_KEY = 'choice-reaction-results';

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

export default function ChoiceReactionTest() {
  const { t } = useI18n();
  const { setTimeout, clearTimeout } = useTimeout();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalRounds] = useState(10);
  const hasSavedRef = useRef(false);
  const [history, setHistory] = useState<number[]>([]);

  const getRandomTarget = useCallback(() => {
    return targets[Math.floor(Math.random() * targets.length)];
  }, []);

  const startGame = useCallback(() => {
    setGameState('waiting');
    setReactionTimes([]);
    setCurrentRound(0);
    setCurrentTarget(null);
    hasSavedRef.current = false;

    const delay = Math.random() * 2000 + 1000; // 1-3 seconds

    setTimeout(() => {
      const target = getRandomTarget();
      setCurrentTarget(target);
      setGameState('ready');
      setStartTime(performance.now());
    }, delay);
  }, [getRandomTarget, setTimeout]);

  // Handle keyboard input to start game
  useEffect(() => {
    if (gameState === 'idle') {
      const handleKeyPress = () => {
        startGame();
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, startGame]);

  const nextRound = useCallback(() => {
    if (currentRound + 1 >= totalRounds) {
      setGameState('finished');
      const average = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);

      // 防止重复保存
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      // 始终写入本机历史(进度曲线),登录用户也保留
      try {
        const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        raw.push({ times: reactionTimes, average, timestamp: Date.now() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
        setHistory(readLocalHistory());
      } catch (e) {
        console.error(e);
      }

      submitScore({
        test_type: 'choice-reaction',
        score: average,
        details: {
          times: reactionTimes,
          rounds: totalRounds,
        },
      }).catch(console.error);
    } else {
      setGameState('waiting');
      setCurrentRound(currentRound + 1);
      setCurrentTarget(null);

      const delay = Math.random() * 2000 + 1000;

      setTimeout(() => {
        const target = getRandomTarget();
        setCurrentTarget(target);
        setGameState('ready');
        setStartTime(performance.now());
      }, delay);
    }
  }, [currentRound, totalRounds, getRandomTarget, setTimeout]);

  useEffect(() => {
    if (gameState === 'ready' && currentTarget) {
      const handleKeyPress = (e: KeyboardEvent) => {
        // Prevent page scrolling when using arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
        }

        const pressedKey = keyMap[e.key];
        if (pressedKey === currentTarget.key) {
          const reactionTime = performance.now() - startTime;
          setReactionTimes([...reactionTimes, reactionTime]);
          nextRound();
        } else if (pressedKey) {
          // Wrong key pressed - still count as reaction but could add penalty
          const reactionTime = performance.now() - startTime;
          setReactionTimes([...reactionTimes, reactionTime + 500]); // 500ms penalty for wrong key
          nextRound();
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, currentTarget, startTime, reactionTimes, nextRound]);

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
  }, []);

  const getRating = (avgTime: number) => {
    if (avgTime < 400) return t.ratingSuper;
    if (avgTime < 500) return t.ratingExcellent;
    if (avgTime < 600) return t.ratingGreat;
    if (avgTime < 700) return t.ratingGood;
    if (avgTime < 800) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const getVerdictColor = (ms: number) => {
    if (ms < 400) return 'var(--color-success-400)';
    if (ms < 500) return 'var(--color-success-300)';
    if (ms < 600) return 'var(--color-brand)';
    if (ms < 700) return 'var(--color-warning-400)';
    if (ms < 800) return 'var(--color-warning-500)';
    return 'var(--color-danger-400)';
  };

  const averageTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const bestTime = reactionTimes.length > 0 ? Math.round(Math.min(...reactionTimes)) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="display-title">{t.choiceReaction}</h1>
        </div>
        {/* 游戏区 —— display 变体:左结果 + 右方向靶 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {gameState === 'finished' ? averageTime : <span className="dim">000</span>}
              <span className="unit">ms</span>
            </div>
            <div
              className="game-verdict"
              style={{ color: gameState === 'finished' ? getVerdictColor(averageTime) : 'transparent' }}
            >
              {gameState === 'finished' ? getRating(averageTime) : ''}
            </div>
            <div className="game-stats">
              {gameState === 'finished'
                ? `${t.srtBest} ${bestTime} ms · ${t.srtAverage} ${averageTime} ms`
                : `${currentRound + 1} / ${totalRounds}`}
            </div>
            {gameState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={startGame}>
                  ↻ {t.srtTryAgain}
                </button>
              </div>
            )}
          </div>

          <div className="game-panel relative min-h-[320px]">
            {gameState === 'waiting' && (
              <div className="text-center">
                <div className="mb-6 flex justify-center"><Timer className="h-16 w-16 text-cyan-300" /></div>
                <p className="text-2xl font-bold text-text">{t.getReady}</p>
                <p className="mt-3 text-lg text-text-secondary">{currentRound + 1} / {totalRounds}</p>
              </div>
            )}

            {gameState === 'ready' && currentTarget && (
              <div className="text-center">
                <div className="mb-6 flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-7xl text-gray-900 shadow-[0_0_40px_rgba(34,211,238,0.35)]">
                  {currentTarget.icon}
                </div>
                <p className="text-2xl font-bold text-text">
                  {t.pressArrow.replace('{direction}', currentTarget.label)}
                </p>
              </div>
            )}

            {gameState === 'idle' && (
              <div className="text-center">
                <button className="btn btn-primary" onClick={startGame}>
                  {t.clickToStart}
                </button>
                <p className="mt-3 text-sm text-text-tertiary">{t.orPressAnyKeyToStart}</p>
              </div>
            )}

            {gameState === 'finished' && (
              <span className="game-label text-text-tertiary">{t.srtResults}</span>
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
              dangerouslySetInnerHTML={{ __html: t.crtBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.crtImprovements.split('<br>').map((item) => (
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
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Choice Reaction Time Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the choice reaction time test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>The choice reaction time test measures how quickly you can process visual information and make a decision. Unlike simple reaction tests, this evaluates cognitive processing speed by requiring you to identify and respond to different stimuli.</p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-300">
                    <li><strong>Wait for the visual signal</strong> - A random arrow (↑↓←→) will appear on screen. You need to identify which direction it's pointing.</li>
                    <li><strong>Press the matching arrow key</strong> - Quickly press the arrow key on your keyboard that matches the direction shown.</li>
                    <li><strong>Complete 10 rounds</strong> - The test measures your reaction time across 10 trials with random arrow directions.</li>
                    <li><strong>Get your results</strong> - View your average reaction time, best score, and performance rating.</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Choice reaction time is typically 100-200ms slower than simple reaction time because your brain must process and identify the stimulus before responding. This test measures both decision-making speed and motor response time.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good choice reaction time? Average scores explained"
              icon="⚡"
              answer={
                <div className="space-y-4">
                  <p>A good choice reaction time depends on age, experience, and practice level. Choice reaction times are naturally slower than simple reactions because they involve decision-making.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average choice reaction time by age (in milliseconds):</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🎮 <strong>18-24 years:</strong> ~380ms (men: ~360ms, women: ~400ms)</li>
                      <li>👨 <strong>25-35 years:</strong> ~420ms (men: ~400ms, women: ~440ms)</li>
                      <li>👴 <strong>36-45 years:</strong> ~460ms (men: ~440ms, women: ~480ms)</li>
                      <li>👵 <strong>46-55 years:</strong> ~500ms (men: ~480ms, women: ~520ms)</li>
                      <li>👴 <strong>56+ years:</strong> ~540ms+ (men: ~520ms+, women: ~560ms+)</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🔥 Elite (Top 5%)</p>
                      <p className="text-sm text-gray-300">Below 350ms - Professional gamer/athlete level, exceptional decision-making speed</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above Average (Top 25%)</p>
                      <p className="text-sm text-gray-300">350-450ms - Better than most, excellent cognitive processing</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Normal Average</p>
                      <p className="text-sm text-gray-300">450-550ms - Typical choice reaction time for healthy adults</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Below Average</p>
                      <p className="text-sm text-gray-300">550-650ms - Slower processing, may benefit from practice and focus exercises</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Poor</p>
                      <p className="text-sm text-gray-300">650ms+ - Significantly slower, could indicate fatigue, distraction, or need for cognitive training</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: Choice reaction time includes decision-making time, so scores are 100-200ms slower than simple reaction tests. Gaming and sports practice can significantly improve choice reaction speed.</p>
                </div>
              }
            />
            <FAQItem
              question="What does choice reaction time measure? Cognitive abilities assessed"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The choice reaction time test measures your <strong>choice reaction time</strong> - the time required to process visual information, make a decision, and execute a motor response. It evaluates complex cognitive functions beyond simple reflexes.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Visual processing speed</strong> - How quickly you recognize and identify arrow direction</li>
                      <li><strong>Decision-making time</strong> - How fast your brain processes and selects the correct response</li>
                      <li><strong>Neural transmission efficiency</strong> - Speed of signal transmission between brain regions</li>
                      <li><strong>Motor response coordination</strong> - How quickly your fingers execute the chosen action</li>
                      <li><strong>Cognitive flexibility</strong> - Ability to switch between different responses based on stimuli</li>
                      <li><strong>Attention and focus</strong> - Sustained concentration required for accurate responses</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Age</strong> - Processing speed naturally declines ~1-2ms per year after age 25</li>
                      <li><strong>Familiarity with arrows</strong> - Gamers and frequent computer users typically perform better</li>
                      <li><strong>Fatigue and stress</strong> - Mental exhaustion significantly impacts decision-making speed</li>
                      <li><strong>Practice effects</strong> - Regular testing can improve scores by 15-25%</li>
                      <li><strong>Hand-eye coordination</strong> - Developed through gaming, sports, and musical instruments</li>
                      <li><strong>Attention and focus</strong> - Distractions can add 100-200ms to response times</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Why choice reaction time matters:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li>Predicts performance in gaming, sports, and driving</li>
                      <li>Important for jobs requiring quick decisions (pilots, surgeons, emergency responders)</li>
                      <li>Indicator of cognitive health and brain processing efficiency</li>
                      <li>Can decline with neurological conditions (early warning sign)</li>
                      <li>Improves with cognitive training and physical exercise</li>
                    </ul>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve choice reaction time? Training strategies and tips"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Choice reaction time can be improved through targeted practice, cognitive training, and lifestyle optimization. Here are proven strategies:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Cognitive Training Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Practice this test daily</strong> - 10-15 minutes daily for 2-3 weeks can improve speed by 20-30%</li>
                      <li><strong>Play action video games</strong> - FPS games (CS:GO, Valorant, Overwatch) train rapid decision-making</li>
                      <li><strong>Use brain training apps</strong> - Lumosity, Peak, and Elevate offer choice reaction exercises</li>
                      <li><strong>Play sports</strong> - Tennis, basketball, and soccer improve split-second decision-making</li>
                      <li><strong>Learn musical instruments</strong> - Piano and guitar train hand-eye coordination and reaction speed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🏃 Physical and Lifestyle Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Regular aerobic exercise</strong> - Cardio 3-5x weekly increases cerebral blood flow and processing speed</li>
                      <li><strong>Quality sleep</strong> - 7-9 hours is essential; sleep deprivation slows decision-making by 20-30%</li>
                      <li><strong>Proper nutrition</strong> - Omega-3s, B-vitamins, and antioxidants support neural health</li>
                      <li><strong>Stay hydrated</strong> - Dehydration of 2% can slow cognitive processing by 10-15%</li>
                      <li><strong>Moderate caffeine</strong> - 100-200mg can improve alertness and decision-making speed</li>
                      <li><strong>Reduce alcohol</strong> - Even small amounts impair cognitive processing for 24+ hours</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎮 Practice Techniques</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Finger placement</strong> - Keep fingers on arrow keys (WASD or actual arrows) to minimize movement</li>
                      <li><strong>Minimize distractions</strong> - Quiet environment, close other tabs, focus only on the test</li>
                      <li><strong>Best testing time</strong> - Morning or early afternoon when alertness is highest</li>
                      <li><strong>Warm-up routine</strong> - Do a few practice rounds before recording your score</li>
                      <li><strong>Stay relaxed</strong> - Muscle tension slows response time; keep hands and shoulders loose</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With consistent practice over 3-4 weeks, most people improve choice reaction time by 50-100ms (15-25%). Professional gamers can achieve sub-300ms consistently, with elite performers reaching 250-300ms range.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my choice reaction time slow? Common causes and solutions"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If your choice reaction time is above 600ms, there might be specific reasons affecting your performance. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for slow choice reaction time:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Lack of practice</strong> - Without regular practice, decision-making pathways remain slow</li>
                      <li><strong>Fatigue and sleep deprivation</strong> - Can slow cognitive processing by 50-100ms</li>
                      <li><strong>Stress and anxiety</strong> - High cortisol impairs decision-making and increases response time</li>
                      <li><strong>Distractions</strong> - Background noise, notifications, or multitasking divide attention</li>
                      <li><strong>Physical positioning</strong> - Poor keyboard setup or hand placement slows response</li>
                      <li><strong>Age-related decline</strong> - Natural slowing of neural transmission, but can be mitigated</li>
                      <li><strong>Medical conditions</strong> - ADHD, depression, or neurological issues may affect processing speed</li>
                      <li><strong>Medications</strong> - Some medications (antihistamines, antidepressants) can slow reactions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to improve slow choice reaction time:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Practice regularly</strong> - Use this test 10-15 minutes daily for 2-3 weeks</li>
                      <li><strong>Get better sleep</strong> - Prioritize sleep hygiene; it's the #1 cognitive performance factor</li>
                      <li><strong>Optimize your setup</strong> - Use gaming keyboard, proper chair, and keep fingers on arrow keys</li>
                      <li><strong>Exercise regularly</strong> - Both cardio and strength training improve neural efficiency</li>
                      <li><strong>Play fast-paced games</strong> - Action games train rapid decision-making naturally</li>
                      <li><strong>Reduce stress</strong> - Meditation and mindfulness improve focus and cognitive speed</li>
                      <li><strong>Take breaks</strong> - Test in short sessions (10-15 min) with rest between</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Medical Note:</strong> If your choice reaction time is consistently above 700ms and you're under 40, consider consulting a healthcare provider. Extremely slow decision-making can indicate attention disorders, cognitive impairment, or other neurological conditions.</p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
