'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type TestState = 'idle' | 'showing' | 'input' | 'finished';

export default function NumberMemoryTest() {
  const { t } = useI18n();
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
  }, [generateNumber]);

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
  }, [currentNumber, userInput, currentLevel, generateNumber]);

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
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Idle State */}
        {gameState === 'idle' && (
          <div className="text-center">
            <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                {t.numberMemoryTitle}
              </h2>
              <div className="mb-6 text-left text-gray-700 dark:text-gray-300">
                <p className="mb-3">1. {t.numberMemoryInstruction1}</p>
                <p className="mb-3">2. {t.numberMemoryInstruction2}</p>
                <p className="mb-3">3. {t.numberMemoryInstruction3}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.numberMemoryTip}
                </p>
              </div>
              {/* Example */}
              <div className="mb-6 rounded-xl bg-white/50 p-6 dark:bg-gray-800/50">
                <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t.numberMemoryExample}:
                </p>
                <div className="mb-4">
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryExampleShow} (3{t.numberMemorySeconds})
                  </p>
                  <p className="text-6xl font-bold text-primary-600 dark:text-primary-400 tracking-widest">
                    728
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryExampleInput}
                  </p>
                  <input
                    type="text"
                    disabled
                    placeholder="728"
                    className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 p-4 text-center text-4xl font-bold tracking-widest dark:border-gray-700 dark:bg-gray-900"
                  />
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

        {/* Showing Number State */}
        {gameState === 'showing' && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {t.numberMemoryLevel} {currentLevel}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {currentNumber.length} {t.numberMemoryDigits}
              </div>
            </div>

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
          </div>
        )}

        {/* Input State */}
        {gameState === 'input' && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {t.numberMemoryLevel} {currentLevel}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {currentNumber.length} {t.numberMemoryDigits}
              </div>
            </div>

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
          </div>
        )}

        {/* Finished State */}
        {gameState === 'finished' && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            <div className="rounded-xl bg-red-50 p-8 text-center dark:bg-red-900/20">
              <div className="mb-4 text-6xl">❌</div>
              <h3 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                {t.numberMemoryWrong}
              </h3>

              <div className="mb-8 space-y-4">
                <div>
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryCorrectAnswer}
                  </div>
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400 tracking-widest">
                    {currentNumber}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryYourAnswer}
                  </div>
                  <div className="text-5xl font-bold text-red-600 dark:text-red-400 tracking-widest">
                    {userInput || t.numberMemoryNoAnswer}
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    {t.numberMemoryReached}
                  </div>
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {currentLevel - 1} {t.numberMemoryDigits}
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-lg bg-white/50 p-4 dark:bg-gray-800/50">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.srtRank}: {getRating(currentLevel - 1)}
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
