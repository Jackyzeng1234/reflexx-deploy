'use client';

import { useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';

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

      // Submit to Supabase and check if user is logged in
      submitScore({
        test_type: 'choice-reaction',
        score: average,
        details: {
          times: reactionTimes,
          rounds: totalRounds,
        },
      }).then((submittedToDb) => {
        // Only save to localStorage if NOT logged in (submission failed)
        if (!submittedToDb) {
          const savedResults = JSON.parse(localStorage.getItem('choice-reaction-results') || '[]');
          savedResults.push({
            times: reactionTimes,
            average: average,
            timestamp: Date.now(),
          });
          localStorage.setItem('choice-reaction-results', JSON.stringify(savedResults.slice(-100)));
        }
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

  const getRating = (avgTime: number) => {
    if (avgTime < 400) return t.ratingSuper;
    if (avgTime < 500) return t.ratingExcellent;
    if (avgTime < 600) return t.ratingGreat;
    if (avgTime < 700) return t.ratingGood;
    if (avgTime < 800) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const averageTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const bestTime = reactionTimes.length > 0 ? Math.round(Math.min(...reactionTimes)) : 0;

  return (
    <div className="flex min-h-[500px] items-center justify-center py-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Main Game Area */}
        <div className="rounded-3xl border-2 border-white/40 bg-white/70 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
          {/* Game Content - Fixed height container */}
          <div className={`min-h-[500px] ${gameState === 'idle' ? 'pointer-events-none' : ''}`}>
            {/* Waiting State */}
            {gameState === 'waiting' && (
              <div className="flex h-full min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-8 text-7xl">⏳</div>
                  <p className="text-2xl font-bold text-black">
                    {t.getReady}
                  </p>
                  <p className="mt-4 text-lg text-gray-600">
                    Round {currentRound + 1} / {totalRounds}
                  </p>
                </div>
              </div>
            )}

            {/* Ready State */}
            {gameState === 'ready' && currentTarget && (
              <div className="flex h-full min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-9xl shadow-2xl">
                    {currentTarget.icon}
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {t.pressArrow.replace('{direction}', currentTarget.label)}
                  </p>
                </div>
              </div>
            )}

            {/* Finished State */}
            {gameState === 'finished' && reactionTimes.length > 0 && (
              <div className="flex h-full min-h-[500px] items-center justify-center">
                <div className="w-full px-8 py-6">
                  <div className="mb-6 text-center">
                    <div className="mb-3 text-5xl">📊</div>
                    <h3 className="text-2xl font-bold text-black">{t.srtResults}</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="text-center">
                      <div className="mb-1 text-sm text-gray-600">{t.srtAverage}</div>
                      <div className="text-4xl font-bold text-black">{averageTime}<span className="text-2xl">ms</span></div>
                      <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-black ${
                        averageTime < 400 ? 'bg-purple-500' :
                        averageTime < 500 ? 'bg-green-500' :
                        averageTime < 600 ? 'bg-blue-500' :
                        averageTime < 700 ? 'bg-yellow-500' :
                        averageTime < 800 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}>
                        {getRating(averageTime)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-sm text-gray-600">{t.srtBest}</div>
                      <div className="text-4xl font-bold text-black">{bestTime}<span className="text-2xl">ms</span></div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                      }}
                      className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
                    >
                      {t.srtTryAgain}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Idle State - Click to Start Overlay */}
          {gameState === 'idle' && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
              onClick={startGame}
            >
              <div className="text-center">
                <div className="mb-4 text-6xl">🎮</div>
                <div className="text-2xl font-bold text-black">
                  {t.clickToStart}
                </div>
                <div className="mt-2 text-sm text-black">
                  {t.orPressAnyKeyToStart}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="mb-8 text-3xl font-bold text-white text-center">Frequently Asked Questions About Choice Reaction Time Test</h2>
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
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300"><strong>💡 Pro Tip:</strong> Choice reaction time is typically 100-200ms slower than simple reaction time because your brain must process and identify the stimulus before responding. This test measures both decision-making speed and motor response time.</p>
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
                    <h4 className="font-semibold text-white mb-2">Average choice reaction time by age (in milliseconds):</h4>
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
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 font-semibold mb-1">⭐ Above Average (Top 25%)</p>
                      <p className="text-sm text-gray-300">350-450ms - Better than most, excellent cognitive processing</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 font-semibold mb-1">✅ Normal Average</p>
                      <p className="text-sm text-gray-300">450-550ms - Typical choice reaction time for healthy adults</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 font-semibold mb-1">⚠️ Below Average</p>
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
                    <h4 className="font-semibold text-white mb-2">This test measures:</h4>
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
                    <h4 className="font-semibold text-white mb-2">Factors affecting your score:</h4>
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
                    <h4 className="font-semibold text-white mb-2">Why choice reaction time matters:</h4>
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
                    <h4 className="font-semibold text-white mb-3">🎯 Cognitive Training Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Practice this test daily</strong> - 10-15 minutes daily for 2-3 weeks can improve speed by 20-30%</li>
                      <li><strong>Play action video games</strong> - FPS games (CS:GO, Valorant, Overwatch) train rapid decision-making</li>
                      <li><strong>Use brain training apps</strong> - Lumosity, Peak, and Elevate offer choice reaction exercises</li>
                      <li><strong>Play sports</strong> - Tennis, basketball, and soccer improve split-second decision-making</li>
                      <li><strong>Learn musical instruments</strong> - Piano and guitar train hand-eye coordination and reaction speed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">🏃 Physical and Lifestyle Optimization</h4>
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
                    <h4 className="font-semibold text-white mb-3">🎮 Practice Techniques</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Finger placement</strong> - Keep fingers on arrow keys (WASD or actual arrows) to minimize movement</li>
                      <li><strong>Minimize distractions</strong> - Quiet environment, close other tabs, focus only on the test</li>
                      <li><strong>Best testing time</strong> - Morning or early afternoon when alertness is highest</li>
                      <li><strong>Warm-up routine</strong> - Do a few practice rounds before recording your score</li>
                      <li><strong>Stay relaxed</strong> - Muscle tension slows response time; keep hands and shoulders loose</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-300"><strong>🏆 Expected Results:</strong> With consistent practice over 3-4 weeks, most people improve choice reaction time by 50-100ms (15-25%). Professional gamers can achieve sub-300ms consistently, with elite performers reaching 250-300ms range.</p>
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
                    <h4 className="font-semibold text-white mb-2">Common reasons for slow choice reaction time:</h4>
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
                    <h4 className="font-semibold text-white mb-2">How to improve slow choice reaction time:</h4>
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

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-300"><strong>⚠️ Medical Note:</strong> If your choice reaction time is consistently above 700ms and you're under 40, consider consulting a healthcare provider. Extremely slow decision-making can indicate attention disorders, cognitive impairment, or other neurological conditions.</p>
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
