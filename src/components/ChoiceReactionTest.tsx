'use client';

import { useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';

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
        <div
          className="rounded-3xl border-2 border-gray-200/60 bg-white/80 backdrop-blur-xl p-8 shadow-2xl dark:border-gray-700/60 dark:bg-gray-800/80 relative overflow-hidden"
          onClick={() => {
            if (gameState === 'idle' || gameState === 'finished') {
              startGame();
            }
          }}
        >
          {/* Game Content - Fixed height container */}
          <div className={`min-h-[500px] ${gameState === 'idle' ? 'pointer-events-none' : ''}`}>
            {/* Waiting State */}
            {gameState === 'waiting' && (
              <div className="flex h-full min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-8 text-7xl">⏳</div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t.getReady}
                  </p>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
                    <h3 className="text-2xl font-bold">{t.srtResults}</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="text-center">
                      <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.srtAverage}</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{averageTime}<span className="text-2xl">ms</span></div>
                      <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white ${
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
                      <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.srtBest}</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{bestTime}<span className="text-2xl">ms</span></div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={startGame}
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] hover:bg-black/10">
              <div className="text-center">
                <div className="mb-4 text-6xl">🎮</div>
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

        {/* Instructions, Benefits & Improvements - Three Columns */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* How to Play */}
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white/60 backdrop-blur-md p-5 dark:border-gray-700/50 dark:bg-gray-800/60">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">📖 {t.howToPlay}</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
              <li>• {t.choiceReactionInstruction1}</li>
              <li>• {t.choiceReactionInstruction2}</li>
              <li>• {t.choiceReactionInstruction3.replace('{rounds}', String(totalRounds))}</li>
              <li>• {t.choiceReactionPenalty}</li>
            </ol>
          </div>

          {/* What This Measures */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200 text-left" dangerouslySetInnerHTML={{ __html: t.crtBenefits }} />
          </div>

          {/* How To Improve */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200 text-left" dangerouslySetInnerHTML={{ __html: t.crtImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
