'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';

type GameState = 'idle' | 'waiting' | 'ready' | 'too-early' | 'finished';

// FAQ Item Component
interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  icon?: string;
}

function FAQItem({ question, answer, icon = '❓' }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-3 text-lg font-semibold text-white">
          <span>{icon}</span>
          <span>{question}</span>
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-gray-300 leading-relaxed">
          {typeof answer === 'string' ? (
            <p dangerouslySetInnerHTML={{ __html: answer }} />
          ) : (
            answer
          )}
        </div>
      )}
    </div>
  );
}

export default function SimpleReactionTest() {
  const { t } = useI18n();
  const { setTimeout, clearTimeout } = useTimeout();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const hasSavedRef = useRef(false);

  const totalRounds = 5;

  const startTest = useCallback(() => {
    setGameState('waiting');
    setCurrentRound(0);
    setReactionTimes([]);
    hasSavedRef.current = false;
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds random delay
    setTimeout(() => {
      setStartTime(performance.now());
      setGameState('ready');
    }, delay);
  }, [setTimeout]);

  const handleClick = useCallback(() => {
    if (gameState === 'idle' || gameState === 'finished' || gameState === 'too-early') {
      startTest();
      return;
    }

    if (gameState === 'waiting') {
      clearTimeout();
      setGameState('too-early');
      return;
    }

    if (gameState === 'ready') {
      const reactionTime = performance.now() - startTime;
      const newReactionTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newReactionTimes);

      if (currentRound + 1 >= totalRounds) {
        setGameState('finished');
        const average = Math.round(newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length);

        // 防止重复保存
        if (hasSavedRef.current) {
          return;
        }
        hasSavedRef.current = true;

        // Submit to Supabase and check if user is logged in
        submitScore({
          test_type: 'simple-reaction',
          score: average,
          details: {
            times: newReactionTimes,
            rounds: totalRounds,
          },
        }).then((submittedToDb) => {
          // Only save to localStorage if NOT logged in (submission failed)
          if (!submittedToDb) {
            const savedResults = JSON.parse(localStorage.getItem('simple-reaction-results') || '[]');
            savedResults.push({
              times: newReactionTimes,
              average: average,
              timestamp: Date.now(),
            });
            localStorage.setItem('simple-reaction-results', JSON.stringify(savedResults.slice(-100)));
          }
        }).catch(console.error);
      } else {
        setCurrentRound(currentRound + 1);
        setGameState('waiting');
        const delay = Math.random() * 3000 + 2000;
        setTimeout(() => {
          setStartTime(performance.now());
          setGameState('ready');
        }, delay);
      }
    }
  }, [gameState, startTime, reactionTimes, currentRound, startTest, setTimeout, clearTimeout]);

  const getRating = (avgTime: number) => {
    if (avgTime < 200) return t.ratingSuper;
    if (avgTime < 250) return t.ratingExcellent;
    if (avgTime < 300) return t.ratingGreat;
    if (avgTime < 350) return t.ratingGood;
    if (avgTime < 400) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const getRatingColor = (avgTime: number) => {
    if (avgTime < 200) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
    if (avgTime < 250) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (avgTime < 300) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (avgTime < 350) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    if (avgTime < 400) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const averageTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const bestTime = reactionTimes.length > 0 ? Math.round(Math.min(...reactionTimes)) : 0;

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

  return (
    <div className="container mx-auto px-4 pt-8 pb-2">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <p className="text-lg text-white">
            {t.srtInstruction}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {reactionTimes.length > 0 && `Round ${reactionTimes.length}/${totalRounds}`}
          </p>
        </div>

        {/* Test Area */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-gray-200 shadow-xl dark:border-gray-700">
          <div
            onClick={handleClick}
            className={`relative flex aspect-[21/9] cursor-pointer items-center justify-center transition-all duration-200 ${
              gameState === 'idle'
                ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-black dark:from-primary-600 dark:to-primary-800'
                : gameState === 'waiting'
                ? 'bg-red-500 text-black dark:bg-red-600'
                : gameState === 'ready'
                ? 'bg-green-500 text-black dark:bg-green-600'
                : gameState === 'too-early'
                ? 'bg-orange-500 text-black dark:bg-orange-600'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-white'
            }`}
          >
            {gameState === 'idle' && (
              <div className="text-center">
                <div className="mb-4 text-6xl">⚡</div>
                <div className="text-3xl font-bold text-black">{t.srtTitle}</div>
                <div className="mt-4 text-xl opacity-90 text-black">{t.srtClickOrSpace}</div>
              </div>
            )}

            {gameState === 'waiting' && (
              <div className="text-center">
                <div className="mb-4 text-6xl">⏳</div>
                <div className="text-3xl font-bold text-black">{t.srtWait}</div>
              </div>
            )}

            {gameState === 'ready' && (
              <div className="text-center animate-pulse">
                <div className="mb-4 text-6xl">⚡</div>
                <div className="text-4xl font-bold text-white">{t.srtClick}</div>
              </div>
            )}

            {gameState === 'too-early' && (
              <div className="text-center">
                <div className="mb-4 text-6xl">⚠️</div>
                <div className="text-3xl font-bold text-black">{t.srtTooEarly}</div>
                <div className="mt-4 text-xl opacity-90 cursor-pointer hover:opacity-100 transition-opacity text-black" onClick={() => setGameState('waiting')}>
                  {t.clickToRestart}
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="w-full px-8 py-6">
                <div className="mb-6 text-center">
                  <div className="mb-3 text-5xl">📊</div>
                  <h3 className="text-2xl font-bold text-black">{t.srtResults}</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center">
                    <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.srtAverage}</div>
                    <div className="text-4xl font-bold text-black">{averageTime}<span className="text-2xl">ms</span></div>
                    <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-black ${
                      averageTime < 200 ? 'bg-purple-500' :
                      averageTime < 250 ? 'bg-green-500' :
                      averageTime < 300 ? 'bg-blue-500' :
                      averageTime < 350 ? 'bg-yellow-500' :
                      averageTime < 400 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}>
                      {getRating(averageTime)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.srtBest}</div>
                    <div className="text-4xl font-bold text-black">{bestTime}<span className="text-2xl">ms</span></div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleClick}
                    className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
                  >
                    {t.srtTryAgain}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="mb-8 text-3xl font-bold text-white text-center">Frequently Asked Questions About Reaction Time Test</h2>
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
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300"><strong>💡 Pro Tip:</strong> Reaction time varies throughout the day. For the most accurate results, take the test multiple times at different times and average your scores. Avoid testing when tired or distracted.</p>
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
                    <h4 className="font-semibold text-white mb-2">Average reaction time by age (in milliseconds):</h4>
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
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 font-semibold mb-1">⭐ Above Average (Top 25%)</p>
                      <p className="text-sm text-gray-300">180-220ms - Better than most people, competitive gamer level</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 font-semibold mb-1">✅ Normal Average</p>
                      <p className="text-sm text-gray-300">220-280ms - Typical reaction time for healthy adults</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 font-semibold mb-1">⚠️ Below Average</p>
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
                    <h4 className="font-semibold text-white mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Visual processing speed</strong> - How fast your eyes and visual cortex detect the color change (red to green)</li>
                      <li><strong>Neural transmission time</strong> - How quickly signals travel from your brain to your fingers</li>
                      <li><strong>Motor response time</strong> - How fast your muscles contract after receiving the neural signal</li>
                      <li><strong>Neural pathway efficiency</strong> - How well-established the connections between neurons are</li>
                      <li><strong>Sensorimotor integration</strong> - The coordination between sensory input and motor output</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Factors affecting your reaction time score:</h4>
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
                    <h4 className="font-semibold text-white mb-2">Why reaction time matters:</h4>
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
                    <h4 className="font-semibold text-white mb-3">🎯 Reaction Time Training Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Daily practice</strong> - Practice 10-15 minutes daily for 2-4 weeks to see 10-20% improvement in reaction speed</li>
                      <li><strong>Action video games</strong> - FPS games (CS:GO, Valorant, Call of Duty) train rapid visual processing and decision-making</li>
                      <li><strong>Ball sports</strong> - Tennis, ping pong, badminton improve hand-eye coordination and anticipatory skills</li>
                      <li><strong>Reaction training apps</strong> - Use tools like Aim Lab, Human Benchmark, or this test regularly</li>
                      <li><strong>Catching drills</strong> - Have someone drop a ruler and catch it between your fingers (classic reflex test)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">🏃 Physical Optimization for Faster Reactions</h4>
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
                    <h4 className="font-semibold text-white mb-3">🧠 Mental Preparation and Focus Techniques</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Test in optimal conditions</strong> - Quiet environment, good lighting, comfortable position</li>
                      <li><strong>Best time of day</strong> - Morning (after breakfast) typically yields best reaction times</li>
                      <li><strong>Stay relaxed but alert</strong> - Muscle tension slows signal transmission, stay loose</li>
                      <li><strong>Use peripheral vision</strong> - Don't stare at one point; keep your eyes relaxed and take in the whole screen</li>
                      <li><strong>Moderate caffeine</strong> - 100-200mg can improve alertness, but avoid excessive amounts</li>
                      <li><strong>Minimize distractions</strong> - Close other tabs, silence your phone, focus only on the test</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-300"><strong>🏆 Expected Results:</strong> With consistent practice over 3-4 weeks, most people improve reaction time by 20-40ms (10-20%). Professional athletes can achieve sub-200ms consistently, with elite performers reaching 150-170ms range.</p>
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
                    <h4 className="font-semibold text-white mb-2">Common reasons for slow reaction time:</h4>
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
                    <h4 className="font-semibold text-white mb-2">How to fix slow reaction time:</h4>
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

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-300"><strong>⚠️ Medical Note:</strong> If your reaction time is consistently over 350ms and you're under 40, consider consulting a healthcare provider. Extremely slow reactions can indicate neurological conditions, vitamin deficiencies, or other health issues.</p>
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
