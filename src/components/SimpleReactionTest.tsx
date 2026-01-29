'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type GameState = 'idle' | 'waiting' | 'ready' | 'too-early' | 'finished';

export default function SimpleReactionTest() {
  const { t } = useI18n();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false);

  const totalRounds = 5;

  const startTest = useCallback(() => {
    setGameState('waiting');
    setCurrentRound(0);
    setReactionTimes([]);
    hasSavedRef.current = false;
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds random delay
    const timeout = setTimeout(() => {
      setStartTime(performance.now());
      setGameState('ready');
    }, delay);
    setTimeoutId(timeout);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'idle' || gameState === 'finished' || gameState === 'too-early') {
      startTest();
      return;
    }

    if (gameState === 'waiting') {
      if (timeoutId) clearTimeout(timeoutId);
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
        const timeout = setTimeout(() => {
          setStartTime(performance.now());
          setGameState('ready');
        }, delay);
        setTimeoutId(timeout);
      }
    }
  }, [gameState, startTime, reactionTimes, currentRound, timeoutId, startTest]);

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

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {t.srtTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t.srtInstruction}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {reactionTimes.length > 0 && `Round ${reactionTimes.length}/${totalRounds}`}
          </p>
        </div>

        {/* Test Area */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-gray-200 shadow-xl dark:border-gray-700">
          <div
            onClick={handleClick}
            className={`relative flex aspect-[2/1] cursor-pointer items-center justify-center transition-all duration-200 ${
              gameState === 'idle'
                ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                : gameState === 'waiting'
                ? 'bg-red-500 text-white'
                : gameState === 'ready'
                ? 'bg-green-500 text-white'
                : gameState === 'too-early'
                ? 'bg-orange-500 text-white'
                : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
            }`}
          >
            {gameState === 'idle' && (
              <div className="text-center">
                <div className="mb-4 text-6xl">⚡</div>
                <div className="text-3xl font-bold">{t.srtTitle}</div>
                <div className="mt-4 text-xl opacity-90">{t.srtClickOrSpace}</div>
              </div>
            )}

            {gameState === 'waiting' && (
              <div className="text-center">
                <div className="mb-4 text-6xl">⏳</div>
                <div className="text-3xl font-bold">{t.srtWait}</div>
              </div>
            )}

            {gameState === 'ready' && (
              <div className="text-center animate-pulse">
                <div className="mb-4 text-6xl">⚡</div>
                <div className="text-4xl font-bold">{t.srtClick}</div>
              </div>
            )}

            {gameState === 'too-early' && (
              <div className="text-center">
                <div className="mb-4 text-6xl">⚠️</div>
                <div className="text-3xl font-bold">{t.srtTooEarly}</div>
                <div className="mt-4 text-xl opacity-90">Click to try again</div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <div className="mb-4 text-6xl">✅</div>
                <div className="text-3xl font-bold">{t.srtResults}</div>
                <div className="mt-4 text-xl opacity-90">Click to try again</div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {gameState === 'finished' && reactionTimes.length > 0 && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.srtAverage}
                  </div>
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {averageTime}ms
                  </div>
                  <div className={`mt-2 inline-block rounded-full px-4 py-1 text-sm font-semibold ${getRatingColor(averageTime)}`}>
                    {getRating(averageTime)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.srtBest}
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {bestTime}ms
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.srtRank}
                  </div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    Top {Math.min(Math.round(Math.exp((300 - averageTime) / 100) * 10), 100)}%
                  </div>
                </div>
              </div>

              {/* Round Details */}
              <div className="mt-6 border-t border-primary-200 pt-6 dark:border-primary-800">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Round Details</h3>
                <div className="grid grid-cols-5 gap-3">
                  {reactionTimes.map((time, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-800"
                    >
                      <div className="text-xs text-gray-500">#{index + 1}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {Math.round(time)}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={handleClick}
                className="w-full max-w-sm rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                {t.srtTryAgain}
              </button>
              </div>
          </div>
        )}

        {/* Instructions, Benefits & Improvements - Three Columns */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* How to Play */}
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white/60 backdrop-blur-md p-5 dark:border-gray-700/50 dark:bg-gray-800/60">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white text-center">📖 {t.howToPlay}</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• {t.srtWaitForGreen}</li>
              <li>• {t.srtInstruction}</li>
              <li>• {t.srtCompleteRounds}</li>
            </ol>
          </div>

          {/* What This Measures */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300 text-center">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200" dangerouslySetInnerHTML={{ __html: t.srtBenefits }} />
          </div>

          {/* How To Improve */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300 text-center">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200" dangerouslySetInnerHTML={{ __html: t.srtImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
