'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';

type GameState = 'idle' | 'memorize' | 'recall' | 'finished';

interface NumberTile {
  value: number;
  isClicked: boolean;
  x: number;
  y: number;
}

export default function ChimpTest() {
  const { t } = useI18n();
  const { setTimeout } = useTimeout();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [tiles, setTiles] = useState<NumberTile[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const hasSavedRef = useRef(false);

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

      // Submit to Supabase and check if user is logged in
      submitScore({
        test_type: 'chimp',
        score: tiles.length - 1,
        details: {
          level: currentLevel,
        },
      }).then((submittedToDb) => {
        // Only save to localStorage if NOT logged in (submission failed)
        if (!submittedToDb) {
          const savedResults = JSON.parse(localStorage.getItem('chimp-results') || '[]');
          savedResults.push({
            level: currentLevel,
            numbers: tiles.length - 1,
            timestamp: Date.now(),
          });
          localStorage.setItem('chimp-results', JSON.stringify(savedResults.slice(-100)));
        }
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

  const getRating = (level: number) => {
    if (level >= 10) return t.ratingSuper;
    if (level >= 8) return t.ratingExcellent;
    if (level >= 6) return t.ratingGreat;
    if (level >= 4) return t.ratingGood;
    if (level >= 3) return t.ratingAverage;
    return t.ratingNeedsPractice;
  };

  return (
    <div className="flex min-h-[500px] items-center justify-center py-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Main Game Area */}
        <div className="rounded-3xl border-2 border-white/40 bg-white/70 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
          {gameState === 'finished' ? (
            /* Finished State - Display in game area */
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-6xl">📊</div>
                <h3 className="mb-6 text-2xl font-bold text-black">
                  {t.chimpTestGameOver}
                </h3>

                <div className="mb-8 grid gap-4 md:grid-cols-2">
                  <div className="text-center">
                    <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {t.chimpTestReached}
                    </div>
                    <div className="text-4xl font-bold text-primary-600">
                      Level {currentLevel}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {t.chimpTestNumbers}
                    </div>
                    <div className="text-4xl font-bold text-green-600">
                      {tiles.length - 1}
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
          ) : (
            /* Game State */
            <>
              <div
                onClick={() => {
                  if (gameState === 'idle') {
                    startGame();
                  }
                }}
              >
                {/* Game Content - Fixed height container */}
                <div className={`min-h-[500px] ${gameState === 'idle' ? 'pointer-events-none' : ''}`}>
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-xl font-bold text-black">
                      Level {currentLevel}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      {gameState === 'memorize' && t.chimpTestMemorize}
                      {gameState === 'recall' && `${t.chimpTestClickNumber} ${nextNumber}`}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      {tiles.length} {t.chimpTestNumbers}
                    </div>
                  </div>

                  {/* Game Board */}
                  <div className="relative h-96 rounded-xl border-2 border-dashed border-white/60 bg-transparent">
                    {tiles.map((tile) => (
                      <button
                        key={tile.value}
                        onClick={() => handleTileClick(tile)}
                        disabled={tile.isClicked || gameState !== 'recall'}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 font-bold transition-all ${
                          tile.isClicked
                            ? 'border-green-500 bg-green-500 text-white opacity-50'
                            : gameState === 'recall'
                            ? 'border-primary-500 bg-white text-gray-900 hover:scale-110 active:scale-95 dark:bg-gray-800 dark:text-white'
                            : 'border-primary-500 bg-primary-500 text-white'
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
                </div>

                {/* Idle State - Click to Start Overlay */}
                {gameState === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">📊</div>
                      <div className="text-2xl font-bold text-black">
                        {t.clickToStart}
                      </div>
                      <div className="mt-2 text-sm text-black">
                        {t.orPressAnyKeyToStart}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="mb-8 text-3xl font-bold text-white text-center">Frequently Asked Questions About Chimp Test</h2>
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
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300"><strong>💡 Pro Tip:</strong> Use spatial grouping! Instead of memorizing individual numbers, group them by location (e.g., "top row: 1-3, bottom row: 4-6"). This leverages your brain's natural ability to remember spatial patterns. The average human can remember 5-9 items (working memory span).</p>
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
                    <h4 className="font-semibold text-white mb-2">Average chimp test levels by age:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🎮 <strong>18-24 years:</strong> ~7-9 numbers (gamers: 10-12, memory athletes: 14-18)</li>
                      <li>👨 <strong>25-35 years:</strong> ~6-8 numbers (with practice: 9-12)</li>
                      <li>👴 <strong>36-45 years:</strong> ~5-7 numbers (with practice: 7-10)</li>
                      <li>👵 <strong>46-55 years:</strong> ~4-6 numbers (with practice: 6-9)</li>
                      <li>👴 <strong>56+ years:</strong> ~3-5 numbers (with practice: 5-7)</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Exceptional (Top 5%)</p>
                      <p className="text-sm text-gray-300">Level 12+ - Superior working memory; comparable to trained chimps and memory experts</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 font-semibold mb-1">⭐ Excellent (Top 20%)</p>
                      <p className="text-sm text-gray-300">Level 9-11 - Above average memory; excellent spatial working memory capacity</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 font-semibold mb-1">✅ Good (Normal Range)</p>
                      <p className="text-sm text-gray-300">Level 6-8 - Healthy working memory; typical for focused adults</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 font-semibold mb-1">⚠️ Average</p>
                      <p className="text-sm text-gray-300">Level 4-5 - Within normal range; may improve with memory techniques</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Below Average</p>
                      <p className="text-sm text-gray-300">Level 1-3 - Could indicate fatigue, distraction, or need for memory training</p>
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
                    <h4 className="font-semibold text-white mb-2">This test measures:</h4>
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
                    <h4 className="font-semibold text-white mb-2">Factors affecting your score:</h4>
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
                    <h4 className="font-semibold text-white mb-2">Why working memory matters:</h4>
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
                    <h4 className="font-semibold text-white mb-3">🧠 Memory Techniques and Strategies</h4>
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
                    <h4 className="font-semibold text-white mb-3">💪 Physical and Lifestyle Optimization</h4>
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
                    <h4 className="font-semibold text-white mb-3">🎯 Practice Tips for Better Scores</h4>
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
                    <h4 className="font-semibold text-white mb-3">🎮 Cognitive Training Exercises</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Dual N-Back training</strong> - Proven to increase working memory by 30-40%</li>
                      <li><strong>Brain training apps</strong> - Lumosity, Peak, Elevate offer working memory exercises</li>
                      <li><strong>Chess and strategy games</strong> - Improve spatial thinking and planning</li>
                      <li><strong>Puzzle games</strong> - Sudoku, crosswords, and logic puzzles train working memory</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-300"><strong>🏆 Expected Results:</strong> With consistent practice over 4-6 weeks, most people improve by 2-4 numbers (30-50% increase). Memory athletes can reach 15-20+ numbers using advanced techniques. The key is practicing working memory tasks regularly, not just this test.</p>
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
                    <h4 className="font-semibold text-white mb-2">Common reasons for low chimp test scores:</h4>
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
                    <h4 className="font-semibold text-white mb-2">How to improve low scores:</h4>
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
                    <h4 className="font-semibold text-white mb-2">Quick improvements to try today:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sleep well tonight</strong> - Get 8+ hours and retest tomorrow morning</li>
                      <li><strong>Try chunking</strong> - Group numbers into 2-3 smaller, manageable chunks</li>
                      <li><strong>Use verbal rehearsal</strong> - Say the locations out loud while memorizing</li>
                      <li><strong>Exercise before testing</strong> - 20 minutes of cardio boosts brain function</li>
                      <li><strong>Eliminate all distractions</strong> - Test in a completely quiet environment</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-300"><strong>⚠️ Medical Note:</strong> If you consistently score below 3 despite good sleep and practice, consider consulting a healthcare provider. Persistent working memory deficits can indicate ADHD, depression, anxiety disorders, sleep apnea, or other treatable conditions.</p>
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
