'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/8 bg-surface/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400">
                <Zap className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-gray-200">REFLEX</span>
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">X</span>
              </span>
            </div>
            <p className="max-w-xs text-sm text-gray-400">{t.professionalGrade}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-200">{t.footerQuickLinks}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/leaderboard" className="text-gray-400 transition-colors hover:text-cyan-300">
                  {t.navLeaderboard}
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-gray-400 transition-colors hover:text-cyan-300">
                  {t.navStats}
                </Link>
              </li>
              <li>
                <Link href="/tests" className="text-gray-400 transition-colors hover:text-cyan-300">
                  {t.navTests}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-200">{t.footerLegal}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 transition-colors hover:text-cyan-300">
                  {t.footerPrivacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 transition-colors hover:text-cyan-300">
                  {t.footerTerms}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 transition-colors hover:text-cyan-300">
                  {t.footerContact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} ReflexX. {t.footerRights}</p>
        </div>
      </div>
    </footer>
  );
}
