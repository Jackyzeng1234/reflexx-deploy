'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { ratingBucket, ratingColor, ratingLabelKey } from '@/lib/ratings';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { Puzzle, BarChart3 } from 'lucide-react';

type GameState = 'idle' | 'memorize' | 'recall' | 'finished';

interface NumberTile {
  value: number;
  isClicked: boolean;
  x: number;
  y: number;
}

const HISTORY_KEY = 'chimp-results';

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

export default function ChimpTest() {
  const { t } = useI18n();
  const { setTimeout } = useTimeout();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [tiles, setTiles] = useState<NumberTile[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const hasSavedRef = useRef(false);
  const [history, setHistory] = useState<number[]>([]);

  const generateTiles = useCallback((count: number) => {
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
  }, []);

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
  }, [generateTiles, setTimeout]);

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

  const handleTileClick = useCallback((clickedTile: NumberTile) => {
    if (gameState !== 'recall') return;

    if (clickedTile.value !== nextNumber) {
      setGameState('finished');

      // 防止重复保存
      if (hasSavedRef.current) {
        return;
      }
      hasSavedRef.current = true;

      // 始终写入本机历史(进度曲线),登录用户也保留
      try {
        const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        raw.push({ level: currentLevel, numbers: tiles.length - 1, timestamp: Date.now() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
        setHistory(readLocalHistory());
      } catch (e) {
        console.error(e);
      }

      submitScore({
        test_type: 'chimp',
        score: tiles.length - 1,
        details: {
          level: currentLevel,
        },
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
  }, [gameState, nextNumber, tiles.length, currentLevel, generateTiles, setTimeout]);

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
  }, []);

  const getRating = (level: number) => t[ratingLabelKey(ratingBucket('chimp', level))];

  const getVerdictColor = (level: number) => ratingColor(ratingBucket('chimp', level));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="display-title">{t.chimpTestTitle}</h1>
        </div>
        {/* 游戏区 —— display 变体:左结果 + 右数字板 */}
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
                ? `${t.chimpTestNumbers} ${tiles.length - 1}`
                : gameState !== 'idle'
                ? `Level ${currentLevel}`
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
            <div className="mb-4 flex w-full items-center justify-between">
              <div className="text-lg font-bold text-text">Level {currentLevel}</div>
              <div className="text-sm text-text-secondary">
                {gameState === 'memorize' && t.chimpTestMemorize}
                {gameState === 'recall' && `${t.chimpTestClickNumber} ${nextNumber}`}
              </div>
              <div className="text-sm text-text-secondary">
                {tiles.length} {t.chimpTestNumbers}
              </div>
            </div>

            <div className="relative h-80 w-full rounded-xl border-2 border-dashed border-white/20">
              {tiles.map((tile) => (
                <button
                  key={tile.value}
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.isClicked || gameState !== 'recall'}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 font-bold transition-all ${
                    tile.isClicked
                      ? 'border-emerald-400 bg-emerald-500 text-white opacity-50'
                      : gameState === 'recall'
                      ? 'border-cyan-400/60 bg-surface-hover text-gray-100 hover:scale-110 active:scale-95'
                      : 'border-cyan-400 bg-cyan-500 text-gray-900'
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

            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="btn btn-primary" onClick={startGame}>
                  {t.clickToStart}
                </button>
              </div>
            )}
            {gameState === 'finished' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="game-label text-text-tertiary">{t.chimpTestGameOver}</span>
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
              dangerouslySetInnerHTML={{ __html: t.chimpBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.chimpImprovements.split('<br>').map((item) => (
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
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Chimp Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the chimp test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>The Chimp Test (inspired by the famous Japanese monkey memory study) measures your working memory capacity and spatial memory. It tests how many numbers you can remember in their correct positions after they disappear.</p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-300">
                    <li><strong>Memorize the numbers</strong> - Numbers appear randomly on screen. You have 2 seconds to memorize their positions.</li>
                    <li><strong>Numbers are hidden</strong> - After 2 seconds, the numbers disappear and become blank squares.</li>
                    <li><strong>Click in ascending order</strong> - Click the squares in numerical order (1, 2, 3, 4...).</li>
                    <li><strong>Progressive difficulty</strong> - Each successful level adds one more number to remember.</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Use spatial grouping! Instead of memorizing individual numbers, group them by location (e.g., "top row: 1-3, bottom row: 4-6"). This leverages your brain's natural ability to remember spatial patterns. The average human can remember 5-9 items (working memory span).</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good chimp test score? Average levels by age"
              icon="🎯"
              answer={
                <div className="space-y-4">
                  <p>The original Japanese study found young chimpanzees outperformed humans in this task! Average humans can remember 5-9 numbers in sequence. Your score depends on working memory capacity, age, and practice.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average chimp test levels by age:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li><strong>18–25 years:</strong> 7–9 levels</li>
                      <li><strong>26–35 years:</strong> 6–9 levels</li>
                      <li><strong>36–45 years:</strong> 6–8 levels</li>
                      <li><strong>46–60 years:</strong> 5–7 levels</li>
                      <li><strong>60+ years:</strong> 4–6 levels</li>
                    </ul>
                  </div>

                  <h4 className="font-semibold text-gray-100 mb-2">How we rate your result — the same 5 tiers the test uses:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Exceptional — level 12+</p>
                      <p className="text-sm text-gray-300">Roughly the top 2%. Superior visuospatial working memory.</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above average — level 9–12</p>
                      <p className="text-sm text-gray-300">Stronger than most; good spatial working memory capacity.</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Average — level 6–9</p>
                      <p className="text-sm text-gray-300">The typical range for healthy adults; most people land here.</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Below average — level 4–6</p>
                      <p className="text-sm text-gray-300">Below the norm. Worth retesting when rested and free of distractions.</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Needs attention — under level 4</p>
                      <p className="text-sm text-gray-300">Well below the norm. If it stays this low, check sleep, stress, or focus.</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Fun fact: Young chimpanzees in the Japanese study averaged ~9 numbers, outperforming adult humans (~6 numbers). However, memory athletes using techniques can achieve 15-20+ numbers. Working memory is highly trainable!</p>
                </div>
              }
            />
            <FAQItem
              question="What does the chimp test measure? Cognitive abilities assessed"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The Chimp Test measures your <strong>visuospatial working memory</strong> - the ability to temporarily store and manipulate visual and spatial information. It evaluates the brain's working memory capacity, similar to a computer's RAM.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Visuospatial working memory</strong> - Ability to remember object locations and spatial relationships</li>
                      <li><strong>Working memory capacity</strong> - How many items you can hold in conscious awareness (Miller's Law: 7±2)</li>
                      <li><strong>Short-term memory span</strong> - Duration information can be held without rehearsal</li>
                      <li><strong>Spatial attention</strong> - Ability to distribute attention across multiple locations</li>
                      <li><strong>Sequential processing</strong> - Ordering information in a specific sequence</li>
                      <li><strong>Perceptual speed</strong> - How quickly you can encode visual information</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Age</strong> - Working memory peaks at ~25 years, declines ~5% per decade after</li>
                      <li><strong>Sleep quality</strong> - Poor sleep severely impacts working memory capacity</li>
                      <li><strong>Stress and anxiety</strong> - Cortisol reduces prefrontal cortex function (working memory center)</li>
                      <li><strong>Practice and training</strong> - Can improve working memory by 20-50%</li>
                      <li><strong>Genetics</strong> - Some people naturally have higher working memory capacity</li>
                      <li><strong>Physical fitness</strong> - Exercise increases blood flow to memory-related brain regions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Why working memory matters:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li>Predicts academic performance (math, reading comprehension, problem-solving)</li>
                      <li>Important for everyday tasks (mental math, following instructions, planning)</li>
                      <li>Indicator of cognitive health and brain function</li>
                      <li>Declines in aging, dementia, ADHD, depression, and other conditions</li>
                      <li>Can be improved through cognitive training and lifestyle changes</li>
                    </ul>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve chimp test score? Memory training strategies"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Working memory can be significantly improved through targeted training, memory techniques, and lifestyle changes. Here are proven strategies:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🧠 Memory Techniques and Strategies</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Chunking method</strong> - Group numbers into smaller chunks (e.g., quadrants: top-left, top-right, bottom-left, bottom-right)</li>
                      <li><strong>Spatial patterns</strong> - Notice geometric patterns or shapes the numbers form</li>
                      <li><strong>Verbal rehearsal</strong> - Repeat number locations to yourself ("1 top-left, 2 center, 3 bottom-right...")</li>
                      <li><strong>Practice daily</strong> - 10-15 minutes daily for 2-3 weeks can improve score by 2-4 numbers</li>
                      <li><strong>Use memory palace</strong> - Associate number positions with familiar locations</li>
                      <li><strong>Create a story</strong> - Connect the numbers in a logical narrative</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">💪 Physical and Lifestyle Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Aerobic exercise</strong> - Cardio 3-5x weekly increases prefrontal cortex activity by 20-30%</li>
                      <li><strong>Get quality sleep</strong> - 7-9 hours; working memory consolidation happens during sleep</li>
                      <li><strong>Meditation</strong> - Mindfulness improves working memory capacity and attention</li>
                      <li><strong>Brain-healthy diet</strong> - Omega-3s, antioxidants, and B-vitamins support memory</li>
                      <li><strong>Stay hydrated</strong> - Dehydration impairs cognitive performance by 10-15%</li>
                      <li><strong>Reduce alcohol</strong> - Alcohol consumption reduces working memory capacity for 24+ hours</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Practice Tips for Better Scores</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Test when alert</strong> - Morning or early afternoon when focus is highest</li>
                      <li><strong>Minimize distractions</strong> - Quiet room, silence phone, close other browser tabs</li>
                      <li><strong>Stay relaxed</strong> - Stress blocks working memory; take deep breaths before starting</li>
                      <li><strong>Warm up your brain</strong> - Do some mental math or puzzles before testing</li>
                      <li><strong>Practice in short sessions</strong> - 10-15 minutes with breaks between attempts</li>
                      <li><strong>Use both eyes</strong> - Take in the whole board at once, don't focus on one number at a time</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎮 Cognitive Training Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Dual N-Back training</strong> - Proven to increase working memory by 30-40%</li>
                      <li><strong>Brain training apps</strong> - Lumosity, Peak, Elevate offer working memory exercises</li>
                      <li><strong>Chess and strategy games</strong> - Improve spatial thinking and planning</li>
                      <li><strong>Puzzle games</strong> - Sudoku, crosswords, and logic puzzles train working memory</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With consistent practice over 4-6 weeks, most people improve by 2-4 numbers (30-50% increase). Memory athletes can reach 15-20+ numbers using advanced techniques. The key is practicing working memory tasks regularly, not just this test.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my chimp test score low? Common causes and solutions"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If you're scoring below 4 numbers, there might be specific reasons. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for low chimp test scores:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sleep deprivation</strong> - #1 cause; poor sleep reduces working memory by 30-50%</li>
                      <li><strong>High stress and anxiety</strong> - Cortisol impairs prefrontal cortex function</li>
                      <li><strong>Distractions and multitasking</strong> - Divided attention prevents memory encoding</li>
                      <li><strong>Lack of practice</strong> - Working memory remains underdeveloped without training</li>
                      <li><strong>Mental fatigue</strong> - Being tired reduces cognitive resources for memory</li>
                      <li><strong>Age-related decline</strong> - Natural decrease in working memory after age 25</li>
                      <li><strong>Depression or ADHD</strong> - Can significantly impact working memory capacity</li>
                      <li><strong>Poor testing conditions</strong> - Bad lighting, uncomfortable position, noise</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to improve low scores:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Prioritize sleep</strong> - Get 7-9 hours quality sleep; test after good rest</li>
                      <li><strong>Reduce stress</strong> - Meditation, deep breathing, and relaxation techniques</li>
                      <li><strong>Practice working memory tasks</strong> - Use this test and similar exercises daily</li>
                      <li><strong>Learn memory techniques</strong> - Chunking, spatial grouping, verbal rehearsal</li>
                      <li><strong>Exercise regularly</strong> - Aerobic exercise boosts working memory significantly</li>
                      <li><strong>Take brain supplements</strong> - Omega-3, B-vitamins, and magnesium support cognition</li>
                      <li><strong>Stay mentally active</strong> - Learning new skills improves working memory capacity</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Quick improvements to try today:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sleep well tonight</strong> - Get 8+ hours and retest tomorrow morning</li>
                      <li><strong>Try chunking</strong> - Group numbers into 2-3 smaller, manageable chunks</li>
                      <li><strong>Use verbal rehearsal</strong> - Say the locations out loud while memorizing</li>
                      <li><strong>Exercise before testing</strong> - 20 minutes of cardio boosts brain function</li>
                      <li><strong>Eliminate all distractions</strong> - Test in a completely quiet environment</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Medical Note:</strong> If you consistently score below 3 despite good sleep and practice, consider consulting a healthcare provider. Persistent working memory deficits can indicate ADHD, depression, anxiety disorders, sleep apnea, or other treatable conditions.</p>
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
