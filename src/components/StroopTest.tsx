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

      newTrials.push({
        word: wordColor.name,
        color: displayColor.hex,
        correctColor: displayColor.name,
      });
    }
    return newTrials;
  }, []);

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
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Idle State */}
        {gameState === 'idle' && (
          <div className="text-center">
            <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                {t.stroopTestTitle}
              </h2>
              <div className="mb-6 text-left text-gray-700 dark:text-gray-300">
                <p className="mb-3">1. {t.stroopTestInstruction1}</p>
                <p className="mb-3">2. {t.stroopTestInstruction2}</p>
                <p className="mb-3">3. {t.stroopTestInstruction3}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.stroopTestTip}
                </p>
              </div>
              {/* Example */}
              <div className="mb-6 rounded-xl bg-white/50 p-6 dark:bg-gray-800/50">
                <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t.stroopTestExample}:
                </p>
                <div className="mb-4">
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Word: "RED" in {language === 'zh' ? '绿色' : 'green color'}</p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400" style={{ fontSize: '32px', fontWeight: 'bold' }}>RED</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.stroopTestExampleAnswer}: <strong className="text-green-600">Green</strong>
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Word: "BLUE" in {language === 'zh' ? '红色' : 'red color'}</p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400" style={{ fontSize: '32px', fontWeight: 'bold' }}>BLUE</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.stroopTestExampleAnswer}: <strong className="text-red-600">Red</strong>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={startGame}
              className="w-full max-w-sm rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              {t.startTest}
            </button>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
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
              {colorKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleColorClick(COLORS[key].name)}
                  disabled={!showWord}
                  className={`rounded-xl border-2 p-6 font-bold text-2xl transition-all ${
                    !showWord
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:scale-105 hover:shadow-lg active:scale-95'
                  }`}
                  style={{
                    borderColor: COLORS[key].hex,
                    color: COLORS[key].hex,
                  }}
                >
                  {COLORS[key].name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Finished State */}
        {gameState === 'finished' && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            <div className="rounded-xl bg-primary-50 p-8 text-center dark:bg-primary-900/20">
              <h3 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                {t.stroopTestComplete}
              </h3>

              <div className="mb-8 grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.stroopTestScore}
                  </div>
                  <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                    {score}/{totalRounds}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {((score / totalRounds) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.stroopTestAvgReaction}
                  </div>
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                    {averageReactionTime}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    ms
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-lg bg-white/50 p-4 dark:bg-gray-800/50">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.srtRank}: {getRating(score)}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={startGame}
                  className="w-full max-w-sm rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
                >
                  {t.srtTryAgain}
                </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
