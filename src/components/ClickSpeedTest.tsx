'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { TestDuration } from '@/types';
import { submitScore, getBestScore } from '@/lib/scores';

type TestState = 'idle' | 'running' | 'finished' | 'cooldown';

export default function ClickSpeedTest() {
  const { t } = useI18n();
  const [testState, setTestState] = useState<TestState>('idle');
  const [selectedDuration, setSelectedDuration] = useState<TestDuration>(5);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cps, setCps] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [bestCps, setBestCps] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedRef = useRef(false);

  const durations: TestDuration[] = [1, 5, 10, 30, 60, 100];

  useEffect(() => {
    async function loadBestScore() {
      const score = await getBestScore('click-speed');
      setBestCps(score);
    }
    loadBestScore();
  }, []);

  const startTest = useCallback(() => {
    setTestState('running');
    setClicks(0);
    setTimeLeft(selectedDuration);
    setCps(0);
    hasSavedRef.current = false;
  }, [selectedDuration]);

  const handleClick = useCallback(() => {
    if (testState === 'idle') {
      startTest();
      return;
    }

    if (testState === 'cooldown') {
      return;
    }

    if (testState === 'finished') {
      setTestState('idle');
      setClicks(0);
      setCps(0);
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
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            setClicks((currentClicks) => {
              if (hasSavedRef.current) {
                return currentClicks;
              }
              hasSavedRef.current = true;

              const finalCps = parseFloat((currentClicks / selectedDuration).toFixed(2));

              submitScore({
                test_type: 'click-speed',
                score: finalCps,
                details: {
                  clicks: currentClicks,
                  duration: selectedDuration,
                },
              }).then(async (submittedToDb) => {
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
                const score = await getBestScore('click-speed');
                setBestCps(score);
              }).catch(console.error);

              return currentClicks;
            });

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
    if (num >= 10) return { text: t.ratingSuper, bg: 'bg-purple-500' };
    if (num >= 8) return { text: t.ratingExcellent, bg: 'bg-green-500' };
    if (num >= 6) return { text: t.ratingGreat, bg: 'bg-blue-500' };
    if (num >= 5) return { text: t.ratingGood, bg: 'bg-yellow-500' };
    if (num >= 4) return { text: t.ratingAverage, bg: 'bg-orange-500' };
    return { text: t.ratingNeedsPractice, bg: 'bg-red-500' };
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl">
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
        <div className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                disabled={testState === 'running' || testState === 'cooldown'}
                className={`rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                  selectedDuration === duration
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-primary-900/10'
                } ${
                  testState === 'running' || testState === 'cooldown'
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>

        {/* Click Area */}
        <div className="mb-8">
          {testState === 'finished' ? (
            <div
              className="relative w-full rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20"
              style={{ aspectRatio: '21/9' }}
            >
              <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="w-full px-8 py-6">
                  <div className="mb-6 text-center">
                    <div className="mb-3 text-5xl">📊</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.cstResults}</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.cstTotalClicks}</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{clicks}</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.cstAverageCPS}</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{finalCps}</div>
                      <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white ${getCpsRating(finalCps).bg}`}>
                        {getCpsRating(finalCps).text}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.cstBestRecord}</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{bestCps !== null ? bestCps.toFixed(2) : '--'}</div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={handleClick}
                      className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
                    >
                      {t.srtTryAgain}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClick}
              className={`relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                testState === 'idle'
                  ? 'border-primary-300 bg-gradient-to-br from-primary-500 to-primary-700 text-white dark:border-primary-700'
                  : testState === 'running'
                  ? 'border-green-400 bg-green-500 text-white hover:bg-green-600 active:scale-95'
                  : 'border-green-400 bg-green-500 text-white'
              } shadow-xl`}
              style={{ aspectRatio: '21/9' }}
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
              </div>
            </button>
          )}
        </div>

        {/* Instructions, Benefits & Improvements */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white/60 backdrop-blur-md p-5 dark:border-gray-700/50 dark:bg-gray-800/60">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white text-center">📖 {t.howToPlay}</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• {t.cstInstruction1}</li>
              <li>• {t.cstInstruction2}</li>
              <li>• {t.cstInstruction3}</li>
            </ol>
            <div className="mt-3 rounded-lg bg-yellow-50 p-2 dark:bg-yellow-900/20">
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                💡 {t.cstProTip}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300 text-center">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200" dangerouslySetInnerHTML={{ __html: t.csBenefits }} />
          </div>

          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300 text-center">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200" dangerouslySetInnerHTML={{ __html: t.csImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
