'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';

type TestState = 'idle' | 'typing' | 'finished';

const sampleTexts = [
  // === 文学作品风格 (更多变化) ===
  "The morning sun filtered through the curtains, casting long shadows across the room. She sat by the window, watching the world wake up slowly. The coffee in her mug had gone cold, but she didn't mind. Some moments were meant to be savored, not rushed through.",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. The opening lines seemed to echo in her mind as she walked through the bustling streets. Everyone was in such a hurry, rushing from one place to another, never stopping to simply be.",
  "The old house stood silent at the end of the lane, its windows like vacant eyes staring out at the world. Children dared each other to approach the front gate, but none ever did. Local legends spoke of treasures hidden within, but no one had been brave enough to find out.",
  "He had always dreamed of sailing across the ocean, leaving everything behind for the open sea. The reality was different from his fantasies—storms that lasted for days, the endless horizon, the crushing isolation. Yet somehow, it was exactly what he needed.",
  "The city never really slept. Even at three in the morning, there was movement somewhere—taxis, stray cats, night shift workers making their way home under yellow streetlights. She found comfort in this constant activity, this reminder that life continued regardless of her troubles.",

  // === 新闻报道风格 ===
  "Local authorities announced new traffic regulations downtown starting next month. The changes aim to reduce congestion during peak hours and improve pedestrian safety. Business owners have expressed mixed reactions, with some concerned about potential customer impact.",
  "Weather forecasters predict heavy rainfall throughout the region over the weekend. Residents in low-lying areas are advised to take necessary precautions. Emergency services have been placed on standby as meteorologists monitor the developing situation.",
  "The tech giant revealed its latest flagship smartphone yesterday, featuring advanced AI capabilities and improved battery life. Pre-orders open next week, with industry analysts expecting record-breaking sales despite the premium price point.",
  "Scientists at the university have made a breakthrough in renewable energy storage. Their new battery technology could revolutionize how we store solar and wind power. The team hopes to make the technology commercially viable within five years.",
  "The local team secured a dramatic victory in last night's championship game. Fans went wild as the final buzzer sounded, celebrating the win that many thought impossible. The coach praised the players' determination and teamwork in post-game interviews.",

  // === 日常对话/邮件风格 (更自然) ===
  "Hey! Just wanted to check in and see how you're doing. It's been way too long since we caught up properly. I was thinking we could grab coffee sometime this week if you're free? Let me know what works for you!",
  "Thanks for sending over those documents yesterday. I've reviewed them and have a few questions we should discuss. Can you jump on a quick call later today? Around 3pm would be perfect, but let me know if that doesn't work for your schedule.",
  "So I was at this restaurant last night, and you won't believe what happened. The waiter accidentally spills soup all over this guy's suit, and instead of getting mad, the guy starts laughing! Apparently it was an old suit he hated anyway.",
  "Sorry I missed your call earlier—I was stuck in back-to-back meetings all afternoon. Everything okay? I should be free after 7 tonight if you want to chat. Otherwise, just shoot me a text and we can figure something out.",
  "Can't make it to the meeting tomorrow, something came up with the family. Is there any chance we could reschedule for Thursday? Really sorry about the short notice—I know how important this discussion is.",

  // === 技术博客风格 (保留但更自然) ===
  "JavaScript frameworks keep evolving, and it's hard to keep up sometimes. Just when you think you've mastered React, along comes something new. But that's also what makes web development exciting—there's always something fresh to learn and explore.",
  "I've been using Python for about three years now, and honestly, it still surprises me. The other day I discovered a library that solved a problem I'd been struggling with for weeks. That's the thing about programming—there's always a better way if you look hard enough.",
  "Debugging is basically just being a detective, except the crime scene is your code and the culprit is usually something stupid you did hours ago. The trick is learning to laugh about it instead of crying. Eventually, you'll even start to enjoy the process.",
  "The thing about cloud computing that nobody really talks about is how it changes how you think about infrastructure. Suddenly you're not limited by physical hardware—you can spin up servers like they're nothing. It's powerful, but also kind of terrifying when you see the bill.",
  "Version control with Git seems overwhelming at first, but once it clicks, you wonder how you ever lived without it. Being able to experiment freely and just roll back if something breaks? That's freedom. The learning curve is worth it.",

  // === 故事叙述风格 ===
  "The email sat in her inbox for three days before she finally opened it. Part of her already knew what it would say—some things you just feel in your gut. Still, seeing the words on screen hit her harder than expected. Life has a way of surprising us when we least expect it.",
  "They met by pure chance at a bookstore, both reaching for the same novel. Neither would admit they'd chosen it because the cover looked interesting, not because they'd actually heard of the author. Sometimes the best stories start with the smallest coincidences.",
  "The recipe had been passed down through three generations, and she still managed to mess it up. Her grandmother would have shaken her head in that particular way she had—half disappointed, half amused. Cooking, like life, requires patience and the willingness to learn from mistakes.",
  "He'd promised himself he wouldn't check his phone during the vacation, but old habits die hard. By day three, he'd rationalized it to 'just checking the weather' and 'making sure work isn't burning down.' The truth was, he was addicted, and admitting it was the first step.",
  "The startup launched with high hopes and a modest budget. Six months later, they were running out of money and customers. But sometimes, hitting rock bottom is exactly what you need to figure out what actually matters. They pivoted, and that made all the difference.",

  // === 随机网页内容风格 ===
  "Welcome to our store! We've been serving customers since 1995 with pride and dedication. Browse our extensive catalog online or visit us in person—our friendly staff is always ready to help. Don't forget to check out this week's special offers!",
  "Terms and conditions apply to all promotions shown on this website. Please read the full details before making a purchase. Prices shown are in USD and may vary by region. Free shipping available on orders over fifty dollars.",
  "Sign up for our newsletter and get twenty percent off your first order! Plus, be the first to know about new arrivals, exclusive deals, and special events. No spam, we promise—just great content delivered straight to your inbox once a week.",
  "This page is currently under maintenance. We apologize for any inconvenience and appreciate your patience. Our team is working hard to improve your experience. Check back soon or follow us on social media for updates on when we'll be back online.",
  "Click here to download our free mobile app, available on iOS and Android. Get instant access to all features, exclusive content, and personalized recommendations. Over one million downloads and counting—join the community today!",

  // === 科普文章风格 ===
  "Your brain forms new connections every time you learn something, which is pretty amazing when you think about it. This neuroplasticity continues throughout your life, meaning you're never too old to learn new skills. So that idea about being 'too old' to pick up a new hobby? Yeah, that's just not true.",
  "The ocean covers more than seventy percent of Earth's surface, yet we've explored less than five percent of it. Think about that for a second. An entire world exists down there that we know almost nothing about. New species are discovered literally every time someone ventures deeper.",
  "Sleep isn't just rest—it's when your brain actually cleans itself. During deep sleep, your brain flushes out toxins that build up during the day. This is why pulling all-nighters makes you feel foggy. You're essentially walking around with a dirty brain.",
  "Bees are responsible for pollinating about one third of the food we eat. No bees means no coffee, no almonds, no apples. The list goes on. Yet bee populations are declining worldwide, and scientists are racing to figure out why. The answer might surprise you—it's not just one thing.",
  "The human body contains about 37 trillion cells. Each one is like a tiny city, with its own power plant, waste management system, and communication network. And somehow, they all work together to keep you alive without you even thinking about it. Kind of puts things in perspective.",

  // === 随笔/思考风格 ===
  "Have you ever noticed how some memories are crystal clear while others fade away? I can still remember my second grade teacher's face, but I couldn't tell you what I had for lunch last Tuesday. The brain is weird like that—what seems important isn't always what we remember.",
  "Sometimes I think about how different life would be if we could see the future. Would we make different choices? Or would knowing what's coming take away the joy of discovery? Maybe not knowing is actually a gift. It certainly keeps things interesting.",
  "The older I get, the more I realize nobody really has it all figured out. Adults are just making it up as they go, same as kids. The difference is, adults are better at pretending they know what they're doing. It's actually kind of hilarious when you think about it.",
  "Why do we always want what we can't have? It's like some cosmic joke. The moment something becomes unavailable, suddenly it's the only thing we care about. Marketing people understand this perfectly well—create scarcity, and demand follows.",
  "Time moves differently when you're doing something you love versus something you dread. An hour feels like five minutes in the first case and five hours in the second. Einstein was right—relativity applies to more than just physics.",

  // === 商业/工作邮件 ===
  "I wanted to follow up on our conversation from last week regarding the project timeline. After reviewing the requirements, I believe we need to adjust our delivery dates slightly. Let's schedule a call to discuss this further and ensure we're aligned on expectations.",
  "Thank you for your interest in our services. One of our consultants will reach out within 24-48 hours to discuss your specific needs and provide a customized proposal. In the meantime, feel free to explore our website for case studies and client testimonials.",
  "Please find attached the quarterly report you requested. Key highlights include a fifteen percent increase in customer satisfaction and significant cost savings from our new operational efficiencies. Let me know if you need any clarification on the data presented.",
  "This email is to confirm your appointment scheduled for next Tuesday at 2pm. Please arrive ten minutes early to complete any necessary paperwork. If you need to reschedule, kindly provide at least 24 hours' notice to avoid any cancellation fees.",
  "We're excited to announce that our team has grown! Please join us in welcoming three new members who will be joining the engineering and design departments. Their combined expertise will help us deliver even better products and experiences for our customers.",

  // === 健康/生活方式 ===
  "The thing about exercise is that nobody ever regrets doing it. Sure, getting off the couch is hard—like, really hard sometimes. But once you're moving, endorphins kick in and suddenly you're actually enjoying yourself. The trick is just getting started.",
  "Meditation isn't about clearing your mind completely. That's basically impossible. It's more about noticing when your mind wanders and gently bringing it back. Over time, you get better at observing your thoughts without getting caught up in them. Sounds simple, takes practice.",
  "Eating well doesn't mean never touching junk food again. Let's be realistic—that's not sustainable. It's more about making good choices most of the time and not beating yourself up when you indulge. Pizza night happens. Move on and eat something healthy tomorrow.",
  "The relationship between food and mood is real. You know how you feel sluggish after eating an entire pizza? Or how a good breakfast makes you feel ready to tackle the day? There's actual science behind that. Your brain needs the right fuel to function at its best.",
  "Walking is underrated as exercise. People think you need to run marathons or lift heavy weights to be fit. But a brisk thirty-minute walk every day? That's huge for your health. Plus, you can listen to podcasts or just clear your head. It's self-care that doesn't feel like work.",

  // === 科技/AI (更口语化) ===
  "AI is everywhere these days, but let's be real—it's not magic. It's math, basically. Lots and lots of data processing. Still wild what it can do though, from writing code to creating art. We're definitely living in interesting times, and things are only going to get weirder from here.",
  "Remember when we used to think flying cars were the future? Turns out, the future is more like carrying supercomputers in our pockets and arguing with strangers online. Progress is weird that way—never quite what we expect, but transformative in ways we couldn't imagine.",
  "Working from home sounded great until you actually had to do it. Turns out, your couch isn't a great office, and video calls are somehow more exhausting than real meetings. But the flexibility? That part's actually pretty awesome. It's a trade-off, like most things in life.",
  "The thing about new technology is that it always feels overwhelming at first. Phones, internet, social media—people freaked out about all of them. But eventually, we adapt and wonder how we lived without it. AI will probably be the same. We're just in the freaking out phase.",
  "Privacy in the age of data collection is... complicated. On one hand, personalized experiences are convenient. On the other, it's kind of creepy how well algorithms know us. The truth is, we're all trading privacy for convenience every day without really thinking about it.",

  // === 长文本挑战 (4-5行) ===
  "The conference hall buzzed with energy as hundreds of developers networked and shared ideas. She stood near the back, feeling out of place among so many accomplished professionals. Imposter syndrome hit hard sometimes, even though she knew she belonged there too. Taking a deep breath, she approached a group discussing machine learning—time to fake it until you make it, or whatever they say.",
  "Summer arrived late that year, catching everyone off guard when temperatures suddenly spiked. Air conditioners that had sat dormant for months roared to life simultaneously, and power grids strained under the demand. Ice cream shops did brisk business, while parks filled with people desperate to soak up some sun. There's something about the first really hot day that makes everyone come alive.",
  "He'd been saving for this trip for years, skipping vacations and cutting back on everything. Standing at the edge of the Grand Canyon at sunrise, watching the light paint the rocks in impossible colors, every sacrifice felt worth it. Some experiences just can't be captured in photos—you have to be there, feeling small in the best possible way.",
  "The startup ecosystem moves fast—companies rise and fall in what feels like months. Working in that environment means constant adaptation and learning. Some days you're on top of the world, riding the wave of success. Other days, you're questioning every life choice that led here. But the possibility, however remote, of building something that matters? That keeps you going.",
  "She opened the bakery on a whim, with zero experience and more optimism than sense. Friends said it was crazy, that most small businesses fail within a year. Three years later, she's still amazed it worked. The secret? Good bread, honestly. Plus listening to customers and adapting constantly. Running a business is part passion, part persistence, and a little bit luck.",

  // === 产品描述风格 ===
  "Introducing our latest innovation in home fitness—the smart resistance band that tracks your workouts. Connect via Bluetooth to view your reps, sets, and resistance levels in real-time. The companion app offers personalized training programs and progress tracking. Perfect for busy professionals who want to stay fit without expensive gym memberships.",
  "This premium mechanical keyboard features aircraft-grade aluminum construction and hot-swappable switches. Customize your typing experience with per-key RGB lighting and programmable macros. The detachable USB-C cable and wireless connectivity options provide maximum flexibility. Built to last through millions of keystrokes, backed by our five-year warranty.",
  "Our noise-canceling headphones deliver studio-quality audio in a comfortable, lightweight design. With up to 30 hours of battery life and rapid charging, you're never without your music. The smart ambient mode automatically adjusts noise cancellation based on your environment. Experience sound the way artists intended.",
];

export default function TypingTest() {
  const { t } = useI18n();
  const { setTimeout: timeout } = useTimeout();
  const [testState, setTestState] = useState<TestState>('idle');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);  // 保存 raw WPM (未考虑准确率)
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
    setRawWpm(0);  // 重置 raw WPM
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

    timeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [currentText, timeout]);

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

  const restartGame = useCallback(() => {
    // Select a new random text
    let newText;
    do {
      newText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    } while (newText === currentText && sampleTexts.length > 1);

    setCurrentText(newText);
    setUserInput('');
    userInputRef.current = '';
    setStartTime(0);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setErrors(0);
    setElapsedTime(0);
    setIsStarted(true); // 直接开始，不需要再点击
    setOverlayVisible(false);
    setTestState('typing');
    hasSavedRef.current = false;
    actualStartTimeRef.current = performance.now();
    isGameStartedRef.current = true;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Start timer
    timerRef.current = setInterval(() => {
      if (actualStartTimeRef.current > 0) {
        const elapsed = (performance.now() - actualStartTimeRef.current) / 1000;
        setElapsedTime(Math.round(elapsed));
      }
    }, 100);

    timeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [currentText, timeout]);

  const handleFinish = useCallback(() => {
    // 防止重复调用
    if (hasSavedRef.current || testState === 'finished') {
      return;
    }

    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Calculate final time and WPM
    const timeElapsedMinutes = elapsedTime / 60; // 转换为分钟
    const wordsTyped = userInputRef.current.length / 5;
    const finalWpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
    const netWpm = Math.round(finalWpm * (accuracy / 100));

    setRawWpm(finalWpm);  // 保存 raw WPM (用于显示)
    setWpm(netWpm);  // 设置为 net WPM (最终成绩)
    hasSavedRef.current = true;

    // 设置 finished 状态
    setTestState('finished');

    // Submit score
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
          wpm: netWpm,  // 保存 net WPM (已考虑准确率)
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
            <div className="w-full px-8 py-6">
              <div className="mb-6 text-center">
                <div className="mb-3 text-5xl">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.typingTestComplete}</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.typingTestTypingSpeed}</div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">{rawWpm}<span className="text-2xl">WPM</span></div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.typingAccuracy}</div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">{accuracy.toFixed(1)}<span className="text-2xl">%</span></div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t.netWPM}</div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">{wpm}</div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={restartGame}
                  className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-4 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90"
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
