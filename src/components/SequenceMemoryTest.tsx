'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { ratingBucket, ratingColor, ratingLabelKey } from '@/lib/ratings';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { Music, BarChart3 } from 'lucide-react';

type GameState = 'idle' | 'showing' | 'input' | 'finished';

interface Tile {
  id: number;
  isActive: boolean;
}

const HISTORY_KEY = 'sequence-memory-results';

/** 读取本机历史成绩(通关关卡),按时间升序 */
function readLocalHistory(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((r: any) => r.level)
      .filter((n: any) => typeof n === 'number');
  } catch {
    return [];
  }
}

export default function SequenceMemoryTest() {
  const { t } = useI18n();
  const { setTimeout } = useTimeout();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasSavedRef = useRef(false);
  const isShowingSequenceRef = useRef(false); // 追踪是否正在展示序列
  const [history, setHistory] = useState<number[]>([]);

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
    isShowingSequenceRef.current = false;
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
    if (gameState !== 'showing' || isShowingSequenceRef.current) return;

    isShowingSequenceRef.current = true;

    const showTile = (index: number) => {
      // 检查是否仍在展示状态
      if (!isShowingSequenceRef.current || gameState !== 'showing') {
        isShowingSequenceRef.current = false;
        return;
      }

      if (index >= sequence.length) {
        setGameState('input');
        setActiveTile(null);
        isShowingSequenceRef.current = false;
        return;
      }

      const tileId = sequence[index];
      setActiveTile(tileId);
      playTone(tileId); // Play tone when showing

      // 使用 useTimeout hook
      setTimeout(() => {
        // 再次检查状态
        if (!isShowingSequenceRef.current) return;

        setActiveTile(null);
        setTimeout(() => {
          showTile(index + 1);
        }, 300);
      }, 600);
    };

    showTile(0);
  }, [gameState, sequence, playTone, setTimeout]);

  useEffect(() => {
    if (gameState === 'showing' && sequence.length > 0) {
      const timer = window.setTimeout(() => {
        showSequence();
      }, 500);
      return () => window.clearTimeout(timer);
    }
  }, [gameState, sequence, showSequence]);

  const handleTileClick = useCallback((tileId: number) => {
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

      // 始终写入本机历史(进度曲线),登录用户也保留
      try {
        const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        raw.push({ level: currentLevel, timestamp: Date.now() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
        setHistory(readLocalHistory());
      } catch (e) {
        console.error(e);
      }

      submitScore({
        test_type: 'sequence-memory',
        score: currentLevel,
        details: {
          tiles: sequence.length,
        },
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
        isShowingSequenceRef.current = false;
      }, 1000);
    }
  }, [gameState, playerInput, sequence, currentLevel, playTone, playErrorSound, setTimeout]);

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
  }, []);

  const getRating = (level: number) => t[ratingLabelKey(ratingBucket('sequence-memory', level))];

  const getVerdictColor = (level: number) => ratingColor(ratingBucket('sequence-memory', level));

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="display-title">{t.sequenceMemoryTitle}</h1>
        </div>
        {/* 游戏区 —— display 变体:左结果 + 右 3×3 色块 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {gameState === 'finished' ? currentLevel : <span className="dim">0</span>}
            </div>
            <div
              className="game-verdict"
              style={{ color: gameState === 'finished' ? getVerdictColor(currentLevel) : 'transparent' }}
            >
              {gameState === 'finished' ? getRating(currentLevel) : ''}
            </div>
            <div className="game-stats">
              {gameState === 'finished'
                ? `${t.sequenceMemoryLevel} ${currentLevel}`
                : gameState === 'input'
                ? `${t.sequenceMemoryRepeat} (${playerInput.length}${t.sequenceMemoryOf}${sequence.length})`
                : ''}
            </div>
            {gameState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={startGame}>
                  ↻ {t.srtTryAgain}
                </button>
              </div>
            )}
          </div>

          <div className="game-panel relative">
            <div className="mb-5 text-center">
              <div className="text-2xl font-bold text-text">
                {t.sequenceMemoryLevel} {currentLevel}
              </div>
              {gameState === 'showing' && (
                <div className="mt-1 text-sm text-text-secondary">{t.sequenceMemoryWatching}</div>
              )}
              {gameState === 'input' && (
                <div className="mt-1 text-sm text-text-secondary">
                  {t.sequenceMemoryRepeat} ({playerInput.length}{t.sequenceMemoryOf}{sequence.length})
                </div>
              )}
            </div>

            <div className="grid w-full max-w-sm grid-cols-3 gap-3">
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

            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="btn btn-primary" onClick={startGame}>
                  {t.clickToStart}
                </button>
              </div>
            )}
            {gameState === 'finished' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="game-label text-text-tertiary">{t.sequenceMemoryGameOver}</span>
              </div>
            )}
          </div>
        </div>

        {/* 成绩曲线:本机历史(≥2 次后显示) */}
        {history.length >= 2 && (
          <div className="mx-auto mt-20 max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.progressChartTitle}
            </h2>
            <div className="mt-6">
              <ReactionChart data={history} unit="level" caption={t.chartHigherBetter} />
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
              dangerouslySetInnerHTML={{ __html: t.smBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.smImprovements.split('<br>').map((item) => (
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
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Sequence Memory Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the sequence memory test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>The sequence memory test measures your ability to remember and repeat increasingly long sequences of tiles. It's designed to challenge your spatial and auditory memory through a progressive difficulty system.</p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-300">
                    <li><strong>Watch the sequence</strong> - The test will highlight tiles in a specific order, accompanied by musical tones. Each new level adds one more tile to the sequence.</li>
                    <li><strong>Wait for your turn</strong> - After the sequence is shown, the text will change to "Your turn!" and the tiles become clickable.</li>
                    <li><strong>Repeat the sequence</strong> - Click the tiles in the exact same order they were shown. Each tile plays a tone to help with recall.</li>
                    <li><strong>Progress through levels</strong> - Successfully repeat the sequence to advance. Make one mistake and the game ends.</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Use both visual and auditory memory! The musical tones create a multi-sensory memory trace. Try humming the tones or creating a story connecting the tiles. Level represents the sequence length you successfully completed.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good sequence memory score? Average levels by age"
              icon="🎯"
              answer={
                <div className="space-y-4">
                  <p>Sequence memory scores vary significantly based on age, practice, and natural memory ability. The average person can remember 5-7 items in sequence (Miller's Law: 7±2).</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average sequence memory levels by age:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li><strong>18–25 years:</strong> 8–10 levels</li>
                      <li><strong>26–35 years:</strong> 7–10 levels</li>
                      <li><strong>36–45 years:</strong> 7–9 levels</li>
                      <li><strong>46–60 years:</strong> 6–8 levels</li>
                      <li><strong>60+ years:</strong> 4–7 levels</li>
                    </ul>
                  </div>

                  <h4 className="font-semibold text-gray-100 mb-2">How we rate your result — the same 5 tiers the test uses:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Exceptional — level 14+</p>
                      <p className="text-sm text-gray-300">Roughly the top 2%. Exceptional visual sequence memory.</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above average — level 10–14</p>
                      <p className="text-sm text-gray-300">Stronger than most; above-average visual memory.</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Average — level 7–10</p>
                      <p className="text-sm text-gray-300">The typical range for healthy adults; most people land here.</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Below average — level 4–7</p>
                      <p className="text-sm text-gray-300">Below the norm. Worth retesting when rested and focused.</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Needs attention — under level 4</p>
                      <p className="text-sm text-gray-300">Well below the norm. If it stays this low, check sleep, stress, or focus.</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: Sequence memory is highly trainable. Regular practice can improve scores by 50-100%. Musicians and gamers typically score higher due to trained pattern recognition and auditory memory skills.</p>
                </div>
              }
            />
            <FAQItem
              question="What does sequence memory test measure? Cognitive functions assessed"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The sequence memory test measures your <strong>spatial working memory</strong> and <strong>auditory memory</strong> - the ability to hold and manipulate information in short-term memory. It evaluates how well you can remember sequences of information.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Spatial memory</strong> - Ability to remember locations and spatial relationships (which tiles were activated)</li>
                      <li><strong>Auditory memory</strong> - Capacity to recall sequences of sounds and musical tones</li>
                      <li><strong>Working memory capacity</strong> - How many items you can hold in conscious awareness simultaneously</li>
                      <li><strong>Sequential processing</strong> - Ability to remember and reproduce ordered information</li>
                      <li><strong>Pattern recognition</strong> - Brain's ability to detect and remember visual patterns</li>
                      <li><strong>Attention and focus</strong> - Sustained concentration required to track the sequence</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sleep quality</strong> - Memory consolidation occurs during sleep; poor sleep severely impacts recall</li>
                      <li><strong>Stress and anxiety</strong> - High cortisol interferes with memory formation and retrieval</li>
                      <li><strong>Age</strong> - Working memory naturally declines ~5% per decade after age 30</li>
                      <li><strong>Practice effects</strong> - Regular practice can improve working memory by 20-40%</li>
                      <li><strong>Musical training</strong> - Musicians typically have better auditory and sequential memory</li>
                      <li><strong>Fatigue</strong> - Mental exhaustion reduces working memory capacity significantly</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Why sequence memory matters:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li>Predicts academic and professional performance (math, programming, learning skills)</li>
                      <li>Important for daily tasks (remembering instructions, phone numbers, passwords)</li>
                      <li>Indicator of cognitive health and brain function</li>
                      <li>Can decline with age, stress, or neurological conditions</li>
                      <li>Improves with memory training, exercise, and proper sleep</li>
                    </ul>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve sequence memory? Memory enhancement techniques"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Sequence memory can be significantly improved through targeted training, memory techniques, and lifestyle optimization. Here are proven strategies:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🧠 Memory Training Techniques</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Practice this test daily</strong> - 10-15 minutes daily for 2-3 weeks can improve memory span by 2-4 levels</li>
                      <li><strong>Use chunking strategy</strong> - Group tiles into smaller chunks (2-3 items) instead of individual tiles</li>
                      <li><strong>Create mnemonics</strong> - Associate tiles with familiar patterns, shapes, or stories</li>
                      <li><strong>Verbal rehearsal</strong> - Repeat the sequence to yourself ("top-left, center, bottom-right...")</li>
                      <li><strong>Visual imagery</strong> - Create a mental image or story connecting the tiles in order</li>
                      <li><strong>Rhythm and timing</strong> - Notice the rhythm/pattern of the sequence; tap along to remember</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎵 Auditory and Musical Training</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Learn musical instrument</strong> - Piano, guitar, or violin dramatically improve sequential memory</li>
                      <li><strong>Singing lessons</strong> - Train your ear to remember melodies and tone sequences</li>
                      <li><strong>Rhythm games</strong> - Games like Guitar Hero, Dance Dance Revolution improve audio-visual memory</li>
                      <li><strong>Ear training apps</strong> - Practice identifying and remembering musical intervals and patterns</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">💪 Physical and Lifestyle Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Get quality sleep</strong> - 7-9 hours is essential; memory consolidation happens during deep sleep</li>
                      <li><strong>Aerobic exercise</strong> - Cardio increases hippocampus size and improves memory by 20-30%</li>
                      <li><strong>Meditation</strong> - Mindfulness practice improves focus and working memory capacity</li>
                      <li><strong>Brain-healthy diet</strong> - Omega-3s, berries, nuts, and dark chocolate support memory</li>
                      <li><strong>Stay hydrated</strong> - Dehydration impairs concentration and memory recall</li>
                      <li><strong>Reduce stress</strong> - High cortisol damages the hippocampus and impairs memory formation</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Practice Tips for Better Scores</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Test when alert</strong> - Morning or early afternoon when focus is highest</li>
                      <li><strong>Minimize distractions</strong> - Quiet room, silence phone, close other tabs</li>
                      <li><strong>Stay relaxed</strong> - Anxiety blocks memory; take deep breaths before starting</li>
                      <li><strong>Use both senses</strong> - Pay attention to both visual location and musical tone</li>
                      <li><strong>Take breaks</strong> - Practice in 10-15 minute sessions with rest between</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With consistent practice over 4-6 weeks, most people improve sequence memory by 3-5 levels (40-60%). Musicians and memory athletes can reach levels 20-30+. The key is using memory techniques (chunking, mnemonics) rather than just rote repetition.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my sequence memory poor? Common causes and how to fix them"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If you're struggling to remember sequences beyond 3-4 levels, there might be specific reasons. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for poor sequence memory:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sleep deprivation</strong> - #1 cause of poor memory; even one night of bad sleep hurts recall</li>
                      <li><strong>High stress and anxiety</strong> - Cortisol blocks memory formation and retrieval</li>
                      <li><strong>Distractions and multitasking</strong> - Divided attention prevents memory consolidation</li>
                      <li><strong>Lack of practice</strong> - Without training, working memory remains underdeveloped</li>
                      <li><strong>Fatigue and burnout</strong> - Mental exhaustion reduces working memory capacity</li>
                      <li><strong>Poor nutrition</strong> - Diet lacking in brain-essential nutrients (omega-3s, B-vitamins)</li>
                      <li><strong>Depression or ADHD</strong> - Can significantly impact working memory and focus</li>
                      <li><strong>Medications</strong> - Some medications (antihistamines, benzodiazepines) impair memory</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to improve poor sequence memory:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Prioritize sleep</strong> - Get 7-9 hours quality sleep; it's critical for memory consolidation</li>
                      <li><strong>Reduce stress</strong> - Meditation, deep breathing, and relaxation improve memory function</li>
                      <li><strong>Practice daily</strong> - Use this test 10-15 minutes daily to build memory capacity</li>
                      <li><strong>Learn memory techniques</strong> - Chunking, mnemonics, and visualization methods</li>
                      <li><strong>Exercise regularly</strong> - Aerobic exercise increases hippocampus size and memory</li>
                      <li><strong>Take supplements</strong> - Omega-3, B-complex, and magnesium support brain health</li>
                      <li><strong>Stay mentally active</strong> - Learn new skills, puzzles, reading, and brain games</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Quick fixes for immediate improvement:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Get 8 hours sleep tonight</strong> - Test again tomorrow morning</li>
                      <li><strong>Do 10 minutes of meditation</strong> - Reduces stress and improves focus</li>
                      <li><strong>Exercise before testing</strong> - 20 minutes of cardio boosts brain function</li>
                      <li><strong>Eliminate distractions</strong> - Test in a quiet room with no interruptions</li>
                      <li><strong>Use memory techniques</strong> - Try chunking or verbalizing the sequence</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Medical Note:</strong> If you consistently score below level 3 despite good sleep and practice, consider consulting a healthcare provider. Persistent working memory problems can indicate ADHD, depression, sleep disorders, or other conditions that are treatable.</p>
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
