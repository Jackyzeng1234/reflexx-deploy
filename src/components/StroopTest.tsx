'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

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

        // Submit to Supabase and check if user is logged in
        submitScore({
          test_type: 'stroop',
          score: finalScore,
          details: {
            averageReactionTime: averageReactionTime,
            rounds: totalRounds,
          },
        }).then((submittedToDb) => {
          // Only save to localStorage if NOT logged in (submission failed)
          if (!submittedToDb) {
            const savedResults = JSON.parse(localStorage.getItem('stroop-results') || '[]');
            savedResults.push({
              score: finalScore,
              averageReactionTime: averageReactionTime,
              timestamp: Date.now(),
            });
            localStorage.setItem('stroop-results', JSON.stringify(savedResults.slice(-100)));
          }
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

  const getRating = (score: number) => {
    const percentage = (score / totalRounds) * 100;
    if (percentage >= 90) return t.ratingSuper;
    if (percentage >= 75) return t.ratingExcellent;
    if (percentage >= 60) return t.ratingGreat;
    if (percentage >= 45) return t.ratingGood;
    if (percentage >= 30) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const averageReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="flex min-h-[500px] items-center justify-center py-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Main Game Area - Always visible when not finished */}
        {gameState !== 'finished' && (
          <div
            className="rounded-3xl border-2 border-gray-200/60 bg-white/80 backdrop-blur-xl p-8 shadow-2xl dark:border-gray-700/60 dark:bg-gray-800/80 relative overflow-hidden"
            onClick={() => {
              if (gameState === 'idle') {
                startGame();
              }
            }}
          >
            {/* Game Content - Fixed height container */}
            <div className={`min-h-[500px] ${gameState === 'idle' ? 'pointer-events-none' : ''}`}>
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.stroopTestRound} {currentTrial + 1}/{totalRounds}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {t.stroopTestScore}: {score}
                </div>
              </div>

              {/* Word Display */}
              <div className="mb-8 flex h-48 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                {showWord ? (
                  <div
                    className="select-none text-7xl font-bold transition-all"
                    style={{ color: trials[currentTrial]?.color }}
                  >
                    {trials[currentTrial]?.word}
                  </div>
                ) : (
                  <div className="text-center">
                    {roundResult === true && (
                      <div className="text-6xl">✓</div>
                    )}
                    {roundResult === false && (
                      <div className="text-6xl">✗</div>
                    )}
                  </div>
                )}
              </div>

              {/* Color Options */}
              <div className="grid grid-cols-2 gap-4">
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
                      className={`rounded-xl border-2 p-6 font-bold text-2xl transition-all ${
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
            </div>

            {/* Idle State - Click to Start Overlay */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] hover:bg-black/10">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🎨</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t.clickToStart}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t.orPressAnyKeyToStart}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Finished State */}
        {gameState === 'finished' && (
          <div className="rounded-3xl border-2 border-gray-200/60 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-xl p-8 shadow-2xl dark:border-gray-700/60 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="text-center">
              <div className="mb-4 text-6xl">📊</div>
              <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                {t.stroopTestComplete}
              </h3>

              <div className="mb-8 grid gap-4 md:grid-cols-2">
                <div className="text-center">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.stroopTestScore}
                  </div>
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {score}/{totalRounds}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {((score / totalRounds) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.stroopTestAvgReaction}
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {averageReactionTime}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    ms
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
              >
                {t.srtTryAgain}
              </button>
            </div>
          </div>
        )}

        {/* Instructions, Benefits & Improvements - Three Columns */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* How to Play */}
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white/60 backdrop-blur-md p-5 dark:border-gray-700/50 dark:bg-gray-800/60">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">📖 {t.howToPlay}</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
              <li>• {t.stroopTestInstruction1}</li>
              <li>• {t.stroopTestInstruction2}</li>
              <li>• {t.stroopTestInstruction3}</li>
              <li>• {t.stroopTestTip}</li>
            </ol>
          </div>

          {/* What This Measures */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200 text-left" dangerouslySetInnerHTML={{ __html: t.stroopBenefits }} />
          </div>

          {/* How To Improve */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200 text-left" dangerouslySetInnerHTML={{ __html: t.stroImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
