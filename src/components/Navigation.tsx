'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n, languages } from '@/lib/i18n';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useI18n();
  const { user, profile, signOut, loading } = useAuth();

  const navItems = [
    { href: '/', label: t.navHome },
    { href: '/tests', label: t.navTests },
    { href: '/leaderboard', label: t.navLeaderboard },
    { href: '/stats', label: t.navStats },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <svg className="h-6 w-6 text-white" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M 55 20 L 35 50 L 50 50 L 45 80 L 65 45 L 50 45 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-xl font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* User Info or Login Button */}
            {!loading && user && (
              <div className="flex items-center space-x-2">
                {profile && (
                  <div className="hidden items-center space-x-2 md:flex">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {profile.username}
                    </span>
                  </div>
                )}
                <button
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                  className="rounded-lg px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1 rounded-lg px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                <span>{languages.find((l) => l.code === language)?.flag}</span>
                <span className="hidden sm:inline">{languages.find((l) => l.code === language)?.name}</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white py-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:border-gray-700 dark:bg-gray-800">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex w-full items-center space-x-2 px-4 py-2 text-base hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      language === lang.code ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
