'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import Head from 'next/head';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Privacy Policy - ReflexX</title>
        <meta name="description" content="Privacy policy for ReflexX cognitive training platform. Learn how we collect, use, and protect your personal data." />
        <meta name="keywords" content="privacy policy, data protection, GDPR, user data" />
        <link rel="canonical" href="https://reflexx.uk/privacy" />
      </Head>
      <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {t.footerPrivacy}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">1. Information We Collect</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We collect information you provide directly to us when you create an account, including:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Username (display name on leaderboards)</li>
                <li>Email address (for authentication)</li>
                <li>Test scores and performance data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">2. How We Use Your Information</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We use the information we collect to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Display your scores on leaderboards</li>
                <li>Track your progress over time</li>
                <li>Communicate with you about service updates</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">3. Data Storage & Security</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Your data is stored securely using Supabase infrastructure:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>All passwords are encrypted and securely stored</li>
                <li>We use industry-standard security measures</li>
                <li>Your test data is associated with your account only</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">4. Public Information</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>The following information is publicly visible on leaderboards:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Your username</li>
                <li>Your test scores</li>
                <li>The date/timestamp of your scores</li>
              </ul>
              <p className="mt-2">Your email address is never shared publicly.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">5. Cookies & Local Storage</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We use local storage to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Store your test results (if not logged in)</li>
                <li>Remember your language preference</li>
                <li>Save your authentication session</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">6. Your Rights</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>You have the right to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of data collection</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">7. Contact Us</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>If you have questions about this Privacy Policy, please contact us through our <Link href="/contact" className="text-primary-600 hover:underline dark:text-primary-400">Contact page</Link>.</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
