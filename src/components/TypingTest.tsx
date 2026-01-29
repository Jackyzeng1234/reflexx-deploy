'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';

type TestState = 'idle' | 'typing' | 'finished';

const sampleTexts = [
  // 技术开发类 (2-3行)
  "JavaScript is the programming language of the web. It allows developers to create interactive and dynamic websites that respond to user actions. Modern web applications rely heavily on JavaScript for seamless user experiences.",
  "Python has become one of the most popular programming languages in recent years. Its simplicity and readability make it perfect for beginners. From data science to machine learning, Python is used everywhere.",
  "React is a powerful JavaScript library for building user interfaces. Developed by Facebook, it allows developers to create reusable components. This approach makes large applications easier to maintain and scale.",
  "Databases are essential for storing and organizing information efficiently. They allow applications to quickly retrieve and update data. Understanding database design is crucial for building robust applications.",
  "Cloud computing has revolutionized how businesses operate today. Companies can now access computing resources on-demand without heavy upfront investment. This flexibility enables faster innovation and reduced costs.",

  // 编程实践类 (2-3行)
  "Version control systems like Git help developers track changes in code over time. They enable collaboration among team members working on the same project. Learning Git is essential for modern software development workflows.",
  "Debugging is an integral part of the programming process. It involves identifying and fixing errors that prevent code from working correctly. Good debugging skills can save hours of frustration during development.",
  "Clean code is easy to read, understand, and maintain. Writing clean code requires practice and attention to detail. It makes collaboration with other developers much more effective and enjoyable.",
  "Testing ensures that software works as intended and catches bugs early. Unit tests check individual components, while integration tests verify they work together. Automated testing is a hallmark of professional development.",
  "Documentation is often overlooked but is crucial for long-term project success. Good documentation helps new developers understand code quickly. It also serves as a reference for future maintenance and updates.",

  // 人工智能类 (2-3行)
  "Artificial intelligence is transforming the way we live and work. Machine learning algorithms can now recognize patterns in vast amounts of data. From virtual assistants to self-driving cars, AI is everywhere.",
  "Deep learning has enabled breakthroughs in image and speech recognition. Neural networks mimic the human brain to learn from examples. These advances are powering everything from medical diagnosis to language translation.",
  "Natural language processing allows computers to understand human language. Chatbots and virtual assistants use NLP to communicate with users. The technology continues to improve with more sophisticated models.",
  "Computer vision enables machines to interpret and understand visual information. Applications range from facial recognition to autonomous vehicles. Recent advances have achieved human-level performance on many tasks.",
  "Robotics combines AI, engineering, and physical computing principles. Modern robots can perform complex tasks in unpredictable environments. They are revolutionizing manufacturing, healthcare, and exploration.",

  // 健康生活类 (2-3行)
  "Daily exercise is essential for maintaining both physical and mental health. Regular physical activity can reduce the risk of chronic diseases significantly. Even thirty minutes of moderate exercise daily can make a big difference.",
  "Sleep plays a crucial role in overall health and productivity. Quality sleep allows the body to repair itself and the brain to consolidate memories. Poor sleep habits are linked to numerous health problems and decreased performance.",
  "Mindfulness meditation has gained popularity as a stress reduction technique. Regular practice can improve focus and emotional regulation significantly. Many people report feeling calmer and more centered after just a few weeks.",
  "Nutrition affects every aspect of our physical and mental performance. A balanced diet provides essential nutrients for optimal body function. Making informed food choices is one of the best investments in long-term health.",
  "Hydration is often overlooked but is vital for proper bodily functions. Water helps regulate temperature, transport nutrients, and remove waste. Drinking enough water throughout the day improves energy and cognitive function.",

  // 学习成长类 (2-3行)
  "Continuous learning is essential in today's rapidly changing world. New technologies and discoveries are constantly emerging. Those who embrace lifelong learning stay relevant and adaptable throughout their careers.",
  "Reading regularly is one of the best habits for personal growth. Books expose us to new ideas and perspectives we might never encounter otherwise. Making time for reading can expand knowledge and stimulate creativity.",
  "Goal setting provides direction and motivation in life. Clear, specific goals help focus efforts and measure progress effectively. Breaking big goals into smaller steps makes them more achievable and less overwhelming.",
  "Time management skills are crucial for productivity and work-life balance. Effective time management reduces stress and increases efficiency. Learning to prioritize tasks helps achieve more in less time.",
  "Failure is often a better teacher than success. Each setback provides valuable lessons that can guide future improvements. Embracing failure as part of the learning process leads to greater resilience and growth.",

  // 自然科学类 (2-3行)
  "Climate change is one of the most pressing challenges of our time. Rising global temperatures are causing extreme weather events worldwide. Understanding and addressing this issue requires international cooperation and immediate action.",
  "Photosynthesis is the process by which plants convert sunlight into energy. This fundamental process produces oxygen and forms the base of most food chains. Life on Earth depends entirely on this remarkable biochemical reaction.",
  "The solar system consists of the sun and all celestial bodies bound by its gravity. Eight planets orbit the sun at different distances and speeds. Each planet has unique characteristics that scientists continue to study and explore.",
  "DNA carries the genetic instructions for all living organisms. This remarkable molecule determines traits and passes information between generations. Understanding DNA has revolutionized medicine and our knowledge of life itself.",
  "Ecosystems maintain balance through complex interdependencies among species. Each organism plays a specific role in maintaining ecosystem health. Disruptions to these delicate systems can have widespread and unpredictable consequences.",

  // 历史文化类 (2-3行)
  "The Renaissance was a period of cultural and intellectual rebirth in Europe. Art, science, and literature flourished during this transformative era. This period laid the groundwork for many modern developments in various fields.",
  "Ancient civilizations developed remarkable innovations that still influence us today. From writing systems to architectural marvels, their achievements endure. Studying these cultures helps us appreciate human ingenuity across different ages.",
  "Music has been an essential part of human culture for thousands of years. Different cultures developed unique musical traditions and instruments. Music transcends language barriers and connects people through emotional expression.",
  "Architecture reflects the values, technology, and aesthetics of different civilizations. From ancient pyramids to modern skyscrapers, buildings tell stories about their creators. Architectural heritage provides insight into how people lived throughout history.",
  "Literature preserves human stories, wisdom, and imagination across generations. Great works of literature speak to universal human experiences. Reading literature from different periods expands our understanding of the human condition.",

  // 商业创新类 (2-3行)
  "Entrepreneurship drives innovation and economic growth around the world. Successful entrepreneurs identify unmet needs and create valuable solutions. The entrepreneurial mindset involves embracing risk and learning from failures.",
  "Marketing has evolved dramatically with the rise of digital media. Businesses now reach customers through multiple channels and platforms. Effective marketing requires understanding consumer behavior and adapting to new technologies.",
  "Supply chains have become increasingly global and interconnected. Raw materials might travel across multiple countries before becoming final products. This complexity creates both opportunities and vulnerabilities for modern businesses.",
  "Customer experience has become a key differentiator in competitive markets. Companies that prioritize customer satisfaction build loyalty and advocacy. Positive experiences lead to repeat business and valuable word-of-mouth marketing.",
  "Remote work has transformed how many companies operate and collaborate. Technology enables seamless communication regardless of physical location. This shift has implications for productivity, work-life balance, and organizational culture.",

  // 心理思维类 (2-3行)
  "Critical thinking enables us to analyze information objectively and make informed decisions. It involves questioning assumptions and evaluating evidence carefully. In an age of information overload, critical thinking is more important than ever.",
  "Emotional intelligence is crucial for effective interpersonal relationships. People with high EQ can recognize and manage their own emotions effectively. They also excel at understanding and influencing the emotions of others.",
  "Growth mindset is the belief that abilities can be developed through dedication and hard work. This perspective encourages learning and persistence in the face of challenges. People with a growth mindset achieve more than those with fixed mindsets.",
  "Creativity is not just for artists and musicians – it is a valuable skill in every field. Creative thinking leads to innovative solutions and competitive advantages. Everyone can enhance their creativity through practice and deliberate effort.",
  "Decision-making is a constant part of daily life and professional success. Understanding cognitive biases helps us make better choices. Good decision-making requires both analytical thinking and emotional intelligence.",

  // 科技未来类 (2-4行，稍长)
  "The internet has revolutionized how we communicate, work, and access information. It connects billions of people worldwide and enables instant sharing of knowledge. This global network has transformed industries and created entirely new ways of doing business. However, it also presents challenges like privacy concerns and digital divides.",
  "Blockchain technology promises to transform how we store and verify information. It creates secure, transparent records without central authorities. Applications range from cryptocurrency to supply chain tracking. While still evolving, blockchain could revolutionize many industries in the coming decades. Understanding its potential is important for future business leaders.",
  "Quantum computing harnesses quantum mechanical phenomena to process information in new ways. These computers could solve problems impossible for classical computers. Applications include drug discovery, optimization, and cryptography. While practical quantum computers are still developing, progress has been rapid. The field represents the next frontier in computational power.",
  "Virtual and augmented reality are changing how we experience digital content. VR creates fully immersive environments, while AR enhances the real world with digital overlays. These technologies are transforming entertainment, education, and training. As hardware improves, VR and AR will become increasingly integrated into daily life. Their potential applications are limited only by imagination.",
  "5G networks are enabling faster and more reliable wireless communication. This technology supports the growing Internet of Things and smart devices. Faster speeds and lower latency enable new applications in telemedicine and autonomous vehicles. As 5G infrastructure expands, it will unlock possibilities we can barely imagine today. The connectivity revolution continues to accelerate.",
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
  const [elapsedTime, setElapsedTime] = useState(0); // 已用时间（秒）
  const [isStarted, setIsStarted] = useState(false); // 是否已经开始
  const [overlayVisible, setOverlayVisible] = useState(true); // 控制悬浮层显示
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSavedRef = useRef(false);
  const actualStartTimeRef = useRef<number>(0); // 实际的游戏开始时间
  const isGameStartedRef = useRef(false); // 同步跟踪游戏是否已开始
  const userInputRef = useRef(''); // 同步跟踪用户输入
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 用于更新已用时间显示

  const startTest = useCallback(() => {
    // Select a new random text that's different from the current one
    let newText;
    do {
      newText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    } while (newText === currentText && sampleTexts.length > 1);

    setCurrentText(newText);
    setUserInput('');
    userInputRef.current = ''; // 重置 ref
    setStartTime(0);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setElapsedTime(0); // 重置已用时间
    setIsStarted(false);
    setOverlayVisible(true); // 显示悬浮层
    setTestState('idle');
    hasSavedRef.current = false;
    actualStartTimeRef.current = 0; // 重置 ref
    isGameStartedRef.current = false; // 重置游戏开始标志

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [currentText]);

  const startGame = useCallback(() => {
    if (isGameStartedRef.current) return; // 使用 ref 检查
    const now = performance.now();
    setIsStarted(true);
    setOverlayVisible(false); // 隐藏悬浮层
    isGameStartedRef.current = true; // 同步设置 ref
    setStartTime(now);
    actualStartTimeRef.current = now; // 设置 ref
    setTestState('typing');

    // Start timer to update elapsed time display
    timerRef.current = setInterval(() => {
      if (actualStartTimeRef.current > 0) {
        const elapsed = (performance.now() - actualStartTimeRef.current) / 1000;
        setElapsedTime(Math.round(elapsed));
      }
    }, 100);
  }, []);

  const handleFinish = useCallback(() => {
    if (testState === 'finished' || hasSavedRef.current) return;

    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Calculate final time and WPM
    const timeElapsedMinutes = elapsedTime / 60; // 转换为分钟
    const wordsTyped = userInputRef.current.length / 5;
    const finalWpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
    setWpm(finalWpm);
    setTestState('finished');
    hasSavedRef.current = true;

    // Submit score
    const netWpm = Math.round(finalWpm * (accuracy / 100));
    submitScore({
      test_type: 'typing',
      score: netWpm,
      details: {
        wpm: finalWpm,
        accuracy: accuracy,
      },
    }).then((submittedToDb) => {
      if (!submittedToDb) {
        const savedResults = JSON.parse(localStorage.getItem('typing-results') || '[]');
        savedResults.push({
          wpm: finalWpm,
          accuracy: accuracy,
          timestamp: Date.now(),
        });
        localStorage.setItem('typing-results', JSON.stringify(savedResults.slice(-100)));
      }
    }).catch(console.error);
  }, [testState, accuracy, elapsedTime]);

  // Auto-start test on mount
  useEffect(() => {
    if (currentText === '') {
      startTest();
    }
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    userInputRef.current = input; // 同步更新 ref

    // Start game on first input if not started
    if (!isGameStartedRef.current && input.length > 0) {
      startGame();
    }

    // Don't process input if game hasn't started
    if (!isGameStartedRef.current) {
      setUserInput('');
      userInputRef.current = ''; // 清空 ref
      return;
    }

    if (testState === 'idle') {
      setTestState('typing');
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

    // Live WPM calculation - use ref to avoid async state update issue
    if (actualStartTimeRef.current > 0) {
      const timeElapsed = (performance.now() - actualStartTimeRef.current) / 1000 / 60; // in minutes
      const wordsTyped = input.length / 5;
      const liveWpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      setWpm(liveWpm);
    }

    // Check if user has completed the text
    if (input.length === currentText.length) {
      handleFinish();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Remove this handler since we auto-start the test on mount
    // Users can directly start typing without triggering a new text selection
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
          {char}
        </span>
      );
    });
  };

  const calculateLiveWpm = () => {
    if (actualStartTimeRef.current === 0 || userInputRef.current.length === 0) return 0;
    const timeElapsed = (performance.now() - actualStartTimeRef.current) / 1000 / 60;
    const wordsTyped = userInputRef.current.length / 5;
    return Math.round(wordsTyped / timeElapsed);
  };

  return (
    <div className="flex min-h-[600px] items-center justify-center py-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Main Test Area - Always visible */}
        <div className="rounded-3xl border-2 border-gray-200/60 bg-white/80 backdrop-blur-xl p-8 shadow-2xl dark:border-gray-700/60 dark:bg-gray-800/80">
          {/* Stats Bar */}
          <div className="mb-6 gap-2 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-4 shadow-lg dark:from-gray-700/50 dark:to-gray-700/50 sm:flex sm:gap-4">
            <div className="flex-1 text-center">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">{t.typingSpeed}</div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 sm:text-3xl">
                {testState === 'finished' ? wpm : calculateLiveWpm()} <span className="text-sm sm:text-lg">WPM</span>
              </div>
            </div>
            <div className="flex-1 text-center border-l border-r border-gray-200 dark:border-gray-600">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">{t.typingElapsedTime}</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 sm:text-3xl">
                {testState === 'finished' ? `${elapsedTime}s` : `${elapsedTime}s`}
              </div>
            </div>
            <div className="flex-1 text-center border-l border-r border-gray-200 dark:border-gray-600">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">{t.typingAccuracy}</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 sm:text-3xl">
                {accuracy.toFixed(1)}<span className="text-sm sm:text-lg">%</span>
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">{t.typingErrors}</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 sm:text-3xl">
                {errors}
              </div>
            </div>
          </div>

          {/* Text Display */}
          <div className="mb-6 overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 font-mono text-lg leading-relaxed shadow-inner dark:border-gray-700 dark:from-gray-900 dark:to-blue-900/20">
            <div className="select-none whitespace-pre-wrap break-words">
              {currentText ? renderText() : t.loading}
            </div>
          </div>

          {/* Input Area - Modern Style */}
          {testState !== 'finished' && (
            <div className="relative">
              {/* Click to Start Overlay */}
              {overlayVisible && (
                <div
                  className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-2xl bg-black/5 backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-black/10 dark:bg-black/40"
                  onClick={startGame}
                >
                  <div className="text-center">
                    <div className="mb-4 text-6xl">⌨️</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t.typingClickToStart}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {t.typingOrStartTyping}
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 opacity-30 blur-sm transition-opacity focus-within:opacity-75"></div>
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="relative w-full rounded-2xl border-2 border-gray-200 bg-white/90 p-5 font-mono text-lg shadow-xl backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-900/90 dark:focus:ring-primary-400/20"
                rows={6}
                placeholder={isStarted ? t.typingTypeHere : t.typingClickToStartTyping}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          )}

          {/* Finished State */}
          {testState === 'finished' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-purple-50 p-6 text-center shadow-lg dark:from-primary-900/30 dark:to-purple-900/30">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  {t.typingTestComplete}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white/50 p-4 shadow-sm dark:bg-gray-800/50">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingTestTypingSpeed}</div>
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {wpm} <span className="text-lg">WPM</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/50 p-4 shadow-sm dark:bg-gray-800/50">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t.typingAccuracy}</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {accuracy.toFixed(1)}<span className="text-lg">%</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/50 p-4 shadow-sm dark:bg-gray-800/50">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t.netWPM}</div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {(wpm * (accuracy / 100)).toFixed(0)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 inline-block rounded-xl bg-white/50 px-6 py-3 shadow-sm dark:bg-gray-800/50">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t.srtRank}: {getRating(wpm, accuracy)}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={startTest}
                  className="rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:from-primary-700 hover:to-purple-700 hover:shadow-2xl hover:-translate-y-0.5"
                >
                  {t.srtTryAgain}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions, Benefits & Improvements - Three Columns */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* How to Play */}
          <div className="rounded-2xl border-2 border-gray-200/50 bg-white/60 backdrop-blur-md p-5 dark:border-gray-700/50 dark:bg-gray-800/60">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white text-center">📖 {t.howToPlay}</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
              <li>• {t.typingTestInstruction1}</li>
              <li>• {t.typingTestInstruction2}</li>
              <li>• {t.typingTestInstruction3}</li>
              <li>• {t.typingTestAverage} {t.typingSpeed}约为 40 WPM</li>
            </ol>
          </div>

          {/* What This Measures */}
          <div className="rounded-2xl border-2 border-blue-200/50 bg-blue-50/60 backdrop-blur-md p-5 dark:border-blue-800/50 dark:bg-blue-900/20">
            <h3 className="mb-3 text-lg font-bold text-blue-900 dark:text-blue-300 text-center">🧠 {t.testBenefitsTitle}</h3>
            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200 text-left" dangerouslySetInnerHTML={{ __html: t.typingBenefits }} />
          </div>

          {/* How To Improve */}
          <div className="rounded-2xl border-2 border-green-200/50 bg-green-50/60 backdrop-blur-md p-5 dark:border-green-800/50 dark:bg-green-900/20">
            <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-300 text-center">📈 {t.testHowToImproveTitle}</h3>
            <div className="text-sm leading-relaxed text-green-800 dark:text-green-200 text-left" dangerouslySetInnerHTML={{ __html: t.typingImprovements }} />
          </div>
        </div>
      </div>
    </div>
  );
}
