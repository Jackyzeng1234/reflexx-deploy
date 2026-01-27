'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type GameState = 'idle' | 'memorize' | 'recall' | 'finished';

interface NumberTile {
  value: number;
  isClicked: boolean;
  x: number;
  y: number;
}

export default function ChimpTest() {
  const { t } = useI18n();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [tiles, setTiles] = useState<NumberTile[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const hasSavedRef = useRef(false);

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
  }, []);

  const generateTiles = (count: number) => {
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
  };

  const handleTileClick = (clickedTile: NumberTile) => {
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
  };

  const getRating = (level: number) => {
    if (level >= 10) return t.ratingSuper;
    if (level >= 8) return t.ratingExcellent;
    if (level >= 6) return t.ratingGreat;
    if (level >= 4) return t.ratingGood;
    if (level >= 3) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Idle State */}
        {gameState === 'idle' && (
          <div className="text-center">
            <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                {t.chimpTestTitle}
              </h2>
              <div className="mb-6 text-left text-gray-700 dark:text-gray-300">
                <p className="mb-3">1. {t.chimpTestInstruction1}</p>
                <p className="mb-3">2. {t.chimpTestInstruction2}</p>
                <p className="mb-3">3. {t.chimpTestInstruction3}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.chimpTestTip}
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
        )}

        {/* Game Area */}
        {(gameState === 'memorize' || gameState === 'recall' || gameState === 'finished') && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Level {currentLevel}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {gameState === 'memorize' && t.chimpTestMemorize}
                {gameState === 'recall' && `${t.chimpTestClickNumber} ${nextNumber}`}
                {gameState === 'finished' && t.chimpTestGameOver}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {tiles.length} {t.chimpTestNumbers}
              </div>
            </div>

            {/* Game Board */}
            <div className="relative mb-6 h-96 rounded-xl border-2 border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
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

            {/* Finished State */}
            {gameState === 'finished' && (
              <div className="rounded-xl bg-red-50 p-6 text-center dark:bg-red-900/20">
                <div className="mb-4 text-6xl">🐵</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {t.chimpTestGameOver}
                </h3>
                <p className="mb-4 text-xl text-gray-700 dark:text-gray-300">
                  {t.chimpTestReached} <strong className="text-primary-600">Level {currentLevel}</strong>
                </p>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  {t.chimpTestSuccess} {tiles.length - 1} {t.chimpTestNumbers}
                </p>
                <div className="mb-6 rounded-lg bg-white/50 p-4 dark:bg-gray-800/50">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Rank: {getRating(currentLevel)}
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
        )}
      </div>
    </div>
  );
}
