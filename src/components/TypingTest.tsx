'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { submitScore } from '@/lib/scores';
import { useTimeout } from '@/hooks/useTimeout';
import { FAQItem } from '@/components/FAQItem';
import ReactionChart from '@/components/ReactionChart';
import { Keyboard } from 'lucide-react';

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

const HISTORY_KEY = 'typing-results';

/** 读取本机历史成绩(net WPM),按时间升序 */
function readLocalHistory(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .map((r: any) => r.wpm)
      .filter((n: any) => typeof n === 'number');
  } catch {
    return [];
  }
}

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
  const [history, setHistory] = useState<number[]>([]);

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

    // 始终写入本机历史(进度曲线),登录用户也保留
    try {
      const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      raw.push({ wpm: netWpm, accuracy, timestamp: Date.now() });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(raw.slice(-100)));
      setHistory(readLocalHistory());
    } catch (e) {
      console.error(e);
    }

    // Submit score
    submitScore({
      test_type: 'typing',
      score: netWpm,
      details: {
        wpm: finalWpm,
        accuracy: accuracy,
      },
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

  // 加载本机历史(进度曲线)
  useEffect(() => {
    setHistory(readLocalHistory());
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

  const getVerdictColor = (wpm: number) => {
    if (wpm >= 70) return 'var(--color-success-400)';
    if (wpm >= 55) return 'var(--color-success-300)';
    if (wpm >= 40) return 'var(--color-brand)';
    if (wpm >= 25) return 'var(--color-warning-400)';
    if (wpm >= 15) return 'var(--color-warning-500)';
    return 'var(--color-danger-400)';
  };

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'text-gray-500';

      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-emerald-400' : 'text-red-400 bg-red-500/20';
      } else if (index === userInput.length) {
        className = 'bg-cyan-400/30 text-gray-100 animate-pulse';
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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="display-title">{t.typingTitle}</h1>
        </div>
        {/* 游戏区 —— display 变体:左结果 + 右打字区 */}
        <div className="game-shell">
          <div className="min-w-0">
            <div className="game-num">
              {testState === 'finished' ? wpm : <span className="dim">0</span>}
              <span className="unit">wpm</span>
            </div>
            <div
              className="game-verdict"
              style={{ color: testState === 'finished' ? getVerdictColor(wpm) : 'transparent' }}
            >
              {testState === 'finished' ? getRating(wpm, 100) : ''}
            </div>
            <div className="game-stats">
              {testState === 'finished'
                ? `${t.typingTestTypingSpeed} ${rawWpm} WPM · ${accuracy.toFixed(1)}%`
                : testState === 'typing'
                ? `${t.typingAccuracy} ${accuracy.toFixed(1)}%`
                : ''}
            </div>
            {testState === 'finished' && (
              <div className="mt-8">
                <button className="btn btn-primary" onClick={restartGame}>
                  ↻ {t.srtTryAgain}
                </button>
              </div>
            )}
          </div>

          <div className="game-panel relative p-4 sm:p-6">
            {/* 实时统计 */}
            <div className="mb-4 flex w-full items-center justify-between gap-3 text-sm">
              <span className="tabular-nums font-semibold text-text">
                {testState === 'finished' ? wpm : calculateLiveWpm()} WPM
              </span>
              <span className="tabular-nums text-text-tertiary">{elapsedTime}s</span>
              <span className="tabular-nums text-text">{accuracy.toFixed(1)}%</span>
            </div>

            {/* 文本显示 */}
            <div className="mb-4 w-full rounded-xl border border-border bg-surface-hover/40 p-4 font-mono text-base leading-relaxed">
              <div className="select-none whitespace-pre-wrap break-words">
                {currentText ? renderText() : t.loading}
              </div>
            </div>

            {/* 输入区 */}
            {testState !== 'finished' ? (
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-border bg-surface-hover/40 p-3 font-mono text-base text-text focus:border-brand/50 focus:outline-none"
                rows={5}
                placeholder={isStarted ? t.typingTypeHere : t.typingClickToStartTyping}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            ) : (
              <span className="game-label text-text-tertiary">{t.typingTestComplete}</span>
            )}

            {/* 点击开始悬浮层 */}
            {overlayVisible && testState !== 'finished' && (
              <div
                className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm"
                onClick={startGame}
              >
                <div className="text-center">
                  <div className="mb-3 flex justify-center"><Keyboard className="h-12 w-12 text-cyan-300" /></div>
                  <div className="text-xl font-bold text-text">{t.typingClickToStart}</div>
                  <div className="mt-2 text-sm text-text-secondary">{t.typingOrStartTyping}</div>
                </div>
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
              <ReactionChart data={history} unit="wpm" caption={t.chartHigherBetter} />
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
              dangerouslySetInnerHTML={{ __html: t.typingBenefits }}
            />
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {t.testHowToImproveTitle}
            </h2>
            <ul className="mt-4 space-y-2">
              {t.typingImprovements.split('<br>').map((item) => (
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
          <h2 className="mb-8 text-3xl font-bold text-gray-100 text-center">Frequently Asked Questions About Typing Test</h2>
          <div className="space-y-4">
            <FAQItem
              question="How does the typing test work?"
              icon="📖"
              answer={
                <div className="space-y-3">
                  <p>This typing test measures your typing speed (WPM - Words Per Minute) and accuracy. It evaluates both how fast you can type and how precisely, providing a Net WPM score that accounts for errors.</p>
                  <ol className="space-y-3 list-decimal list-inside text-gray-300">
                    <li><strong>Start typing</strong> - Click to start, then begin typing the displayed text in the input field.</li>
                    <li><strong>Type the complete text</strong> - The test tracks your speed and accuracy in real-time as you type.</li>
                    <li><strong>View your results</strong> - See your Raw WPM, Net WPM (adjusted for accuracy), and accuracy percentage.</li>
                    <li><strong>Net WPM calculation</strong> - Your final score is Raw WPM × (Accuracy/100), rewarding both speed and precision.</li>
                  </ol>
                  <div className="mt-4 p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-300"><strong>💡 Pro Tip:</strong> Focus on accuracy first, then speed. Professional typists aim for 95%+ accuracy. Net WPM is calculated as Raw WPM multiplied by accuracy percentage, so errors significantly reduce your final score. The average person types 40 WPM; professional typists achieve 65-95 WPM.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="What is a good typing speed? Average WPM by profession"
              icon="⚡"
              answer={
                <div className="space-y-4">
                  <p>A good typing speed depends on your profession and experience. The average person types 40 WPM. Professional typists, programmers, and writers typically achieve 65-95 WPM with 95%+ accuracy.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Average typing speeds by profession and experience:</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>⌨️ <strong>Beginner:</strong> 20-35 WPM (learning hunt-and-peck method)</li>
                      <li>👨‍💼 <strong>Average office worker:</strong> 40 WPM (touch typing not required)</li>
                      <li>💻 <strong>Programmer/developer:</strong> 50-70 WPM (focus on accuracy over speed)</li>
                      <li>✍️ <strong>Professional writer:</strong> 70-90 WPM (efficient typing essential)</li>
                      <li>🎯 <strong>Professional typist:</strong> 80-120 WPM (specialized training)</li>
                      <li>🏆 <strong>Elite typist/competition:</strong> 120-200+ WPM (top 1%)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Typing speed by age (average):</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>🎮 <strong>18-24 years:</strong> ~45 WPM (gamers: 60-80 WPM)</li>
                      <li>👨 <strong>25-35 years:</strong> ~40-50 WPM</li>
                      <li>👴 <strong>36-45 years:</strong> ~35-45 WPM</li>
                      <li>👵 <strong>46-55 years:</strong> ~30-40 WPM</li>
                      <li>👴 <strong>56+ years:</strong> ~25-35 WPM</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-purple-300 font-semibold mb-1">🏆 Exceptional (Top 5%)</p>
                      <p className="text-sm text-gray-300">100+ WPM, 98%+ accuracy - Professional/competition level; elite typing ability</p>
                    </div>
                    <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <p className="text-cyan-300 font-semibold mb-1">⭐ Above Average (Top 25%)</p>
                      <p className="text-sm text-gray-300">70-99 WPM, 95%+ accuracy - Fast, efficient typing; excellent for most professions</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-emerald-300 font-semibold mb-1">✅ Good (Normal Range)</p>
                      <p className="text-sm text-gray-300">50-69 WPM, 90%+ accuracy - Comfortable typing speed; adequate for most office work</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-amber-300 font-semibold mb-1">⚠️ Average</p>
                      <p className="text-sm text-gray-300">35-49 WPM, 85%+ accuracy - Functional but could benefit from touch typing practice</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 font-semibold mb-1">❌ Below Average</p>
                      <p className="text-sm text-gray-300">&lt;35 WPM - Hunt-and-peck method; significant room for improvement</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 italic">Note: Accuracy is equally important! A fast typist with poor accuracy will have a lower Net WPM than a slightly slower but more accurate typist. Focus on 95%+ accuracy first, then increase speed gradually.</p>
                </div>
              }
            />
            <FAQItem
              question="What does the typing test measure? Skills and abilities assessed"
              icon="🧠"
              answer={
                <div className="space-y-4">
                  <p>The typing test measures your <strong>typing speed (WPM)</strong> and <strong>accuracy</strong>, evaluating both fine motor skills and cognitive processing. It assesses how efficiently you can transfer thoughts to text.</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">This test measures:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Typing speed (WPM)</strong> - Words typed per minute (5 characters = 1 word)</li>
                      <li><strong>Accuracy percentage</strong> - Ratio of correct keystrokes to total keystrokes</li>
                      <li><strong>Net WPM</strong> - Speed adjusted for accuracy (WPM × accuracy%)</li>
                      <li><strong>Fine motor control</strong> - Finger dexterity and keyboard familiarity</li>
                      <li><strong>Hand-eye coordination</strong> - Visual-to-motor response efficiency</li>
                      <li><strong>Focus and concentration</strong> - Sustained attention during typing</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Factors affecting your score:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Typing method</strong> - Touch typing vs hunt-and-peck (huge difference)</li>
                      <li><strong>Keyboard familiarity</strong> - Regular computer users type significantly faster</li>
                      <li><strong>Practice and training</strong> - Typing lessons can improve speed by 20-40 WPM</li>
                      <li><strong>Age</strong> - Speed peaks at ~25-35, gradually declines after</li>
                      <li><strong>Fatigue and stress</strong> - Reduce typing performance noticeably</li>
                      <li><strong>Text difficulty</strong> - Technical terms, numbers, and symbols slow typing</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Why typing speed matters:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li>Essential for many professions (writers, programmers, admins, data entry)</li>
                      <li>Dramatically increases productivity and efficiency at work</li>
                      <li>Reduces physical strain and fatigue from typing</li>
                      <li>Important for coding, writing, and content creation</li>
                      <li>Improves with proper training and consistent practice</li>
                    </ul>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="How to improve typing speed? Training methods and practice tips"
              icon="📈"
              answer={
                <div className="space-y-4">
                  <p>Typing speed can be dramatically improved through proper technique, structured practice, and training programs. Here's what works best:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">⌨️ Learn Proper Typing Technique</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Learn touch typing</strong> - Master home row position (ASDF JKL;) without looking</li>
                      <li><strong>Use online typing tutors</strong> - Keybr, Typing.com, Monkeytype, Ratatype</li>
                      <li><strong>Practice daily</strong> - 20-30 minutes daily for 4-6 weeks to see 20-40 WPM improvement</li>
                      <li><strong>Focus on accuracy first</strong> - 95%+ accuracy before trying to increase speed</li>
                      <li><strong>Use all fingers</strong> - Each finger should cover specific keys (no hunt-and-peck)</li>
                      <li><strong>Keep proper posture</strong> - Straight wrists, elbows at 90°, screen at eye level</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">🎯 Structured Practice Approach</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Start with basics</strong> - Home row, then top row, then bottom row</li>
                      <li><strong>Practice common words</strong> - Focus on frequently used letter combinations</li>
                      <li><strong>Use typing games</strong> - Make practice fun and engaging (ZType, TypeRacer)</li>
                      <li><strong>Take timed tests</strong> - Regularly measure your progress with this test</li>
                      <li><strong>Practice real text</strong> - Type articles, emails, or documents you encounter</li>
                      <li><strong>Gradually increase difficulty</strong> - Move to longer texts with complex words</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">💻 Ergonomic Optimization</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Get a good keyboard</strong> - Mechanical or low-profile keyboards improve typing feel</li>
                      <li><strong>Proper desk setup</strong> - Keyboard at elbow height, screen 20-28 inches away</li>
                      <li><strong>Take regular breaks</strong> - 5-minute break every 30 minutes prevents fatigue</li>
                      <li><strong>Stretch your hands</strong> - Prevent carpal tunnel and repetitive strain injury</li>
                      <li><strong>Use ergonomic keyboard</strong> - Split or curved keyboards reduce strain</li>
                      <li><strong>Adjust keyboard tilt</strong> - Slight negative tilt (front higher) is best for wrists</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-3">📚 Training Resources and Tools</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Monkeytype</strong> - Clean, minimal typing test with detailed statistics</li>
                      <li><strong>Keybr</strong> - Generates custom lessons based on your weak keys</li>
                      <li><strong>Typing.com</strong> - Comprehensive typing curriculum for all levels</li>
                      <li><strong>10FastFingers</strong> - Competitive typing tests and games</li>
                      <li><strong>TypeRacer</strong> - Real-time typing races against others</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-300"><strong>🏆 Expected Results:</strong> With daily practice (20-30 min) for 4-6 weeks, most people improve by 15-30 WPM (30-50% increase). Hunt-and-peck typists can reach 50-60 WPM. With continued practice, 70-80 WPM is achievable for most people within 3-6 months. Professional typists reach 100+ WPM with years of practice.</p>
                  </div>
                </div>
              }
            />
            <FAQItem
              question="Why is my typing speed slow? Common causes and how to fix them"
              icon="🔍"
              answer={
                <div className="space-y-4">
                  <p>If you're typing below 35 WPM or have low accuracy, there might be specific reasons. Here are common causes and solutions:</p>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Common reasons for slow typing speed:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Hunt-and-peck method</strong> - Using 1-2 fingers instead of all 10</li>
                      <li><strong>Looking at the keyboard</strong> - Visual search slows typing dramatically</li>
                      <li><strong>Poor finger placement</strong> - Not using proper home row position</li>
                      <li><strong>Lack of practice</strong> - Infrequent computer use keeps speed low</li>
                      <li><strong>Bad ergonomics</strong> - Uncomfortable setup slows typing and causes fatigue</li>
                      <li><strong>Focus on speed over accuracy</strong> - Constant backspacing reduces overall WPM</li>
                      <li><strong>Physical issues</strong> - Hand pain, vision problems, or arthritis</li>
                      <li><strong>Old/awkward keyboard</strong> - Poor keyboard can significantly slow typing</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">How to improve slow typing speed:</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                      <li><strong>Learn touch typing</strong> - #1 way to improve; learn home row position</li>
                      <li><strong>Use typing tutor software</strong> - Structured lessons teach proper technique</li>
                      <li><strong>Practice daily</strong> - 20-30 minutes consistent practice beats occasional long sessions</li>
                      <li><strong>Don't look at keyboard</strong> - Cover keys or use blank keyboard if needed</li>
                      <li><strong>Focus on accuracy</strong> - Speed comes naturally with accurate practice</li>
                      <li><strong>Get better equipment</strong> - Mechanical keyboard improves feedback and speed</li>
                      <li><strong>Fix ergonomic issues</strong> - Proper posture prevents fatigue and strain</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Quick improvements to try today:</h4>
                    <li><strong>Learn home row</strong> - Start with ASDF JKL; position, practice daily</li>
                    <li><strong>Use typing practice sites</strong> - Keybr.com or Monkeytype for free lessons</li>
                    <li><strong>Take typing lessons</strong> - Typing.com offers free comprehensive courses</li>
                    <li><strong>Don't rush</strong> - Focus on accuracy, speed will follow naturally</li>
                    <li><strong>Practice common words</strong> - The, and, is, of, to, in make up 25% of English text</li>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2">Progress expectations by time invested:</h4>
                    <li><strong>Week 1-2</strong> - Learn home row, reach 20-30 WPM (if starting from hunt-and-peck)</li>
                    <li><strong>Week 3-4</strong> - Master all keys, reach 35-45 WPM</li>
                    <li><strong>Month 2-3</strong> - Build speed, reach 50-60 WPM</li>
                    <li><strong>Month 4-6</strong> - Refine technique, reach 65-75 WPM</li>
                    <li><strong>Year 1</strong> - Consistent practice, reach 80-100+ WPM</li>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-300"><strong>⚠️ Health Note:</strong> If typing causes pain in your wrists, hands, or fingers, stop immediately and evaluate your ergonomics. Carpal tunnel syndrome and repetitive strain injuries are serious. Consider seeing a doctor if pain persists. Proper ergonomics and regular breaks are essential for healthy typing.</p>
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
