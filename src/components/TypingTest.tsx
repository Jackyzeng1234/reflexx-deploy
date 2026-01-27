'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type TestState = 'idle' | 'typing' | 'finished';

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains all the letters of the English alphabet and is commonly used for typing practice.",
  "Programming is the process of creating a set of instructions that tell a computer how to perform a task. It requires logical thinking and problem-solving skills.",
  "React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.",
  "Artificial intelligence is transforming the way we live and work. From virtual assistants to self-driving cars, AI is becoming an integral part of our daily lives.",
  "The internet has revolutionized communication, allowing people to connect instantly across the globe. It has changed how we work, learn, and interact with each other.",
];

export default function TypingTest() {
  const { t } = useI18n();
  const [testState, setTestState] = useState<TestState>('idle');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [errors, setErrors] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSavedRef = useRef(false);

  const startTest = useCallback(() => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setCurrentText(randomText);
    setUserInput('');
    setStartTime(0);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTestState('typing');
    hasSavedRef.current = false;

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;

    if (testState === 'idle') {
      setTestState('typing');
    }

    if (startTime === 0) {
      setStartTime(performance.now());
    }

    setUserInput(input);

    // Calculate errors
    let errorCount = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== currentText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);

    // Calculate accuracy
    const currentAccuracy = input.length > 0 ? ((input.length - errorCount) / input.length) * 100 : 100;
    setAccuracy(currentAccuracy);

    // Check if completed
    if (input.length >= currentText.length) {
      const timeElapsed = (performance.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = input.length / 5; // Standard: 5 characters = 1 word
      const finalWpm = Math.round(wordsTyped / timeElapsed);
      setWpm(finalWpm);
      setTestState('finished');

      // 防止重复保存
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      // Submit to Supabase and check if user is logged in (score = Net WPM)
      const netWpm = Math.round(finalWpm * (currentAccuracy / 100));
      submitScore({
        test_type: 'typing',
        score: netWpm,
        details: {
          wpm: finalWpm,
          accuracy: currentAccuracy,
        },
      }).then((submittedToDb) => {
        // Only save to localStorage if NOT logged in (submission failed)
        if (!submittedToDb) {
          const savedResults = JSON.parse(localStorage.getItem('typing-results') || '[]');
          savedResults.push({
            wpm: finalWpm,
            accuracy: currentAccuracy,
            timestamp: Date.now(),
          });
          localStorage.setItem('typing-results', JSON.stringify(savedResults.slice(-100)));
        }
      }).catch(console.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (testState === 'idle' && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      startTest();
      setUserInput(e.key);
      setStartTime(performance.now());
      setTestState('typing');
    }
  };

  const getRating = (wpm: number, accuracy: number) => {
    // Calculate Net WPM (speed adjusted by accuracy)
    const netWpm = wpm * (accuracy / 100);

    // If accuracy is too low (<80%), cap the maximum rating
    if (accuracy < 80) {
      if (netWpm >= 60) return t.ratingAverage;
      if (netWpm >= 40) return t.ratingNeedsPractice;
      return t.ratingNeedsPractice;
    }

    // If accuracy is low (<90%), cap at Good rating
    if (accuracy < 90) {
      if (netWpm >= 70) return t.ratingGood;
      if (netWpm >= 50) return t.ratingAverage;
      if (netWpm >= 30) return t.ratingNeedsPractice;
      return t.ratingNeedsPractice;
    }

    // For accuracy >= 90%, use Net WPM for rating
    if (netWpm >= 70) return t.ratingSuper;
    if (netWpm >= 55) return t.ratingExcellent;
    if (netWpm >= 40) return t.ratingGreat;
    if (netWpm >= 25) return t.ratingGood;
    if (netWpm >= 15) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'text-gray-400 dark:text-gray-600';

      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      } else if (index === userInput.length) {
        className = 'bg-primary-500 text-white animate-pulse';
      }

      return (
        <span key={index} className={`${className} ${char === ' ' ? 'mx-0.5' : ''}`}>
          {char === ' ' ? '_' : char}
        </span>
      );
    });
  };

  const calculateLiveWpm = () => {
    if (startTime === 0 || userInput.length === 0) return 0;
    const timeElapsed = (performance.now() - startTime) / 1000 / 60;
    const wordsTyped = userInput.length / 5;
    return Math.round(wordsTyped / timeElapsed);
  };

  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Idle State */}
        {testState === 'idle' && (
          <div className="text-center">
            <div className="mb-8 rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                {t.typingTitle}
              </h2>
              <div className="mb-6 text-left text-gray-700 dark:text-gray-300">
                <p className="mb-3">1. {t.typingTestInstruction1}</p>
                <p className="mb-3">2. {t.typingTestInstruction2}</p>
                <p className="mb-3">3. {t.typingTestInstruction3}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.typingTestAverage} {t.typingSpeed}约为 40 WPM (words per minute)
                </p>
              </div>
            </div>
            <button
              onClick={startTest}
              className="w-full max-w-sm rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
            >
              {t.startTest}
            </button>
          </div>
        )}

        {/* Typing Area */}
        {(testState === 'typing' || testState === 'finished') && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            {/* Stats Bar */}
            <div className="mb-6 flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <div className="flex-1 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingSpeed}</div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {testState === 'finished' ? wpm : calculateLiveWpm()} WPM
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingAccuracy}</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {accuracy.toFixed(1)}%
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingErrors}</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {errors}
                </div>
              </div>
            </div>

            {/* Text Display */}
            <div className="mb-6 rounded-xl border-2 border-gray-200 bg-gray-50 p-6 font-mono text-lg leading-relaxed dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 select-none whitespace-pre-wrap break-words">
                {currentText ? renderText() : '加载中...'}
              </div>
            </div>

            {/* Input Area */}
            {testState === 'typing' && (
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border-2 border-gray-200 bg-white p-4 font-mono text-lg focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
                rows={6}
                placeholder={t.typingTypeHere}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            )}

            {/* Finished State */}
            {testState === 'finished' && (
              <div className="space-y-6">
                <div className="rounded-xl bg-primary-50 p-6 text-center dark:bg-primary-900/20">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {t.typingTestComplete}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingTestTypingSpeed}</div>
                      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {wpm} WPM
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingAccuracy}</div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t.netWPM}</div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {(wpm * (accuracy / 100)).toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-white/50 p-4 dark:bg-gray-800/50">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t.srtRank}: {getRating(wpm, accuracy)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={startTest}
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
