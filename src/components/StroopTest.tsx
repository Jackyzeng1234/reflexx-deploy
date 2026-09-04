'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { Palette, BarChart3 } from 'lucide-react';

type TestState = 'idle' | 'playing' | 'finished';

interface Trial {
  word: string;
  color: string;
  correctColor: string;
}

const COLORS = {
  red: { name: 'Red', hex: '#dc2626', chinese: '红', spanish: 'Rojo' },
  blue: { name: 'Blue', hex: '#2563eb', chinese: '蓝', spanish: 'Azul' },
  green: { name: 'Green', hex: '#16a34a', chinese: '绿', spanish: 'Verde' },
  yellow: { name: 'Yellow', hex: '#eab308', chinese: '黄', spanish: 'Amarillo' },
};

const colorKeys = Object.keys(COLORS) as Array<keyof typeof COLORS>;

const HISTORY_KEY = 'stroop-results';

/** 读取本机历史成绩(正确数),按时间升序 */
function readLocalHistory(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((r: any) => r.score)
      .filter((n: any) => typeof n === 'number');
  } catch {
    return [];
  }
}

export default function StroopTest() {
  const { t, language } = useI18n();
  const [gameState, setGameState] = useState<TestState>('idle');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [score, setScore] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [showWord, setShowWord] = useState(true);
  const [roundResult, setRoundResult] = useState<boolean | null>(null);
  const hasSavedRef = useRef(false);
  const [history, setHistory] = useState<number[]>([]);

  const totalRounds = 20;
  const wordDisplayTime = 2000; // 2 seconds per word

  const generateTrials = useCallback(() => {
    const newTrials: Trial[] = [];
    for (let i = 0; i < totalRounds; i++) {
      const wordKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];

      // 60% congruent (word matches color), 40% incongruent (mismatch)
      let finalColorKey = colorKey;
      if (Math.random() > 0.6) {
        // Make it incongruent
        const otherColors = colorKeys.filter(k => k !== wordKey);
        finalColorKey = otherColors[Math.floor(Math.random() * otherColors.length)] as keyof typeof COLORS;
      }

      const wordColor = COLORS[wordKey];
      const displayColor = COLORS[finalColorKey];

      // Get color name in current language
      const getColorName = (color: typeof COLORS[keyof typeof COLORS]) => {
        if (language === 'zh') return color.chinese;
        if (language === 'es') return color.spanish;
        return color.name;
      };

      newTrials.push({
        word: getColorName(wordColor),
        color: displayColor.hex,
        correctColor: getColorName(displayColor), // 保存翻译后的颜色名称
      });
    }
    return newTrials;
  }, [language]);

  const startGame = useCallback(() => {
    const newTrials = generateTrials();
    setTrials(newTrials);
    setCurrentTrial(0);
    setScore(0);
    setReactionTimes([]);
    setGameState('playing');
    setShowWord(true);
    setStartTime(performance.now());
    hasSavedRef.current = false;
  }, [generateTrials]);

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

  const handleColorClick = (colorName: string) => {
    if (gameState !== 'playing') return;

    const reactionTime = performance.now() - startTime;
    const isCorrect = colorName === trials[currentTrial].correctColor;

    setReactionTimes(prev => [...prev, reactionTime]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setRoundResult(true);
    } else {
      setRoundResult(false);
    }

    setShowWord(false);

    setTimeout(() => {
      if (currentTrial + 1 >= totalRounds) {
        setGameState('finished');
        const finalScore = score + (isCorrect ? 1 : 0);
        const finalReactionTimes = [...reactionTimes, reactionTime];
        const averageReactionTime = finalReactionTimes.reduce((a, b) => a + b, 0) / finalReactionTimes.length;

        // 防止重复保存
        if (hasSavedRef.current) {
          return;
        }
        hasSavedRef.current = true;

        // 始终写入本机历史(进度曲线),登录用户也保留
        try {
          const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
          raw.push({ score: finalScore, averageReactionTime, timestamp: Date.now() });
          localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
          setHistory(readLocalHistory());
        } catch (e) {
          console.error(e);
        }

        submitScore({
          test_type: 'stroop',
          score: finalScore,
          details: {
            averageReactionTime: averageReactionTime,
            rounds: totalRounds,
          },
        }).catch(console.error);
      } else {
        const nextTrial = currentTrial + 1;
        setCurrentTrial(nextTrial);
        setShowWord(true);
        setStartTime(performance.now());
        setRoundResult(null);
      }
    }, 500);
  };

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
  }, []);

  const getRating = (score: number) => {
    const percentage = (score / totalRounds) * 100;
    if (percentage >= 90) return t.ratingSuper;
    if (percentage >= 75) return t.ratingExcellent;
    if (percentage >= 60) return t.ratingGreat;
    if (percentage >= 45) return t.ratingGood;
    if (percentage >= 30) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const getVerdictColor = (score: number) => {
    const pct = (score / totalRounds) * 100;
    if (pct >= 90) return 'var(--color-success-400)';
    if (pct >= 75) return 'var(--color-success-300)';
    if (pct >= 60) return 'var(--color-brand)';
    if (pct >= 45) return 'var(--color-warning-400)';
    if (pct >= 30) return 'var(--color-warning-500)';
    return 'var(--color-danger-400)';
  };

  const averageReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="display-title">{t.stroopTestTitle}</h1>
        </div>
        {/* 游戏区 —— display 变体:左结果 + 右颜色词 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {gameState === 'finished' ? score : <span className="dim">0</span>}
              <span className="unit">/{totalRounds}</span>
            </div>
            <div
              className="game-verdict"
              style={{ color: gameState === 'finished' ? getVerdictColor(score) : 'transparent' }}
            >
              {gameState === 'finished' ? getRating(score) : ''}
            </div>
            <div className="game-stats">
              {gameState === 'finished'
                ? `${t.stroopTestAvgReaction} ${averageReactionTime} ms`
                : gameState === 'playing'
                ? `${t.stroopTestScore}: ${score}`
                : ''}
            </div>
            {gameState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={startGame}>
                  ↻ {t.srtTryAgain}
                </button>
              </div>
            )}
          </div>

          <div className="game-panel relative">
            <div className="mb-4 flex w-full items-center justify-between">
              <div className="text-sm font-semibold text-text-secondary">
                {t.stroopTestRound} {currentTrial + 1}/{totalRounds}
              </div>
              <div className="text-sm text-text-secondary">
                {t.stroopTestScore}: {score}
              </div>
            </div>

            <div className="flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed border-white/20">
              {showWord ? (
                <div
                  className="select-none text-6xl font-bold transition-all"
                  style={{ color: trials[currentTrial]?.color }}
                >
                  {trials[currentTrial]?.word}
                </div>
              ) : (
                <div className="text-center">
                  {roundResult === true && (
                    <div className="text-5xl text-emerald-400">✓</div>
                  )}
                  {roundResult === false && (
                    <div className="text-5xl text-red-400">✗</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid w-full grid-cols-2 gap-4">
              {colorKeys.map((key) => {
                const color = COLORS[key];
                const getColorName = () => {
                  if (language === 'zh') return color.chinese;
                  if (language === 'es') return color.spanish;
                  return color.name;
                };

                return (
                  <button
                    key={key}
                    onClick={() => handleColorClick(getColorName())}
                    disabled={!showWord}
                    className={`rounded-xl border-2 p-5 font-bold text-2xl transition-all ${
                      !showWord
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:scale-105 hover:shadow-lg active:scale-95'
                    }`}
                    style={{
                      borderColor: color.hex,
                      color: color.hex,
                    }}
                  >
                    {getColorName()}
                  </button>
                );
              })}
            </div>

            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="btn btn-primary" onClick={startGame}>
                  {t.clickToStart}
                </button>
              </div>
            )}
            {gameState === 'finished' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="game-label text-text-tertiary">{t.stroopTestComplete}</span>
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
              <ReactionChart data={history} unit="pts" caption={t.chartHigherBetter} />
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
              dangerouslySetInnerHTML={{ __html: t.stroopBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.stroImprovements.split('<br>').map((item) => (
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
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Stroop Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the Stroop test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>The Stroop Test is a classic psychological test that measures cognitive flexibility and inhibitory control. It challenges your brain's ability to suppress automatic responses and process conflicting information.</p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-300">
                    <li><strong>View the color word</strong> - A color word (RED, BLUE, GREEN, YELLOW) appears on screen in a colored font.</li>
                    <li><strong>Identify the font color</strong> - Ignore the written word meaning; focus only on the ink color.</li>
                    <li><strong>Click the matching color</strong> - Select the color button that matches the font color (not the word text).</li>
                    <li><strong>Complete 20 rounds</strong> - The test includes congruent (matching) and incongruent (conflicting) trials.</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> The Stroop effect causes ~100-200ms slower responses on incongruent trials (when word and color don't match). This measures your cognitive control - the ability to override automatic reading. Average accuracy is 85-95% with reaction times of 600-800ms per trial.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good Stroop test score? Accuracy and reaction time explained"
              icon="🎯"
              answer={
                <div className="space-y-4">
                  <p>A good Stroop test score balances both accuracy (correct responses) and reaction time (speed). Most people score 85-95% accuracy with 600-800ms average reaction time.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average scores by age (20 trials, 60% congruent):</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🎮 <strong>18-24 years:</strong> 90-95% accuracy, ~600ms (gamers: 95%+, ~500ms)</li>
                      <li>👨 <strong>25-35 years:</strong> 88-93% accuracy, ~650ms</li>
                      <li>👴 <strong>36-45 years:</strong> 85-90% accuracy, ~700ms</li>
                      <li>👵 <strong>46-55 years:</strong> 82-88% accuracy, ~750ms</li>
                      <li>👴 <strong>56+ years:</strong> 78-85% accuracy, ~800ms+</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Exceptional (Top 5%)</p>
                      <p className="text-sm text-gray-300">95%+ accuracy, sub-600ms - Elite cognitive control; often athletes, gamers, or meditation practitioners</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Excellent (Top 20%)</p>
                      <p className="text-sm text-gray-300">90-94% accuracy, 600-700ms - Strong inhibitory control and cognitive flexibility</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Good (Normal Range)</p>
                      <p className="text-sm text-gray-300">85-89% accuracy, 700-800ms - Healthy cognitive function for focused adults</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Average</p>
                      <p className="text-sm text-gray-300">80-84% accuracy, 800-900ms - May indicate fatigue, distraction, or need for practice</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Below Average</p>
                      <p className="text-sm text-gray-300">&lt;80% accuracy, 900ms+ - Could indicate attention issues, high stress, or need for cognitive training</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: The "Stroop effect" means incongruent trials (word doesn't match color) typically take 100-200ms longer. Smaller interference effects (faster on incongruent trials) indicate better cognitive control and executive function.</p>
                </div>
              }
            />
            <FAQItem
              question="What does the Stroop test measure? Cognitive functions assessed"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The Stroop Test measures <strong>inhibitory control</strong> and <strong>cognitive flexibility</strong> - key components of executive function. It evaluates how well your brain can suppress automatic responses and process conflicting information.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Inhibitory control</strong> - Ability to suppress automatic reading response and focus on color</li>
                      <li><strong>Cognitive flexibility</strong> - Mental switching between different rules and task demands</li>
                      <li><strong>Selective attention</strong> - Focusing on relevant information (color) while ignoring irrelevant (word)</li>
                      <li><strong>Processing speed</strong> - How quickly you can analyze and respond to stimuli</li>
                      <li><strong>Executive function</strong> - Higher-order cognitive processes for goal-directed behavior</li>
                      <li><strong>Interference control</strong> - Resolving conflict between competing mental processes</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Age</strong> - Executive function peaks at ~25-30, declines gradually after</li>
                      <li><strong>Sleep deprivation</strong> - Reduces inhibitory control by 30-50%</li>
                      <li><strong>Stress and anxiety</strong> - Impairs prefrontal cortex function (executive control center)</li>
                      <li><strong>Practice effects</strong> - Can improve accuracy by 10-15% and reduce reaction time by 50-100ms</li>
                      <li><strong>ADHD and attention disorders</strong> - Typically show larger Stroop interference effects</li>
                      <li><strong>Fatigue</strong> - Mental exhaustion significantly impacts executive function</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Why Stroop test results matter:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li>Predicts real-world executive function (planning, decision-making, self-control)</li>
                      <li>Used to diagnose ADHD, brain injuries, dementia, and neurological conditions</li>
                      <li>Indicator of cognitive health and brain function integrity</li>
                      <li>Correlates with academic and professional performance</li>
                      <li>Improves with cognitive training, meditation, and aerobic exercise</li>
                    </ul>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve Stroop test performance? Cognitive enhancement strategies"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Stroop test performance can be improved through cognitive training, lifestyle optimization, and practice strategies. Here are proven methods:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🧠 Cognitive Training Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Practice this test daily</strong> - 10-15 minutes daily for 2-3 weeks improves accuracy by 10-15%</li>
                      <li><strong>Meditation and mindfulness</strong> - 8 weeks of mindfulness practice reduces Stroop interference by 30-40%</li>
                      <li><strong>Dual N-Back training</strong> - Proven to improve executive function and working memory</li>
                      <li><strong>Brain training apps</strong> - Lumosity, Peak, Elevate offer inhibitory control exercises</li>
                      <li><strong>Learn a new language</strong> - Enhances cognitive flexibility and executive control</li>
                      <li><strong>Play strategy games</strong> - Chess, Go, and complex video games train executive function</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">💪 Physical and Lifestyle Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Aerobic exercise</strong> - Cardio 3-5x weekly improves executive function by 20-30%</li>
                      <li><strong>Get quality sleep</strong> - 7-9 hours; executive function severely impaired by sleep deprivation</li>
                      <li><strong>Reduce stress</strong> - High cortisol damages prefrontal cortex and impairs inhibitory control</li>
                      <li><strong>Brain-healthy diet</strong> - Omega-3s, antioxidants, and B-vitamins support cognitive function</li>
                      <li><strong>Stay hydrated</strong> - Dehydration impairs attention and executive performance by 10-15%</li>
                      <li><strong>Limited caffeine</strong> - 100-200mg can help, but excessive amounts increase anxiety</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Test-Taking Strategies</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Focus on color only</strong> - Practice ignoring the word text completely</li>
                      <li><strong>Test when alert</strong> - Morning or early afternoon when executive function is highest</li>
                      <li><strong>Minimize distractions</strong> - Quiet room, silence phone, close other browser tabs</li>
                      <li><strong>Stay relaxed</strong> - Anxiety impairs inhibitory control; take deep breaths</li>
                      <li><strong>Use peripheral vision</strong> - Take in the whole word, don't focus on individual letters</li>
                      <li><strong>Practice both types</strong> - Practice congruent and incongruent trials equally</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With consistent practice over 4-6 weeks, most people improve accuracy by 5-10% and reduce reaction time by 50-100ms. Mindfulness meditation practitioners often show the greatest improvements (30-40% reduction in Stroop interference).</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my Stroop test score poor? Common causes and solutions"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If you're scoring below 80% accuracy or have reaction times over 900ms, there might be specific reasons. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for poor Stroop test performance:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sleep deprivation</strong> - #1 cause; severely impairs inhibitory control and executive function</li>
                      <li><strong>High stress and anxiety</strong> - Cortisol reduces prefrontal cortex activity dramatically</li>
                      <li><strong>ADHD and attention disorders</strong> - Characterized by difficulty with inhibitory control</li>
                      <li><strong>Fatigue and burnout</strong> - Mental exhaustion depletes executive function resources</li>
                      <li><strong>Lack of practice</strong> - Without training, automatic reading dominates</li>
                      <li><strong>Depression</strong> - Can slow processing speed and impair executive function</li>
                      <li><strong>Multitasking during test</strong> - Divided attention prevents proper focus</li>
                      <li><strong>Age-related decline</strong> - Natural decrease in executive function after age 30</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to improve poor Stroop test scores:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Prioritize sleep</strong> - Get 7-9 hours quality sleep; test after good rest</li>
                      <li><strong>Practice mindfulness</strong> - 10-15 minutes daily meditation improves inhibitory control</li>
                      <li><strong>Reduce stress</strong> - Relaxation techniques before and during testing</li>
                      <li><strong>Exercise regularly</strong> - Aerobic exercise boosts executive function significantly</li>
                      <li><strong>Practice cognitive control</strong> - Use this test and similar exercises daily</li>
                      <li><strong>Take breaks</strong> - Test in short sessions (10-15 min) with rest between</li>
                      <li><strong>Consider professional help</strong> - If consistently poor, might indicate ADHD or other conditions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Quick fixes for immediate improvement:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Get 8 hours sleep</strong> - Retest tomorrow morning after good sleep</li>
                      <li><strong>Do 10 minutes meditation</strong> - Reduces stress and improves focus</li>
                      <li><strong>Exercise before testing</strong> - 20 minutes cardio boosts brain function</li>
                      <li><strong>Practice color naming</strong> - Practice saying ink colors of written words</li>
                      <li><strong>Test in optimal conditions</strong> - Quiet room, good lighting, comfortable position</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Medical Note:</strong> If you consistently score below 75% accuracy or have reaction times over 1000ms despite good sleep and practice, consider consulting a healthcare provider. Poor Stroop performance can indicate ADHD, traumatic brain injury, dementia, depression, or other neurological conditions.</p>
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
