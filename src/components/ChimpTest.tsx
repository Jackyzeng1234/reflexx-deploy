'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';

type GameState = 'idle' | 'memorize' | 'recall' | 'finished';

interface NumberTile {
  value: number;
  isClicked: boolean;
  x: number;
  y: number;
}

export default function ChimpTest() {
  const { t } = useI18n();
  const { setTimeout } = useTimeout();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [tiles, setTiles] = useState<NumberTile[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const hasSavedRef = useRef(false);

  const generateTiles = useCallback((count: number) => {
    const newTiles: NumberTile[] = [];
    const buttonSize = 60; // 60px button size
    const padding = 70; // pixels of padding needed between buttons

    for (let i = 1; i <= count; i++) {
      let x = Math.random() * 70 + 15;
      let y = Math.random() * 70 + 15;
      let attempts = 0;
      let overlapping = true;

      // Try to find a non-overlapping position
      while (overlapping && attempts < 500) {
        x = Math.random() * 70 + 15; // 15% to 85% range (more padding from edges)
        y = Math.random() * 70 + 15;

        // Check if this position overlaps with any existing tile
        overlapping = false;
        for (const existingTile of newTiles) {
          const dx = Math.abs(x - existingTile.x);
          const dy = Math.abs(y - existingTile.y);
          // Convert percentage difference to approximate pixel distance
          const distanceX = dx * 3.84; // ~384px / 100
          const distanceY = dy * 3.84;
          const minDistance = padding;

          if (distanceX < minDistance && distanceY < minDistance) {
            overlapping = true;
            break;
          }
        }

        attempts++;
      }

      newTiles.push({
        value: i,
        isClicked: false,
        x,
        y,
      });
    }

    // Shuffle positions
    newTiles.sort(() => Math.random() - 0.5);
    setTiles(newTiles);
  }, []);

  const startGame = useCallback(() => {
    const count = 4; // Start with 4 numbers
    generateTiles(count);
    setCurrentLevel(1);
    setNextNumber(1);
    setGameState('memorize');
    hasSavedRef.current = false;

    // Hide numbers after 2 seconds
    setTimeout(() => {
      setGameState('recall');
    }, 2000);
  }, [generateTiles, setTimeout]);

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

  const handleTileClick = useCallback((clickedTile: NumberTile) => {
    if (gameState !== 'recall') return;

    if (clickedTile.value !== nextNumber) {
      setGameState('finished');

      // 防止重复保存
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      // Submit to Supabase and check if user is logged in
      submitScore({
        test_type: 'chimp',
        score: tiles.length - 1,
        details: {
          level: currentLevel,
        },
      }).then((submittedToDb) => {
        // Only save to localStorage if NOT logged in (submission failed)
        if (!submittedToDb) {
          const savedResults = JSON.parse(localStorage.getItem('chimp-results') || '[]');
          savedResults.push({
            level: currentLevel,
            numbers: tiles.length - 1,
            timestamp: Date.now(),
          });
          localStorage.setItem('chimp-results', JSON.stringify(savedResults.slice(-100)));
        }
      }).catch(console.error);

      return;
    }

    setTiles((prev) =>
      prev.map((tile) =>
        tile.value === clickedTile.value ? { ...tile, isClicked: true } : tile
      )
    );
    setNextNumber(nextNumber + 1);

    // Check if all numbers clicked
    if (nextNumber === tiles.length) {
      // Level complete - increase difficulty
      setTimeout(() => {
        const newCount = tiles.length + 1;
        generateTiles(newCount);
        setCurrentLevel(currentLevel + 1);
        setNextNumber(1);
        setGameState('memorize');

        setTimeout(() => {
          setGameState('recall');
        }, 2000);
      }, 1000);
    }
  }, [gameState, nextNumber, tiles.length, currentLevel, generateTiles, setTimeout]);

  const getRating = (level: number) => {
    if (level >= 10) return t.ratingSuper;
    if (level >= 8) return t.ratingExcellent;
    if (level >= 6) return t.ratingGreat;
    if (level >= 4) return t.ratingGood;
    if (level >= 3) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

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
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  Level {currentLevel}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {gameState === 'memorize' && t.chimpTestMemorize}
                  {gameState === 'recall' && `${t.chimpTestClickNumber} ${nextNumber}`}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {tiles.length} {t.chimpTestNumbers}
                </div>
              </div>

              {/* Game Board */}
              <div className="relative h-96 rounded-xl border-2 border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                {tiles.map((tile) => (
                  <button
                    key={tile.value}
                    onClick={() => handleTileClick(tile)}
                    disabled={tile.isClicked || gameState !== 'recall'}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 font-bold transition-all ${
                      tile.isClicked
                        ? 'border-green-500 bg-green-500 text-white opacity-50'
                        : gameState === 'recall'
                        ? 'border-primary-500 bg-white text-gray-900 hover:scale-110 active:scale-95 dark:bg-gray-800 dark:text-white'
                        : 'border-primary-500 bg-primary-500 text-white'
                    }`}
                    style={{
                      left: `${tile.x}%`,
                      top: `${tile.y}%`,
                      width: '60px',
                      height: '60px',
                      fontSize: '24px',
                    }}
                  >
                    {gameState === 'memorize' || tile.isClicked ? tile.value : '?'}
                  </button>
                ))}
              </div>
            </div>

            {/* Idle State - Click to Start Overlay */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] hover:bg-black/10">
                <div className="text-center">
                  <div className="mb-4 text-6xl">📊</div>
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
                {t.chimpTestGameOver}
              </h3>

              <div className="mb-8 grid gap-4 md:grid-cols-2">
                <div className="text-center">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.chimpTestReached}
                  </div>
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    Level {currentLevel}
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.chimpTestNumbers}
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {tiles.length - 1}
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
              <li>• {t.chimpTestInstruction1}</li>
              <li>• {t.chimpTestInstruction2}</li>
              <li>• {t.chimpTestInstruction3}</li>
              <li>• {t.chimpTestTip}</li>
            </ol>
          </div>

          {/* What This Measures */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200 text-left" dangerouslySetInnerHTML={{ __html: t.chimpBenefits }} />
          </div>

          {/* How To Improve */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200 text-left" dangerouslySetInnerHTML={{ __html: t.chimpImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
