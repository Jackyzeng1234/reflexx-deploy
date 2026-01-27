'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { TestDuration } from '@/types';
import { submitScore } from '@/lib/scores';

type TestState = 'idle' | 'running' | 'finished' | 'cooldown';

export default function ClickSpeedTest() {
  const { t } = useI18n();
  const [testState, setTestState] = useState<TestState>('idle');
  const [selectedDuration, setSelectedDuration] = useState<TestDuration>(5);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cps, setCps] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false); // 防止重复保存

  const durations: TestDuration[] = [1, 5, 10, 30, 60, 100];

  const startTest = useCallback(() => {
    setTestState('running');
    setClicks(0);
    setTimeLeft(selectedDuration);
    setCps(0);
    hasSavedRef.current = false; // 重置保存标志
  }, [selectedDuration]);

  const handleClick = useCallback(() => {
    if (testState === 'idle') {
      startTest();
      return;
    }

    if (testState === 'cooldown') {
      // Ignore clicks during cooldown
      return;
    }

    if (testState === 'finished') {
      // Reset and restart
      setClicks(0);
      setCps(0);
      startTest();
      return;
    }

    if (testState === 'running' && timeLeft > 0) {
      const newClicks = clicks + 1;
      setClicks(newClicks);

      const elapsedTime = selectedDuration - timeLeft;
      const currentCps = elapsedTime > 0 ? (newClicks / elapsedTime).toFixed(2) : '0.00';
      setCps(parseFloat(currentCps));
    }
  }, [testState, clicks, timeLeft, selectedDuration, startTest]);

  useEffect(() => {
    if (testState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Clear interval immediately
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            // Save result using current clicks value
            setClicks((currentClicks) => {
              // 防止重复保存
              if (hasSavedRef.current) {
                return currentClicks;
              }
              hasSavedRef.current = true;

              const finalCps = parseFloat((currentClicks / selectedDuration).toFixed(2));

              // Submit to Supabase and check if user is logged in
              submitScore({
                test_type: 'click-speed',
                score: finalCps,
                details: {
                  clicks: currentClicks,
                  duration: selectedDuration,
                },
              }).then((submittedToDb) => {
                // Only save to localStorage if NOT logged in (submission failed)
                if (!submittedToDb) {
                  const savedResults = JSON.parse(localStorage.getItem('click-speed-results') || '[]');
                  savedResults.push({
                    clicks: currentClicks,
                    duration: selectedDuration,
                    cps: finalCps,
                    timestamp: Date.now(),
                  });
                  localStorage.setItem('click-speed-results', JSON.stringify(savedResults.slice(-100)));
                }
              }).catch(console.error);

              return currentClicks;
            });

            // Enter cooldown state instead of finished
            setTestState('cooldown');
            setCooldownRemaining(2);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [testState, selectedDuration]);

  // Cooldown timer
  useEffect(() => {
    if (testState === 'cooldown') {
      cooldownRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
            }
            setTestState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [testState]);

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

  const finalCps = clicks > 0 ? (clicks / selectedDuration).toFixed(2) : '0.00';
  const getCpsRating = (cps: string) => {
    const num = parseFloat(cps);
    if (num >= 10) return { text: t.ratingSuper, color: 'text-purple-600' };
    if (num >= 8) return { text: t.ratingExcellent, color: 'text-green-600' };
    if (num >= 6) return { text: t.ratingGreat, color: 'text-blue-600' };
    if (num >= 5) return { text: t.ratingGood, color: 'text-yellow-600' };
    if (num >= 4) return { text: t.ratingAverage, color: 'text-orange-600' };
    return { text: t.ratingNeedsPractice, color: 'text-red-600' };
  };

  const getDurationKey = (duration: TestDuration) => {
    const keys: Record<TestDuration, string> = {
      1: t.duration1s,
      5: t.duration5s,
      10: t.duration10s,
      30: t.duration30s,
      60: t.duration60s,
      100: t.duration100s,
    };
    return keys[duration];
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {t.cstTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Measure how fast you can click!
          </p>
        </div>

        {/* Duration Selector */}
        {testState === 'idle' && (
          <div className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              {t.cstSelectDuration}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {durations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                    selectedDuration === duration
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/10'
                  }`}
                >
                  {duration}s
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Click Area */}
        <div className="mb-8">
          <button
            onClick={handleClick}
            className={`relative w-full overflow-hidden rounded-2xl border-2 transition-all ${
              testState === 'idle'
                ? 'border-primary-300 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 dark:border-primary-700'
                : testState === 'running'
                ? 'border-green-400 bg-green-500 hover:bg-green-600 active:scale-95'
                : testState === 'cooldown'
                ? 'border-green-400 bg-green-500'
                : 'border-primary-300 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 dark:border-primary-700'
            } shadow-xl`}
            style={{ aspectRatio: '2/1' }}
          >
            <div className="flex h-full flex-col items-center justify-center text-white">
              {testState === 'idle' && (
                <>
                  <div className="mb-4 text-7xl">🖱️</div>
                  <div className="text-3xl font-bold">{t.cstStart}</div>
                  <div className="mt-2 text-lg opacity-90">Click or press Space</div>
                </>
              )}

              {testState === 'running' && (
                <>
                  <div className="text-8xl font-bold">{clicks}</div>
                  <div className="mt-2 text-xl opacity-90">{t.cstClicks}</div>
                  <div className="mt-4 text-2xl font-semibold">{timeLeft}s</div>
                </>
              )}

              {testState === 'cooldown' && (
                <>
                  <div className="mb-4 text-6xl">🏁</div>
                  <div className="text-4xl font-bold">{t.timesUp}</div>
                </>
              )}

              {testState === 'finished' && (
                <>
                  <div className="mb-4 text-6xl">🔄</div>
                  <div className="text-4xl font-bold text-white">{t.cstResults}</div>
                  <div className="mt-2 text-lg text-white opacity-90">{t.clickToRestart}</div>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Stats Display */}
        {(testState === 'running' || testState === 'cooldown' || testState === 'finished') && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                {t.cstClicks}
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{clicks}</div>
            </div>

            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
              <div className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
                {t.cstCPS}
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {testState === 'finished' ? finalCps : cps.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6 text-center dark:border-purple-800 dark:bg-purple-900/20">
              <div className="mb-2 text-sm font-medium text-purple-700 dark:text-purple-400">
                {t.cstTime}
              </div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {testState === 'finished' ? selectedDuration : timeLeft}s
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {testState === 'finished' && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="text-center">
                  <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.cstTotalClicks}
                  </div>
                  <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                    {clicks}
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.cstAverageCPS}
                  </div>
                  <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                    {finalCps}
                  </div>
                  <div className={`mt-2 text-lg font-semibold ${getCpsRating(finalCps).color}`}>
                    {getCpsRating(finalCps).text}
                  </div>
                </div>
              </div>

              {/* Best Record */}
              <div className="mt-6 border-t border-primary-200 pt-6 dark:border-primary-800">
                <div className="text-center">
                  <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t.cstBestRecord} ({getDurationKey(selectedDuration)})
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {Math.max(
                      ...JSON.parse(localStorage.getItem('click-speed-results') || '[]')
                        .filter((r: any) => r.duration === selectedDuration)
                        .map((r: any) => r.cps),
                      0
                    ).toFixed(2)}{' '}
                    CPS
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setTestState('idle');
                  setClicks(0);
                  setCps(0);
                }}
                className="w-full max-w-sm rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                {t.cstRestart}
              </button>
              </div>
          </div>
        )}

        {/* Instructions */}
        {testState === 'idle' && (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{t.howToPlay}</h2>
            <ol className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  1
                </span>
                <span>{t.cstInstruction1}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  2
                </span>
                <span>{t.cstInstruction2}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  3
                </span>
                <span>{t.cstInstruction3}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  4
                </span>
                <span>{t.cstInstruction4}</span>
              </li>
            </ol>

            <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                💡 {t.cstProTip}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
