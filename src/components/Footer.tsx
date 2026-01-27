'use client';

import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <svg className="h-5 w-5 text-white" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M 55 20 L 35 50 L 50 50 L 45 80 L 65 45 L 50 45 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-lg">ReactionTest</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.professionalGrade}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/tests" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                  {t.navTests}
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                  {t.navLeaderboard}
                </a>
              </li>
              <li>
                <a href="/stats" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                  {t.navStats}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                  {t.footerPrivacy}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                  {t.footerTerms}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                  {t.footerContact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {currentYear} ReactionTest. {t.footerRights}</p>
        </div>
      </div>
    </footer>
  );
}
