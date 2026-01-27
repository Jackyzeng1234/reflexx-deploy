'use client';

import { useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

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
  }, [getRandomTarget]);

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
  }, [currentRound, totalRounds, getRandomTarget]);

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

  return (
    <div className="flex min-h-[500px] items-center justify-center">
      {/* Idle State */}
      {gameState === 'idle' && (
        <div className="text-center">
          <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {t.howToPlay}
            </h2>
            <div className="mb-6 text-left text-gray-700 dark:text-gray-300">
              <p className="mb-3">1. {t.choiceReactionInstruction1}</p>
              <p className="mb-3">2. {t.choiceReactionInstruction2}</p>
              <p className="mb-3">3. {t.choiceReactionInstruction3.replace('{rounds}', String(totalRounds))}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.choiceReactionPenalty}
              </p>
            </div>
            <div className="mb-6 flex justify-center gap-4">
              {targets.map((target) => (
                <div
                  key={target.key}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-gray-300 bg-white text-3xl font-bold text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  {target.icon}
                </div>
              ))}
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

      {/* Waiting State */}
      {gameState === 'waiting' && (
        <div className="text-center">
          <div className="mb-8 text-7xl">⏳</div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.getReady}
          </p>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Round {currentRound + 1} / {totalRounds}
          </p>
        </div>
      )}

      {/* Ready State */}
      {gameState === 'ready' && currentTarget && (
        <div className="text-center">
          <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-9xl shadow-2xl">
            {currentTarget.icon}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.pressArrow.replace('{direction}', currentTarget.label)}
          </p>
        </div>
      )}

      {/* Finished State */}
      {gameState === 'finished' && reactionTimes.length > 0 && (
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
              {t.srtResults}
            </h2>

            <div className="mb-6">
              <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                {averageTime}ms
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t.srtAverage}
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.srtRank}: {getRating(averageTime)}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-5 gap-2">
              {reactionTimes.map((time, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-2 text-center text-sm ${
                    time < 500
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : time < 600
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {Math.round(time)}ms
                </div>
              ))}
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
      )}
    </div>
  );
}
