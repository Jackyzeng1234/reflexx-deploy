'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useI18n, languages } from '@/lib/i18n';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Zap,
  ChevronDown,
  Globe,
  Menu,
  X,
  Trophy,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { getTests, TestCategory } from '@/lib/testCatalog';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useI18n();
  const { user, profile, signOut, loading } = useAuth();
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const testsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (navRef.current && !navRef.current.contains(target)) {
        setIsTestsOpen(false);
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 卸载时清理下拉关闭定时器
  useEffect(() => {
    return () => {
      if (testsCloseTimer.current) clearTimeout(testsCloseTimer.current);
    };
  }, []);

  const tests = getTests(t);
  const categoryLabels: { key: TestCategory; label: string }[] = [
    { key: 'reaction', label: t.catReaction },
    { key: 'speed', label: t.catSpeed },
    { key: 'memory', label: t.catMemory },
    { key: 'cognitive', label: t.catCognitive },
  ];
  const testGroups = categoryLabels.map((cat) => ({
    category: cat.label,
    items: tests
      .filter((test) => test.category === cat.key)
      .map((test) => ({ href: test.href, label: test.title, icon: test.icon })),
  }));

  const navLinks = [
    { href: '/leaderboard', label: t.navLeaderboard, icon: Trophy },
    { href: '/stats', label: t.navStats, icon: BarChart3 },
  ];

  const langLabel = languages.find((l) => l.code === language);

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0e17]/80 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-[90px] items-center justify-between">
            {/* 左: logo + 桌面导航 */}
            <div className="flex items-center gap-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-[0_0_16px_rgba(34,211,238,0.4)]">
                  <Zap className="h-6 w-6 text-white" fill="currentColor" />
                </div>
                <span className="hidden text-xl font-bold sm:block">
                  <span className="text-gray-100">REFLEX</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">X</span>
                </span>
              </Link>

              {/* 桌面导航 */}
              <div className="ml-6 hidden items-center gap-1 md:flex">
                {/* Tests mega menu */}
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (testsCloseTimer.current) {
                      clearTimeout(testsCloseTimer.current);
                      testsCloseTimer.current = null;
                    }
                    setIsTestsOpen(true);
                  }}
                  onMouseLeave={() => {
                    testsCloseTimer.current = setTimeout(() => setIsTestsOpen(false), 250);
                  }}
                >
                  <Link
                    href="/tests"
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pathname.startsWith('/tests')
                        ? 'text-cyan-300'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {t.navTests}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isTestsOpen ? 'rotate-180' : ''}`} />
                  </Link>

                  {isTestsOpen && (
                    <div className="absolute left-1/2 top-full mt-2 w-[560px] -translate-x-1/2 rounded-xl border border-white/10 bg-[#121826]/95 p-4 shadow-2xl backdrop-blur-xl">
                      <div className="grid grid-cols-2 gap-4">
                        {testGroups.map((group) => (
                          <div key={group.category}>
                            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                              {group.category}
                            </p>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsTestsOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                                      pathname === item.href
                                        ? 'bg-cyan-400/10 text-cyan-300'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                                  >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-cyan-300">
                                      <Icon size={18} />
                                    </span>
                                    {item.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        pathname === link.href ? 'text-cyan-300' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 右: 语言 + 登录 */}
            <div className="flex items-center gap-2">
              {/* 语言切换 */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  <Globe className="h-4 w-4" />
                  <span>{langLabel?.name}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-white/10 bg-[#121826]/95 py-1.5 shadow-2xl backdrop-blur-xl">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          language === lang.code
                            ? 'text-cyan-300'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 用户 / 登录 */}
              {!loading && user && (
                <div className="hidden items-center gap-2 md:flex">
                  <span className="text-sm font-medium text-gray-300">{profile?.username || ''}</span>
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push('/');
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.navLogout}
                  </button>
                </div>
              )}
              {!loading && !user && (
                <Link
                  href="/auth"
                  className="hidden rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90 md:block"
                >
                  {t.navLogin}
                </Link>
              )}

              {/* 移动端汉堡 */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 移动端抽屉 */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto border-l border-white/10 bg-[#0a0e17] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400">
                  <Zap className="h-5 w-5 text-white" fill="currentColor" />
                </div>
                <span className="text-lg font-bold">
                  <span className="text-gray-100">REFLEX</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">X</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 hover:bg-white/5 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 移动端语言 */}
            <div className="mb-4 flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    language === lang.code ? 'bg-cyan-400/10 text-cyan-300' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>

            {/* 移动端主导航 */}
            <Link
              href="/leaderboard"
              onClick={() => setIsMobileOpen(false)}
              className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5"
            >
              <Trophy className="h-4 w-4 text-cyan-300" /> {t.navLeaderboard}
            </Link>
            <Link
              href="/stats"
              onClick={() => setIsMobileOpen(false)}
              className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5"
            >
              <BarChart3 className="h-4 w-4 text-cyan-300" /> {t.navStats}
            </Link>

            {/* 移动端测试列表 */}
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{t.navTests}</p>
            <div className="space-y-4">
              {testGroups.map((group) => (
                <div key={group.category}>
                  <p className="mb-1 px-3 text-xs font-semibold text-gray-500">{group.category}</p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-cyan-300">
                          <Icon size={16} />
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 移动端登录 */}
            <div className="mt-6 border-t border-white/10 pt-4">
              {!loading && user ? (
                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                    setIsMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" /> {t.navLogout}
                </button>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsMobileOpen(false)}
                  className="block rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2.5 text-center text-sm font-semibold text-gray-900"
                >
                  {t.navLogin}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
