'use client';

import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-black/30 backdrop-blur-md">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <svg className="h-5 w-5 text-white" viewBox="0 0 100 100" fill="currentColor">
                  <text x="50%" y="55%" textAnchor="middle" dy=".3em" fontSize="50" fontWeight="bold">⚡</text>
                </svg>
              </div>
              <span className="font-bold text-lg">
                <span className="text-gray-200">REFLEX</span><span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">X</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {t.professionalGrade}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/leaderboard" className="text-white hover:text-primary-400">
                  {t.navLeaderboard}
                </a>
              </li>
              <li>
                <a href="/stats" className="text-white hover:text-primary-400">
                  {t.navStats}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-white hover:text-primary-400">
                  {t.footerPrivacy}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-white hover:text-primary-400">
                  {t.footerTerms}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-white hover:text-primary-400">
                  {t.footerContact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-white">
          <p>&copy; {currentYear} ReflexX. {t.footerRights}</p>
        </div>
      </div>
    </footer>
  );
}
