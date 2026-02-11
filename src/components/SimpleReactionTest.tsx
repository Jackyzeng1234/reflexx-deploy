'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';

type GameState = 'idle' | 'waiting' | 'ready' | 'too-early' | 'finished';

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
            className={`relative flex aspect-[21/9] cursor-pointer items-center justify-center transition-all duration-200 ${
              gameState === 'idle'
                ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white dark:from-primary-600 dark:to-primary-800'
                : gameState === 'waiting'
                ? 'bg-red-500 text-white dark:bg-red-600'
                : gameState === 'ready'
                ? 'bg-green-500 text-white dark:bg-green-600'
                : gameState === 'too-early'
                ? 'bg-orange-500 text-white dark:bg-orange-600'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-white'
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
                <div className="mt-4 text-xl opacity-90 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => setGameState('waiting')}>
                  {t.clickToRestart}
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="w-full px-8 py-6">
                <div className="mb-6 text-center">
                  <div className="mb-3 text-5xl">📊</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.srtResults}</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center">
                    <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.srtAverage}</div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{averageTime}<span className="text-2xl">ms</span></div>
                    <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white ${
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
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{bestTime}<span className="text-2xl">ms</span></div>
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
