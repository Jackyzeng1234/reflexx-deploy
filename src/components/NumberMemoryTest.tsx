'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';

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
        {/* Main Game Area */}
        <div className="rounded-3xl border-2 border-white/40 bg-white/70 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden">
          {gameState === 'finished' ? (
            /* Finished State - Display in game area */
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-6xl">📊</div>
                <h3 className="mb-6 text-2xl font-bold text-black">
                  {t.numberMemoryWrong}
                </h3>

                <div className="mb-8 grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="mb-2 text-sm text-gray-600">
                      {t.numberMemoryCorrectAnswer}
                    </div>
                    <div className="text-3xl font-bold text-green-600 tracking-widest">
                      {currentNumber}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-sm text-gray-600">
                      {t.numberMemoryYourAnswer}
                    </div>
                    <div className="text-3xl font-bold text-red-600 tracking-widest">
                      {userInput || t.numberMemoryNoAnswer}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-sm text-gray-600">
                      {t.numberMemoryReached}
                    </div>
                    <div className="text-3xl font-bold text-primary-600">
                      {currentLevel - 1}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
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
                  <div className="mb-6 text-center">
                    <div className="text-xl font-bold text-black">
                      {t.numberMemoryLevel} {currentLevel}
                    </div>
                    <div className="text-lg text-gray-600">
                      {currentNumber.length} {t.numberMemoryDigits}
                    </div>
                  </div>

                  {/* Showing Number State */}
                  {gameState === 'showing' && (
                    <>
                      {/* Number Display */}
                      <div className="mb-8 flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-white/60 bg-transparent">
                        <div className="animate-pulse">
                          <div className="text-8xl font-bold text-primary-600 tracking-widest">
                            {currentNumber}
                          </div>
                        </div>
                      </div>

                      {/* Timer Bar */}
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
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
                      <div className="mb-16">
                        <input
                          type="text"
                          value={userInput}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          maxLength={currentLevel}
                          placeholder={t.numberMemoryInputPlaceholder}
                          className="w-full rounded-xl border-2 border-dashed border-white/60 bg-transparent p-6 text-center text-6xl font-bold tracking-widest text-black focus:border-white/80 focus:outline-none"
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
                      <div className="mt-4 text-center text-sm text-gray-600">
                        {t.numberMemoryHint}
                      </div>
                    </>
                  )}
                </div>

                {/* Idle State - Click to Start Overlay */}
                {gameState === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">🔢</div>
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
          <h2 className="mb-8 text-3xl font-bold text-white text-center">Frequently Asked Questions About Number Memory Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the number memory test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>The number memory test measures your digit span - how many digits you can remember and recall after a brief presentation. It's a classic measure of short-term memory capacity.</p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-300">
                    <li><strong>Memorize the number</strong> - A multi-digit number appears on screen for 3 seconds (starting with 3 digits).</li>
                    <li><strong>Number disappears</strong> - The number vanishes and an input field appears.</li>
                    <li><strong>Enter the number</strong> - Type the exact number you saw, digit by digit.</li>
                    <li><strong>Progressive difficulty</strong> - Correct answers advance to longer numbers; one mistake ends the test.</li>
                  </ol>
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300"><strong>💡 Pro Tip:</strong> Use chunking! Group digits into smaller chunks (e.g., phone number format: 123-456-7890). The average person can remember 5-9 digits. Display time decreases as levels increase, making it progressively harder.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good number memory score? Average digit span by age"
              icon="🎯"
              answer={
                <div className="space-y-4">
                  <p>The average digit span for adults is 5-9 numbers. Your score represents the longest number of digits you successfully remembered. Memory athletes can achieve 50-100+ digits using advanced techniques.</p>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Average number memory levels by age:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🎮 <strong>18-24 years:</strong> ~7-9 digits (gamers: 10-12, memory athletes: 20-50+)</li>
                      <li>👨 <strong>25-35 years:</strong> ~6-8 digits (with practice: 9-12)</li>
                      <li>👴 <strong>36-45 years:</strong> ~5-7 digits (with practice: 7-10)</li>
                      <li>👵 <strong>46-55 years:</strong> ~5-6 digits (with practice: 6-9)</li>
                      <li>👴 <strong>56+ years:</strong> ~4-6 digits (with practice: 5-8)</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Exceptional (Top 5%)</p>
                      <p className="text-sm text-gray-300">12+ digits - Superior digit span; often uses memory techniques or has exceptional natural ability</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 font-semibold mb-1">⭐ Excellent (Top 20%)</p>
                      <p className="text-sm text-gray-300">9-11 digits - Above average short-term memory capacity</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 font-semibold mb-1">✅ Good (Normal Range)</p>
                      <p className="text-sm text-gray-300">6-8 digits - Healthy short-term memory; typical for well-rested, focused adults</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 font-semibold mb-1">⚠️ Average</p>
                      <p className="text-sm text-gray-300">4-5 digits - Within normal range; may improve with practice and better sleep</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Below Average</p>
                      <p className="text-sm text-gray-300">1-3 digits - Could indicate fatigue, distraction, or need for memory training</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: Digit span is highly trainable with proper techniques. Memory athletes use chunking, visualization, and memory palace methods to achieve extraordinary scores. Regular practice can improve your digit span by 2-4 digits.</p>
                </div>
              }
            />
            <FAQItem
              question="What does the number memory test measure? Cognitive abilities assessed"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The number memory test measures your <strong>digit span</strong> - the capacity of your short-term or working memory for numerical information. It's one of the most widely used cognitive tests in psychology.</p>

                  <div>
                    <h4 className="font-semibold text-white mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Short-term memory capacity</strong> - How many digits you can hold in conscious awareness</li>
                      <li><strong>Working memory span</strong> - Ability to maintain and manipulate information temporarily</li>
                      <li><strong>Attention and focus</strong> - Sustained concentration required for encoding</li>
                      <li><strong>Visual processing</strong> - How quickly you can perceive and encode numerical information</li>
                      <li><strong>Memory retrieval speed</strong> - How fast you can access stored information</li>
                      <li><strong>Sequential memory</strong> - Remembering items in their correct order</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Factors affecting your score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Age</strong> - Working memory peaks at ~25 years, declines gradually after</li>
                      <li><strong>Sleep quality</strong> - Memory consolidation and recall depend on good sleep</li>
                      <li><strong>Stress and anxiety</strong> - Impair attention and memory encoding</li>
                      <li><strong>Practice effects</strong> - Can improve digit span by 20-50%</li>
                      <li><strong>Fatigue</strong> - Mental exhaustion reduces working memory capacity</li>
                      <li><strong>Display time</strong> - Shorter presentation times increase difficulty</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Why digit span matters:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li>Predicts academic performance (math, reading comprehension, learning ability)</li>
                      <li>Important for daily tasks (phone numbers, PINs, calculations)</li>
                      <li>Indicator of cognitive health and brain function</li>
                      <li>Used to diagnose ADHD, dementia, and other cognitive conditions</li>
                      <li>Improves with memory training and cognitive exercises</li>
                    </ul>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve number memory? Memory training techniques"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Number memory can be dramatically improved through memory techniques and practice. Here are proven strategies:</p>

                  <div>
                    <h4 className="font-semibold text-white mb-3">🧠 Memory Techniques (Proven Methods)</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Chunking strategy</strong> - Break numbers into smaller groups (e.g., 123-456-7890 instead of 1234567890)</li>
                      <li><strong>Practice daily</strong> - 10-15 minutes daily for 2-3 weeks can improve digit span by 2-4</li>
                      <li><strong>Memory palace technique</strong> - Associate digits with familiar locations</li>
                      <li><strong>Major system</strong> - Convert numbers to letters, then to memorable images</li>
                      <li><strong>Paired associates</strong> - Link digit pairs with visual images</li>
                      <li><strong>Verbal rehearsal</strong> - Repeat the number to yourself in chunks</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">💪 Physical and Lifestyle Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Get quality sleep</strong> - 7-9 hours; critical for memory consolidation</li>
                      <li><strong>Aerobic exercise</strong> - Cardio 3-5x weekly increases memory capacity by 20-30%</li>
                      <li><strong>Meditation</strong> - Improves attention and working memory span</li>
                      <li><strong>Brain-healthy diet</strong> - Omega-3s, antioxidants, B-vitamins support memory</li>
                      <li><strong>Stay hydrated</strong> - Dehydration impairs memory recall by 10-15%</li>
                      <li><strong>Reduce stress</strong> - High cortisol interferes with memory formation</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">🎯 Practice Tips for Better Scores</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Start with chunking</strong> - Group digits in 2s, 3s, or 4s (123-456-7890)</li>
                      <li><strong>Test when alert</strong> - Morning or early afternoon when memory is sharpest</li>
                      <li><strong>Minimize distractions</strong> - Quiet room, silence phone, close other tabs</li>
                      <li><strong>Use visualization</strong> - Create mental images for digit groups</li>
                      <li><strong>Practice in short sessions</strong> - 10-15 minutes with breaks between</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">📚 Advanced Memory Training</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Learn the Major System</strong> - Converts numbers to memorable letters/images</li>
                      <li><strong>Memory palace training</strong> - Ancient technique used by memory champions</li>
                      <li><strong>Dual N-Back exercises</strong> - Proven to expand working memory capacity</li>
                      <li><strong>Brain training apps</strong> - Elevate, Peak, Lumosity offer digit span training</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-300"><strong>🏆 Expected Results:</strong> With consistent practice over 4-6 weeks, most people improve digit span by 2-4 digits (30-50% increase). Memory athletes using advanced techniques can achieve 50-100+ digits. The key is learning memory systems, not just rote repetition.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my number memory poor? Common causes and how to fix them"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If you're struggling to remember more than 4 digits, there might be specific reasons. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Common reasons for poor number memory:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Sleep deprivation</strong> - #1 cause of poor memory; severely impacts recall</li>
                      <li><strong>Stress and anxiety</strong> - Impair attention and memory encoding</li>
                      <li><strong>Distractions</strong> - Divided attention prevents proper memory formation</li>
                      <li><strong>Lack of practice</strong> - Without training, memory remains underdeveloped</li>
                      <li><strong>Fatigue and burnout</strong> - Mental exhaustion reduces memory capacity</li>
                      <li><strong>Depression</strong> - Can significantly impact working memory and attention</li>
                      <li><strong>Age-related decline</strong> - Natural decrease after age 25, but can be mitigated</li>
                      <li><strong>Poor techniques</strong> - Not using chunking or other memory strategies</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">How to improve poor number memory:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Prioritize sleep</strong> - Get 7-9 hours quality sleep; test after good rest</li>
                      <li><strong>Learn chunking</strong> - Break numbers into smaller, manageable groups</li>
                      <li><strong>Practice daily</strong> - Use this test 10-15 minutes daily to build capacity</li>
                      <li><strong>Reduce stress</strong> - Meditation and relaxation improve memory function</li>
                      <li><strong>Exercise regularly</strong> - Aerobic exercise boosts memory significantly</li>
                      <li><strong>Stay mentally active</strong> - Learning new skills improves working memory</li>
                      <li><strong>Take brain supplements</strong> - Omega-3, B-vitamins support cognitive health</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Quick improvements to try today:</h4>
                    <li><strong>Get 8 hours sleep</strong> - Retest tomorrow morning after good sleep</li>
                    <li><strong>Use chunking</strong> - Group digits into 2s or 3s (12-34-56-78-90)</li>
                    <li><strong>Do 10 minutes meditation</strong> - Reduces stress and improves focus</li>
                    <li><strong>Exercise before testing</strong> - 20 minutes cardio boosts brain function</li>
                    <li><strong>Eliminate distractions</strong> - Test in a completely quiet environment</li>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-300"><strong>⚠️ Medical Note:</strong> If you consistently score below 3 digits despite good sleep and practice, consider consulting a healthcare provider. Extremely low digit span can indicate ADHD, depression, anxiety disorders, or other cognitive conditions that may be treatable.</p>
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
