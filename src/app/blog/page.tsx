'use client';

import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useI18n } from '@/lib/i18n';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  author: string;
}

// 博客文章列表 - 全英文
const blogPosts: BlogPost[] = [
  {
    slug: 'teenager-reaction-time-training-cognitive-development',
    title: 'Teenager Reaction Time Training: Cognitive Development for Ages 13-18',
    excerpt: 'Advanced cognitive training strategies for teenagers. Whether you\'re aiming for esports, sports excellence, or academic achievement, discover how ReflexX helps teens build faster reactions, sharper focus, and competitive advantages during the critical brain development window.',
    category: 'Teen Development',
    readTime: '15 min read',
    date: 'January 15, 2025',
    image: '/blog/teenager-training.jpg',
    author: 'Dr. Sarah Chen'
  },
  {
    slug: 'reaction-time-test-for-kids-safe-cognitive-training',
    title: 'Reaction Time Test for Kids: Safe Cognitive Training for Ages 6-12',
    excerpt: 'Discover safe and fun reaction time tests for children ages 6-12. Parent-approved cognitive training games that improve reflexes, memory, and focus. Complete guide with age-appropriate exercises, safety tips, and real results from families.',
    category: 'Child Development',
    readTime: '12 min read',
    date: 'January 15, 2025',
    image: '/blog/kids-training.jpg',
    author: 'Dr. Emily Watson'
  },
  {
    slug: 'reaction-time-test-what-is-and-why-it-matters',
    title: 'What Is Reaction Time and Why It Matters for Gaming and Daily Life',
    excerpt: 'Understand the science behind reaction time, how it affects your gaming performance, athletic ability, and daily life. Explore factors influencing reaction speed and scientific training methods.',
    category: 'Reaction Time',
    readTime: '8 min read',
    date: 'December 15, 2024',
    image: '/blog/reaction-time-science.jpg',
    author: 'Dr. Sarah Chen'
  },
  {
    slug: 'average-reaction-time-by-age-global-data-study',
    title: 'Global Study: Average Reaction Time by Age Data Analysis',
    excerpt: 'Authoritative analysis based on 1M+ test data. Reveals how reaction time changes with age and which age groups have the fastest reaction speeds. Includes detailed comparison charts and professional insights.',
    category: 'Data Analysis',
    readTime: '12 min read',
    date: 'December 14, 2024',
    image: '/blog/age-comparison.jpg',
    author: 'Prof. Michael Liu'
  },
  {
    slug: 'how-to-improve-aim-accuracy-fps-games-guide',
    title: 'Must-Read for FPS Players: How to Systematically Improve Aim Accuracy and Reaction Speed',
    excerpt: 'Training methods used by pro players. From hardware setup to training programs, comprehensively improve your FPS game performance. Includes specific techniques for Valorant, CSGO, and more.',
    category: 'Gaming Training',
    readTime: '15 min read',
    date: 'December 13, 2024',
    image: '/blog/aim-training.jpg',
    author: 'Alex "Scope" Johnson'
  },
  {
    slug: 'chimp-test-working-memory-brain-training',
    title: 'Chimp Test Explained: Scientific Assessment of Working Memory',
    excerpt: 'How does this simple test evaluate your working memory capacity? The relationship between working memory and intelligence, and how to improve memory through training. Professional analysis based on cognitive psychology.',
    category: 'Cognitive Test',
    readTime: '10 min read',
    date: 'December 12, 2024',
    image: '/blog/chimp-test.jpg',
    author: 'Dr. Emily Watson'
  },
  {
    slug: 'number-memory-test-techniques-brain-training',
    title: 'Number Memory Techniques: Training Methods from Average to Superhuman',
    excerpt: 'Techniques used by world memory champions revealed. Significantly improve your short-term memory through scientific methods. Suitable for students, professionals, and anyone wanting to enhance memory.',
    category: 'Memory Training',
    readTime: '11 min read',
    date: 'December 11, 2024',
    image: '/blog/memory-training.jpg',
    author: 'Sarah "Memory Queen" Park'
  },
  {
    slug: 'sequence-memory-test-brain-plasticity-neuroscience',
    title: 'Sequence Memory and Brain Plasticity: Your Brain Changes Every Day',
    excerpt: 'Why is sequence memory ability so important? Explore neuroscience principles, understand how training changes brain structure. Includes practical training recommendations and progress tracking methods.',
    category: 'Neuroscience',
    readTime: '9 min read',
    date: 'December 10, 2024',
    image: '/blog/brain-plasticity.jpg',
    author: 'Dr. Robert Kim'
  },
  {
    slug: 'stroop-test-cognitive-flexibility-inhibitory-control',
    title: 'Stroop Test: Assessing Cognitive Flexibility and Inhibitory Control',
    excerpt: 'Why does this seemingly simple test reflect high-level cognitive functions? In-depth analysis of the neural mechanisms of the Stroop effect and its applications in psychology and neuroscience.',
    category: 'Psychology',
    readTime: '13 min read',
    date: 'December 9, 2024',
    image: '/blog/stroop-effect.jpg',
    author: 'Prof. Lisa Martinez'
  },
  {
    slug: 'click-speed-test-cps-mouse-dpi-settings',
    title: 'Click Speed Test Ultimate Guide: Hardware Settings and Training Techniques',
    excerpt: 'CPS testing is more than a hand speed game. Understand how mouse DPI, refresh rate, grip affect your performance. Pro gamer setup secrets and personalized optimization recommendations.',
    category: 'Hardware Optimization',
    readTime: '14 min read',
    date: 'December 8, 2024',
    image: '/blog/click-speed.jpg',
    author: 'James "ClickMaster" Brown'
  },
  {
    slug: 'typing-speed-test-wpm-accuracy-improvement-guide',
    title: 'Typing Speed and Accuracy: From Beginner to Professional Advancement',
    excerpt: 'WPM testing is just the beginning. Learn proper touch typing, keyboard layout selection, training programs. How to improve typing efficiency in work and study.',
    category: 'Skill Development',
    readTime: '16 min read',
    date: 'December 7, 2024',
    image: '/blog/typing-speed.jpg',
    author: 'Amanda "TypeFast" Lee'
  },
  {
    slug: 'choice-reaction-time-test-decision-making-speed',
    title: 'Choice Reaction Time: Scientific Training for Fast Decision-Making',
    excerpt: 'The ability to make correct decisions quickly in complex environments is crucial. Analyzes how choice reaction time reflects cognitive processing speed and how to improve decision quality.',
    category: 'Cognitive Science',
    readTime: '10 min read',
    date: 'December 6, 2024',
    image: '/blog/decision-making.jpg',
    author: 'Dr. Christopher Davis'
  },
  {
    slug: 'auditory-vs-visual-reaction-time-comparison',
    title: 'Auditory vs Visual Reaction Time: Which Sensory Modality Is Faster?',
    excerpt: 'Comparative analysis based on latest research. Why are auditory reactions typically faster than visual? Detailed explanation of neural processing mechanisms in different sensory pathways. Practical advice for athletes and musicians.',
    category: 'Sensory Science',
    readTime: '11 min read',
    date: 'December 5, 2024',
    image: '/blog/sensory-comparison.jpg',
    author: 'Dr. Rachel Green'
  },
  {
    slug: 'reaction-time-training-30-day-improvement-program',
    title: '30-Day Reaction Speed Challenge: Scientific Training Plan and Progress Tracking',
    excerpt: 'Complete 30-day training program with daily exercises, progress tracking, and expected results. Suitable for all skill levels. Progressive training methods based on sports science.',
    category: 'Training Program',
    readTime: '20 min read',
    date: 'December 4, 2024',
    image: '/blog/30-day-challenge.jpg',
    author: 'Coach Mike Thompson'
  },
  {
    slug: 'esports-pro-vs-casual-gamer-reaction-time-study',
    title: 'Esports Pros vs Casual Gamers: How Big Is the Reaction Time Gap?',
    excerpt: 'Analyzing reaction time data between professional esports players and casual gamers. What gives pros their lightning-fast reactions? In-depth discussion of nature vs nurture.',
    category: 'Esports Analysis',
    readTime: '13 min read',
    date: 'December 3, 2024',
    image: '/blog/esports-analysis.jpg',
    author: 'Tournament Analyst Kevin Wang'
  },
  {
    slug: 'factors-affecting-reaction-time-age-genetics-caffeine',
    title: 'Factors Affecting Reaction Time: Comprehensive Analysis from Genetics to Environment',
    excerpt: 'Age, gender, fatigue, medications, temperature... Learn about all the factors that may affect your reaction speed. Authoritative guide based on scientific research.',
    category: 'Scientific Guide',
    readTime: '18 min read',
    date: 'December 2, 2024',
    image: '/blog/affecting-factors.jpg',
    author: 'Dr. Jennifer Adams'
  },
  {
    slug: 'brain-training-games-effective-or-waste-time',
    title: 'Do Brain Training Games Really Work? Scientific Evidence Reveals the Truth',
    excerpt: 'Do various brain training apps on the market actually improve cognitive abilities? Analysis of latest research findings tells you which training methods are truly effective.',
    category: 'Product Review',
    readTime: '15 min read',
    date: 'December 1, 2024',
    image: '/blog/brain-games.jpg',
    author: 'Science Editor Tom Wilson'
  }
];

const categories = [
  'All',
  'Child Development',
  'Teen Development',
  'Reaction Time',
  'Data Analysis',
  'Gaming Training',
  'Cognitive Test',
  'Memory Training',
  'Neuroscience',
  'Psychology',
  'Hardware Optimization',
  'Skill Development',
  'Cognitive Science',
  'Sensory Science',
  'Training Program',
  'Esports Analysis',
  'Scientific Guide',
  'Product Review'
];

export default function BlogPage() {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>Reaction Time Blog - Scientific Training & Data Analysis</title>
        <meta name="description" content="Expert articles on reaction time testing, cognitive training, and performance improvement. Scientific research-based guides for gamers and athletes." />
        <meta name="keywords" content="reaction time test, cognitive training, aim trainer, brain games, fps gaming, esports training" />
        <link rel="canonical" href="https://reflexx.uk/blog" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-5xl font-bold text-white">
              Reaction Time & Cognitive Training Blog
            </h1>
            <p className="mb-8 text-xl text-gray-300">
              Scientific Training Guides, Data Analysis and Professional Insights
            </p>

            {/* Search Bar */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-6 py-4 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/40 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/15"
                >
                  {/* Article Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl">📊</span>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      {post.category}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-6">
                    <h2 className="mb-3 text-xl font-bold text-white group-hover:text-blue-300">
                      {post.title}
                    </h2>
                    <p className="mb-4 text-sm text-gray-300 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="py-16 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  No matching articles found
                </h3>
                <p className="text-gray-400">
                  Try different keywords or categories
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
