'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type GameState = 'idle' | 'showing' | 'input' | 'finished';

interface Tile {
  id: number;
  isActive: boolean;
}

export default function SequenceMemoryTest() {
  const { t } = useI18n();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasSavedRef = useRef(false);

  const tiles: Tile[] = [
    { id: 0, isActive: false },
    { id: 1, isActive: false },
    { id: 2, isActive: false },
    { id: 3, isActive: false },
    { id: 4, isActive: false },
    { id: 5, isActive: false },
    { id: 6, isActive: false },
    { id: 7, isActive: false },
    { id: 8, isActive: false },
  ];

  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-indigo-500',
  ];

  // Musical notes (frequencies in Hz) - C major scale
  const noteFrequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66];

  const playTone = useCallback((tileId: number) => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = noteFrequencies[tileId];
      oscillator.type = 'sine';

      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.error('Audio error:', error);
    }
  }, []);

  const playErrorSound = useCallback(() => {
    try {
      if (!audioContextRef.current) return;

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 200; // Low frequency for error
      oscillator.type = 'sawtooth';

      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      oscillator.start(now);
      oscillator.stop(now + 0.4);
    } catch (error) {
      console.error('Error sound failed:', error);
    }
  }, []);

  const startGame = useCallback(async () => {
    // Initialize AudioContext on user interaction
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }

    const firstTile = Math.floor(Math.random() * 9);
    setSequence([firstTile]);
    setPlayerInput([]);
    setCurrentLevel(1);
    setGameState('showing');
    hasSavedRef.current = false;
  }, []);

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

  const showSequence = useCallback(() => {
    if (gameState !== 'showing') return;

    const showTile = (index: number) => {
      if (index >= sequence.length) {
        setGameState('input');
        setActiveTile(null);
        return;
      }

      const tileId = sequence[index];
      setActiveTile(tileId);
      playTone(tileId); // Play tone when showing

      setTimeout(() => {
        setActiveTile(null);
        setTimeout(() => {
          showTile(index + 1);
        }, 300);
      }, 600);
    };

    showTile(0);
  }, [gameState, sequence, playTone]);

  useEffect(() => {
    if (gameState === 'showing' && sequence.length > 0) {
      const timer = setTimeout(() => {
        showSequence();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, sequence, showSequence]);

  const handleTileClick = (tileId: number) => {
    if (gameState !== 'input') return;

    // Play tone when clicking
    playTone(tileId);

    const newInput = [...playerInput, tileId];
    setPlayerInput(newInput);

    const currentIndex = newInput.length - 1;

    if (sequence[currentIndex] !== tileId) {
      // Wrong tile - play error sound
      playErrorSound();
      setGameState('finished');

      // 防止重复保存
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      // Submit to Supabase and check if user is logged in
      submitScore({
        test_type: 'sequence-memory',
        score: currentLevel,
        details: {
          tiles: sequence.length,
        },
      }).then((submittedToDb) => {
        // Only save to localStorage if NOT logged in (submission failed)
        if (!submittedToDb) {
          const savedResults = JSON.parse(localStorage.getItem('sequence-memory-results') || '[]');
          savedResults.push({
            level: currentLevel,
            timestamp: Date.now(),
          });
          localStorage.setItem('sequence-memory-results', JSON.stringify(savedResults.slice(-100)));
        }
      }).catch(console.error);

      return;
    }

    if (newInput.length === sequence.length) {
      // Correct sequence completed
      setTimeout(() => {
        const newTile = Math.floor(Math.random() * 9);
        setSequence([...sequence, newTile]);
        setPlayerInput([]);
        setCurrentLevel(currentLevel + 1);
        setGameState('showing');
        setActiveTile(null);
      }, 1000);
    }
  };

  const getRating = (level: number) => {
    if (level >= 15) return t.ratingSuper;
    if (level >= 12) return t.ratingExcellent;
    if (level >= 9) return t.ratingGreat;
    if (level >= 6) return t.ratingGood;
    if (level >= 4) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

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
              {/* Level Display */}
              <div className="mb-6 text-center">
                <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                  {t.sequenceMemoryLevel} {currentLevel}
                </div>
                {gameState === 'showing' && (
                  <div className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    {t.sequenceMemoryWatching}
                  </div>
                )}
                {gameState === 'input' && (
                  <div className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    {t.sequenceMemoryRepeat} ({playerInput.length}{t.sequenceMemoryOf}{sequence.length})
                  </div>
                )}
              </div>

              {/* Tiles Grid */}
              <div className="relative max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-6">
                  {tiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => handleTileClick(tile.id)}
                      disabled={gameState !== 'input'}
                      className={`aspect-square rounded-xl border-4 transition-all ${
                        activeTile === tile.id
                          ? `${colors[tile.id]} scale-110 border-white shadow-2xl`
                          : gameState === 'input'
                          ? `${colors[tile.id]} opacity-40 hover:opacity-100 active:scale-95`
                          : `${colors[tile.id]} opacity-40`
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Idle State - Click to Start Overlay */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] hover:bg-black/10">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🎵</div>
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
          <div className="rounded-3xl border-2 border-gray-200/60 bg-white/80 backdrop-blur-xl p-8 shadow-2xl dark:border-gray-700/60 dark:bg-gray-800/80">
            <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-purple-50 p-6 text-center shadow-lg dark:from-primary-900/30 dark:to-purple-900/30">
              <div className="mb-4 text-6xl">❌</div>
              <h3 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                {t.sequenceMemoryGameOver}
              </h3>
              <p className="mb-2 text-xl text-gray-700 dark:text-gray-300">
                {t.sequenceMemoryLevel} {currentLevel}
              </p>
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                {getRating(currentLevel)}
              </p>

              <div className="flex justify-center">
                <button
                  onClick={startGame}
                  className="rounded-2xl bg-[var(--color-accent)] px-8 py-4 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
                >
                  {t.srtTryAgain}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions, Benefits & Improvements - Three Columns */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* How to Play */}
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white/60 backdrop-blur-md p-5 dark:border-gray-700/50 dark:bg-gray-800/60">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">📖 {t.howToPlay}</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
              <li>• {t.sequenceMemoryInstruction1}</li>
              <li>• {t.sequenceMemoryInstruction2}</li>
              <li>• {t.sequenceMemoryInstruction3}</li>
              <li>• {t.sequenceMemoryTip}</li>
            </ol>
          </div>

          {/* What This Measures */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200 text-left" dangerouslySetInnerHTML={{ __html: t.smBenefits }} />
          </div>

          {/* How To Improve */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200 text-left" dangerouslySetInnerHTML={{ __html: t.smImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
