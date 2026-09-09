'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { ratingBucket, ratingColor, ratingLabelKey } from '@/lib/ratings';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { Volume2, Ear, AlertTriangle, BarChart3 } from 'lucide-react';

type TestState = 'idle' | 'waiting' | 'ready' | 'too-early' | 'finished';

const HISTORY_KEY = 'auditory-reaction-results';

/** 读取本机历史成绩(ms),按时间升序 */
function readLocalHistory(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((r: any) => (typeof r.average === 'number' ? r.average : r.times?.[0]))
      .filter((n: any) => typeof n === 'number');
  } catch {
    return [];
  }
}

export default function AuditoryReactionTest() {
  const { t } = useI18n();
  const { setTimeout: timeout, clearTimeout: clearDelayTimeout } = useTimeout();
  const [testState, setTestState] = useState<TestState>('idle');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [totalRounds] = useState(5);
  const hasSavedRef = useRef(false);
  const [history, setHistory] = useState<number[]>([]);

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

      timeout(() => {
        setIsPlaying(false);
      }, 300);
    } catch (error) {
      console.error('Audio play error:', error);
      // Fallback: just show visual cue
      setStartTime(performance.now());
      setTestState('ready');
      setIsPlaying(true);
      timeout(() => {
        setIsPlaying(false);
      }, 300);
    }
  }, [timeout]);

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

    timeout(() => {
      console.log('Delay timeout, playing tone now');
      playTone();
    }, delay);
  }, [playTone, timeout]);

  const handleClick = useCallback(() => {
    if (testState === 'idle' || testState === 'finished' || testState === 'too-early') {
      startTest();
      return;
    }

    if (testState === 'waiting') {
      clearDelayTimeout();
      console.log('Cleared timeout due to early click');
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

        // 始终写入本机历史(进度曲线),登录用户也保留
        try {
          const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
          raw.push({ times: newTimes, average, timestamp: Date.now() });
          localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
          setHistory(readLocalHistory());
        } catch (e) {
          console.error(e);
        }

        submitScore({
          test_type: 'auditory-reaction',
          score: average,
          details: {
            times: newTimes,
            rounds: totalRounds,
          },
        }).catch(console.error);
      } else {
        setTestState('waiting');
        const delay = Math.random() * 3000 + 2000;
        console.log('Next round will play tone in', Math.round(delay), 'ms');
        timeout(() => {
          console.log('Next round: Delay timeout, playing tone now');
          playTone();
        }, delay);
      }
    }
  }, [testState, currentRound, reactionTimes, startTime, startTest, playTone, totalRounds, timeout, clearDelayTimeout]);

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
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
  }, []);

  const averageTime =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  const bestTime = reactionTimes.length > 0 ? Math.round(Math.min(...reactionTimes)) : 0;

  const getRating = (avgTime: number) => t[ratingLabelKey(ratingBucket('auditory-reaction', avgTime))];

  const getVerdictColor = (ms: number) => ratingColor(ratingBucket('auditory-reaction', ms));

  const surfaceLabel =
    testState === 'idle' ? t.clickToStart
    : testState === 'waiting' ? t.auditoryReactionWait
    : testState === 'ready' ? t.auditoryReactionClickNow
    : testState === 'too-early' ? t.auditoryReactionTooEarly
    : t.srtTryAgain;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="display-title">{t.auditoryReactionTitle}</h1>
        </div>
        {/* 游戏区 —— display 变体:左结果 + 右方形靶 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {testState === 'finished' ? averageTime : <span className="dim">000</span>}
              <span className="unit">ms</span>
            </div>
            <div
              className="game-verdict"
              style={{ color: testState === 'finished' ? getVerdictColor(averageTime) : 'transparent' }}
            >
              {testState === 'finished' ? getRating(averageTime) : ''}
            </div>
            <div className="game-stats">
              {testState === 'finished'
                ? `${t.srtBest} ${bestTime} ms · ${t.srtAverage} ${averageTime} ms`
                : `${currentRound + 1} / ${totalRounds}`}
            </div>
            {testState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={() => startTest()}>
                  ↻ {t.srtTryAgain}
                </button>
              </div>
            )}
          </div>

          <button
            className="game-surface"
            data-state={testState}
            onClick={handleClick}
            aria-label={surfaceLabel}
          >
            <span className="game-label">{surfaceLabel}</span>
          </button>
        </div>

        {/* 成绩曲线:本机历史(≥2 次后显示) */}
        {history.length >= 2 && (
          <div className="mx-auto mt-20 max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.progressChartTitle}
            </h2>
            <div className="mt-6">
              <ReactionChart data={history} />
            </div>
          </div>
        )}

        {/* SEO 正文:测量内容 + 如何提升 */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testBenefitsTitle}
            </h2>
            <p
              className="mt-4 leading-relaxed text-text-secondary"
              dangerouslySetInnerHTML={{ __html: t.artBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.artImprovements.split('<br>').map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-brand" aria-hidden>→</span>
                  <span className="leading-relaxed text-text-secondary">
                    {item.replace(/^[•\s]+/, '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Auditory Reaction Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the auditory reaction test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>This auditory reaction test measures how quickly you respond to sound stimuli. It evaluates your auditory processing speed, neural transmission time, and motor response coordination - different from visual reaction tests.</p>
                  <ol className="space-y-2 list-decimal list-inside text-gray-300">
                    <li><strong>Wait for the sound</strong> - The test starts with a waiting period. A tone will play randomly after 2-5 seconds</li>
                    <li><strong>Listen carefully</strong> - Keep your audio on and volume at a comfortable level. The tone is a 1000Hz beep</li>
                    <li><strong>Click or press space</strong> - As soon as you hear the tone, click anywhere in the test area or press the spacebar</li>
                    <li><strong>Click, then repeat</strong> - Each attempt records one auditory reaction time. Run it several times and read your average — not a single lucky click — as your real baseline.</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Auditory reactions are typically 30-50ms faster than visual ones — sound reaches the brain faster than sight. This is normal. For best results, take the test in a quiet environment with good audio quality.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good auditory reaction time? Average scores and benchmarks"
              icon="⚡"
              answer={
                <div className="space-y-4">
                  <p>A good auditory reaction time depends on your age, hearing ability, and focus. Here are the average auditory reaction time benchmarks:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average auditory reaction times by age (in milliseconds):</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li><strong>18–25 years:</strong> 130–170 ms</li>
                      <li><strong>26–35 years:</strong> 140–180 ms</li>
                      <li><strong>36–45 years:</strong> 150–195 ms</li>
                      <li><strong>46–60 years:</strong> 160–210 ms</li>
                      <li><strong>60+ years:</strong> 180–235 ms</li>
                    </ul>
                  </div>

                  <h4 className="font-semibold text-gray-100 mb-2">How we rate your result — the same 5 tiers the test uses:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🔥 Exceptional — under 110 ms</p>
                      <p className="text-sm text-gray-300">Roughly the top 2%. Typical of trained athletes, musicians and gamers.</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above average — 110–140 ms</p>
                      <p className="text-sm text-gray-300">Faster than most; sharp auditory-motor coordination.</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Average — 140–200 ms</p>
                      <p className="text-sm text-gray-300">The typical range for healthy adults; most people land here.</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Below average — 200–235 ms</p>
                      <p className="text-sm text-gray-300">Slower than the norm. Worth retesting with good audio and full focus.</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Needs attention — over 235 ms</p>
                      <p className="text-sm text-gray-300">Well above the norm. If it stays this high when you're rested, consider checking your audio or hearing.</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: Auditory reactions are naturally 30-50ms faster than visual ones — sound reaches the brain quicker than sight. Musicians and athletes often have faster auditory reaction times due to training.</p>
                </div>
              }
            />
            <FAQItem
              question="What does auditory reaction time measure? Brain processing and hearing function"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>This auditory reaction test measures your <strong>auditory processing speed</strong>, <strong>neural transmission efficiency</strong>, and <strong>auditory-motor coordination</strong>. It evaluates how fast your brain processes sound information and initiates physical responses.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Auditory processing speed</strong> - How fast your ears detect sound and your auditory cortex processes it</li>
                      <li><strong>Neural pathway efficiency</strong> - Signal transmission from auditory nerve to brain and motor cortex</li>
                      <li><strong>Sound recognition time</strong> - How quickly you identify and respond to auditory stimuli</li>
                      <li><strong>Motor response coordination</strong> - Communication between auditory processing and motor execution centers</li>
                      <li><strong>Attention and focus</strong> - Your ability to maintain alertness for auditory cues</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Difference from visual reaction time:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Longer neural pathway</strong> - Sound travels through more brain regions before reaching motor cortex (+20-50ms)</li>
                      <li><strong>Auditory vs visual processing</strong> - Different brain areas process sound vs light, affecting speed</li>
                      <li><strong>Practice effect</strong> - Musicians and athletes often train auditory reactions specifically</li>
                      <li><strong>Hearing acuity</strong> - Better hearing can improve auditory reaction time by 10-20ms</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your auditory reaction score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Age and hearing</strong> - Natural hearing decline slows auditory processing by 1-2ms per year</li>
                      <li><strong>Audio quality and volume</strong> - Poor audio or low volume adds 20-40ms to reaction time</li>
                      <li><strong>Fatigue and focus</strong> - Tiredness impairs auditory attention significantly</li>
                      <li><strong>Background noise</strong> - Noisy environments can slow reactions by 30-50ms</li>
                      <li><strong>Music training</strong> - Musicians typically have 15-25ms faster auditory reactions</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>🎵 Musical Applications:</strong> Fast auditory reaction is crucial for musicians, especially rhythm sections, conductors, and performers. It's also valuable for athletes responding to starting guns, coaches' whistles, and game sounds. Professional musicians often have elite-level auditory reaction times.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve auditory reaction time? Training techniques and exercises"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Improving auditory reaction time requires specific training exercises that challenge your auditory processing speed and coordination. Here's a comprehensive guide:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎵 Musical and Rhythm Training</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Learn an instrument</strong> - Playing instruments improves auditory-motor coordination significantly</li>
                      <li><strong>Rhythm games</strong> - Games like Guitar Hero, Beat Saber, or rhythm trainers improve sound reaction</li>
                      <li><strong>Metronome practice</strong> - Clap or tap along with metronome at different speeds improves timing</li>
                      <li><strong>Sight-reading music</strong> - Reading and playing music simultaneously trains auditory processing</li>
                      <li><strong>Singing or vocal training</strong> - Pitch and rhythm exercises enhance auditory sensitivity</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Auditory Reaction Drills</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Daily sound reaction tests</strong> - Take this test 2-3 times per day to build consistency</li>
                      <li><strong>Audio cue training</strong> - Have a friend make random sounds and react as fast as possible</li>
                      <li><strong>Multiple sound identification</strong> - Practice identifying and reacting to different sounds quickly</li>
                      <li><strong>Start signal practice</strong> - Use various audio cues (whistle, clap, beep) and respond instantly</li>
                      <li><strong>Background noise training</strong> - Practice reacting to sounds in noisy environments</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🏃 Sports and Physical Training</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sprint starts</strong> - Practice reacting to starting guns or whistle commands</li>
                      <li><strong>Ball sports drills</strong> - React to audio cues while catching or hitting balls</li>
                      <li><strong>Martial arts sparring</strong> - Respond to opponent sounds and教练 commands</li>
                      <li><strong>Reaction ball exercises</strong> - Throw ball against wall and react to bounce sound</li>
                      <li><strong>Interval training</strong> - Alternate between sprints on audio cue and rest periods</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🧠 Cognitive and Mental Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Auditory attention training</strong> - Focus exercises that enhance sound discrimination</li>
                      <li><strong>Dichotic listening</strong> - Practice processing different sounds in each ear simultaneously</li>
                      <li><strong>Sound localization</strong> - Identify where sounds come from to improve spatial auditory processing</li>
                      <li><strong>Meditation and focus</strong> - Mindfulness improves overall attention and reaction speed</li>
                      <li><strong>Brain training games</strong> - Apps that target auditory processing and working memory</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🔊 Environment and Equipment Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Quality headphones or speakers</strong> - Better audio quality improves sound detection speed</li>
                      <li><strong>Optimal volume</strong> - Loud enough to hear clearly, not so loud it causes discomfort or delay</li>
                      <li><strong>Quiet environment</strong> - Minimize background noise for pure auditory testing</li>
                      <li><strong>Good hearing health</strong> - Regular hearing checks, protect ears from loud noises</li>
                      <li><strong>Proper positioning</strong> - Sit comfortably, face audio source directly</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With consistent practice over 3-4 weeks, most people improve auditory reaction time by 20-40ms (8-12% improvement). Musicians may see 30-50ms improvement. Professional athletes and musicians can achieve sub-220ms times with dedicated training.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my auditory reaction time slow? Common causes and solutions"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If your auditory reaction time is above 400ms, there might be specific reasons. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for slow auditory reaction time:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Poor audio quality</strong> - Low volume, distorted audio, or poor headphones add 30-50ms</li>
                      <li><strong>Hearing issues</strong> - Even mild hearing loss can slow auditory processing significantly</li>
                      <li><strong>Lack of focus</strong> - Not paying attention to sounds or being distracted adds 40-60ms</li>
                      <li><strong>Fatigue and tiredness</strong> - Being exhausted impairs auditory processing and attention</li>
                      <li><strong>Background noise</strong> - Noisy environment makes sound detection harder and slower</li>
                      <li><strong>Age-related decline</strong> - Natural hearing and processing decline, especially for high frequencies</li>
                      <li><strong>No musical training</strong> - Musicians typically have 15-25ms faster auditory reactions</li>
                      <li><strong>Earwax or congestion</strong> - Physical blockage reduces hearing clarity and speed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to improve slow auditory reaction time:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Get a hearing test</strong> - Rule out hearing loss or issues that could be affecting your performance</li>
                      <li><strong>Improve audio setup</strong> - Use quality headphones, good volume, and quiet environment</li>
                      <li><strong>Practice auditory focus</strong> - Active listening exercises and sound discrimination training</li>
                      <li><strong>Learn music or rhythm</strong> - Even basic musical training improves auditory processing speed</li>
                      <li><strong>Reduce background noise</strong> - Test in quiet room, use noise-cancelling headphones if available</li>
                      <li><strong>Stay rested and alert</strong> - Fatigue severely impacts auditory attention and processing</li>
                      <li><strong>Clean your ears</strong> - Safe ear cleaning improves hearing clarity</li>
                      <li><strong>Daily practice</strong> - Take auditory reaction tests regularly to build neural pathways</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Medical Note:</strong> If your auditory reaction time is consistently over 450ms and you have concerns about your hearing, consider consulting an audiologist. Sudden changes in hearing or reaction time could indicate medical issues requiring professional evaluation.</p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
