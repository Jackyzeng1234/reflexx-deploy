'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type GameState = 'idle' | 'playing' | 'finished';

interface Target {
  id: number;
  x: number;
  y: number;
}

export default function AimTrainer() {
  const { t } = useI18n();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [clickedTargets, setClickedTargets] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number>(0);
  const [accuracy, setAccuracy] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const accuracyRef = useRef(0);

  const generateTarget = useCallback(() => {
    if (!gameAreaRef.current) return null;

    const area = gameAreaRef.current;
    const areaRect = area.getBoundingClientRect();
    const targetSize = 48;

    const maxX = areaRect.width - targetSize;
    const maxY = areaRect.height - targetSize;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    const newTarget: Target = {
      id: targetIdRef.current++,
      x,
      y,
    };

    return newTarget;
  }, []);

  const startGame = useCallback(() => {
    // Clear any existing timer before starting a new game
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setGameState('playing');
    setTargets([]);
    setClickedTargets(new Set());
    setScore(0);
    setMisses(0);
    setTimeLeft(30);
    setAccuracy(100);
    setStartTime(performance.now());

    // Reset refs
    scoreRef.current = 0;
    accuracyRef.current = 100;

    // Spawn first target
    setTimeout(() => {
      const target = generateTarget();
      if (target) {
        setTargets([target]);
      }
    }, 500);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Clear the timer when game ends
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setGameState('finished');

          // Save to localStorage - use refs to get current values
          const savedResults = JSON.parse(localStorage.getItem('aim-trainer-results') || '[]');
          const finalScore = scoreRef.current;
          const finalAccuracy = accuracyRef.current;
          savedResults.push({
            score: finalScore,
            accuracy: finalAccuracy,
            timestamp: Date.now(),
          });
          localStorage.setItem('aim-trainer-results', JSON.stringify(savedResults.slice(-100)));

          // Submit to Supabase if logged in
          submitScore({
            test_type: 'aim-trainer',
            score: finalScore,
            details: {
              accuracy: finalAccuracy,
            },
          }).catch(console.error);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [generateTarget]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTargetClick = useCallback((e: React.MouseEvent<HTMLDivElement>, targetId: number) => {
    e.stopPropagation();

    if (gameState !== 'playing') return;

    setClickedTargets((prev) => new Set([...prev, targetId]));
    const newScore = score + 1;
    setScore(newScore);
    scoreRef.current = newScore;

    // Remove clicked target and spawn new one
    setTargets((prev) => prev.filter((t) => t.id !== targetId));

    setTimeout(() => {
      if (gameState === 'playing') {
        const newTarget = generateTarget();
        if (newTarget) {
          setTargets((prev) => [...prev, newTarget]);
        }
      }
    }, 100);

    // Update accuracy
    const totalClicks = score + misses + 1;
    const newAccuracy = Math.round(((score + 1) / totalClicks) * 100);
    setAccuracy(newAccuracy);
    accuracyRef.current = newAccuracy;
  }, [gameState, score, misses, generateTarget]);

  const handleMissClick = useCallback(() => {
    if (gameState !== 'playing') return;

    setMisses((prev) => prev + 1);

    // Update accuracy
    const totalClicks = score + misses + 1;
    const newAccuracy = Math.round((score / totalClicks) * 100);
    setAccuracy(newAccuracy);
    accuracyRef.current = newAccuracy;
  }, [gameState, score, misses]);

  const getRating = (finalScore: number) => {
    if (finalScore >= 50) return t.ratingSuper;
    if (finalScore >= 40) return t.ratingExcellent;
    if (finalScore >= 30) return t.ratingGreat;
    if (finalScore >= 20) return t.ratingGood;
    if (finalScore >= 10) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const totalTime = 30 - timeLeft;

  return (
    <div className="flex h-full flex-col">
      {/* Idle State */}
      {gameState === 'idle' && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                {t.howToPlay}
              </h2>
              <div className="mb-6 text-left text-gray-700 dark:text-gray-300">
                <p className="mb-3">1. {t.aimTrainerInstruction1}</p>
                <p className="mb-3">2. {t.aimTrainerInstruction2}</p>
                <p className="mb-3">3. {t.aimTrainerInstruction3}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.aimTrainerTip}
                </p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="w-full max-w-sm rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              {t.startTest}
            </button>
          </div>
        </div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && (
        <div className="flex h-full flex-col">
          {/* HUD */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-white/50 p-4 shadow-sm backdrop-blur dark:bg-gray-800/50">
            <div className="flex gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{timeLeft}s</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{accuracy}%</div>
              </div>
            </div>
          </div>

          {/* Game Area */}
          <div
            ref={gameAreaRef}
            className="relative flex-1 cursor-crosshair rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
            onClick={handleMissClick}
          >
            {targets.map((target) => (
              <div
                key={target.id}
                className="absolute h-12 w-12 cursor-pointer rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                style={{
                  left: `${target.x}px`,
                  top: `${target.y}px`,
                }}
                onClick={(e) => handleTargetClick(e, target.id)}
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {/* Outer red circle */}
                  <circle cx="50" cy="50" r="48" fill="#dc2626" />
                  {/* White ring */}
                  <circle cx="50" cy="50" r="36" fill="white" />
                  {/* Red ring */}
                  <circle cx="50" cy="50" r="24" fill="#dc2626" />
                  {/* White ring */}
                  <circle cx="50" cy="50" r="12" fill="white" />
                  {/* Center bullseye */}
                  <circle cx="50" cy="50" r="4" fill="#dc2626" />
                  {/* Crosshair lines */}
                  <line x1="50" y1="0" x2="50" y2="8" stroke="#dc2626" strokeWidth="2" />
                  <line x1="50" y1="92" x2="50" y2="100" stroke="#dc2626" strokeWidth="2" />
                  <line x1="0" y1="50" x2="8" y2="50" stroke="#dc2626" strokeWidth="2" />
                  <line x1="92" y1="50" x2="100" y2="50" stroke="#dc2626" strokeWidth="2" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finished State */}
      {gameState === 'finished' && (
        <div className="flex h-full items-center justify-center">
          <div className="w-full max-w-2xl text-center">
            <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                {t.results}
              </h2>

              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">{score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingTargetsHit}</div>
                </div>
                <div className="rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">{accuracy}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
                <div className="rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {(score / totalTime).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingTargetsPerSec}</div>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.srtRank}: {getRating(score)}
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {t.typingMisses}: {misses} | {t.typingTotalClicks}: {score + misses}
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
  );
}
