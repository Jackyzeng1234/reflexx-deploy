'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n, languages } from '@/lib/i18n';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useI18n();
  const { user, profile, signOut, loading } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }

    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreOpen]);

  const navItems = [
    { href: '/tests/aim-trainer', label: t.aimTrainer },
    { href: '/tests/chimp-test', label: t.chimpTestTitle },
    { href: '/tests/number-memory', label: t.numberMemoryTitle },
  ];

  const moreTests = [
    { href: '/tests/simple-reaction', label: t.simpleReaction },
    { href: '/tests/auditory-reaction', label: t.auditoryReactionTitle },
    { href: '/tests/click-speed', label: t.clickSpeed },
    { href: '/tests/choice-reaction', label: t.choiceReaction },
    { href: '/tests/sequence-memory', label: t.sequenceMemoryTitle },
    { href: '/tests/stroop-test', label: t.stroopTestTitle },
    { href: '/tests/typing', label: t.typingTitle },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-700 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <svg className="h-6 w-6 text-white" viewBox="0 0 100 100" fill="currentColor">
                  <text x="50%" y="55%" textAnchor="middle" dy=".3em" fontSize="50" fontWeight="bold">⚡</text>
                </svg>
              </div>
              <span className="hidden sm:block text-xl font-bold text-white">
                <span className="text-gray-200">REFLEX</span><span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">X</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-xl font-medium transition-colors hover:bg-white/10 ${
                    pathname === item.href
                      ? 'bg-primary-900/30 text-primary-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* More Tests Dropdown */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className="rounded-lg px-4 py-2 text-xl font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  More
                </button>
                {isMoreOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-md py-2 shadow-lg">
                    {moreTests.map((test) => (
                      <Link
                        key={test.href}
                        href={test.href}
                        onClick={() => setIsMoreOpen(false)}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-base hover:bg-white/10 text-gray-300 hover:text-white"
                      >
                        <span>{test.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <Link
                href="/leaderboard"
                className={`rounded-lg px-4 py-2 text-xl font-medium transition-colors hover:bg-white/10 ${
                  pathname === '/leaderboard'
                    ? 'bg-primary-900/30 text-primary-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {t.navLeaderboard}
              </Link>

              {/* Stats */}
              <Link
                href="/stats"
                className={`rounded-lg px-4 py-2 text-xl font-medium transition-colors hover:bg-white/10 ${
                  pathname === '/stats'
                    ? 'bg-primary-900/30 text-primary-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {t.navStats}
              </Link>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* User Info or Login Button */}
            {!loading && user && (
              <div className="flex items-center space-x-2">
                {profile && (
                  <div className="hidden items-center space-x-2 md:flex">
                    <span className="text-base font-medium text-gray-300">
                      {profile.username}
                    </span>
                  </div>
                )}
                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                  className="rounded-lg px-3 py-2 text-base font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {t.navLogout}
                </button>
              </div>
            )}
            {!loading && !user && (
              <Link
                href="/auth"
                className="rounded-lg bg-primary-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-primary-700"
              >
                {t.navLogin}
              </Link>
            )}

            {/* Language Selector - Temporarily hidden */}
            {/* <div className="relative group">
              <button className="flex items-center space-x-1 rounded-lg px-3 py-2 text-base font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                <span>{languages.find((l) => l.code === language)?.flag}</span>
                <span className="hidden sm:inline">{languages.find((l) => l.code === language)?.name}</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-md py-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-base hover:bg-white/10 ${
                      language === lang.code ? 'bg-white/10' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-gray-300">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
