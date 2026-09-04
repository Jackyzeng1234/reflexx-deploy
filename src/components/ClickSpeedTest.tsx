'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { TestDuration } from '@/types';
import { submitScore, getBestScore } from '@/lib/scores';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { MousePointerClick, BarChart3, Flag } from 'lucide-react';

type TestState = 'idle' | 'running' | 'finished' | 'cooldown';

const HISTORY_KEY = 'click-speed-results';

/** 读取本机历史成绩(CPS),按时间升序 */
function readLocalHistory(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((r: any) => (typeof r.cps === 'number' ? r.cps : r.score))
      .filter((n: any) => typeof n === 'number');
  } catch {
    return [];
  }
}

export default function ClickSpeedTest() {
  const { t } = useI18n();
  const [testState, setTestState] = useState<TestState>('idle');
  const [selectedDuration, setSelectedDuration] = useState<TestDuration>(5);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cps, setCps] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [bestCps, setBestCps] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false);
  const [history, setHistory] = useState<number[]>([]);

  const durations: TestDuration[] = [1, 5, 10, 30, 60, 100];

  useEffect(() => {
    async function loadBestScore() {
      const score = await getBestScore('click-speed');
      setBestCps(score);
    }
    loadBestScore();
  }, []);

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
  }, []);

  const startTest = useCallback(() => {
    setTestState('running');
    setClicks(0);
    setTimeLeft(selectedDuration);
    setCps(0);
    hasSavedRef.current = false;
  }, [selectedDuration]);

  const handleClick = useCallback(() => {
    if (testState === 'idle') {
      startTest();
      return;
    }

    if (testState === 'cooldown') {
      return;
    }

    if (testState === 'finished') {
      setTestState('idle');
      setClicks(0);
      setCps(0);
      return;
    }

    if (testState === 'running' && timeLeft > 0) {
      const newClicks = clicks + 1;
      setClicks(newClicks);

      const elapsedTime = selectedDuration - timeLeft;
      const currentCps = elapsedTime > 0 ? (newClicks / elapsedTime).toFixed(2) : '0.00';
      setCps(parseFloat(currentCps));
    }
  }, [testState, clicks, timeLeft, selectedDuration, startTest]);

  useEffect(() => {
    if (testState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            setClicks((currentClicks) => {
              if (hasSavedRef.current) {
                return currentClicks;
              }
              hasSavedRef.current = true;

              const finalCps = parseFloat((currentClicks / selectedDuration).toFixed(2));

              // 始终写入本机历史(进度曲线),登录用户也保留
              try {
                const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
                raw.push({ clicks: currentClicks, duration: selectedDuration, cps: finalCps, timestamp: Date.now() });
                localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
                setHistory(readLocalHistory());
              } catch (e) {
                console.error(e);
              }

              submitScore({
                test_type: 'click-speed',
                score: finalCps,
                details: {
                  clicks: currentClicks,
                  duration: selectedDuration,
                },
              }).then(async () => {
                const score = await getBestScore('click-speed');
                setBestCps(score);
              }).catch(console.error);

              return currentClicks;
            });

            setTestState('cooldown');
            setCooldownRemaining(2);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [testState, selectedDuration]);

  useEffect(() => {
    if (testState === 'cooldown') {
      cooldownRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
            }
            setTestState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [testState]);

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

  const finalCps = clicks > 0 ? (clicks / selectedDuration).toFixed(2) : '0.00';
  const getCpsRating = (cps: string) => {
    const num = parseFloat(cps);
    if (num >= 10) return { text: t.ratingSuper, cls: 'border-cyan-400/40 text-cyan-300' };
    if (num >= 8) return { text: t.ratingExcellent, cls: 'border-emerald-400/40 text-emerald-300' };
    if (num >= 6) return { text: t.ratingGreat, cls: 'border-sky-400/40 text-sky-300' };
    if (num >= 5) return { text: t.ratingGood, cls: 'border-amber-400/40 text-amber-300' };
    if (num >= 4) return { text: t.ratingAverage, cls: 'border-orange-400/40 text-orange-300' };
    return { text: t.ratingNeedsPractice, cls: 'border-red-400/40 text-red-300' };
  };

  const getVerdictColor = (cps: number) => {
    if (cps >= 10) return 'var(--color-success-400)';
    if (cps >= 8) return 'var(--color-success-300)';
    if (cps >= 6) return 'var(--color-brand)';
    if (cps >= 5) return 'var(--color-warning-400)';
    if (cps >= 4) return 'var(--color-warning-500)';
    return 'var(--color-danger-400)';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="display-title">{t.cstTitle}</h1>
        </div>

        {/* Duration Selector */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-surface p-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                disabled={testState === 'running' || testState === 'cooldown'}
                className={`rounded-lg border px-4 py-3 font-semibold transition-all ${
                  selectedDuration === duration
                    ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                    : 'border-white/10 bg-surface-hover text-gray-300 hover:border-cyan-400/40 hover:text-white'
                } ${
                  testState === 'running' || testState === 'cooldown'
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>

        {/* 游戏区 —— display 变体:左结果 + 右点击区 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {testState === 'finished' ? finalCps : <span className="dim">0.00</span>}
              <span className="unit">cps</span>
            </div>
            <div
              className="game-verdict"
              style={{
                color: testState === 'finished' ? getVerdictColor(parseFloat(finalCps)) : 'transparent',
              }}
            >
              {testState === 'finished' ? getCpsRating(finalCps).text : ''}
            </div>
            <div className="game-stats">
              {testState === 'finished'
                ? `${t.cstTotalClicks} ${clicks} · ${t.cstBestRecord} ${bestCps !== null ? bestCps.toFixed(2) : '--'}`
                : testState === 'running'
                ? `${t.cstClicks}: ${clicks} · ${timeLeft}s`
                : ''}
            </div>
            {testState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={startTest}>
                  ↻ {t.srtTryAgain}
                </button>
              </div>
            )}
          </div>

          <button
            className="game-surface"
            data-state={testState === 'running' ? 'ready' : testState === 'cooldown' ? 'waiting' : undefined}
            onClick={handleClick}
            aria-label={t.cstTitle}
          >
            {testState === 'idle' && (
              <>
                <span className="game-label">{t.cstStart}</span>
                <span className="text-sm opacity-70">Click or press Space</span>
              </>
            )}
            {testState === 'running' && (
              <>
                <span className="game-num">{clicks}</span>
                <span className="game-label">{t.cstClicks}</span>
                <span className="tabular-nums text-sm opacity-70">{timeLeft}s</span>
              </>
            )}
            {testState === 'cooldown' && <span className="game-label">{t.timesUp}</span>}
            {testState === 'finished' && (
              <span className="game-label text-text-tertiary">{t.cstResults}</span>
            )}
          </button>
        </div>

        {/* 成绩曲线:本机历史(≥2 次后显示) */}
        {history.length >= 2 && (
          <div className="mx-auto mt-20 max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.progressChartTitle}
            </h2>
            <div className="mt-6">
              <ReactionChart data={history} unit="cps" caption={t.chartHigherBetter} />
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
              dangerouslySetInnerHTML={{ __html: t.csBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.csImprovements.split('<br>').map((item) => (
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
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Click Speed Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the click speed test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>This click speed test (CPS test) measures how many times you can click your mouse in a set time period. It evaluates your finger dexterity, hand-eye coordination, and clicking speed.</p>
                  <ol className="space-y-2 list-decimal list-inside text-gray-300">
                    <li><strong>Choose your duration</strong> - Select a time limit from 1 to 100 seconds. Shorter durations (1-5s) test burst clicking speed, while longer durations (30-100s) test endurance and consistency</li>
                    <li><strong>Click as fast as possible</strong> - Click anywhere in the test area or press spacebar. Use your preferred clicking technique (regular, butterfly, or jitter clicking)</li>
                    <li><strong>Track your CPS in real-time</strong> - Monitor your clicks per second (CPS) as you click. The test calculates your average CPS throughout the duration</li>
                    <li><strong>View your results</strong> - See your total clicks, average CPS, rating, and how you compare to your personal best</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Different clicking techniques yield different results. Regular clicking averages 4-6 CPS, butterfly clicking 8-12 CPS, and jitter clicking can reach 10-15+ CPS. Find what works best for you while avoiding strain.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good click speed? Average CPS and rankings explained"
              icon="⚡"
              answer={
                <div className="space-y-4">
                  <p>A good click speed depends on your clicking technique, mouse type, and practice level. Here are the average CPS (clicks per second) benchmarks:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average CPS by clicking style:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🖱️ <strong>Regular clicking:</strong> 4-6 CPS - Using one finger to click normally</li>
                      <li>🦋 <strong>Butterfly clicking:</strong> 8-12 CPS - Alternating two fingers on the mouse button</li>
                      <li>⚡ <strong>Jitter clicking:</strong> 10-15+ CPS - Vibrating your hand to click rapidly (advanced)</li>
                      <li>👆 <strong>Drag clicking:</strong> 15-30+ CPS - Dragging finger across button (requires specific mice)</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Elite (Top 1%)</p>
                      <p className="text-sm text-gray-300">12+ CPS - Professional gamer level, exceptional finger speed and control</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above Average (Top 15%)</p>
                      <p className="text-sm text-gray-300">8-12 CPS - Better than most, competitive gamer level with good technique</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Normal Average</p>
                      <p className="text-sm text-gray-300">5-8 CPS - Typical clicking speed for healthy adults using regular technique</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Below Average</p>
                      <p className="text-sm text-gray-300">3-5 CPS - Slower than average, may need practice or better mouse positioning</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Poor</p>
                      <p className="text-sm text-gray-300">Below 3 CPS - Significantly slower, could indicate unfamiliarity with mouse or physical issues</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: These benchmarks assume regular clicking technique. Advanced techniques can achieve much higher CPS. Focus on consistency and avoiding hand strain rather than raw speed.</p>
                </div>
              }
            />
            <FAQItem
              question="What does click speed test measure? Fine motor skills and dexterity"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The click speed test measures your <strong>finger dexterity</strong>, <strong>hand-eye coordination</strong>, and <strong>fine motor control</strong>. It evaluates how quickly and accurately you can perform repetitive finger movements.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Finger dexterity</strong> - The independence and control of individual fingers, particularly the index finger</li>
                      <li><strong>Neuromuscular efficiency</strong> - How well your nervous system coordinates muscle contractions for rapid movements</li>
                      <li><strong>Hand-eye coordination</strong> - The synchronization between visual input and motor response, even for simple tasks</li>
                      <li><strong>Finger endurance</strong> - Your ability to maintain clicking speed over longer durations (30-100 seconds)</li>
                      <li><strong>Consistency and rhythm</strong> - How steady your clicking speed remains throughout the test period</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your CPS score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Mouse type and quality</strong> - Gaming mice with optimized switches can improve CPS by 1-2 clicks per second</li>
                      <li><strong>Hand position and grip</strong> - Proper ergonomic positioning reduces fatigue and improves speed</li>
                      <li><strong>Clicking technique</strong> - Advanced techniques (butterfly, jitter) can double or triple your CPS</li>
                      <li><strong>Finger strength and flexibility</strong> - Regular practice and finger exercises improve dexterity over time</li>
                      <li><strong>Age and fitness</strong> - Fine motor skills typically peak in early 20s but can be maintained with practice</li>
                      <li><strong>Fatigue and discomfort</strong> - Hand strain significantly reduces clicking speed and consistency</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>🎮 Gaming Relevance:</strong> High click speed is valuable in Minecraft PvP, cookie clicker games, and certain competitive games. However, raw clicking speed is less important than accuracy, strategy, and game sense in most competitive scenarios.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve click speed? Training techniques and optimization tips"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Improving click speed requires practice, proper technique, and optimizing your setup. Here's a comprehensive guide to increasing your CPS safely and effectively:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🖱️ Mouse Setup and Ergonomics</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Use a gaming mouse</strong> - Mice with optimized switches (Omron, Kailh) respond faster and last longer</li>
                      <li><strong>Adjust mouse sensitivity</strong> - Higher DPI (800-1600) can help with rapid clicking precision</li>
                      <li><strong>Proper hand position</strong> - Keep your wrist relaxed, palm lightly touching the mouse, fingers curved naturally</li>
                      <li><strong>Mouse grip style</strong> - Find what works: palm grip (comfort), claw grip (speed), or fingertip grip (agility)</li>
                      <li><strong>Keep your mouse clean</strong> - Dust and debris can slow button response time</li>
                      <li><strong>Use a mousepad</strong> - Provides consistent surface and reduces friction for smoother movement</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">👆 Clicking Techniques to Practice</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Regular clicking</strong> - Master the basics first: 4-6 CPS with one finger, focusing on rhythm</li>
                      <li><strong>Butterfly clicking</strong> - Alternate two fingers on the left mouse button. Can reach 8-12 CPS with practice</li>
                      <li><strong>Jitter clicking</strong> - Tense your arm and vibrate your hand to click rapidly. Advanced technique, risk of strain</li>
                      <li><strong>Drag clicking</strong> - Drag your finger across the button. Only works with specific mice. Can achieve 15-30+ CPS</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">💪 Training Exercises and Drills</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Daily CPS tests</strong> - Take 5-10 tests per day at different durations (1s, 5s, 10s) to build consistency</li>
                      <li><strong>Interval training</strong> - Alternate between 5-second burst clicking and 10-second rest periods for 10 rounds</li>
                      <li><strong>Endurance sessions</strong> - Practice 30-60 second sessions to improve consistency and reduce fatigue</li>
                      <li><strong>Finger exercises</strong> - Finger taps, stretches, and grip strengtheners improve finger independence</li>
                      <li><strong>Target practice</strong> - Use aim trainers that combine clicking speed with accuracy for transferable skills</li>
                      <li><strong>Take breaks</strong> - Rest 1-2 minutes between sessions to prevent strain and maintain peak performance</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🏃 Physical Optimization and Health</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Stretch regularly</strong> - Finger, wrist, and forearm stretches prevent repetitive strain injury (RSI)</li>
                      <li><strong>Stay hydrated</strong> - Dehydration can cause muscle cramps and reduce fine motor control</li>
                      <li><strong>Warm up before testing</strong> - Light finger exercises and movement improve blood flow and responsiveness</li>
                      <li><strong>Stop if you feel pain</strong> - Numbness, tingling, or sharp pain are signs of RSI. Rest immediately</li>
                      <li><strong>Maintain good posture</strong> - Keep your wrist neutral, arm at 90-degree angle, shoulders relaxed</li>
                      <li><strong>Consider ergonomic equipment</strong> - Vertical mice, wrist rests, and ergonomic keyboards reduce strain</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With daily practice over 2-3 weeks, most people improve CPS by 1-2 clicks per second (20-30% improvement). Advanced techniques can yield 2-4 CPS improvement. Focus on gradual progress rather than immediate gains to avoid injury.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my click speed slow? Common causes and how to fix them"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If your click speed is below 4 CPS, there might be specific reasons affecting your performance. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for slow click speed:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Poor mouse quality</strong> - Worn-out switches, dirty sensors, or cheap mice can reduce responsiveness significantly</li>
                      <li><strong>Incorrect hand position</strong> - Gripping the mouse too tightly or awkward positioning slows finger movement</li>
                      <li><strong>Lack of practice</strong> - Clicking speed is a skill. Beginners typically start at 3-4 CPS and improve with practice</li>
                      <li><strong>Finger fatigue</strong> - Tired muscles from excessive use or poor ergonomics reduce speed and consistency</li>
                      <li><strong>Physical limitations</strong> - Arthritis, carpal tunnel, or other conditions affect fine motor control</li>
                      <li><strong>Wrong technique</strong> - Using just the wrist or whole arm instead of finger isolation reduces efficiency</li>
                      <li><strong>Distractions and focus</strong> - Not fully concentrating on the test can reduce your CPS by 1-2 clicks</li>
                      <li><strong>Mouse settings</strong> - Low polling rate, high lift-off distance, or incorrect sensitivity affect performance</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to fix slow click speed:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Upgrade your mouse</strong> - Gaming mice with faster switches (1-2ms response) can improve CPS by 0.5-1</li>
                      <li><strong>Practice daily</strong> - Consistent short practice sessions (5-10 minutes) build muscle memory faster than marathon sessions</li>
                      <li><strong>Learn proper technique</strong> - Watch tutorials on butterfly or jitter clicking, but progress gradually to avoid injury</li>
                      <li><strong>Optimize your setup</strong> - Adjust mouse DPI, polling rate to 1000Hz, and use a quality mousepad</li>
                      <li><strong>Improve ergonomics</strong> - Position your mouse at the same height as your elbow, keep wrist neutral</li>
                      <li><strong>Warm up properly</strong> - Light finger stretches and movement before testing improve performance</li>
                      <li><strong>Rest adequately</strong> - Take breaks every 15-20 minutes to prevent fatigue and maintain peak performance</li>
                      <li><strong>Strengthen your fingers</strong> - Finger exercises, grip strengtheners, and hand therapy tools improve dexterity</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Health Warning:</strong> Stop clicking immediately if you feel pain, numbness, or tingling in your fingers, wrist, or forearm. These are symptoms of Repetitive Strain Injury (RSI). Pushing through pain can cause permanent damage. Always prioritize health over CPS scores. If symptoms persist, consult a medical professional.</p>
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
