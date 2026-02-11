'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';

type TestState = 'idle' | 'showing' | 'input' | 'finished';

export default function NumberMemoryTest() {
  const { t } = useI18n();
  const { setTimeout } = useTimeout();
  const [gameState, setGameState] = useState<TestState>('idle');
  const [currentNumber, setCurrentNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentLevel, setCurrentLevel] = useState(3); // Start with 3 digits
  const [displayTime, setDisplayTime] = useState(3000); // 3 seconds initially
  const hasSavedRef = useRef(false);

  const generateNumber = useCallback((digits: number) => {
    let num = '';
    for (let i = 0; i < digits; i++) {
      num += Math.floor(Math.random() * 10);
    }
    return num;
  }, []);

  const startGame = useCallback(() => {
    const num = generateNumber(3);
    setCurrentNumber(num);
    setUserInput('');
    setCurrentLevel(3);
    setDisplayTime(3000);
    setGameState('showing');
    hasSavedRef.current = false;

    // Hide number after display time
    setTimeout(() => {
      setGameState('input');
    }, 3000);
  }, [generateNumber, setTimeout]);

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

  const handleSubmit = useCallback(() => {
    const isCorrect = userInput === currentNumber;

    if (!isCorrect) {
      setGameState('finished');

      // 防止重复保存
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      // Submit to Supabase and check if user is logged in
      const digits = currentLevel - 1;
      submitScore({
        test_type: 'number-memory',
        score: digits,
        details: {},
      }).then((submittedToDb) => {
        // Only save to localStorage if NOT logged in (submission failed)
        if (!submittedToDb) {
          const savedResults = JSON.parse(localStorage.getItem('number-memory-results') || '[]');
          savedResults.push({
            digits: digits,
            timestamp: Date.now(),
          });
          localStorage.setItem('number-memory-results', JSON.stringify(savedResults.slice(-100)));
        }
      }).catch(console.error);

      return;
    }

    // Correct! Level up
    const newLevel = currentLevel + 1;
    const newNumber = generateNumber(newLevel);
    setCurrentNumber(newNumber);
    setCurrentLevel(newLevel);
    setUserInput('');
    setGameState('showing');

    // Reduce display time slightly as levels increase
    const newDisplayTime = Math.max(1000, 3000 - (newLevel - 3) * 200);
    setDisplayTime(newDisplayTime);

    setTimeout(() => {
      setGameState('input');
    }, newDisplayTime);
  }, [currentNumber, userInput, currentLevel, generateNumber, setTimeout]);

  const getRating = (digits: number) => {
    if (digits >= 12) return t.ratingSuper;
    if (digits >= 10) return t.ratingExcellent;
    if (digits >= 8) return t.ratingGreat;
    if (digits >= 6) return t.ratingGood;
    if (digits >= 5) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setUserInput(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.length > 0) {
      handleSubmit();
    }
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
              <div className="mb-6 text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.numberMemoryLevel} {currentLevel}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {currentNumber.length} {t.numberMemoryDigits}
                </div>
              </div>

              {/* Showing Number State */}
              {gameState === 'showing' && (
                <>
                  {/* Number Display */}
                  <div className="mb-8 flex h-64 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    <div className="animate-pulse">
                      <div className="text-8xl font-bold text-primary-600 dark:text-primary-400 tracking-widest">
                        {currentNumber}
                      </div>
                    </div>
                  </div>

                  {/* Timer Bar */}
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-primary-600 transition-all ease-linear"
                      style={{
                        width: '100%',
                        animation: 'shrink linear forwards',
                        animationDuration: `${displayTime}ms`,
                      }}
                    />
                  </div>

                  <style jsx>{`
                    @keyframes shrink {
                      from { width: 100%; }
                      to { width: 0%; }
                    }
                  `}</style>
                </>
              )}

              {/* Input State */}
              {gameState === 'input' && (
                <>
                  {/* Input Area */}
                  <div className="mb-8">
                    <input
                      type="text"
                      value={userInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      maxLength={currentLevel}
                      placeholder={t.numberMemoryInputPlaceholder}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-6 text-center text-6xl font-bold tracking-widest focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={userInput.length === 0}
                    className={`w-full rounded-lg px-6 py-4 font-semibold text-white text-xl shadow-lg transition-all ${
                      userInput.length === 0
                        ? 'cursor-not-allowed bg-gray-400'
                        : 'bg-primary-600 hover:bg-primary-700 hover:shadow-xl'
                    }`}
                  >
                    {t.numberMemorySubmit}
                  </button>

                  {/* Hint */}
                  <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryHint}
                  </div>
                </>
              )}
            </div>

            {/* Idle State - Click to Start Overlay */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/40 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] hover:bg-black/10">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🔢</div>
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
                {t.numberMemoryWrong}
              </h3>

              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryCorrectAnswer}
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 tracking-widest">
                    {currentNumber}
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryYourAnswer}
                  </div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 tracking-widest">
                    {userInput || t.numberMemoryNoAnswer}
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryReached}
                  </div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {currentLevel - 1}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryDigits}
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
              <li>• {t.numberMemoryInstruction1}</li>
              <li>• {t.numberMemoryInstruction2}</li>
              <li>• {t.numberMemoryInstruction3}</li>
              <li>• {t.numberMemoryTip}</li>
            </ol>
          </div>

          {/* What This Measures */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200 text-left" dangerouslySetInnerHTML={{ __html: t.nmBenefits }} />
          </div>

          {/* How To Improve */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200 text-left" dangerouslySetInnerHTML={{ __html: t.nmImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
