'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type TestState = 'idle' | 'waiting' | 'ready' | 'too-early' | 'finished';

export default function AuditoryReactionTest() {
  const { t } = useI18n();
  const [testState, setTestState] = useState<TestState>('idle');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [totalRounds] = useState(5);
  const hasSavedRef = useRef(false);

  const playTone = useCallback(async () => {
    try {
      console.log('Attempting to play tone...');

      // Create AudioContext if needed
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        console.log('Created new AudioContext');
      }

      const audioContext = audioContextRef.current;
      console.log('AudioContext state:', audioContext.state);

      // Resume if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Resumed AudioContext');
      }

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Use a higher frequency and louder volume
      oscillator.frequency.value = 1000; // 1000 Hz - more audible
      oscillator.type = 'sine';

      // Simple volume envelope - louder
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.5, now); // Start at 0.5 (louder)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Shorter duration

      oscillator.start(now);
      oscillator.stop(now + 0.3);

      console.log('Oscillator started');

      setStartTime(performance.now());
      setTestState('ready');
      setIsPlaying(true);

      setTimeout(() => {
        setIsPlaying(false);
      }, 300);
    } catch (error) {
      console.error('Audio play error:', error);
      // Fallback: just show visual cue
      setStartTime(performance.now());
      setTestState('ready');
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 300);
    }
  }, []);

  const startTest = useCallback(async () => {
    console.log('Starting test...');

    // Initialize AudioContext immediately on user interaction
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      console.log('AudioContext created:', audioContextRef.current.state);
    }

    // Resume AudioContext if suspended
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log('AudioContext resumed:', audioContextRef.current.state);
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }

    setTestState('waiting');
    setReactionTimes([]);
    setCurrentRound(0);
    hasSavedRef.current = false;

    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    console.log('Will play tone in', Math.round(delay), 'ms');

    timeoutRef.current = setTimeout(() => {
      console.log('Delay timeout, playing tone now');
      playTone();
    }, delay);
  }, [playTone]);

  const handleClick = useCallback(() => {
    if (testState === 'idle' || testState === 'finished' || testState === 'too-early') {
      startTest();
      return;
    }

    if (testState === 'waiting') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log('Cleared timeout due to early click');
      }
      setTestState('too-early');
      return;
    }

    if (testState === 'ready') {
      const reactionTime = performance.now() - startTime;
      setReactionTimes([...reactionTimes, reactionTime]);
      setCurrentRound(currentRound + 1);

      if (currentRound + 1 >= totalRounds) {
        setTestState('finished');
        const newTimes = [...reactionTimes, reactionTime];
        const average = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);

        // 防止重复保存
        if (hasSavedRef.current) {
          return;
        }
        hasSavedRef.current = true;

        // Submit to Supabase and check if user is logged in
        submitScore({
          test_type: 'auditory-reaction',
          score: average,
          details: {
            times: newTimes,
            rounds: totalRounds,
          },
        }).then((submittedToDb) => {
          // Only save to localStorage if NOT logged in (submission failed)
          if (!submittedToDb) {
            const savedResults = JSON.parse(localStorage.getItem('auditory-reaction-results') || '[]');
            savedResults.push({
              times: newTimes,
              average: average,
              timestamp: Date.now(),
            });
            localStorage.setItem('auditory-reaction-results', JSON.stringify(savedResults.slice(-100)));
          }
        }).catch(console.error);
      } else {
        setTestState('waiting');
        const delay = Math.random() * 3000 + 2000;
        console.log('Next round will play tone in', Math.round(delay), 'ms');
        timeoutRef.current = setTimeout(() => {
          console.log('Next round: Delay timeout, playing tone now');
          playTone();
        }, delay);
      }
    }
  }, [testState, currentRound, reactionTimes, startTime, startTest, playTone, totalRounds]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      // Don't clear timeout here - it causes the issue!
      // timeoutRef will be cleaned up when component unmounts naturally
    };
  }, [handleClick]);

  // Separate cleanup for component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const averageTime =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  const getRating = (avgTime: number) => {
    if (avgTime < 300) return t.ratingSuper;
    if (avgTime < 400) return t.ratingExcellent;
    if (avgTime < 500) return t.ratingGreat;
    if (avgTime < 600) return t.ratingGood;
    if (avgTime < 700) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Main Test Area */}
        <div
          onClick={handleClick}
          className={`relative mb-8 flex h-96 cursor-pointer items-center justify-center rounded-2xl border-4 transition-all ${
            testState === 'idle'
              ? 'border-primary-300 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 dark:border-primary-700'
              : testState === 'waiting'
              ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
              : testState === 'ready' || isPlaying
              ? 'border-green-400 bg-green-500'
              : testState === 'too-early'
              ? 'border-red-400 bg-red-500'
              : 'border-primary-300 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 dark:border-primary-700'
          }`}
        >
          {testState === 'idle' && (
            <div className="text-center text-white">
              <div className="mb-6 text-8xl">🔊</div>
              <div className="text-4xl font-bold">{t.auditoryReactionTitle}</div>
              <div className="mt-4 text-xl opacity-90">{t.auditoryReactionInstruction1}</div>
            </div>
          )}

          {testState === 'waiting' && (
            <div className="text-center">
              <div className="mb-6 text-8xl">👂</div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {t.auditoryReactionWait}
              </div>
              <div className="mt-4 text-xl text-gray-700 dark:text-gray-300">
                {t.srtAverage} {currentRound + 1} / {totalRounds}
              </div>
            </div>
          )}

          {testState === 'ready' && (
            <div className="text-center text-white">
              <div className="mb-6 text-9xl animate-pulse">🔊</div>
              <div className="text-5xl font-bold">{t.auditoryReactionClickNow}</div>
            </div>
          )}

          {testState === 'too-early' && (
            <div className="text-center text-white">
              <div className="mb-6 text-8xl">⚠️</div>
              <div className="text-4xl font-bold">{t.auditoryReactionTooEarly}</div>
              <div className="mt-4 text-xl">{t.srtTryAgain}</div>
            </div>
          )}

          {testState === 'finished' && (
            <div className="text-center text-white">
              <div className="mb-6 text-8xl">📊</div>
              <div className="text-4xl font-bold">{t.auditoryReactionResults}</div>
              <div className="mt-4 text-xl">{t.srtTryAgain}</div>
            </div>
          )}
        </div>

        {/* Results */}
        {testState === 'finished' && reactionTimes.length > 0 && (
          <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-8 dark:border-primary-800 dark:bg-primary-900/20">
            <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              {t.srtResults}
            </h2>

            <div className="mb-6 text-center">
              <div className="text-6xl font-bold text-primary-600 dark:text-primary-400">
                {averageTime}ms
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t.srtAverage}
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-white/50 p-4 text-center dark:bg-gray-800/50">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Rank: {getRating(averageTime)}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-5 gap-2">
              {reactionTimes.map((time, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-2 text-center text-sm ${
                    time < 400
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : time < 500
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {Math.round(time)}ms
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={startTest}
                className="w-full max-w-sm rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
              >
                {t.startTest}
              </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
