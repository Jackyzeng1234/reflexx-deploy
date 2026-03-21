'use client';

import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import Head from 'next/head';

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>Terms of Service - ReflexX</title>
        <meta name="description" content="Terms of service for ReflexX cognitive training platform. Learn about our terms and conditions." />
        <meta name="keywords" content="terms of service, terms and conditions, legal, user agreement" />
        <link rel="canonical" href="https://reflexx.uk/terms" />
      </Head>
      <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            {t.footerTerms}
          </h1>
          <p className="text-lg text-white">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>By accessing and using ReactionTest, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">2. Description of Service</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>ReactionTest is a cognitive testing platform that provides:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Reaction time tests</li>
                <li>Memory tests</li>
                <li>Typing speed tests</li>
                <li>Performance tracking and statistics</li>
                <li>Global leaderboards</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">3. User Accounts</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>3.1 Account Creation:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
              <p><strong>3.2 Username:</strong> Choose an appropriate username. We reserve the right to remove inappropriate usernames.</p>
              <p><strong>3.3 Accuracy:</strong> You must provide accurate and complete information when creating your account.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">4. User Conduct</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>You agree NOT to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Use bots, scripts, or any automated means to manipulate test scores</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with other users' experience</li>
                <li>Submit false or misleading information</li>
                <li>Exploit bugs or vulnerabilities in the system</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">5. Content & Data</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>5.1 User Data:</strong> You retain ownership of your test scores and account data.</p>
              <p><strong>5.2 Leaderboards:</strong> Your username and scores may be displayed publicly on leaderboards.</p>
              <p><strong>5.3 Data Deletion:</strong> You may request deletion of your account and associated data at any time.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">6. Disclaimers</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>6.1 Educational Purposes:</strong> These tests are for entertainment and educational purposes only.</p>
              <p><strong>6.2 Not Medical Advice:</strong> Test results should not be used for medical diagnosis or treatment.</p>
              <p><strong>6.3 Accuracy:</strong> While we strive for accuracy, we cannot guarantee 100% precision due to device and network variations.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">7. Service Availability</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We do not guarantee uninterrupted or error-free service. We reserve the right to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Modify or discontinue features at any time</li>
                <li>Suspend or terminate accounts that violate these terms</li>
                <li>Perform maintenance that may temporarily interrupt service</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">8. Intellectual Property</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>All content, features, and functionality of this service are owned by ReactionTest and are protected by international copyright, trademark, and other intellectual property laws.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">9. Limitation of Liability</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>ReactionTest shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">10. Termination</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">11. Changes to Terms</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">12. Contact Us</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>For questions about these Terms of Service, please contact us through our <Link href="/contact" className="text-primary-600 hover:underline dark:text-primary-400">Contact page</Link>.</p>
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
